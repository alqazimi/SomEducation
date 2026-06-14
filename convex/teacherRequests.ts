import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireCurrentUser } from "./lib/auth";
import { logAudit } from "./lib/audit";
import { createNotification } from "./lib/notifications";
import { sanitizeText } from "./lib/validation";

export const submitRequest = mutation({
  args: {
    reason: v.string(),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    if (user.role !== "student") {
      throw new Error("Only students can request teacher access");
    }

    const existing = await ctx.db
      .query("teacherRequests")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      throw new Error("You already have a pending teacher request");
    }

    const now = Date.now();
    return await ctx.db.insert("teacherRequests", {
      userId: user._id,
      reason: sanitizeText(args.reason, 1000),
      experience: args.experience
        ? sanitizeText(args.experience, 2000)
        : undefined,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const requests = await ctx.db
      .query("teacherRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return await Promise.all(
      requests.map(async (req) => {
        const user = await ctx.db.get(req.userId);
        return { ...req, user };
      })
    );
  },
});

export const getMyRequest = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("teacherRequests")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
  },
});

export const approve = mutation({
  args: {
    requestId: v.id("teacherRequests"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") {
      throw new Error("Request not found or already processed");
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: admin._id,
      reviewNote: args.note ? sanitizeText(args.note, 500) : undefined,
      updatedAt: now,
    });

    await ctx.db.patch(request.userId, {
      role: "teacher",
      updatedAt: now,
    });

    await createNotification(ctx, {
      userId: request.userId,
      type: "teacher_approved",
      title: "Teacher Access Approved",
      body: "Your request to become a teacher has been approved. You can now create courses.",
      link: "/dashboard/teacher/courses",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "teacher_request.approved",
      entityType: "teacherRequests",
      entityId: args.requestId,
    });
  },
});

export const reject = mutation({
  args: {
    requestId: v.id("teacherRequests"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== "pending") {
      throw new Error("Request not found or already processed");
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: admin._id,
      reviewNote: args.note ? sanitizeText(args.note, 500) : undefined,
      updatedAt: now,
    });

    await createNotification(ctx, {
      userId: request.userId,
      type: "teacher_rejected",
      title: "Teacher Request Declined",
      body:
        args.note ??
        "Your request to become a teacher was not approved at this time.",
      link: "/dashboard/student/become-teacher",
    });

    await logAudit(ctx, {
      actorId: admin._id,
      action: "teacher_request.rejected",
      entityType: "teacherRequests",
      entityId: args.requestId,
    });
  },
});
