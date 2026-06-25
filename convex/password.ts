import { v } from "convex/values";
import {
  getAuthUserId,
  getAuthSessionId,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { checkRateLimit } from "./lib/validation";

const PASSWORD_PROVIDER = "password";
const MIN_PASSWORD_LENGTH = 12;

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    await ctx.runMutation(internal.passwordInternal.assertPasswordChangeRateLimit, {
      userId,
    });

    validatePassword(args.newPassword);

    if (args.currentPassword === args.newPassword) {
      throw new Error("New password must be different from your current password");
    }

    const email = await ctx.runQuery(internal.users.getUserEmailInternal, {
      userId,
    });
    if (!email) {
      throw new Error("Account email not found");
    }

    const retrieved = await retrieveAccount(ctx, {
      provider: PASSWORD_PROVIDER,
      account: { id: email, secret: args.currentPassword },
    });
    if (!retrieved || retrieved.user._id !== userId) {
      throw new Error("Current password is incorrect");
    }

    await modifyAccountCredentials(ctx, {
      provider: PASSWORD_PROVIDER,
      account: { id: email, secret: args.newPassword },
    });

    const sessionId = await getAuthSessionId(ctx);
    await ctx.runMutation(internal.sessions.revokeUserSessionsInternal, {
      userId,
      exceptSessionId: sessionId ?? undefined,
    });
  },
});
