import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, slugify } from "./lib/auth";
import { sanitizeText } from "./lib/validation";
import { paymentProviderType } from "./schema";

export const list = query({
  args: {
    type: v.optional(paymentProviderType),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let providers;

    if (args.type !== undefined && args.activeOnly) {
      providers = await ctx.db
        .query("paymentProviders")
        .withIndex("by_type", (q) =>
          q.eq("type", args.type!).eq("isActive", true)
        )
        .collect();
    } else if (args.type !== undefined) {
      providers = await ctx.db
        .query("paymentProviders")
        .filter((q) => q.eq(q.field("type"), args.type!))
        .collect();
    } else {
      providers = await ctx.db.query("paymentProviders").collect();
      if (args.activeOnly) {
        providers = providers.filter((provider) => provider.isActive);
      }
    }

    if (args.activeOnly) {
      providers = providers.filter(
        (provider) => provider.isActive && provider.accountNumber.trim().length > 0
      );
    }

    return providers.sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name)
    );
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const providers = await ctx.db.query("paymentProviders").collect();

    const withStats = await Promise.all(
      providers.map(async (provider) => {
        const payments = await ctx.db
          .query("payments")
          .filter((q) => q.eq(q.field("paymentProviderId"), provider._id))
          .collect();

        return {
          ...provider,
          paymentCount: payments.length,
        };
      })
    );

    return withStats.sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name)
    );
  },
});

export const create = mutation({
  args: {
    type: paymentProviderType,
    name: v.string(),
    accountNumber: v.string(),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = sanitizeText(args.name, 100);
    const slug = slugify(name);
    const accountNumber = sanitizeText(args.accountNumber, 60);

    if (!accountNumber.trim()) {
      throw new Error("Account or wallet number is required");
    }

    const existing = await ctx.db
      .query("paymentProviders")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("Payment provider already exists");

    const last = await ctx.db.query("paymentProviders").order("desc").first();

    return await ctx.db.insert("paymentProviders", {
      type: args.type,
      name,
      slug,
      accountNumber,
      instructions: args.instructions
        ? sanitizeText(args.instructions, 500)
        : undefined,
      isActive: true,
      order: (last?.order ?? -1) + 1,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    providerId: v.id("paymentProviders"),
    type: v.optional(paymentProviderType),
    name: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    instructions: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const provider = await ctx.db.get(args.providerId);
    if (!provider) throw new Error("Payment provider not found");

    const updates: {
      type?: typeof provider.type;
      name?: string;
      slug?: string;
      accountNumber?: string;
      instructions?: string;
      isActive?: boolean;
      order?: number;
    } = {};

    if (args.type !== undefined) updates.type = args.type;

    if (args.name !== undefined) {
      const name = sanitizeText(args.name, 100);
      const slug = slugify(name);
      const existing = await ctx.db
        .query("paymentProviders")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing && existing._id !== args.providerId) {
        throw new Error("Another provider already uses this name");
      }
      updates.name = name;
      updates.slug = slug;
    }

    if (args.accountNumber !== undefined) {
      const accountNumber = sanitizeText(args.accountNumber, 60);
      if (!accountNumber.trim()) {
        throw new Error("Account or wallet number is required");
      }
      updates.accountNumber = accountNumber;
    }

    if (args.instructions !== undefined) {
      const trimmed = args.instructions.trim();
      updates.instructions = trimmed
        ? sanitizeText(trimmed, 500)
        : undefined;
    }

    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.order !== undefined) updates.order = args.order;

    if (Object.keys(updates).length === 0) return args.providerId;

    await ctx.db.patch(args.providerId, updates);
    return args.providerId;
  },
});

export const remove = mutation({
  args: { providerId: v.id("paymentProviders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const provider = await ctx.db.get(args.providerId);
    if (!provider) throw new Error("Payment provider not found");

    const used = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("paymentProviderId"), args.providerId))
      .first();

    if (used) {
      throw new Error(
        "This provider has payment records. Hide it instead of deleting."
      );
    }

    await ctx.db.delete(args.providerId);
  },
});
