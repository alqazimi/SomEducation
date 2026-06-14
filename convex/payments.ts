import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireAdmin,
  requireCurrentUser,
  getCurrentUser,
  isAdminOrOwner,
} from "./lib/auth";
import { logAudit } from "./lib/audit";
import { createNotification } from "./lib/notifications";
import { validateStorageFile } from "./lib/files";
import {
  checkRateLimit,
  sanitizeText,
  validatePhone,
} from "./lib/validation";
import { paymentMethod } from "./schema";

export const submit = mutation({
  args: {
    courseId: v.id("courses"),
    fullName: v.string(),
    phone: v.string(),
    method: paymentMethod,
    transactionReference: v.string(),
    notes: v.optional(v.string()),
    screenshotStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await checkRateLimit(ctx, `payment:${user._id}`, 5);

    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") {
      throw new Error("Course not available for purchase");
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

    const pendingPayment = await ctx.db
      .query("payments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
    if (pendingPayment) {
      throw new Error("You already have a pending payment for this course");
    }

    if (!validatePhone(args.phone)) {
      throw new Error("Invalid phone number");
    }

    await validateStorageFile(ctx, args.screenshotStorageId);

    const now = Date.now();
    return await ctx.db.insert("payments", {
      studentId: user._id,
      courseId: args.courseId,
      fullName: sanitizeText(args.fullName, 100),
      phone: sanitizeText(args.phone, 20),
      method: args.method,
      transactionReference: sanitizeText(args.transactionReference, 100),
      notes: args.notes ? sanitizeText(args.notes, 500) : undefined,
      screenshotStorageId: args.screenshotStorageId,
      amount: course.price,
      currency: course.currency,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const resubmitScreenshot = mutation({
  args: {
    paymentId: v.id("payments"),
    screenshotStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.studentId !== user._id) {
      throw new Error("Payment not found");
    }
    if (payment.status !== "resubmit_requested") {
      throw new Error("Screenshot resubmission not requested");
    }

    await validateStorageFile(ctx, args.screenshotStorageId);

    await ctx.db.patch(args.paymentId, {
      screenshotStorageId: args.screenshotStorageId,
      status: "pending",
      updatedAt: Date.now(),
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_studentId", (q) => q.eq("studentId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      payments.map(async (payment) => {
        const course = await ctx.db.get(payment.courseId);
        const screenshotUrl = await ctx.storage.getUrl(
          payment.screenshotStorageId
        );
        return { ...payment, course, screenshotUrl };
      })
    );
  },
});

export const listForAdmin = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("resubmit_requested"),
        v.literal("suspended")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const payments = args.status
      ? await ctx.db
          .query("payments")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("payments").order("desc").collect();

    return await Promise.all(
      payments.map(async (payment) => {
        const [student, course] = await Promise.all([
          ctx.db.get(payment.studentId),
          ctx.db.get(payment.courseId),
        ]);
        const screenshotUrl = await ctx.storage.getUrl(
          payment.screenshotStorageId
        );
        return { ...payment, student, course, screenshotUrl };
      })
    );
  },
});

export const getById = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) return null;

    if (!isAdminOrOwner(user.role) && payment.studentId !== user._id) {
      throw new Error("Access denied");
    }

    const [student, course] = await Promise.all([
      ctx.db.get(payment.studentId),
      ctx.db.get(payment.courseId),
    ]);
    const screenshotUrl = await ctx.storage.getUrl(
      payment.screenshotStorageId
    );

    return { ...payment, student, course, screenshotUrl };
  },
});

export const approve = mutation({
  args: {
    paymentId: v.id("payments"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status === "approved") {
      throw new Error("Payment already approved");
    }

    const now = Date.now();
    await ctx.db.patch(args.paymentId, {
      status: "approved",
      adminNote: args.note ? sanitizeText(args.note, 500) : undefined,
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", payment.studentId).eq("courseId", payment.courseId)
      )
      .first();

    if (existingEnrollment) {
      await ctx.db.patch(existingEnrollment._id, {
        status: "active",
        paymentId: args.paymentId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("enrollments", {
        studentId: payment.studentId,
        courseId: payment.courseId,
        paymentId: args.paymentId,
        status: "active",
        enrolledAt: now,
        updatedAt: now,
      });
    }

    const course = await ctx.db.get(payment.courseId);
    await createNotification(ctx, {
      userId: payment.studentId,
      type: "payment_approved",
      title: "Payment Approved",
      body: `Your payment for "${course?.title ?? "course"}" has been approved. You now have access.`,
      link: course ? `/learn/${course.slug}` : "/dashboard/student/courses",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.approved",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});

export const reject = mutation({
  args: {
    paymentId: v.id("payments"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    const now = Date.now();
    await ctx.db.patch(args.paymentId, {
      status: "rejected",
      adminNote: sanitizeText(args.note, 500),
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    await createNotification(ctx, {
      userId: payment.studentId,
      type: "payment_rejected",
      title: "Payment Rejected",
      body: sanitizeText(args.note, 500),
      link: "/dashboard/student/payments",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.rejected",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});

export const requestResubmit = mutation({
  args: {
    paymentId: v.id("payments"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    await ctx.db.patch(args.paymentId, {
      status: "resubmit_requested",
      adminNote: sanitizeText(args.note, 500),
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId: payment.studentId,
      type: "payment_resubmit",
      title: "New Screenshot Required",
      body: sanitizeText(args.note, 500),
      link: "/dashboard/student/payments",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.resubmit_requested",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});

export const suspendAccess = mutation({
  args: {
    paymentId: v.id("payments"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    const now = Date.now();
    await ctx.db.patch(args.paymentId, {
      status: "suspended",
      adminNote: args.note ? sanitizeText(args.note, 500) : undefined,
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", payment.studentId).eq("courseId", payment.courseId)
      )
      .first();

    if (enrollment) {
      await ctx.db.patch(enrollment._id, {
        status: "suspended",
        updatedAt: now,
      });
    }

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.suspended",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});

export const remove = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    await ctx.db.delete(args.paymentId);

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.deleted",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});
