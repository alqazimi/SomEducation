import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export async function getActiveEnrollmentCount(
  ctx: QueryCtx,
  courseId: Id<"courses">
) {
  const enrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_courseId", (q) =>
      q.eq("courseId", courseId).eq("status", "active")
    )
    .collect();
  return enrollments.length;
}
