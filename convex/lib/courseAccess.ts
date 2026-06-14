import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { throwError } from "./errors";
import { isAdminOrOwner } from "./roles";
import { AuthUser } from "./types";

type Ctx = QueryCtx | MutationCtx;

export async function getCourseOrThrow(ctx: Ctx, courseId: Id<"courses">) {
  const course = await ctx.db.get(courseId);
  if (!course) throwError("Course not found", "NOT_FOUND");
  return course;
}

/**
 * Instructor studio & curriculum mutations.
 * Teachers may only manage their own courses; admins/owners may manage any course.
 */
export async function assertCanManageCourse(
  ctx: Ctx,
  courseId: Id<"courses">,
  user: AuthUser
) {
  const course = await getCourseOrThrow(ctx, courseId);

  if (user.role === "teacher" && course.teacherId !== user._id) {
    throwError("You can only manage your own courses", "FORBIDDEN");
  }

  if (!isAdminOrOwner(user.role) && course.teacherId !== user._id) {
    throwError("Access denied", "FORBIDDEN");
  }

  return course;
}

export function isCourseInstructor(
  user: AuthUser | null | undefined,
  course: { teacherId: Id<"users"> }
) {
  return user?._id === course.teacherId;
}

export function canViewManagedCourse(
  user: AuthUser,
  course: { teacherId: Id<"users"> }
) {
  if (user.role === "teacher" && course.teacherId !== user._id) {
    return false;
  }
  return isAdminOrOwner(user.role) || course.teacherId === user._id;
}

export function canLearnCourse(
  user: AuthUser | null | undefined,
  course: { teacherId: Id<"users"> },
  isEnrolled: boolean
) {
  if (!user) return false;
  if (isEnrolled) return true;
  if (isCourseInstructor(user, course)) return true;
  if (isAdminOrOwner(user.role)) return true;
  return false;
}
