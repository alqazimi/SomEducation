import { z } from "zod";

export const paymentFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z
    .string()
    .min(7, "Valid phone number required")
    .max(20)
    .regex(/^[\d\s+\-()]+$/, "Invalid phone format"),
  method: z.enum(["bank_transfer", "mobile_money", "cash_transfer"]),
  transactionReference: z
    .string()
    .min(3, "Transaction reference required")
    .max(100),
  notes: z.string().max(500).optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const courseFormSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  categoryId: z.string().min(1, "Category is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  price: z.coerce.number().min(0).max(1_000_000),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  youtubeUrl: z
    .string()
    .max(500)
    .optional()
    .or(z.literal("")),
  content: z.string().max(50000).optional().or(z.literal("")),
  durationMinutes: z.coerce.number().min(0).max(600).optional(),
  isFreePreview: z.boolean().optional(),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const teacherRequestSchema = z.object({
  reason: z.string().min(20, "Please provide at least 20 characters").max(1000),
  experience: z.string().max(2000).optional(),
});

export type TeacherRequestValues = z.infer<typeof teacherRequestSchema>;

export const messageFormSchema = z.object({
  recipientId: z.string().min(1),
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
});

export type MessageFormValues = z.infer<typeof messageFormSchema>;

export const settingsFormSchema = z.object({
  paymentPhone: z.string().min(5).max(30),
  paymentInstructions: z.string().min(10).max(2000),
  supportEmail: z.string().email().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
