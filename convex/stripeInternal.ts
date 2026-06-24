import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { fulfillPayment } from "./lib/fulfillPayment";
import { findOpenPaymentForCourse } from "./lib/payments";
import { sanitizeText } from "./lib/validation";

const SETTINGS_KEY = "platform";

async function isStripeEnabled(ctx: { db: import("./_generated/server").QueryCtx["db"] }) {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return false;
  }
  const settings = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
    .unique();
  return settings?.stripeEnabled !== false;
}

export const assertStripePurchaseAllowed = internalQuery({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (!(await isStripeEnabled(ctx))) {
      throw new Error("Card payments are not enabled yet");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") {
      throw new Error("Course not available for purchase");
    }
    if (course.price <= 0) {
      throw new Error("This course is free — no payment required");
    }

    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .first();
    if (existingEnrollment?.status === "active") {
      throw new Error("You are already enrolled in this course");
    }
    if (existingEnrollment?.status === "suspended") {
      throw new Error(
        "Your access to this course is suspended. Contact support."
      );
    }

    const suspendedPayment = await ctx.db
      .query("payments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .filter((q) => q.eq(q.field("status"), "suspended"))
      .first();
    if (suspendedPayment) {
      throw new Error(
        "Your access to this course is suspended. Contact support."
      );
    }

    const openPayment = await findOpenPaymentForCourse(
      ctx,
      user._id,
      args.courseId
    );
    if (openPayment && openPayment.method !== "stripe") {
      throw new Error(
        "You already have a manual payment request for this course. Finish or update it first."
      );
    }

    const fullName =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

    return {
      userId: user._id,
      userEmail: user.email,
      fullName,
      phone: user.phone ?? "N/A",
      course: {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        price: course.price,
        currency: course.currency,
      },
      existingStripePaymentId: openPayment?.method === "stripe" ? openPayment._id : null,
    };
  },
});

export const createPendingStripePayment = internalMutation({
  args: {
    courseId: v.id("courses"),
    stripeCheckoutSessionId: v.string(),
    fullName: v.string(),
    phone: v.string(),
    amount: v.number(),
    currency: v.string(),
    existingPaymentId: v.optional(v.id("payments")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const now = Date.now();

    if (args.existingPaymentId) {
      await ctx.db.patch(args.existingPaymentId, {
        stripeCheckoutSessionId: args.stripeCheckoutSessionId,
        transactionReference: args.stripeCheckoutSessionId,
        status: "pending",
        updatedAt: now,
      });
      return args.existingPaymentId;
    }

    return await ctx.db.insert("payments", {
      studentId: user._id,
      courseId: args.courseId,
      fullName: sanitizeText(args.fullName, 100),
      phone: sanitizeText(args.phone, 20),
      method: "stripe",
      transactionReference: args.stripeCheckoutSessionId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const completeStripePayment = internalMutation({
  args: {
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId)
      )
      .unique();

    if (!payment) {
      throw new Error("Payment not found for checkout session");
    }
    if (payment.status === "approved") {
      return { paymentId: payment._id, alreadyApproved: true };
    }

    if (args.stripePaymentIntentId) {
      await ctx.db.patch(payment._id, {
        stripePaymentIntentId: args.stripePaymentIntentId,
        updatedAt: Date.now(),
      });
    }

    await fulfillPayment(ctx, {
      paymentId: payment._id,
      auditAction: "payment.stripe_completed",
    });

    return { paymentId: payment._id, alreadyApproved: false };
  },
});

export const expireStripePayment = internalMutation({
  args: { stripeCheckoutSessionId: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId)
      )
      .unique();

    if (!payment || payment.status !== "pending" || payment.method !== "stripe") {
      return;
    }

    await ctx.db.patch(payment._id, {
      status: "rejected",
      adminNote: "Stripe checkout expired or was cancelled",
      updatedAt: Date.now(),
    });
  },
});
