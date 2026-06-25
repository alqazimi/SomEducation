import { UserRole } from "./types";

export function isOwner(role: UserRole) {
  return role === "owner";
}

export function isAdminOrOwner(role: UserRole) {
  return role === "admin" || role === "owner";
}

export function isStaff(role: UserRole) {
  return role === "teacher" || isAdminOrOwner(role);
}

export function requiresMfa(role: UserRole) {
  return isStaff(role);
}

export function getOwnerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveInitialRole(email: string): UserRole {
  const normalized = email.toLowerCase();
  if (getOwnerEmails().includes(normalized)) return "owner";
  if (getAdminEmails().includes(normalized)) return "admin";
  return "student";
}
