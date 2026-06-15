import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireAdmin } from "./lib/auth";
import { isAdminOrOwner } from "./lib/roles";
import { logAudit } from "./lib/audit";
import { sanitizeText } from "./lib/validation";

const SETTINGS_KEY = "platform";
const DEFAULT_PLATFORM_NAME = "SomEducation";
const DEFAULT_PAYMENT_PHONE = "+44XXXXXXXXXX";

function isPlaceholderPhone(phone: string) {
  return (
    phone === DEFAULT_PAYMENT_PHONE ||
    /X{4,}/i.test(phone) ||
    phone.replace(/\D/g, "").length < 8
  );
}

function isPaymentConfigured(
  settings: {
    paymentPhone?: string;
    paymentInstructions?: string;
  } | null
) {
  if (!settings) return false;
  const phone = settings.paymentPhone?.trim();
  const instructions = settings.paymentInstructions?.trim();
  if (!phone || !instructions) return false;
  return (
    !isPlaceholderPhone(phone) &&
    instructions.length >= 10
  );
}

export const getSetupStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !isAdminOrOwner(user.role)) {
      return null;
    }

    const [categories, platformSettings, courses, payments] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
        .unique(),
      ctx.db.query("courses").collect(),
      ctx.db.query("payments").collect(),
    ]);

    const steps = {
      hasCategories: categories.some((c) => c.isActive),
      hasPaymentSettings: isPaymentConfigured(platformSettings),
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
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .unique();

    if (!settings) {
      return {
        paymentPhone: DEFAULT_PAYMENT_PHONE,
        paymentInstructions:
          "Send payment via Bank Transfer, Mobile Money, or Cash Transfer. Include your transaction reference in the payment note.",
        platformName: DEFAULT_PLATFORM_NAME,
        supportEmail: "support@someducation.com",
        isPaymentConfigured: false,
      };
    }

    return {
      paymentPhone: settings.paymentPhone ?? DEFAULT_PAYMENT_PHONE,
      paymentInstructions:
        settings.paymentInstructions ??
        "Send payment via Bank Transfer, Mobile Money, or Cash Transfer.",
      platformName: settings.platformName,
      supportEmail: settings.supportEmail ?? "support@someducation.com",
      isPaymentConfigured: isPaymentConfigured(settings),
    };
  },
});

export const update = mutation({
  args: {
    paymentPhone: v.optional(v.string()),
    paymentInstructions: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .unique();

    const data = {
      paymentPhone: args.paymentPhone
        ? sanitizeText(args.paymentPhone, 30)
        : undefined,
      paymentInstructions: args.paymentInstructions
        ? sanitizeText(args.paymentInstructions, 2000)
        : undefined,
      supportEmail: args.supportEmail
        ? sanitizeText(args.supportEmail, 100)
        : undefined,
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
