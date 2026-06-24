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
import { sanitizeText, validateImageUrl, validatePrice, resolveCompareAtPrice, sanitizeLearningOutcomes } from "./lib/validation";
import { parseYoutubeVideoId } from "./lib/youtube";
import {
  assertCanManageCourse,
  canLearnCourse,
  canViewManagedCourse,
  isCourseInstructor,
} from "./lib/courseAccess";
import { getActiveEnrollmentCount } from "./lib/enrollmentStats";
import { findOpenPaymentForCourse } from "./lib/payments";
import { courseDifficulty, courseStatus } from "./schema";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

function isFreeCourse(course: { price: number }) {
  return course.price <= 0;
}

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

async function enrichHomepageCourse(ctx: QueryCtx, course: Doc<"courses">) {
  const enriched = await enrichManagedCourse(ctx, course);
  const durationHours = Math.max(
    1,
    Math.ceil(enriched.lessonCount / 2)
  );
  const compareAtPrice =
    course.compareAtPrice && course.compareAtPrice > course.price
      ? course.compareAtPrice
      : undefined;

  return {
    _id: enriched._id,
    slug: enriched.slug,
    title: enriched.title,
    description: enriched.description,
    thumbnailUrl: enriched.thumbnailUrl,
    enrollmentCount: enriched.enrollmentCount,
    durationHours,
    lessonCount: enriched.lessonCount,
    price: enriched.price,
    currency: enriched.currency,
    compareAtPrice,
    difficulty: enriched.difficulty,
  };
}

export const listPublished = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    difficulty: v.optional(courseDifficulty),
    pricing: v.optional(v.union(v.literal("free"), v.literal("paid"))),
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

    if (args.pricing === "free") {
      courses = courses.filter((course) => isFreeCourse(course));
    } else if (args.pricing === "paid") {
      courses = courses.filter((course) => !isFreeCourse(course));
    }

    return await Promise.all(
      courses.map(async (course) => enrichPublishedCourseCard(ctx, course))
    );
  },
});

async function enrichPublishedCourseCard(ctx: QueryCtx, course: Doc<"courses">) {
  const enriched = await enrichHomepageCourse(ctx, course);
  const [teacher, category, previewLesson, user] = await Promise.all([
    ctx.db.get(course.teacherId),
    ctx.db.get(course.categoryId),
    ctx.db
      .query("lessons")
      .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
      .filter((q) => q.eq(q.field("isFreePreview"), true))
      .first(),
    getCurrentUser(ctx),
  ]);

  let isEnrolled = false;
  let canLearn = false;
  if (user) {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", user._id).eq("courseId", course._id)
      )
      .first();
    isEnrolled = enrollment?.status === "active";
    canLearn = canLearnCourse(user, course, isEnrolled);
  }

  const teacherName = teacher
    ? `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim() ||
      teacher.email
    : undefined;

  return {
    ...enriched,
    teacher,
    category,
    teacherName,
    categoryName: category?.name,
    hasFreePreview: previewLesson !== null,
    isEnrolled,
    canLearn,
  };
}

export const listRelated = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 4, 8);
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course || course.status !== "published") {
      return [];
    }

    const published = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const others = published.filter((item) => item._id !== course._id);
    const sameCategory = others.filter(
      (item) => item.categoryId === course.categoryId
    );
    const otherCategories = others.filter(
      (item) => item.categoryId !== course.categoryId
    );

    const ordered = [...sameCategory, ...otherCategories].slice(0, limit);
    return Promise.all(
      ordered.map((item) => enrichPublishedCourseCard(ctx, item))
    );
  },
});

export const listHomepageSections = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const takeFour = <T,>(items: T[]) => items.slice(0, 4);

    const freeCourses = courses.filter(isFreeCourse);
    const paidCourses = courses.filter((course) => !isFreeCourse(course));
    const freeIds = new Set(freeCourses.map((course) => course._id));

    const paidOnly = paidCourses.filter((course) => !freeIds.has(course._id));

    const discountedRaw = takeFour(
      [...paidOnly]
        .filter(
          (course) =>
            course.compareAtPrice !== undefined &&
            course.compareAtPrice > course.price
        )
        .sort((a, b) => {
          const savingsA = a.compareAtPrice! - a.price;
          const savingsB = b.compareAtPrice! - b.price;
          return savingsB - savingsA || b.price - a.price;
        })
    );

    const discountedIds = new Set(discountedRaw.map((course) => course._id));

    const recentRaw = takeFour(
      [...paidOnly]
        .filter((course) => !discountedIds.has(course._id))
        .sort((a, b) => b.createdAt - a.createdAt)
    );

    const recentIds = new Set(recentRaw.map((course) => course._id));

    const freeRaw = takeFour(
      [...freeCourses].sort((a, b) => b.createdAt - a.createdAt)
    );

    const popularCandidates = [...paidOnly]
      .filter(
        (course) =>
          !discountedIds.has(course._id) && !recentIds.has(course._id)
      )
      .sort(
        (a, b) =>
          (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt)
      )
      .slice(0, 12);
    const popularEnriched = await Promise.all(
      popularCandidates.map((course) => enrichPublishedCourseCard(ctx, course))
    );
    const popular = takeFour(
      [...popularEnriched].sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    );

    const enrichById = async (rawCourses: Doc<"courses">[]) => {
      const unique = new Map(rawCourses.map((course) => [course._id, course]));
      const enriched = await Promise.all(
        [...unique.values()].map((course) => enrichPublishedCourseCard(ctx, course))
      );
      const map = new Map(enriched.map((course) => [course._id, course]));
      return rawCourses.map((course) => map.get(course._id)!);
    };

    const [discounted, recent, free] = await Promise.all([
      enrichById(discountedRaw),
      enrichById(recentRaw),
      enrichById(freeRaw),
    ]);

    const withoutFree = <T extends { price: number }>(items: T[]) =>
      items.filter((course) => !isFreeCourse(course));

    return {
      discounted: withoutFree(discounted),
      recent: withoutFree(recent),
      popular: withoutFree(popular),
      free: free.filter(isFreeCourse),
    };
  },
});

export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 4, 8);
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    return await Promise.all(
      courses.map(async (course) => {
        const enriched = await enrichManagedCourse(ctx, course);
        const [teacher, category, lessons] = await Promise.all([
          ctx.db.get(course.teacherId),
          ctx.db.get(course.categoryId),
          ctx.db
            .query("lessons")
            .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
            .collect(),
        ]);

        const durationMinutes = lessons.reduce(
          (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
          0
        );
        const durationHours = Math.max(
          1,
          durationMinutes > 0
            ? Math.round(durationMinutes / 60)
            : Math.max(1, Math.ceil(enriched.lessonCount / 2))
        );

        return {
          ...enriched,
          teacher,
          category,
          durationHours,
        };
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
    let activePayment: { _id: Id<"payments">; status: string } | null = null;
    if (user) {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_student_course", (q) =>
          q.eq("studentId", user._id).eq("courseId", course._id)
        )
        .first();
      isEnrolled = enrollment?.status === "active";

      if (!isEnrolled) {
        const openPayment = await findOpenPaymentForCourse(
          ctx,
          user._id,
          course._id
        );
        if (openPayment) {
          activePayment = {
            _id: openPayment._id,
            status: openPayment.status,
          };
        }
      }
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

    const lessonCount = modulesWithLessons.reduce(
      (acc, mod) => acc + mod.lessons.length,
      0
    );
    const totalDurationMinutes = modulesWithLessons.reduce(
      (acc, mod) =>
        acc +
        mod.lessons.reduce(
          (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
          0
        ),
      0
    );
    const enrollmentCount = await getActiveEnrollmentCount(ctx, course._id);

    const previewLessonDoc = (
      await ctx.db
        .query("lessons")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect()
    )
      .filter((lesson) => lesson.isFreePreview)
      .sort((a, b) => a.order - b.order)[0];

    let previewLesson: {
      _id: Id<"lessons">;
      title: string;
      youtubeVideoId: string | null;
      videoUrl: string | null;
    } | null = null;

    if (previewLessonDoc) {
      const videoUrl = previewLessonDoc.videoStorageId
        ? await ctx.storage.getUrl(previewLessonDoc.videoStorageId)
        : null;
      previewLesson = {
        _id: previewLessonDoc._id,
        title: previewLessonDoc.title,
        youtubeVideoId: previewLessonDoc.youtubeUrl
          ? parseYoutubeVideoId(previewLessonDoc.youtubeUrl)
          : null,
        videoUrl,
      };
    }

    return {
      ...course,
      teacher,
      category,
      modules: modulesWithLessons,
      thumbnailUrl,
      previewLesson,
      isEnrolled,
      activePayment,
      isCourseInstructor: isInstructor,
      canLearn,
      enrollmentCount,
      lessonCount,
      totalDurationMinutes,
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
    compareAtPrice: v.optional(v.number()),
    learningOutcomes: v.optional(v.array(v.string())),
    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    if (!validatePrice(args.price)) throw new Error("Invalid price");
    const compareAtPrice = resolveCompareAtPrice(args.compareAtPrice, args.price);
    const learningOutcomes = sanitizeLearningOutcomes(args.learningOutcomes);

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
      compareAtPrice,
      learningOutcomes,
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
    compareAtPrice: v.optional(v.union(v.number(), v.null())),
    learningOutcomes: v.optional(v.array(v.string())),
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
    if (args.compareAtPrice !== undefined) {
      const salePrice = (updates.price as number) ?? course.price;
      updates.compareAtPrice =
        args.compareAtPrice === null
          ? undefined
          : resolveCompareAtPrice(args.compareAtPrice, salePrice);
    } else if (args.price !== undefined && course.compareAtPrice !== undefined) {
      updates.compareAtPrice = resolveCompareAtPrice(
        course.compareAtPrice,
        args.price
      );
    }
    if (args.learningOutcomes !== undefined) {
      updates.learningOutcomes = sanitizeLearningOutcomes(args.learningOutcomes);
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
