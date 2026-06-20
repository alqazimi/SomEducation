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
  findOpenPaymentForCourse,
  isFixablePaymentStatus,
} from "./lib/payments";
import {
  checkRateLimit,
  sanitizeText,
  validatePhone,
} from "./lib/validation";

export const submit = mutation({
  args: {
    courseId: v.id("courses"),
    fullName: v.string(),
    phone: v.string(),
    paymentProviderId: v.id("paymentProviders"),
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

    const provider = await ctx.db.get(args.paymentProviderId);
    if (!provider || !provider.isActive || !provider.accountNumber.trim()) {
      throw new Error("Selected payment method is not available");
    }

    if (provider.type !== "mobile_money" && provider.type !== "bank_transfer") {
      throw new Error("Invalid payment method");
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
        "Your access to this course is suspended. Contact support or wait for an admin to restore access."
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
        "Your access to this course is suspended. Contact support or wait for an admin to restore access."
      );
    }

    const openPayment = await findOpenPaymentForCourse(
      ctx,
      user._id,
      args.courseId
    );
    if (openPayment) {
      throw new Error(
        "You already have a payment request for this course. Update it from your payment history instead of submitting again."
      );
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
      method: provider.type,
      paymentProviderId: provider._id,
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

export const fixAndResubmit = mutation({
  args: {
    paymentId: v.id("payments"),
    screenshotStorageId: v.id("_storage"),
    paymentProviderId: v.id("paymentProviders"),
    transactionReference: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await checkRateLimit(ctx, `payment-fix:${user._id}`, 10);

    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.studentId !== user._id) {
      throw new Error("Payment not found");
    }
    if (!isFixablePaymentStatus(payment.status)) {
      throw new Error("This payment cannot be updated right now");
    }

    const provider = await ctx.db.get(args.paymentProviderId);
    if (!provider || !provider.isActive || !provider.accountNumber.trim()) {
      throw new Error("Selected payment method is not available");
    }
    if (provider.type !== "mobile_money" && provider.type !== "bank_transfer") {
      throw new Error("Invalid payment method");
    }

    await validateStorageFile(ctx, args.screenshotStorageId);

    const now = Date.now();
    await ctx.db.patch(args.paymentId, {
      screenshotStorageId: args.screenshotStorageId,
      paymentProviderId: provider._id,
      method: provider.type,
      transactionReference: sanitizeText(args.transactionReference, 100),
      notes: args.notes ? sanitizeText(args.notes, 500) : payment.notes,
      status: "pending",
      adminNote: undefined,
      reviewedBy: undefined,
      reviewedAt: undefined,
      updatedAt: now,
    });

    await logAudit(ctx, {
      actorId: user._id,
      action: "payment.resubmitted",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});

/** @deprecated Use fixAndResubmit */
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
    if (!isFixablePaymentStatus(payment.status)) {
      throw new Error("Screenshot resubmission not requested");
    }
    if (!payment.paymentProviderId) {
      throw new Error("Payment provider missing — use the full fix form");
    }

    await validateStorageFile(ctx, args.screenshotStorageId);

    await ctx.db.patch(args.paymentId, {
      screenshotStorageId: args.screenshotStorageId,
      status: "pending",
      adminNote: undefined,
      reviewedBy: undefined,
      reviewedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const getOpenForCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const payment = await findOpenPaymentForCourse(
      ctx,
      user._id,
      args.courseId
    );
    if (!payment) return null;

    const [course, provider] = await Promise.all([
      ctx.db.get(payment.courseId),
      payment.paymentProviderId
        ? ctx.db.get(payment.paymentProviderId)
        : null,
    ]);
    const screenshotUrl = await ctx.storage.getUrl(
      payment.screenshotStorageId
    );

    return { ...payment, course, provider, screenshotUrl };
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
        const [course, provider] = await Promise.all([
          ctx.db.get(payment.courseId),
          payment.paymentProviderId
            ? ctx.db.get(payment.paymentProviderId)
            : null,
        ]);
        const screenshotUrl = await ctx.storage.getUrl(
          payment.screenshotStorageId
        );
        return { ...payment, course, provider, screenshotUrl };
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
    const user = await getCurrentUser(ctx);
    if (!user || !isAdminOrOwner(user.role)) return null;

    const payments = args.status
      ? await ctx.db
          .query("payments")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("payments").order("desc").collect();

    return await Promise.all(
      payments.map(async (payment) => {
        const [student, course, provider] = await Promise.all([
          ctx.db.get(payment.studentId),
          ctx.db.get(payment.courseId),
          payment.paymentProviderId
            ? ctx.db.get(payment.paymentProviderId)
            : null,
        ]);
        const screenshotUrl = await ctx.storage.getUrl(
          payment.screenshotStorageId
        );
        return { ...payment, student, course, provider, screenshotUrl };
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
    if (payment.status === "approved") {
      throw new Error(
        "Revoke approval first before requesting a new screenshot for an approved payment"
      );
    }

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
    if (payment.status !== "approved") {
      throw new Error("Only approved payments can be suspended");
    }

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

    const course = await ctx.db.get(payment.courseId);
    await createNotification(ctx, {
      userId: payment.studentId,
      type: "payment_rejected",
      title: "Course access suspended",
      body:
        args.note?.trim() ??
        `Your access to "${course?.title ?? "this course"}" has been suspended. Contact support if you have questions.`,
      link: "/dashboard/student/payments",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.suspended",
      entityType: "payments",
      entityId: args.paymentId,
    });
  },
});

export const revokeApproval = mutation({
  args: {
    paymentId: v.id("payments"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "approved") {
      throw new Error("Only approved payments can be revoked");
    }

    const note = sanitizeText(args.note, 500);
    const now = Date.now();

    await ctx.db.patch(args.paymentId, {
      status: "rejected",
      adminNote: note,
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
        status: "revoked",
        updatedAt: now,
      });
    }

    const course = await ctx.db.get(payment.courseId);
    await createNotification(ctx, {
      userId: payment.studentId,
      type: "payment_rejected",
      title: "Payment approval revoked",
      body: note,
      link: "/dashboard/student/payments",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.approval_revoked",
      entityType: "payments",
      entityId: args.paymentId,
      details: JSON.stringify({
        courseId: payment.courseId,
        studentId: payment.studentId,
        courseTitle: course?.title,
      }),
    });
  },
});

export const getSuspendedForCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .first();

    const suspendedPayment = await ctx.db
      .query("payments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .filter((q) => q.eq(q.field("status"), "suspended"))
      .first();

    if (enrollment?.status !== "suspended" && !suspendedPayment) {
      return null;
    }

    const course = await ctx.db.get(args.courseId);
    const payment = suspendedPayment
      ? {
          ...suspendedPayment,
          adminNote: suspendedPayment.adminNote,
        }
      : null;

    return {
      enrollmentStatus: enrollment?.status,
      adminNote: payment?.adminNote,
      courseTitle: course?.title,
    };
  },
});

export const restoreAccess = mutation({
  args: {
    paymentId: v.id("payments"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "suspended") {
      throw new Error("Only suspended payments can be restored");
    }

    const now = Date.now();
    await ctx.db.patch(args.paymentId, {
      status: "approved",
      adminNote: args.note ? sanitizeText(args.note, 500) : payment.adminNote,
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
      title: "Course access restored",
      body:
        args.note?.trim() ??
        `Your access to "${course?.title ?? "your course"}" has been restored.`,
      link: course ? `/learn/${course.slug}` : "/dashboard/student/courses",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "payment.access_restored",
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
