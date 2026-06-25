import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  buildSearchText,
  getCurrentUser,
  isOwner,
  requireAdmin,
  requireAuthenticatedUser,
  requireCurrentUser,
} from "./lib/auth";
import { logAudit } from "./lib/audit";
import { getOwnerEmails, requiresMfa } from "./lib/roles";
import { sanitizeText, validatePhone } from "./lib/validation";
import { validateImageStorageFile } from "./lib/files";
import { resolveProfileImageUrl } from "./lib/profileImage";
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
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const profileImageUrl = await resolveProfileImageUrl(ctx, user);
    return { ...user, profileImageUrl };
  },
});

export const getUserEmailInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.status === "deleted") return null;
    return user.email?.trim().toLowerCase() ?? null;
  },
});

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthenticatedUser(ctx);
    if (
      getOwnerEmails().includes((user.email ?? "").toLowerCase()) &&
      user.role !== "owner"
    ) {
      await ctx.db.patch(user._id, {
        role: "owner",
        updatedAt: Date.now(),
      });
    }
    return user._id;
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
      mfaEnabled: requiresMfa(args.role) ? target.mfaEnabled ?? false : undefined,
      mfaSecret: requiresMfa(args.role) ? target.mfaSecret : undefined,
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
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImageStorageId: v.optional(v.id("_storage")),
    removeProfileImage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const nextFirstName =
      args.firstName !== undefined
        ? sanitizeText(args.firstName, 80)
        : user.firstName ?? "";
    const nextLastName =
      args.lastName !== undefined
        ? sanitizeText(args.lastName, 80)
        : user.lastName ?? "";

    if (args.firstName !== undefined && !nextFirstName) {
      throw new Error("First name is required");
    }
    if (args.lastName !== undefined && !nextLastName) {
      throw new Error("Last name is required");
    }

    let nextPhone = user.phone;
    if (args.phone !== undefined) {
      const phone = args.phone.trim();
      if (phone && !validatePhone(phone)) {
        throw new Error("Invalid phone number");
      }
      nextPhone = phone || undefined;
    }

    let nextBio = user.bio;
    if (args.bio !== undefined) {
      nextBio = args.bio ? sanitizeText(args.bio, 500) : undefined;
    }

    let nextProfileImageStorageId = user.profileImageStorageId;
    let nextImageUrl = user.imageUrl;
    let nextImage = user.image;

    if (args.removeProfileImage) {
      nextProfileImageStorageId = undefined;
      nextImageUrl = undefined;
      nextImage = undefined;
    } else if (args.profileImageStorageId !== undefined) {
      await validateImageStorageFile(ctx, args.profileImageStorageId);
      const url = await ctx.storage.getUrl(args.profileImageStorageId);
      nextProfileImageStorageId = args.profileImageStorageId;
      nextImageUrl = url ?? undefined;
      nextImage = url ?? undefined;
    }

    const {
      _id,
      _creationTime,
      profileImageStorageId: _oldStorageId,
      imageUrl: _oldImageUrl,
      image: _oldImage,
      ...rest
    } = user;

    const nextUser = {
      ...rest,
      firstName: nextFirstName || undefined,
      lastName: nextLastName || undefined,
      name:
        [nextFirstName, nextLastName].filter(Boolean).join(" ").trim() ||
        user.email,
      phone: nextPhone,
      bio: nextBio,
      searchText: buildSearchText([nextFirstName, nextLastName, user.email]),
      updatedAt: Date.now(),
      ...(nextProfileImageStorageId
        ? { profileImageStorageId: nextProfileImageStorageId }
        : {}),
      ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
      ...(nextImage ? { image: nextImage } : {}),
    };

    await ctx.db.replace(user._id, nextUser);
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
