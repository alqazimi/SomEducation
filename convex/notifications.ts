import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireCurrentUser } from "./lib/auth";

export const list = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return [];

    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_userId", (q) =>
          q.eq("userId", user._id).eq("isRead", false)
        )
        .order("desc")
        .take(50);
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return;

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) =>
        q.eq("userId", user._id).eq("isRead", false)
      )
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) =>
        q.eq("userId", user._id).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});
