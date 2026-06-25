import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { buildSearchText } from "./lib/auth";
import { isStaff } from "./lib/roles";
import { resolveInitialRole } from "./lib/roles";

const SESSION_MS = 3 * 60 * 60 * 1000;

function displayName(profile: Record<string, unknown>) {
  const first = profile.firstName as string | undefined;
  const last = profile.lastName as string | undefined;
  const combined = [first, last].filter(Boolean).join(" ").trim();
  return combined || (profile.name as string | undefined);
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password) => {
        if (password.length < 12) {
          throw new Error("Password must be at least 12 characters");
        }
      },
      profile(params) {
        const email = String(params.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) {
          throw new Error("Email is required");
        }
        const firstName = params.firstName
          ? String(params.firstName).trim()
          : "";
        const lastName = params.lastName
          ? String(params.lastName).trim()
          : "";
        const name =
          displayName({ firstName, lastName, email }) || email;
        return {
          email,
          firstName,
          lastName,
          name,
        };
      },
    }),
  ],
  session: {
    totalDurationMs: SESSION_MS,
    inactiveDurationMs: SESSION_MS,
  },
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const email = args.profile.email?.trim().toLowerCase();
      if (!email) {
        throw new Error("Email is required");
      }

      const now = Date.now();
      const firstName = args.profile.firstName as string | undefined;
      const lastName = args.profile.lastName as string | undefined;
      const name = displayName(args.profile);

      if (args.existingUserId) {
        const existing = await ctx.db.get(args.existingUserId);
        if (!existing) {
          throw new Error("User not found");
        }
        await ctx.db.patch(args.existingUserId, {
          email,
          firstName: firstName ?? existing.firstName,
          lastName: lastName ?? existing.lastName,
          name: name ?? existing.name,
          searchText: buildSearchText([
            firstName ?? existing.firstName,
            lastName ?? existing.lastName,
            email,
          ]),
          updatedAt: now,
        });
        return args.existingUserId;
      }

      const legacyUsers = await ctx.db.query("users").collect();
      const legacy = legacyUsers.find(
        (row) => (row.email ?? "").toLowerCase() === email
      );

      if (legacy) {
        await ctx.db.patch(legacy._id, {
          email,
          firstName: firstName ?? legacy.firstName,
          lastName: lastName ?? legacy.lastName,
          name: name ?? legacy.name,
          searchText: buildSearchText([
            firstName ?? legacy.firstName,
            lastName ?? legacy.lastName,
            email,
          ]),
          updatedAt: now,
        });
        return legacy._id;
      }

      const role = resolveInitialRole(email);
      return await ctx.db.insert("users", {
        email,
        firstName,
        lastName,
        name,
        role,
        status: "active",
        searchText: buildSearchText([firstName, lastName, email]),
        mfaEnabled: isStaff(role) ? false : undefined,
        createdAt: now,
        updatedAt: now,
      });
    },
    async beforeSessionCreation(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user || user.status === "deleted") {
        throw new Error("Account not found");
      }
      if (user.status === "suspended") {
        throw new Error("Your account has been suspended");
      }

      if (user.role === "student") {
        const sessions = (await ctx.db.query("authSessions").collect()).filter(
          (session) => session.userId === userId
        );
        for (const session of sessions) {
          await ctx.db.delete(session._id);
          const verifications = (
            await ctx.db.query("mfaVerifications").collect()
          ).filter((row) => row.sessionId === session._id);
          for (const row of verifications) {
            await ctx.db.delete(row._id);
          }
        }
      }
    },
  },
});
