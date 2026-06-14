import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { isAdminOrOwner, getCurrentUser, requireTeacherOrAdmin } from "./lib/auth";
import { assertCanManageCourse } from "./lib/courseAccess";
import { getProgressSummary } from "./progress";
import { validateStorageFile } from "./lib/files";
import { sanitizeText } from "./lib/validation";
import { normalizeYoutubeUrl, parseYoutubeVideoId } from "./lib/youtube";

async function canAccessLesson(ctx: QueryCtx, lesson: Doc<"lessons">) {
  if (lesson.isFreePreview) return true;

  const user = await getCurrentUser(ctx);
  if (!user) return false;

  const course = await ctx.db.get(lesson.courseId);
  if (!course) return false;
  if (isAdminOrOwner(user.role) || course.teacherId === user._id) return true;

  const enrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_student_course", (q) =>
      q.eq("studentId", user._id).eq("courseId", lesson.courseId)
    )
    .first();

  return enrollment?.status === "active";
}

export const getLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    const hasAccess = await canAccessLesson(ctx, lesson);
    if (!hasAccess) {
      return {
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        isFreePreview: lesson.isFreePreview,
        locked: true as const,
      };
    }

    const videoUrl = lesson.videoStorageId
      ? await ctx.storage.getUrl(lesson.videoStorageId)
      : null;
    const fileUrl = lesson.fileStorageId
      ? await ctx.storage.getUrl(lesson.fileStorageId)
      : null;
    const youtubeVideoId = lesson.youtubeUrl
      ? parseYoutubeVideoId(lesson.youtubeUrl)
      : null;

    return {
      ...lesson,
      videoUrl,
      fileUrl,
      youtubeVideoId,
      locked: false as const,
    };
  },
});

export const create = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    content: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    fileStorageId: v.optional(v.id("_storage")),
    durationMinutes: v.optional(v.number()),
    order: v.number(),
    isFreePreview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const mod = await ctx.db.get(args.moduleId);
    if (!mod) throw new Error("Module not found");
    await assertCanManageCourse(ctx, mod.courseId, user);

    if (args.videoStorageId)
      await validateStorageFile(ctx, args.videoStorageId, {
        maxSize: 100 * 1024 * 1024,
      });
    if (args.fileStorageId) await validateStorageFile(ctx, args.fileStorageId);

    let youtubeUrl: string | undefined;
    if (args.youtubeUrl?.trim()) {
      const normalized = normalizeYoutubeUrl(args.youtubeUrl);
      if (!normalized) throw new Error("Invalid YouTube URL");
      youtubeUrl = normalized;
    }

    const now = Date.now();
    return await ctx.db.insert("lessons", {
      moduleId: args.moduleId,
      courseId: mod.courseId,
      title: sanitizeText(args.title, 200),
      content: args.content ? sanitizeText(args.content, 50000) : undefined,
      youtubeUrl,
      videoStorageId: args.videoStorageId,
      fileStorageId: args.fileStorageId,
      durationMinutes: args.durationMinutes,
      order: args.order,
      isFreePreview: args.isFreePreview ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    fileStorageId: v.optional(v.id("_storage")),
    durationMinutes: v.optional(v.number()),
    order: v.optional(v.number()),
    isFreePreview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    await assertCanManageCourse(ctx, lesson.courseId, user);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title) updates.title = sanitizeText(args.title, 200);
    if (args.content !== undefined) {
      updates.content = args.content
        ? sanitizeText(args.content, 50000)
        : undefined;
    }
    if (args.youtubeUrl !== undefined) {
      if (args.youtubeUrl.trim()) {
        const normalized = normalizeYoutubeUrl(args.youtubeUrl);
        if (!normalized) throw new Error("Invalid YouTube URL");
        updates.youtubeUrl = normalized;
      } else {
        updates.youtubeUrl = undefined;
      }
    }
    if (args.videoStorageId) {
      await validateStorageFile(ctx, args.videoStorageId, {
        maxSize: 100 * 1024 * 1024,
      });
      updates.videoStorageId = args.videoStorageId;
    }
    if (args.fileStorageId) {
      await validateStorageFile(ctx, args.fileStorageId);
      updates.fileStorageId = args.fileStorageId;
    }
    if (args.durationMinutes !== undefined)
      updates.durationMinutes = args.durationMinutes;
    if (args.order !== undefined) updates.order = args.order;
    if (args.isFreePreview !== undefined)
      updates.isFreePreview = args.isFreePreview;

    await ctx.db.patch(args.lessonId, updates);
  },
});

export const remove = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    await assertCanManageCourse(ctx, lesson.courseId, user);
    await ctx.db.delete(args.lessonId);
  },
});

export const listEnrolledCourses = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_studentId", (q) =>
        q.eq("studentId", user._id).eq("status", "active")
      )
      .collect();

    return await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;
        const thumbnailUrl = course.thumbnailStorageId
          ? (await ctx.storage.getUrl(course.thumbnailStorageId)) ??
            course.thumbnailUrl ??
            null
          : course.thumbnailUrl ?? null;
        const progress = await getProgressSummary(
          ctx,
          user._id,
          enrollment.courseId
        );
        return {
          ...course,
          thumbnailUrl,
          enrolledAt: enrollment.enrolledAt,
          progress,
        };
      })
    ).then((results) => results.filter(Boolean));
  },
});
