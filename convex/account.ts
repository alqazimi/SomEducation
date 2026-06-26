import { v } from "convex/values";
import { getAuthUserId, retrieveAccount } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const PASSWORD_PROVIDER = "password";
const DELETE_CONFIRMATION = "DELETE";

export const deleteMyAccount = action({
  args: {
    currentPassword: v.string(),
    confirmation: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    if (args.confirmation.trim() !== DELETE_CONFIRMATION) {
      throw new Error(`Type ${DELETE_CONFIRMATION} to confirm account deletion`);
    }

    await ctx.runMutation(internal.passwordInternal.assertAccountDeletionRateLimit, {
      userId,
    });

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

    await ctx.runMutation(internal.users.applySelfAccountDeletion, { userId });
  },
});
