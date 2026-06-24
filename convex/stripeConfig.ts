import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const SETTINGS_KEY = "platform";

export const getPublicConfig = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .unique();

    const configured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
    const explicitlyDisabled = settings?.stripeEnabled === false;

    return {
      stripeEnabled: settings?.stripeEnabled === true,
      stripeConfigured: configured,
      stripeReady: configured && !explicitlyDisabled,
    };
  },
});

export const getCheckoutStatus = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripeCheckoutSessionId", (q) =>
        q.eq("stripeCheckoutSessionId", args.sessionId)
      )
      .unique();

    if (!payment || payment.studentId !== user._id) {
      return null;
    }

    const course = await ctx.db.get(payment.courseId);
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", payment.courseId)
      )
      .first();

    return {
      paymentStatus: payment.status,
      courseSlug: course?.slug,
      courseTitle: course?.title,
      isEnrolled: enrollment?.status === "active",
    };
  },
});
