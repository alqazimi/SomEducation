import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { insertDefaultCategories } from "./lib/defaultCategories";

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await insertDefaultCategories(ctx);
    return { success: true };
  },
});
