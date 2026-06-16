import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { PaymentStatus } from "./types";

export const OPEN_PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "resubmit_requested",
  "rejected",
];

export const FIXABLE_PAYMENT_STATUSES: PaymentStatus[] = [
  "resubmit_requested",
  "rejected",
];

export function isOpenPaymentStatus(status: PaymentStatus) {
  return OPEN_PAYMENT_STATUSES.includes(status);
}

export function isFixablePaymentStatus(status: PaymentStatus) {
  return FIXABLE_PAYMENT_STATUSES.includes(status);
}

export async function findOpenPaymentForCourse(
  ctx: QueryCtx,
  studentId: Id<"users">,
  courseId: Id<"courses">
) {
  const payments = await ctx.db
    .query("payments")
    .withIndex("by_student_course", (q) =>
      q.eq("studentId", studentId).eq("courseId", courseId)
    )
    .collect();

  return (
    payments
      .filter((payment) => isOpenPaymentStatus(payment.status))
      .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null
  );
}
