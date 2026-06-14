import { describe, expect, it } from "vitest";
import { paymentFormSchema, courseFormSchema } from "@/schemas";

describe("paymentFormSchema", () => {
  it("accepts valid payment data", () => {
    const result = paymentFormSchema.safeParse({
      fullName: "John Doe",
      phone: "+44 7700 900123",
      method: "bank_transfer",
      transactionReference: "TXN-12345",
      notes: "Paid via mobile app",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone", () => {
    const result = paymentFormSchema.safeParse({
      fullName: "John Doe",
      phone: "abc",
      method: "bank_transfer",
      transactionReference: "TXN-12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short transaction reference", () => {
    const result = paymentFormSchema.safeParse({
      fullName: "John Doe",
      phone: "+44 7700 900123",
      method: "bank_transfer",
      transactionReference: "AB",
    });
    expect(result.success).toBe(false);
  });
});

describe("courseFormSchema", () => {
  it("accepts valid course data", () => {
    const result = courseFormSchema.safeParse({
      title: "Introduction to React",
      description: "Learn React from scratch with hands-on projects.",
      categoryId: "cat123",
      difficulty: "beginner",
      price: 49.99,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = courseFormSchema.safeParse({
      title: "Bad Course",
      description: "This course has invalid pricing setup.",
      categoryId: "cat123",
      difficulty: "beginner",
      price: -10,
    });
    expect(result.success).toBe(false);
  });
});
