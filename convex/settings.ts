import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireAdmin } from "./lib/auth";
import { isAdminOrOwner } from "./lib/roles";
import { logAudit } from "./lib/audit";
import { sanitizeText } from "./lib/validation";

const SETTINGS_KEY = "platform";
const DEFAULT_PLATFORM_NAME = "SomEducation";

async function isPaymentConfigured(ctx: {
  db: import("./_generated/server").QueryCtx["db"];
}) {
  const [activeProviders, settings] = await Promise.all([
    ctx.db
      .query("paymentProviders")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect(),
    ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .unique(),
  ]);

  const manualConfigured = activeProviders.some(
    (provider) => provider.accountNumber.trim().length > 0
  );

  return manualConfigured || settings?.stripeEnabled === true;
}

export const getSetupStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !isAdminOrOwner(user.role)) {
      return null;
    }

    const [categories, courses, payments, paymentConfigured, platformSettings] =
      await Promise.all([
        ctx.db.query("categories").collect(),
        ctx.db.query("courses").collect(),
        ctx.db.query("payments").collect(),
        isPaymentConfigured(ctx),
        ctx.db
          .query("settings")
          .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
          .unique(),
      ]);

    const steps = {
      hasCategories: categories.some((c) => c.isActive),
      hasPaymentSettings: paymentConfigured,
      hasPublishedCourse: courses.some((c) => c.status === "published"),
      hasApprovedPayment: payments.some((p) => p.status === "approved"),
    };

    const allComplete = Object.values(steps).every(Boolean);

    return {
      ...steps,
      allComplete,
      dismissed: platformSettings?.setupChecklistDismissed ?? false,
    };
  },
});

export const dismissSetupChecklist = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        setupChecklistDismissed: true,
        updatedBy: admin._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("settings", {
        key: SETTINGS_KEY,
        platformName: DEFAULT_PLATFORM_NAME,
        setupChecklistDismissed: true,
        updatedBy: admin._id,
        updatedAt: now,
      });
    }
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const [settings, paymentConfigured] = await Promise.all([
      ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
        .unique(),
      isPaymentConfigured(ctx),
    ]);

    if (!settings) {
      return {
        paymentInstructions:
          "Choose your payment provider on the purchase page and send the exact course amount.",
        platformName: DEFAULT_PLATFORM_NAME,
        supportEmail: "support@someducation.com",
        isPaymentConfigured: paymentConfigured,
        stripeEnabled: false,
      };
    }

    return {
      paymentInstructions:
        settings.paymentInstructions ??
        "Choose your payment provider on the purchase page and send the exact course amount.",
      platformName: settings.platformName,
      supportEmail: settings.supportEmail ?? "support@someducation.com",
      isPaymentConfigured: paymentConfigured,
      stripeEnabled: settings.stripeEnabled === true,
    };
  },
});

export const update = mutation({
  args: {
    paymentInstructions: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    stripeEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .unique();

    const data = {
      paymentInstructions: args.paymentInstructions
        ? sanitizeText(args.paymentInstructions, 2000)
        : undefined,
      supportEmail: args.supportEmail
        ? sanitizeText(args.supportEmail, 100)
        : undefined,
      stripeEnabled: args.stripeEnabled,
      updatedBy: admin._id,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("settings", {
        key: SETTINGS_KEY,
        platformName: DEFAULT_PLATFORM_NAME,
        ...data,
      });
    }

    await logAudit(ctx, {
      actorId: admin._id,
      action: "settings.updated",
      entityType: "settings",
      entityId: SETTINGS_KEY,
    });
  },
});
