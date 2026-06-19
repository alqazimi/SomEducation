import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireTeacherOrAdmin } from "./lib/auth";
import { assertCanManageCourse } from "./lib/courseAccess";
import { deleteExamsForModule } from "./exams";
import { sanitizeText } from "./lib/validation";

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    await assertCanManageCourse(ctx, args.courseId, user);

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    const sortedModules = modules.sort((a, b) => a.order - b.order);

    return await Promise.all(
      sortedModules.map(async (mod) => {
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
        return {
          ...mod,
          lessons: lessons.sort((a, b) => a.order - b.order),
          exams: exams.sort((a, b) => a.order - b.order),
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    await assertCanManageCourse(ctx, args.courseId, user);

    const now = Date.now();
    return await ctx.db.insert("modules", {
      courseId: args.courseId,
      title: sanitizeText(args.title, 200),
      description: args.description
        ? sanitizeText(args.description, 2000)
        : undefined,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const mod = await ctx.db.get(args.moduleId);
    if (!mod) throw new Error("Module not found");
    await assertCanManageCourse(ctx, mod.courseId, user);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title) updates.title = sanitizeText(args.title, 200);
    if (args.description !== undefined) {
      updates.description = args.description
        ? sanitizeText(args.description, 2000)
        : undefined;
    }
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.moduleId, updates);
  },
});

export const remove = mutation({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const mod = await ctx.db.get(args.moduleId);
    if (!mod) throw new Error("Module not found");
    await assertCanManageCourse(ctx, mod.courseId, user);

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
    for (const lesson of lessons) await ctx.db.delete(lesson._id);
    await deleteExamsForModule(ctx, args.moduleId);
    await ctx.db.delete(args.moduleId);
  },
});
