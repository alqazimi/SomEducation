import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser, isAdminOrOwner, requireTeacherOrAdmin } from "./lib/auth";
import { assertCanManageCourse } from "./lib/courseAccess";
import { getActiveEnrollmentCount } from "./lib/enrollmentStats";

export const getTeacherStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireTeacherOrAdmin(ctx);
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_teacherId", (q) => q.eq("teacherId", user._id))
      .collect();

    let totalEnrollments = 0;
    let publishedCourses = 0;

    for (const course of courses) {
      if (course.status === "published") publishedCourses += 1;
      totalEnrollments += await getActiveEnrollmentCount(ctx, course._id);
    }

    return {
      totalCourses: courses.length,
      publishedCourses,
      totalEnrollments,
    };
  },
});

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    await assertCanManageCourse(ctx, args.courseId, user);

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) =>
        q.eq("courseId", args.courseId).eq("status", "active")
      )
      .collect();

    return await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        return { ...enrollment, student };
      })
    );
  },
});

export const checkAccess = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { hasAccess: false, reason: "not_authenticated" as const };

    const course = await ctx.db.get(args.courseId);
    if (!course) return { hasAccess: false, reason: "not_found" as const };

    if (isAdminOrOwner(user.role) || course.teacherId === user._id) {
      return { hasAccess: true, reason: "owner_or_admin" as const };
    }

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .first();

    return {
      hasAccess: enrollment?.status === "active",
      reason: (enrollment?.status ?? "not_enrolled") as string,
    };
  },
});
