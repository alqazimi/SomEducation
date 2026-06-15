import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRole = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("teacher"),
  v.literal("student")
);

export const userStatus = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("deleted")
);

export const courseStatus = v.union(
  v.literal("draft"),
  v.literal("pending"),
  v.literal("published"),
  v.literal("rejected")
);

export const courseDifficulty = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced")
);

export const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("resubmit_requested"),
  v.literal("suspended")
);

export const paymentMethod = v.union(
  v.literal("bank_transfer"),
  v.literal("mobile_money"),
  v.literal("cash_transfer")
);

export const paymentProviderType = v.union(
  v.literal("mobile_money"),
  v.literal("bank_transfer")
);

export const teacherRequestStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
);

export const enrollmentStatus = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("revoked")
);

export const notificationType = v.union(
  v.literal("payment_approved"),
  v.literal("payment_rejected"),
  v.literal("payment_resubmit"),
  v.literal("new_message"),
  v.literal("teacher_approved"),
  v.literal("teacher_rejected"),
  v.literal("course_approved"),
  v.literal("course_rejected")
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: userRole,
    status: userStatus,
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    searchText: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role", "status"])
    .index("by_status", ["status"])
    .searchIndex("search_users", {
      searchField: "searchText",
      filterFields: ["role", "status"],
    }),

  teacherRequests: defineTable({
    userId: v.id("users"),
    reason: v.string(),
    experience: v.optional(v.string()),
    status: teacherRequestStatus,
    reviewedBy: v.optional(v.id("users")),
    reviewNote: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status", "createdAt"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  paymentProviders: defineTable({
    type: paymentProviderType,
    name: v.string(),
    slug: v.string(),
    accountNumber: v.string(),
    instructions: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type", "isActive"]),

  courses: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),
    categoryId: v.id("categories"),
    difficulty: courseDifficulty,
    price: v.number(),
    currency: v.string(),
    teacherId: v.id("users"),
    status: courseStatus,
    rejectionReason: v.optional(v.string()),
    searchText: v.string(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_teacherId", ["teacherId", "status"])
    .index("by_status", ["status", "publishedAt"])
    .index("by_category", ["categoryId", "status"])
    .searchIndex("search_courses", {
      searchField: "searchText",
      filterFields: ["status", "categoryId", "difficulty"],
    }),

  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_courseId", ["courseId", "order"]),

  lessons: defineTable({
    moduleId: v.id("modules"),
    courseId: v.id("courses"),
    title: v.string(),
    content: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    fileStorageId: v.optional(v.id("_storage")),
    durationMinutes: v.optional(v.number()),
    order: v.number(),
    isFreePreview: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_moduleId", ["moduleId", "order"])
    .index("by_courseId", ["courseId", "order"]),

  payments: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    fullName: v.string(),
    phone: v.string(),
    method: paymentMethod,
    paymentProviderId: v.optional(v.id("paymentProviders")),
    transactionReference: v.string(),
    notes: v.optional(v.string()),
    screenshotStorageId: v.id("_storage"),
    amount: v.number(),
    currency: v.string(),
    status: paymentStatus,
    adminNote: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_studentId", ["studentId", "createdAt"])
    .index("by_courseId", ["courseId", "status"])
    .index("by_status", ["status", "createdAt"])
    .index("by_student_course", ["studentId", "courseId"]),

  enrollments: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    paymentId: v.optional(v.id("payments")),
    status: enrollmentStatus,
    enrolledAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_studentId", ["studentId", "status"])
    .index("by_courseId", ["courseId", "status"])
    .index("by_student_course", ["studentId", "courseId"]),

  messages: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    subject: v.string(),
    body: v.string(),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientId", "isRead", "createdAt"])
    .index("by_sender", ["senderId", "createdAt"])
    .index("by_conversation", ["senderId", "recipientId", "createdAt"]),

  settings: defineTable({
    key: v.string(),
    paymentPhone: v.optional(v.string()),
    paymentInstructions: v.optional(v.string()),
    platformName: v.string(),
    supportEmail: v.optional(v.string()),
    setupChecklistDismissed: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: notificationType,
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId", "isRead", "createdAt"]),

  lessonProgress: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
    completedAt: v.number(),
  })
    .index("by_student_course", ["studentId", "courseId"])
    .index("by_student_lesson", ["studentId", "lessonId"]),

  exams: defineTable({
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.number(),
    timeLimitMinutes: v.optional(v.number()),
    maxAttempts: v.number(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_courseId", ["courseId", "order"])
    .index("by_moduleId", ["moduleId", "order"]),

  examQuestions: defineTable({
    examId: v.id("exams"),
    questionText: v.string(),
    order: v.number(),
    options: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
      })
    ),
    correctOptionId: v.string(),
    explanation: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_examId", ["examId", "order"]),

  examAttempts: defineTable({
    examId: v.id("exams"),
    studentId: v.id("users"),
    courseId: v.id("courses"),
    answers: v.array(
      v.object({
        questionId: v.id("examQuestions"),
        selectedOptionId: v.string(),
      })
    ),
    scorePercent: v.number(),
    passed: v.boolean(),
    attemptNumber: v.number(),
    submittedAt: v.number(),
  })
    .index("by_exam_student", ["examId", "studentId", "submittedAt"])
    .index("by_student_course", ["studentId", "courseId"]),

  auditLogs: defineTable({
    actorId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_actor", ["actorId", "createdAt"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_createdAt", ["createdAt"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_key", ["key"]),
});
