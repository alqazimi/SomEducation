import { v } from "convex/values";
import { getAuthSessionId } from "@convex-dev/auth/server";
import { internalMutation, mutation } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { revokeAllUserSessions } from "./lib/sessions";
import { checkRateLimit } from "./lib/validation";

export const revokeUserSessionsInternal = internalMutation({
  args: {
    userId: v.id("users"),
    exceptSessionId: v.optional(v.id("authSessions")),
  },
  handler: async (ctx, args) => {
    await revokeAllUserSessions(ctx, args.userId, {
      exceptSessionId: args.exceptSessionId,
    });
  },
});

export const signOutOtherSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    await checkRateLimit(ctx, `signout-sessions:${user._id}`, 10);

    const sessionId = await getAuthSessionId(ctx);
    await revokeAllUserSessions(ctx, user._id, {
      exceptSessionId: sessionId ?? undefined,
    });
  },
});
