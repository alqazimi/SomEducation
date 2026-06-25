import { z } from "zod";

export const paymentFormSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(100),
    phone: z
      .string()
      .min(7, "Valid phone number required")
      .max(20)
      .regex(/^[\d\s+\-()]+$/, "Invalid phone format"),
    paymentProviderId: z.string().optional(),
    method: z.enum(["mobile_money", "bank_transfer"]).optional(),
    transactionReference: z
      .string()
      .min(3, "Transaction reference required")
      .max(100),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => Boolean(data.paymentProviderId?.trim()) || Boolean(data.method),
    {
      message: "Choose a payment method",
      path: ["paymentProviderId"],
    }
  );

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const paymentFixSchema = z
  .object({
    paymentProviderId: z.string().optional(),
    method: z.enum(["mobile_money", "bank_transfer"]).optional(),
    transactionReference: z
      .string()
      .min(3, "Transaction reference required")
      .max(100),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => Boolean(data.paymentProviderId?.trim()) || Boolean(data.method),
    {
      message: "Choose a payment method",
      path: ["paymentProviderId"],
    }
  );

export type PaymentFixValues = z.infer<typeof paymentFixSchema>;

export const courseFormSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(10000),
    categoryId: z.string().min(1, "Category is required"),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    price: z.coerce.number().min(0).max(1_000_000),
    compareAtPrice: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().min(0).max(1_000_000).optional()
    ),
  })
  .refine(
    (data) =>
      data.compareAtPrice === undefined || data.compareAtPrice > data.price,
    {
      message: "Regular price must be higher than sale price",
      path: ["compareAtPrice"],
    }
  );

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

export const supportMessageFormSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
});

export type SupportMessageFormValues = z.infer<typeof supportMessageFormSchema>;

export const supportReplySchema = z.object({
  body: z.string().min(1).max(5000),
});

export type SupportReplyValues = z.infer<typeof supportReplySchema>;

export const settingsFormSchema = z.object({
  paymentInstructions: z.string().max(2000).optional().or(z.literal("")),
  supportEmail: z.string().email().optional(),
  stripeEnabled: z.boolean().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const paymentProviderFormSchema = z.object({
  type: z.enum(["mobile_money", "bank_transfer"]),
  name: z.string().min(2, "Name is required").max(100),
  accountNumber: z.string().min(3, "Number is required").max(60),
  instructions: z.string().max(500).optional().or(z.literal("")),
});

export type PaymentProviderFormValues = z.infer<typeof paymentProviderFormSchema>;

export const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s+\-()]*$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128),
    confirmPassword: z.string().min(12, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
