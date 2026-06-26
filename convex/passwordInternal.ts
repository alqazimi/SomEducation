import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { checkRateLimit } from "./lib/validation";

export const assertPasswordChangeRateLimit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, `password-change:${args.userId}`, 5);
  },
});

export const assertAccountDeletionRateLimit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await checkRateLimit(ctx, `account-delete:${args.userId}`, 3);
  },
});
