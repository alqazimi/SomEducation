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
    const categories = await ctx.db.query("categories").collect();
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const categories = await ctx.db.query("categories").collect();

    const withStats = await Promise.all(
      categories.map(async (category) => {
        const courses = await ctx.db
          .query("courses")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        return {
          ...category,
          courseCount: courses.length,
          publishedCourseCount: courses.filter((c) => c.status === "published")
            .length,
        };
      })
    );

    return withStats.sort((a, b) => a.name.localeCompare(b.name));
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

export const update = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    const updates: {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    } = {};

    if (args.name !== undefined) {
      const name = sanitizeText(args.name, 100);
      const slug = slugify(name);
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing && existing._id !== args.categoryId) {
        throw new Error("Another category already uses this name");
      }
      updates.name = name;
      updates.slug = slug;
    }

    if (args.description !== undefined) {
      const trimmed = args.description.trim();
      updates.description = trimmed
        ? sanitizeText(trimmed, 500)
        : undefined;
    }

    if (args.isActive !== undefined) {
      updates.isActive = args.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return args.categoryId;
    }

    await ctx.db.patch(args.categoryId, updates);
    return args.categoryId;
  },
});
