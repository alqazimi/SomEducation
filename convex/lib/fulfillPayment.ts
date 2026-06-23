import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { logAudit } from "./audit";
import { createNotification } from "./notifications";

/** Approve a payment and grant (or restore) course enrollment. */
export async function fulfillPayment(
  ctx: MutationCtx,
  args: {
    paymentId: Id<"payments">;
    reviewedBy?: Id<"users">;
    adminNote?: string;
    auditAction?: string;
  }
) {
  const payment = await ctx.db.get(args.paymentId);
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "approved") {
    return { alreadyApproved: true as const };
  }

  const now = Date.now();
  await ctx.db.patch(args.paymentId, {
    status: "approved",
    adminNote: args.adminNote,
    reviewedBy: args.reviewedBy,
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

  if (args.reviewedBy) {
    await logAudit(ctx, {
      actorId: args.reviewedBy,
      action: args.auditAction ?? "payment.approved",
      entityType: "payments",
      entityId: args.paymentId,
    });
  }

  return { alreadyApproved: false as const, courseSlug: course?.slug };
}
