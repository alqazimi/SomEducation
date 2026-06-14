import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, isAdminOrOwner, requireCurrentUser } from "./lib/auth";
import { canLearnCourse } from "./lib/courseAccess";
import { getCourseExamCount, getPassedExamIds } from "./exams";
import { Id } from "./_generated/dataModel";

async function getCourseLessonCount(
  ctx: import("./_generated/server").QueryCtx,
  courseId: Id<"courses">
) {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();
  return lessons.length;
}

async function getCompletedLessonIds(
  ctx: import("./_generated/server").QueryCtx,
  studentId: Id<"users">,
  courseId: Id<"courses">
) {
  const progress = await ctx.db
    .query("lessonProgress")
    .withIndex("by_student_course", (q) =>
      q.eq("studentId", studentId).eq("courseId", courseId)
    )
    .collect();
  return new Set(progress.map((p) => p.lessonId));
}

export async function getProgressSummary(
  ctx: import("./_generated/server").QueryCtx,
  studentId: Id<"users">,
  courseId: Id<"courses">
) {
  const [totalLessons, totalExams, completedIds, passedExamIds] =
    await Promise.all([
      getCourseLessonCount(ctx, courseId),
      getCourseExamCount(ctx, courseId),
      getCompletedLessonIds(ctx, studentId, courseId),
      getPassedExamIds(ctx, studentId, courseId),
    ]);

  const completedLessons = completedIds.size;
  const completedExams = passedExamIds.size;
  const totalItems = totalLessons + totalExams;
  const completedItems = completedLessons + completedExams;
  const percent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    totalLessons,
    totalExams,
    completedLessons,
    completedExams,
    totalItems,
    completedItems,
    percent,
    completedLessonIds: Array.from(completedIds),
    passedExamIds: Array.from(passedExamIds),
  };
}

export const getForCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return {
        totalLessons: 0,
        totalExams: 0,
        completedLessons: 0,
        completedExams: 0,
        totalItems: 0,
        completedItems: 0,
        percent: 0,
        completedLessonIds: [] as Id<"lessons">[],
        passedExamIds: [] as Id<"exams">[],
      };
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return {
        totalLessons: 0,
        totalExams: 0,
        completedLessons: 0,
        completedExams: 0,
        totalItems: 0,
        completedItems: 0,
        percent: 0,
        completedLessonIds: [] as Id<"lessons">[],
        passedExamIds: [] as Id<"exams">[],
      };
    }

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", args.courseId)
      )
      .first();
    const isEnrolled = enrollment?.status === "active";

    if (!canLearnCourse(user, course, isEnrolled)) {
      return {
        totalLessons: 0,
        totalExams: 0,
        completedLessons: 0,
        completedExams: 0,
        totalItems: 0,
        completedItems: 0,
        percent: 0,
        completedLessonIds: [] as Id<"lessons">[],
        passedExamIds: [] as Id<"exams">[],
      };
    }

    return await getProgressSummary(ctx, user._id, args.courseId);
  },
});

export const markLessonComplete = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const course = await ctx.db.get(lesson.courseId);
    if (!course) throw new Error("Course not found");

    const isOwner =
      isAdminOrOwner(user.role) || course.teacherId === user._id;
    if (!isOwner) {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_student_course", (q) =>
          q.eq("studentId", user._id).eq("courseId", lesson.courseId)
        )
        .first();
      if (enrollment?.status !== "active") {
        throw new Error("Enrollment required");
      }
    }

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_student_lesson", (q) =>
        q.eq("studentId", user._id).eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("lessonProgress", {
      studentId: user._id,
      courseId: lesson.courseId,
      lessonId: args.lessonId,
      completedAt: Date.now(),
    });
  },
});

export const markLessonIncomplete = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_student_lesson", (q) =>
        q.eq("studentId", user._id).eq("lessonId", args.lessonId)
      )
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});
