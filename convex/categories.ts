import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, slugify } from "./lib/auth";
import { sanitizeText } from "./lib/validation";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("categories")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }
    return await ctx.db.query("categories").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = sanitizeText(args.name, 100);
    const slug = slugify(name);

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("Category already exists");

    return await ctx.db.insert("categories", {
      name,
      slug,
      description: args.description
        ? sanitizeText(args.description, 500)
        : undefined,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});
