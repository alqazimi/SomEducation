/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bootstrap from "../bootstrap.js";
import type * as categories from "../categories.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as exams from "../exams.js";
import type * as files from "../files.js";
import type * as lessons from "../lessons.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_courseAccess from "../lib/courseAccess.js";
import type * as lib_defaultCategories from "../lib/defaultCategories.js";
import type * as lib_defaultPaymentProviders from "../lib/defaultPaymentProviders.js";
import type * as lib_enrollmentStats from "../lib/enrollmentStats.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_files from "../lib/files.js";
import type * as lib_notifications from "../lib/notifications.js";
import type * as lib_roles from "../lib/roles.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_validation from "../lib/validation.js";
import type * as lib_youtube from "../lib/youtube.js";
import type * as messages from "../messages.js";
import type * as modules from "../modules.js";
import type * as notifications from "../notifications.js";
import type * as paymentProviders from "../paymentProviders.js";
import type * as payments from "../payments.js";
import type * as progress from "../progress.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as teacherRequests from "../teacherRequests.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bootstrap: typeof bootstrap;
  categories: typeof categories;
  courses: typeof courses;
  enrollments: typeof enrollments;
  exams: typeof exams;
  files: typeof files;
  lessons: typeof lessons;
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/courseAccess": typeof lib_courseAccess;
  "lib/defaultCategories": typeof lib_defaultCategories;
  "lib/defaultPaymentProviders": typeof lib_defaultPaymentProviders;
  "lib/enrollmentStats": typeof lib_enrollmentStats;
  "lib/errors": typeof lib_errors;
  "lib/files": typeof lib_files;
  "lib/notifications": typeof lib_notifications;
  "lib/roles": typeof lib_roles;
  "lib/types": typeof lib_types;
  "lib/validation": typeof lib_validation;
  "lib/youtube": typeof lib_youtube;
  messages: typeof messages;
  modules: typeof modules;
  notifications: typeof notifications;
  paymentProviders: typeof paymentProviders;
  payments: typeof payments;
  progress: typeof progress;
  seed: typeof seed;
  settings: typeof settings;
  teacherRequests: typeof teacherRequests;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
