import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  buildSearchText,
  getCurrentUser,
  isAdminOrOwner,
  requireAdmin,
  requireTeacherOrAdmin,
  slugify,
} from "./lib/auth";
import { deleteExamsForCourse } from "./exams";
import { logAudit } from "./lib/audit";
import { createNotification } from "./lib/notifications";
import { validateImageStorageFile } from "./lib/files";
import { sanitizeText, validateImageUrl, validatePrice } from "./lib/validation";
import {
  assertCanManageCourse,
  canLearnCourse,
  canViewManagedCourse,
  isCourseInstructor,
} from "./lib/courseAccess";
import { getActiveEnrollmentCount } from "./lib/enrollmentStats";
import { courseDifficulty, courseStatus } from "./schema";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

async function resolveCourseThumbnail(
  ctx: QueryCtx,
  course: Doc<"courses">
): Promise<string | null> {
  if (course.thumbnailStorageId) {
    const url = await ctx.storage.getUrl(course.thumbnailStorageId);
    if (url) return url;
  }
  if (course.thumbnailUrl) return course.thumbnailUrl;
  return null;
}

async function getModuleAndLessonCounts(ctx: QueryCtx, courseId: Id<"courses">) {
  const modules = await ctx.db
    .query("modules")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();

  let lessonCount = 0;
  for (const mod of modules) {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", mod._id))
      .collect();
    lessonCount += lessons.length;
  }

  return { moduleCount: modules.length, lessonCount };
}

async function enrichManagedCourse(ctx: QueryCtx, course: Doc<"courses">) {
  const [thumbnailUrl, enrollmentCount, counts] = await Promise.all([
    resolveCourseThumbnail(ctx, course),
    getActiveEnrollmentCount(ctx, course._id),
    getModuleAndLessonCounts(ctx, course._id),
  ]);

  return {
    ...course,
    thumbnailUrl,
    enrollmentCount,
    ...counts,
  };
}

export const listPublished = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    difficulty: v.optional(courseDifficulty),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 24, 50);

    let courses;
    if (args.search?.trim()) {
      courses = await ctx.db
        .query("courses")
        .withSearchIndex("search_courses", (q) => {
          let sq = q.search("searchText", args.search!.trim());
          sq = sq.eq("status", "published");
          if (args.categoryId) sq = sq.eq("categoryId", args.categoryId);
          if (args.difficulty) sq = sq.eq("difficulty", args.difficulty);
          return sq;
        })
        .take(limit);
    } else if (args.categoryId) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_category", (q) =>
          q.eq("categoryId", args.categoryId!).eq("status", "published")
        )
        .order("desc")
        .take(limit);
      if (args.difficulty) {
        courses = courses.filter((c) => c.difficulty === args.difficulty);
      }
    } else {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .collect();
      if (args.difficulty) {
        courses = courses.filter((c) => c.difficulty === args.difficulty);
      }
      courses = courses.slice(0, limit);
    }

    return await Promise.all(
      courses.map(async (course) => {
        const [teacher, category] = await Promise.all([
          ctx.db.get(course.teacherId),
          ctx.db.get(course.categoryId),
        ]);
        const thumbnailUrl = await resolveCourseThumbnail(ctx, course);
        return { ...course, teacher, category, thumbnailUrl };
      })
    );
  },
});

/** Public slug list for SEO sitemap generation (no auth, minimal payload). */
export const listPublishedForSitemap = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return courses.map((course) => ({
      slug: course.slug,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt,
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course) return null;

    const user = await getCurrentUser(ctx);
    const isOwner = user?._id === course.teacherId;
    const isAdmin = isAdminOrOwner(user?.role ?? "student");

    if (course.status !== "published" && !isOwner && !isAdmin) {
      return null;
    }

    const [teacher, category, modules] = await Promise.all([
      ctx.db.get(course.teacherId),
      ctx.db.get(course.categoryId),
      ctx.db
        .query("modules")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect(),
    ]);

    let isEnrolled = false;
    if (user) {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_student_course", (q) =>
          q.eq("studentId", user._id).eq("courseId", course._id)
        )
        .first();
      isEnrolled = enrollment?.status === "active";
    }

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const [lessons, exams] = await Promise.all([
          ctx.db
            .query("lessons")
            .withIndex("by_moduleId", (q) => q.eq("moduleId", mod._id))
            .collect(),
          ctx.db
            .query("exams")
            .withIndex("by_moduleId", (q) => q.eq("moduleId", mod._id))
            .collect(),
        ]);

        let examSummaries = exams
          .sort((a, b) => a.order - b.order)
          .map((exam) => ({
            _id: exam._id,
            title: exam.title,
            order: exam.order,
            passingScore: exam.passingScore,
            questionCount: 0,
            hasPassed: false,
            bestScore: null as number | null,
            canAttempt: false,
          }));

        if (user && isEnrolled) {
          examSummaries = await Promise.all(
            exams.map(async (exam) => {
              const [questions, attempts] = await Promise.all([
                ctx.db
                  .query("examQuestions")
                  .withIndex("by_examId", (q) => q.eq("examId", exam._id))
                  .collect(),
                ctx.db
                  .query("examAttempts")
                  .withIndex("by_exam_student", (q) =>
                    q.eq("examId", exam._id).eq("studentId", user._id)
                  )
                  .collect(),
              ]);
              const hasPassed = attempts.some((a) => a.passed);
              const bestScore = attempts.reduce<number | null>((best, current) => {
                if (best === null || current.scorePercent > best) {
                  return current.scorePercent;
                }
                return best;
              }, null);
              const canAttempt =
                exam.maxAttempts === 0 || attempts.length < exam.maxAttempts;

              return {
                _id: exam._id,
                title: exam.title,
                order: exam.order,
                passingScore: exam.passingScore,
                questionCount: questions.length,
                hasPassed,
                bestScore,
                canAttempt,
              };
            })
          );
        } else {
          examSummaries = await Promise.all(
            exams.map(async (exam) => {
              const questions = await ctx.db
                .query("examQuestions")
                .withIndex("by_examId", (q) => q.eq("examId", exam._id))
                .collect();
              return {
                _id: exam._id,
                title: exam.title,
                order: exam.order,
                passingScore: exam.passingScore,
                questionCount: questions.length,
                hasPassed: false,
                bestScore: null as number | null,
                canAttempt: false,
              };
            })
          );
        }

        return {
          ...mod,
          lessons: lessons.map((l) => ({
            _id: l._id,
            title: l.title,
            order: l.order,
            durationMinutes: l.durationMinutes,
            isFreePreview: l.isFreePreview,
          })),
          exams: examSummaries,
        };
      })
    );

    const thumbnailUrl = await resolveCourseThumbnail(ctx, course);

    const isInstructor = isCourseInstructor(user, course);
    const canLearn = canLearnCourse(user, course, isEnrolled);

    return {
      ...course,
      teacher,
      category,
      modules: modulesWithLessons,
      thumbnailUrl,
      isEnrolled,
      isCourseInstructor: isInstructor,
      canLearn,
    };
  },
});

export const listByTeacher = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireTeacherOrAdmin(ctx);

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_teacherId", (q) => q.eq("teacherId", user._id))
      .collect();

    return await Promise.all(
      courses.map((course) => enrichManagedCourse(ctx, course))
    );
  },
});

export const getMyCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || !canViewManagedCourse(user, course)) return null;

    const [thumbnailUrl, enrollmentCount] = await Promise.all([
      resolveCourseThumbnail(ctx, course),
      getActiveEnrollmentCount(ctx, course._id),
    ]);

    return { ...course, thumbnailUrl, enrollmentCount };
  },
});

export const listForAdmin = query({
  args: {
    status: v.optional(courseStatus),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const courses = args.status
      ? await ctx.db
          .query("courses")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("courses").order("desc").collect();

    return await Promise.all(
      courses.map(async (course) => {
        const [teacher, category, enriched] = await Promise.all([
          ctx.db.get(course.teacherId),
          ctx.db.get(course.categoryId),
          enrichManagedCourse(ctx, course),
        ]);

        return {
          ...enriched,
          teacher,
          category,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    difficulty: courseDifficulty,
    price: v.number(),
    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    if (!validatePrice(args.price)) throw new Error("Invalid price");

    if (args.thumbnailStorageId) {
      await validateImageStorageFile(ctx, args.thumbnailStorageId);
    }
    if (args.thumbnailUrl?.trim() && !validateImageUrl(args.thumbnailUrl)) {
      throw new Error("Invalid thumbnail URL");
    }

    const title = sanitizeText(args.title, 200);
    let slug = slugify(title);
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) slug = `${slug}-${Date.now()}`;

    const now = Date.now();
    return await ctx.db.insert("courses", {
      title,
      slug,
      description: sanitizeText(args.description, 10000),
      thumbnailStorageId: args.thumbnailStorageId,
      thumbnailUrl: args.thumbnailStorageId
        ? undefined
        : args.thumbnailUrl?.trim() || undefined,
      categoryId: args.categoryId,
      difficulty: args.difficulty,
      price: args.price,
      currency: "USD",
      teacherId: user._id,
      status: "draft",
      searchText: buildSearchText([title, args.description]),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    difficulty: v.optional(courseDifficulty),
    price: v.optional(v.number()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const course = await assertCanManageCourse(ctx, args.courseId, user);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title) updates.title = sanitizeText(args.title, 200);
    if (args.description)
      updates.description = sanitizeText(args.description, 10000);
    if (args.categoryId) updates.categoryId = args.categoryId;
    if (args.difficulty) updates.difficulty = args.difficulty;
    if (args.price !== undefined) {
      if (!validatePrice(args.price)) throw new Error("Invalid price");
      updates.price = args.price;
    }
    if (args.thumbnailStorageId) {
      await validateImageStorageFile(ctx, args.thumbnailStorageId);
      updates.thumbnailStorageId = args.thumbnailStorageId;
      updates.thumbnailUrl = undefined;
    }
    if (args.thumbnailUrl !== undefined) {
      if (args.thumbnailUrl.trim() && !validateImageUrl(args.thumbnailUrl)) {
        throw new Error("Invalid thumbnail URL");
      }
      updates.thumbnailUrl = args.thumbnailUrl.trim() || undefined;
    }
    if (args.title || args.description) {
      updates.searchText = buildSearchText([
        (updates.title as string) ?? course.title,
        (updates.description as string) ?? course.description,
      ]);
    }

    await ctx.db.patch(args.courseId, updates);
  },
});

export const submitForReview = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    await assertCanManageCourse(ctx, args.courseId, user);

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();
    if (!modules) throw new Error("Course must have at least one module");

    await ctx.db.patch(args.courseId, {
      status: "pending",
      updatedAt: Date.now(),
    });
  },
});

export const approveCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const now = Date.now();
    await ctx.db.patch(args.courseId, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
      rejectionReason: undefined,
    });

    await createNotification(ctx, {
      userId: course.teacherId,
      type: "course_approved",
      title: "Course Published",
      body: `Your course "${course.title}" has been approved and published.`,
      link: `/courses/${course.slug}`,
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "course.approved",
      entityType: "courses",
      entityId: args.courseId,
    });
  },
});

export const rejectCourse = mutation({
  args: {
    courseId: v.id("courses"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    await ctx.db.patch(args.courseId, {
      status: "rejected",
      rejectionReason: sanitizeText(args.reason, 500),
      updatedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId: course.teacherId,
      type: "course_rejected",
      title: "Course Rejected",
      body: sanitizeText(args.reason, 500),
      link: "/dashboard/teacher/courses",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "course.rejected",
      entityType: "courses",
      entityId: args.courseId,
    });
  },
});

export const unpublish = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    await ctx.db.patch(args.courseId, {
      status: "draft",
      publishedAt: undefined,
      updatedAt: Date.now(),
    });

    await createNotification(ctx, {
      userId: course.teacherId,
      type: "course_rejected",
      title: "Course Made Private",
      body: `Your course "${course.title}" was removed from the public catalog by an admin.`,
      link: "/dashboard/teacher/courses",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "course.unpublished",
      entityType: "courses",
      entityId: args.courseId,
    });
  },
});

export const remove = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    await assertCanManageCourse(ctx, args.courseId, user);

    const [modules, lessons] = await Promise.all([
      ctx.db
        .query("modules")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
        .collect(),
      ctx.db
        .query("lessons")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
        .collect(),
    ]);

    for (const lesson of lessons) await ctx.db.delete(lesson._id);
    await deleteExamsForCourse(ctx, args.courseId);
    for (const mod of modules) await ctx.db.delete(mod._id);
    await ctx.db.delete(args.courseId);

    await logAudit(ctx, {
      actorId: user._id,
      action: "course.deleted",
      entityType: "courses",
      entityId: args.courseId,
    });
  },
});
