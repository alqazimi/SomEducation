import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { insertDefaultPaymentProviders } from "./lib/defaultPaymentProviders";

export const seedPaymentProviders = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const created = await insertDefaultPaymentProviders(ctx);
    return { success: true, created };
  },
});
