import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  isAdminOrOwner,
  requireCurrentUser,
  requireTeacherOrAdmin,
} from "./lib/auth";
import { assertCanManageCourse } from "./lib/courseAccess";
import { AuthUser } from "./lib/types";
import { sanitizeText } from "./lib/validation";

const examOptionValidator = v.object({
  id: v.string(),
  text: v.string(),
});

type Ctx = QueryCtx | MutationCtx;

async function getExamQuestions(ctx: Ctx, examId: Id<"exams">) {
  return await ctx.db
    .query("examQuestions")
    .withIndex("by_examId", (q) => q.eq("examId", examId))
    .collect();
}

export async function deleteExamData(
  ctx: MutationCtx,
  examId: Id<"exams">
) {
  const questions = await getExamQuestions(ctx, examId);
  for (const question of questions) {
    await ctx.db.delete(question._id);
  }

  const attempts = await ctx.db
    .query("examAttempts")
    .withIndex("by_exam_student", (q) => q.eq("examId", examId))
    .collect();
  for (const attempt of attempts) {
    await ctx.db.delete(attempt._id);
  }

  await ctx.db.delete(examId);
}

export async function deleteExamsForCourse(
  ctx: MutationCtx,
  courseId: Id<"courses">
) {
  const exams = await ctx.db
    .query("exams")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();
  for (const exam of exams) {
    await deleteExamData(ctx, exam._id);
  }
}

export async function deleteExamsForModule(
  ctx: MutationCtx,
  moduleId: Id<"modules">
) {
  const exams = await ctx.db
    .query("exams")
    .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
    .collect();
  for (const exam of exams) {
    await deleteExamData(ctx, exam._id);
  }
}

async function requireEnrollmentOrStaff(
  ctx: QueryCtx,
  courseId: Id<"courses">,
  user: AuthUser
) {
  const course = await ctx.db.get(courseId);
  if (!course) throw new Error("Course not found");

  if (isAdminOrOwner(user.role) || course.teacherId === user._id) {
    return course;
  }

  const enrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_student_course", (q) =>
      q.eq("studentId", user._id).eq("courseId", courseId)
    )
    .first();

  if (enrollment?.status !== "active") {
    throw new Error("Enrollment required");
  }

  return course;
}

function stripQuestionForStudent(
  question: {
    _id: Id<"examQuestions">;
    questionText: string;
    order: number;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    explanation?: string;
  }
) {
  return {
    _id: question._id,
    questionText: question.questionText,
    order: question.order,
    options: question.options,
  };
}

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    await assertCanManageCourse(ctx, args.courseId, user);

    const exams = await ctx.db
      .query("exams")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    return await Promise.all(
      exams.map(async (exam) => {
        const questions = await getExamQuestions(ctx, exam._id);
        return {
          ...exam,
          questions: questions.sort((a, b) => a.order - b.order),
        };
      })
    );
  },
});

export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const mod = await ctx.db.get(args.moduleId);
    if (!mod) throw new Error("Module not found");
    await assertCanManageCourse(ctx, mod.courseId, user);

    const exams = await ctx.db
      .query("exams")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    return await Promise.all(
      exams.map(async (exam) => {
        const questions = await getExamQuestions(ctx, exam._id);
        return {
          ...exam,
          questionCount: questions.length,
        };
      })
    );
  },
});

export const getForStudent = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const exam = await ctx.db.get(args.examId);
    if (!exam) return null;

    await requireEnrollmentOrStaff(ctx, exam.courseId, user);

    const questions = await getExamQuestions(ctx, exam._id);
    const attempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_exam_student", (q) =>
        q.eq("examId", args.examId).eq("studentId", user._id)
      )
      .collect();

    const sortedAttempts = attempts.sort(
      (a, b) => b.submittedAt - a.submittedAt
    );
    const bestAttempt = sortedAttempts.reduce<
      (typeof sortedAttempts)[number] | null
    >((best, current) => {
      if (!best || current.scorePercent > best.scorePercent) return current;
      return best;
    }, null);
    const hasPassed = sortedAttempts.some((a) => a.passed);
    const attemptsUsed = sortedAttempts.length;
    const attemptsRemaining =
      exam.maxAttempts === 0
        ? null
        : Math.max(exam.maxAttempts - attemptsUsed, 0);

    return {
      ...exam,
      questionCount: questions.length,
      attemptsUsed,
      attemptsRemaining,
      canAttempt:
        exam.maxAttempts === 0 ||
        attemptsUsed < exam.maxAttempts ||
        isAdminOrOwner(user.role),
      hasPassed,
      bestScore: bestAttempt?.scorePercent ?? null,
      latestAttemptId: sortedAttempts[0]?._id ?? null,
    };
  },
});

export const getExamToTake = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const exam = await ctx.db.get(args.examId);
    if (!exam) return null;

    await requireEnrollmentOrStaff(ctx, exam.courseId, user);

    const questions = await getExamQuestions(ctx, exam._id);
    if (questions.length === 0) {
      throw new Error("This exam has no questions yet");
    }

    const attempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_exam_student", (q) =>
        q.eq("examId", args.examId).eq("studentId", user._id)
      )
      .collect();

    const attemptsUsed = attempts.length;
    if (
      exam.maxAttempts > 0 &&
      attemptsUsed >= exam.maxAttempts &&
      !isAdminOrOwner(user.role) &&
      (await ctx.db.get(exam.courseId))?.teacherId !== user._id
    ) {
      throw new Error("No attempts remaining for this exam");
    }

    const mod = await ctx.db.get(exam.moduleId);
    const course = await ctx.db.get(exam.courseId);

    return {
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimitMinutes: exam.timeLimitMinutes,
        maxAttempts: exam.maxAttempts,
        questionCount: questions.length,
        attemptsUsed,
      },
      moduleTitle: mod?.title ?? "Module",
      courseTitle: course?.title ?? "Course",
      courseSlug: course?.slug ?? "",
      questions: questions
        .sort((a, b) => a.order - b.order)
        .map(stripQuestionForStudent),
    };
  },
});

export const getAttemptResult = query({
  args: { attemptId: v.id("examAttempts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) return null;

    if (
      attempt.studentId !== user._id &&
      !isAdminOrOwner(user.role)
    ) {
      const course = await ctx.db.get(attempt.courseId);
      if (course?.teacherId !== user._id) {
        throw new Error("Access denied");
      }
    }

    const exam = await ctx.db.get(attempt.examId);
    if (!exam) return null;

    const questions = await getExamQuestions(ctx, attempt.examId);
    const answerMap = new Map(
      attempt.answers.map((a) => [a.questionId, a.selectedOptionId])
    );

    const breakdown = questions
      .sort((a, b) => a.order - b.order)
      .map((question) => {
        const selectedOptionId = answerMap.get(question._id);
        const isCorrect = selectedOptionId === question.correctOptionId;
        return {
          questionId: question._id,
          questionText: question.questionText,
          options: question.options,
          selectedOptionId,
          correctOptionId: question.correctOptionId,
          explanation: question.explanation,
          isCorrect,
        };
      });

    return {
      attempt: {
        _id: attempt._id,
        scorePercent: attempt.scorePercent,
        passed: attempt.passed,
        attemptNumber: attempt.attemptNumber,
        submittedAt: attempt.submittedAt,
      },
      exam: {
        _id: exam._id,
        title: exam.title,
        passingScore: exam.passingScore,
      },
      breakdown,
    };
  },
});

export const create = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const mod = await ctx.db.get(args.moduleId);
    if (!mod) throw new Error("Module not found");
    await assertCanManageCourse(ctx, mod.courseId, user);

    const existing = await ctx.db
      .query("exams")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    const passingScore = args.passingScore ?? 70;
    if (passingScore < 1 || passingScore > 100) {
      throw new Error("Passing score must be between 1 and 100");
    }

    const now = Date.now();
    return await ctx.db.insert("exams", {
      courseId: mod.courseId,
      moduleId: args.moduleId,
      title: sanitizeText(args.title, 200),
      description: args.description
        ? sanitizeText(args.description, 2000)
        : undefined,
      passingScore,
      timeLimitMinutes: args.timeLimitMinutes,
      maxAttempts: args.maxAttempts ?? 3,
      order: args.order ?? existing.length + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    examId: v.id("exams"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    passingScore: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const exam = await ctx.db.get(args.examId);
    if (!exam) throw new Error("Exam not found");
    await assertCanManageCourse(ctx, exam.courseId, user);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title) updates.title = sanitizeText(args.title, 200);
    if (args.description !== undefined) {
      updates.description = args.description
        ? sanitizeText(args.description, 2000)
        : undefined;
    }
    if (args.passingScore !== undefined) {
      if (args.passingScore < 1 || args.passingScore > 100) {
        throw new Error("Passing score must be between 1 and 100");
      }
      updates.passingScore = args.passingScore;
    }
    if (args.timeLimitMinutes !== undefined) {
      updates.timeLimitMinutes = args.timeLimitMinutes;
    }
    if (args.maxAttempts !== undefined) updates.maxAttempts = args.maxAttempts;
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.examId, updates);
  },
});

export const remove = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const exam = await ctx.db.get(args.examId);
    if (!exam) throw new Error("Exam not found");
    await assertCanManageCourse(ctx, exam.courseId, user);
    await deleteExamData(ctx, args.examId);
  },
});

export const addQuestion = mutation({
  args: {
    examId: v.id("exams"),
    questionText: v.string(),
    options: v.array(examOptionValidator),
    correctOptionId: v.string(),
    explanation: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const exam = await ctx.db.get(args.examId);
    if (!exam) throw new Error("Exam not found");
    await assertCanManageCourse(ctx, exam.courseId, user);

    if (args.options.length < 2) {
      throw new Error("Each question needs at least 2 options");
    }
    if (!args.options.some((o) => o.id === args.correctOptionId)) {
      throw new Error("Correct option must match one of the provided options");
    }

    const existing = await getExamQuestions(ctx, args.examId);
    const now = Date.now();

    const questionId = await ctx.db.insert("examQuestions", {
      examId: args.examId,
      questionText: sanitizeText(args.questionText, 1000),
      order: args.order ?? existing.length + 1,
      options: args.options.map((o) => ({
        id: o.id,
        text: sanitizeText(o.text, 500),
      })),
      correctOptionId: args.correctOptionId,
      explanation: args.explanation
        ? sanitizeText(args.explanation, 2000)
        : undefined,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.examId, { updatedAt: now });
    return questionId;
  },
});

export const updateQuestion = mutation({
  args: {
    questionId: v.id("examQuestions"),
    questionText: v.optional(v.string()),
    options: v.optional(v.array(examOptionValidator)),
    correctOptionId: v.optional(v.string()),
    explanation: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const exam = await ctx.db.get(question.examId);
    if (!exam) throw new Error("Exam not found");
    await assertCanManageCourse(ctx, exam.courseId, user);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.questionText) {
      updates.questionText = sanitizeText(args.questionText, 1000);
    }
    if (args.options) {
      if (args.options.length < 2) {
        throw new Error("Each question needs at least 2 options");
      }
      updates.options = args.options.map((o) => ({
        id: o.id,
        text: sanitizeText(o.text, 500),
      }));
    }
    if (args.correctOptionId !== undefined) {
      updates.correctOptionId = args.correctOptionId;
    }
    if (args.explanation !== undefined) {
      updates.explanation = args.explanation
        ? sanitizeText(args.explanation, 2000)
        : undefined;
    }
    if (args.order !== undefined) updates.order = args.order;

    const options =
      (updates.options as Array<{ id: string }> | undefined) ??
      question.options;
    const correctId =
      (updates.correctOptionId as string | undefined) ?? question.correctOptionId;
    if (!options.some((o) => o.id === correctId)) {
      throw new Error("Correct option must match one of the provided options");
    }

    await ctx.db.patch(args.questionId, updates);
    await ctx.db.patch(question.examId, { updatedAt: Date.now() });
  },
});

export const removeQuestion = mutation({
  args: { questionId: v.id("examQuestions") },
  handler: async (ctx, args) => {
    const user = await requireTeacherOrAdmin(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const exam = await ctx.db.get(question.examId);
    if (!exam) throw new Error("Exam not found");
    await assertCanManageCourse(ctx, exam.courseId, user);

    await ctx.db.delete(args.questionId);
    await ctx.db.patch(question.examId, { updatedAt: Date.now() });
  },
});

export const submitAttempt = mutation({
  args: {
    examId: v.id("exams"),
    answers: v.array(
      v.object({
        questionId: v.id("examQuestions"),
        selectedOptionId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const exam = await ctx.db.get(args.examId);
    if (!exam) throw new Error("Exam not found");

    await requireEnrollmentOrStaff(ctx, exam.courseId, user);

    const questions = await getExamQuestions(ctx, args.examId);
    if (questions.length === 0) {
      throw new Error("This exam has no questions yet");
    }

    const previousAttempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_exam_student", (q) =>
        q.eq("examId", args.examId).eq("studentId", user._id)
      )
      .collect();

    const course = await ctx.db.get(exam.courseId);
    const isStaff =
      isAdminOrOwner(user.role) || course?.teacherId === user._id;

    if (
      exam.maxAttempts > 0 &&
      previousAttempts.length >= exam.maxAttempts &&
      !isStaff
    ) {
      throw new Error("No attempts remaining for this exam");
    }

    const questionIds = new Set(questions.map((q) => q._id));
    for (const answer of args.answers) {
      if (!questionIds.has(answer.questionId)) {
        throw new Error("Invalid question in submission");
      }
    }

    if (args.answers.length !== questions.length) {
      throw new Error("Please answer all questions before submitting");
    }

    let correctCount = 0;
    for (const question of questions) {
      const answer = args.answers.find((a) => a.questionId === question._id);
      if (answer && answer.selectedOptionId === question.correctOptionId) {
        correctCount += 1;
      }
    }

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent >= exam.passingScore;
    const now = Date.now();

    const attemptId = await ctx.db.insert("examAttempts", {
      examId: args.examId,
      studentId: user._id,
      courseId: exam.courseId,
      answers: args.answers,
      scorePercent,
      passed,
      attemptNumber: previousAttempts.length + 1,
      submittedAt: now,
    });

    return { attemptId, scorePercent, passed };
  },
});

export async function getPassedExamIds(
  ctx: QueryCtx,
  studentId: Id<"users">,
  courseId: Id<"courses">
) {
  const attempts = await ctx.db
    .query("examAttempts")
    .withIndex("by_student_course", (q) =>
      q.eq("studentId", studentId).eq("courseId", courseId)
    )
    .collect();

  const passed = new Set<Id<"exams">>();
  for (const attempt of attempts) {
    if (attempt.passed) passed.add(attempt.examId);
  }
  return passed;
}

export async function getCourseExamCount(
  ctx: QueryCtx,
  courseId: Id<"courses">
) {
  const exams = await ctx.db
    .query("exams")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();
  return exams.length;
}
