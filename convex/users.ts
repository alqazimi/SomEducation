import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  buildSearchText,
  getCurrentUser,
  isOwner,
  requireAdmin,
  requireCurrentUser,
  requireIdentity,
} from "./lib/auth";
import { logAudit } from "./lib/audit";
import {
  getOwnerEmails,
  resolveInitialRole,
} from "./lib/roles";
import { checkRateLimit, sanitizeText } from "./lib/validation";
import { userRole } from "./schema";
import { UserRole } from "./lib/types";

async function countActiveOwners(ctx: { db: import("./_generated/server").MutationCtx["db"] }) {
  const users = await ctx.db.query("users").collect();
  return users.filter((u) => u.role === "owner" && u.status === "active").length;
}

async function assertCanRemoveOwner(
  ctx: import("./_generated/server").MutationCtx
) {
  const owners = await countActiveOwners(ctx);
  if (owners <= 1) {
    throw new Error("Cannot remove or suspend the last platform owner");
  }
}

function assertOwnerCanManage(actorRole: UserRole, targetRole: UserRole) {
  if (!isOwner(actorRole)) {
    if (targetRole === "admin" || targetRole === "owner") {
      throw new Error("Only the platform owner can manage admin accounts");
    }
  }
}

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const syncUser = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await checkRateLimit(ctx, `sync:${identity.subject}`, 10);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();
    const email = args.email.toLowerCase();
    const searchText = buildSearchText([
      args.firstName,
      args.lastName,
      args.email,
    ]);

    if (existing) {
      if (existing.status === "deleted") {
        throw new Error("Account has been deleted");
      }

      const updates: Record<string, unknown> = {
        email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        searchText,
        updatedAt: now,
      };

      if (
        getOwnerEmails().includes(email) &&
        existing.role !== "owner"
      ) {
        updates.role = "owner";
      }

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    const role = resolveInitialRole(email);

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      role,
      status: "active",
      searchText,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listUsers = query({
  args: {
    role: v.optional(userRole),
    status: v.optional(
      v.union(v.literal("active"), v.literal("suspended"), v.literal("all"))
    ),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 100, 200);
    const statusFilter = args.status ?? "all";

    if (args.search?.trim()) {
      const users = await ctx.db
        .query("users")
        .withSearchIndex("search_users", (q) => {
          let sq = q.search("searchText", args.search!.trim());
          if (args.role) sq = sq.eq("role", args.role);
          if (statusFilter !== "all") sq = sq.eq("status", statusFilter);
          return sq;
        })
        .take(limit);

      return users.map((user) => ({
        ...user,
        canManage: canManageUser(actor, user),
      }));
    }

    const users = await ctx.db.query("users").collect();

    return users
      .filter((user) => user.status !== "deleted")
      .filter((user) => (args.role ? user.role === args.role : true))
      .filter((user) =>
        statusFilter === "all" ? true : user.status === statusFilter
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((user) => ({
        ...user,
        canManage: canManageUser(actor, user),
      }));
  },
});

function canManageUser(
  actor: { _id: import("./_generated/dataModel").Id<"users">; role: UserRole },
  target: { _id: import("./_generated/dataModel").Id<"users">; role: UserRole }
) {
  if (actor._id === target._id) return false;
  if (isOwner(actor.role)) return true;
  return target.role === "student" || target.role === "teacher";
}

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRole,
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target || target.status === "deleted") {
      throw new Error("User not found");
    }

    if (actor._id === target._id) {
      throw new Error("You cannot change your own role");
    }

    assertOwnerCanManage(actor.role, target.role);

    if (!isOwner(actor.role)) {
      if (args.role === "admin" || args.role === "owner") {
        throw new Error("Only the platform owner can assign admin roles");
      }
      if (target.role !== "student" && target.role !== "teacher") {
        throw new Error("This user's role cannot be changed");
      }
      if (args.role !== "student" && args.role !== "teacher") {
        throw new Error("Only student or teacher roles can be assigned here");
      }
    }

    if (target.role === "owner" && args.role !== "owner") {
      await assertCanRemoveOwner(ctx);
    }

    if (args.role === "owner" && !isOwner(actor.role)) {
      throw new Error("Only the platform owner can assign owner role");
    }

    if (target.role === args.role) {
      return;
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    await logAudit(ctx, {
      actorId: actor._id,
      action: "user.role_changed",
      entityType: "users",
      entityId: args.userId,
      details: JSON.stringify({ from: target.role, to: args.role }),
    });
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    suspend: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target || target.status === "deleted") {
      throw new Error("User not found");
    }

    if (actor._id === target._id) {
      throw new Error("You cannot suspend your own account");
    }

    assertOwnerCanManage(actor.role, target.role);

    if (target.role === "owner" && args.suspend) {
      await assertCanRemoveOwner(ctx);
    }

    await ctx.db.patch(args.userId, {
      status: args.suspend ? "suspended" : "active",
      updatedAt: Date.now(),
    });

    await logAudit(ctx, {
      actorId: actor._id,
      action: args.suspend ? "user.suspended" : "user.unsuspended",
      entityType: "users",
      entityId: args.userId,
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");

    if (actor._id === target._id) {
      throw new Error("You cannot delete your own account");
    }

    assertOwnerCanManage(actor.role, target.role);

    if (target.role === "owner") {
      await assertCanRemoveOwner(ctx);
    }

    await ctx.db.patch(args.userId, {
      status: "deleted",
      updatedAt: Date.now(),
    });

    await logAudit(ctx, {
      actorId: actor._id,
      action: "user.deleted",
      entityType: "users",
      entityId: args.userId,
    });
  },
});

export const updateProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      phone: args.phone ? sanitizeText(args.phone, 20) : undefined,
      bio: args.bio ? sanitizeText(args.bio, 500) : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const activeUsers = users.filter((u) => u.status === "active");
    const courses = await ctx.db.query("courses").collect();
    const payments = await ctx.db.query("payments").collect();
    const approvedPayments = payments.filter((p) => p.status === "approved");

    return {
      totalUsers: activeUsers.length,
      totalStudents: activeUsers.filter((u) => u.role === "student").length,
      totalTeachers: activeUsers.filter((u) => u.role === "teacher").length,
      totalOwners: activeUsers.filter((u) => u.role === "owner").length,
      totalAdmins: activeUsers.filter((u) => u.role === "admin").length,
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "published").length,
      pendingCourses: courses.filter((c) => c.status === "pending").length,
      pendingPayments: payments.filter((p) => p.status === "pending").length,
      totalRevenue: approvedPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  },
});
