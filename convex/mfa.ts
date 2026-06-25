import { v } from "convex/values";
import { generateSecret, generateURI, verifySync } from "otplib";
import { mutation, query } from "./_generated/server";
import { getAuthSessionId } from "@convex-dev/auth/server";
import { getCurrentUser, requireAuthenticatedUser, requireAdmin } from "./lib/auth";
import { isStaff, requiresMfa } from "./lib/roles";
import { throwError } from "./lib/errors";

const MFA_TOLERANCE = 1;

export const getMfaStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const sessionId = await getAuthSessionId(ctx);
    let sessionVerified = false;
    if (sessionId && user.mfaEnabled) {
      const row = await ctx.db
        .query("mfaVerifications")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
        .unique();
      sessionVerified = !!row;
    }

    return {
      required: requiresMfa(user.role),
      enabled: user.mfaEnabled === true,
      sessionVerified,
      needsSetup: requiresMfa(user.role) && !user.mfaEnabled,
      needsVerification:
        requiresMfa(user.role) &&
        user.mfaEnabled === true &&
        !sessionVerified,
    };
  },
});

export const beginMfaSetup = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthenticatedUser(ctx);
    if (!isStaff(user.role)) {
      throw new Error("MFA is only required for staff accounts");
    }
    if (user.mfaEnabled) {
      throw new Error("MFA is already enabled");
    }

    const secret = generateSecret();
    await ctx.db.patch(user._id, {
      mfaSecret: secret,
      updatedAt: Date.now(),
    });

    const otpauthUrl = generateURI({
      issuer: "SomEducation",
      label: user.email ?? String(user._id),
      secret,
    });

    return { secret, otpauthUrl };
  },
});

export const confirmMfaSetup = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAuthenticatedUser(ctx);
    if (!isStaff(user.role)) {
      throw new Error("MFA is only required for staff accounts");
    }
    if (!user.mfaSecret) {
      throw new Error("Start MFA setup first");
    }

    const valid = verifySync({
      secret: user.mfaSecret,
      token: args.code.trim(),
      epochTolerance: MFA_TOLERANCE,
    });
    if (!valid) {
      throw new Error("Invalid authentication code");
    }

    await ctx.db.patch(user._id, {
      mfaEnabled: true,
      updatedAt: Date.now(),
    });

    const sessionId = await getAuthSessionId(ctx);
    if (sessionId) {
      const existing = await ctx.db
        .query("mfaVerifications")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { verifiedAt: Date.now() });
      } else {
        await ctx.db.insert("mfaVerifications", {
          sessionId,
          userId: user._id,
          verifiedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const verifyMfaLogin = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throwError("Authentication required", "UNAUTHENTICATED");
    }
    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new Error("MFA is not enabled for this account");
    }

    const valid = verifySync({
      secret: user.mfaSecret,
      token: args.code.trim(),
      epochTolerance: MFA_TOLERANCE,
    });
    if (!valid) {
      throw new Error("Invalid authentication code");
    }

    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) {
      throwError("Authentication required", "UNAUTHENTICATED");
    }

    const existing = await ctx.db
      .query("mfaVerifications")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { verifiedAt: Date.now() });
    } else {
      await ctx.db.insert("mfaVerifications", {
        sessionId,
        userId: user._id,
        verifiedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const resetUserMfa = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      mfaSecret: undefined,
      mfaEnabled: false,
      updatedAt: Date.now(),
    });

    const verifications = await ctx.db
      .query("mfaVerifications")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    for (const row of verifications) {
      await ctx.db.delete(row._id);
    }

    return { success: true };
  },
});
