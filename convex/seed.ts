import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { insertDefaultCategories } from "./lib/defaultCategories";
import { insertDefaultPaymentProviders } from "./lib/defaultPaymentProviders";

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await insertDefaultCategories(ctx);
    return { success: true };
  },
});

export const seedPaymentProviders = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const created = await insertDefaultPaymentProviders(ctx);
    return { success: true, created };
  },
});
