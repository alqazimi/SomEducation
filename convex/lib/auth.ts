import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { AuthUser, UserRole } from "./types";
import { throwError } from "./errors";
import { isAdminOrOwner, isOwner, isStaff, requiresMfa } from "./roles";

type Ctx = QueryCtx | MutationCtx;

export async function getIdentity(ctx: Ctx) {
  return await ctx.auth.getUserIdentity();
}

export async function requireIdentity(ctx: Ctx) {
  const identity = await getIdentity(ctx);
  if (!identity) {
    throwError("Authentication required", "UNAUTHENTICATED");
  }
  return identity;
}

export async function getCurrentUser(ctx: Ctx): Promise<AuthUser | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  const user = await ctx.db.get(userId);
  if (!user || user.status === "deleted") return null;
  return user as AuthUser;
}

export async function requireAuthenticatedUser(ctx: Ctx): Promise<AuthUser> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throwError("User not found. Please sign in again.", "UNAUTHENTICATED");
  }
  if (user.status === "suspended") {
    throwError("Your account has been suspended.", "FORBIDDEN");
  }
  return user;
}

export async function requireCurrentUser(ctx: Ctx): Promise<AuthUser> {
  const user = await requireAuthenticatedUser(ctx);

  if (requiresMfa(user.role) && user.mfaEnabled) {
    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) {
      throwError("Authentication required", "UNAUTHENTICATED");
    }
    const verified = await ctx.db
      .query("mfaVerifications")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .unique();
    if (!verified) {
      throwError("Multi-factor authentication required", "MFA_REQUIRED");
    }
  }

  return user;
}

export async function requireRole(
  ctx: Ctx,
  allowedRoles: UserRole[]
): Promise<AuthUser> {
  const user = await requireCurrentUser(ctx);
  if (!allowedRoles.includes(user.role)) {
    throwError("Insufficient permissions", "FORBIDDEN");
  }
  return user;
}

export async function requireAdmin(ctx: Ctx): Promise<AuthUser> {
  return requireRole(ctx, ["admin", "owner"]);
}

export async function requireOwner(ctx: Ctx): Promise<AuthUser> {
  return requireRole(ctx, ["owner"]);
}

export async function requireTeacherOrAdmin(ctx: Ctx): Promise<AuthUser> {
  return requireRole(ctx, ["teacher", "admin", "owner"]);
}

export async function requireOwnershipOrAdmin(
  ctx: Ctx,
  ownerId: Id<"users">
): Promise<AuthUser> {
  const user = await requireCurrentUser(ctx);
  if (!isAdminOrOwner(user.role) && user._id !== ownerId) {
    throwError("Access denied", "FORBIDDEN");
  }
  return user;
}

export function buildSearchText(parts: (string | undefined | null)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .trim()
    .slice(0, 500);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export { isAdminOrOwner, isOwner, isStaff, requiresMfa };
