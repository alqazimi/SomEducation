import { Doc, Id } from "../_generated/dataModel";

export type UserRole = "owner" | "admin" | "teacher" | "student";
export type UserStatus = "active" | "suspended" | "deleted";
export type CourseStatus = "draft" | "pending" | "published" | "rejected";
export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "resubmit_requested"
  | "suspended";
export type EnrollmentStatus = "active" | "suspended" | "revoked";

export type UserDoc = Doc<"users">;
export type CourseDoc = Doc<"courses">;
export type PaymentDoc = Doc<"payments">;
export type EnrollmentDoc = Doc<"enrollments">;

export type AuthUser = UserDoc & { _id: Id<"users"> };
