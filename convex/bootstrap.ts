import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOwnerEmails } from "./lib/roles";

export const setupPlatform = mutation({
  args: {
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const categoryCount = (await ctx.db.query("categories").collect()).length;

    const owners = (await ctx.db.query("users").collect()).filter(
      (u) => u.role === "owner" && u.status === "active"
    );

    let promotedUser: { email: string; role: string } | null = null;

    if (owners.length === 0) {
      const emailHint = args.adminEmail?.trim().toLowerCase();
      let user = emailHint
        ? await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", emailHint))
            .unique()
        : null;

      if (!user) {
        user = await ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .first();
      }

      if (user) {
        const ownerEmails = getOwnerEmails();
        const userEmail = (user.email ?? "").toLowerCase();
        const role =
          ownerEmails.includes(userEmail) || ownerEmails.length === 0
            ? "owner"
            : "admin";

        await ctx.db.patch(user._id, {
          role,
          updatedAt: Date.now(),
        });
        promotedUser = { email: user.email ?? emailHint ?? String(user._id), role };
      }
    }

    const adminCount = (await ctx.db.query("users").collect()).filter(
      (u) =>
        (u.role === "admin" || u.role === "owner") && u.status === "active"
    ).length;

    return {
      categoryCount,
      promotedUser,
      adminCount,
      message: promotedUser
        ? `Setup complete. Sign in as ${promotedUser.email} (${promotedUser.role}) and open /dashboard/admin.`
        : categoryCount > 0
          ? "Platform ready. Sign in as owner/admin and open /dashboard/admin."
          : "No users found. Sign up in the app first, then run setup again.",
    };
  },
});
