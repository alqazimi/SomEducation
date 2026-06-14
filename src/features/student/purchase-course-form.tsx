"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { paymentFormSchema, type PaymentFormValues } from "@/schemas";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export function PurchaseCourseForm() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [screenshotId, setScreenshotId] = useState<Id<"_storage"> | null>(null);

  const course = useQuery(api.courses.getBySlug, { slug: params.slug });
  const settings = useQuery(api.settings.get);
  const generateUploadUrl = useMutation(api.files.generateUploadUrlMutation);
  const submitPayment = useMutation(api.payments.submit);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      method: "bank_transfer",
    },
  });

  async function handleFileUpload(file: File) {
    if (!["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG, and PDF files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) {
        throw new Error("Upload request failed");
      }
      const { storageId } = await result.json();
      setScreenshotId(storageId as Id<"_storage">);
      toast.success("Payment screenshot uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Please sign in again and retry."
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: PaymentFormValues) {
    if (!course || !screenshotId) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    try {
      await submitPayment({
        courseId: course._id,
        fullName: data.fullName,
        phone: data.phone,
        method: data.method,
        transactionReference: data.transactionReference,
        notes: data.notes,
        screenshotStorageId: screenshotId,
      });
      toast.success("Payment submitted for review");
      router.push("/dashboard/student/payments");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    }
  }

  if (course === undefined) {
    return <p className="text-sm text-slate-500">Loading course...</p>;
  }

  if (!course) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Course not found.</p>
        <Link href="/courses" className="mt-4 inline-block">
          <Button variant="outline">Back to courses</Button>
        </Link>
      </div>
    );
  }

  if (course.isEnrolled) {
    return (
      <div className="text-center">
        <p className="text-slate-600">You already have access to this course.</p>
        <Link href={`/learn/${course.slug}`} className="mt-4 inline-block">
          <Button>Continue Learning</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href={`/courses/${params.slug}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to course
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Purchase: {course.title}
      </h1>
      <p className="mt-1 text-slate-500">
        Amount: {formatPrice(course.price, course.currency)}
      </p>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              s <= step ? "bg-slate-900" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...form.register("fullName")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} className="mt-1" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={form.watch("method")}
                onValueChange={(v) =>
                  form.setValue("method", v as PaymentFormValues["method"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cash_transfer">Cash Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ref">Transaction Reference</Label>
              <Input id="ref" {...form.register("transactionReference")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" {...form.register("notes")} className="mt-1" />
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Send payment to:</p>
              <p className="mt-2 text-2xl font-semibold">
                {settings?.paymentPhone ?? "+44XXXXXXXXXX"}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                {settings?.paymentInstructions}
              </p>
            </div>
            <Button onClick={() => setStep(3)} className="w-full">
              I&apos;ve Made the Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Upload Payment Screenshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileUpload(file);
              }}
            />
            {uploading && (
              <p className="text-sm text-slate-500">Uploading...</p>
            )}
            {screenshotId && (
              <p className="text-sm text-green-600">Screenshot uploaded successfully</p>
            )}
            <Button onClick={() => setStep(4)} disabled={!screenshotId} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Your payment will be reviewed by our admin team. You&apos;ll receive
              a notification once approved.
            </p>
            <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
              Submit Payment Request
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
