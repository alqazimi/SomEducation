"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { paymentFormSchema, type PaymentFormValues } from "@/schemas";
import { type } from "@/lib/typography";
import { cn, formatPrice } from "@/lib/utils";

type PaymentType = "mobile_money" | "bank_transfer";

const typeOptions: Array<{
  value: PaymentType;
  label: string;
  icon: typeof Smartphone;
}> = [
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
];

export function PurchaseCourseForm() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [screenshotId, setScreenshotId] = useState<Id<"_storage"> | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [selectedProviderId, setSelectedProviderId] =
    useState<Id<"paymentProviders"> | null>(null);

  const course = useQuery(api.courses.getBySlug, { slug: params.slug });
  const providers = useQuery(
    api.paymentProviders.list,
    paymentType ? { type: paymentType, activeOnly: true } : "skip"
  );
  const generateUploadUrl = useMutation(api.files.generateUploadUrlMutation);
  const submitPayment = useMutation(api.payments.submit);

  const selectedProvider = useMemo(
    () => providers?.find((provider) => provider._id === selectedProviderId),
    [providers, selectedProviderId]
  );

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentProviderId: "",
    },
  });

  function handleTypeChange(nextType: PaymentType) {
    setPaymentType(nextType);
    setSelectedProviderId(null);
    form.setValue("paymentProviderId", "");
  }

  function handleProviderSelect(providerId: Id<"paymentProviders">) {
    setSelectedProviderId(providerId);
    form.setValue("paymentProviderId", providerId);
  }

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
        paymentProviderId: data.paymentProviderId as Id<"paymentProviders">,
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
      <h1 className={`mt-4 ${type.pageTitle}`}>Purchase: {course.title}</h1>
      <p className={`mt-1 ${type.muted}`}>
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
            <CardTitle>Your details</CardTitle>
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
              <Label htmlFor="ref">Transaction Reference</Label>
              <Input
                id="ref"
                {...form.register("transactionReference")}
                className="mt-1"
              />
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
            <CardTitle>Choose payment method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const active = paymentType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTypeChange(option.value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-brand-600 bg-brand-50"
                        : "border-border hover:bg-stone-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-brand-700" : "text-stone-500"
                      )}
                    />
                    <p className="mt-3 font-medium text-stone-900">
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {paymentType && (
              <div className="space-y-3">
                <p className={type.cardTitle}>
                  Choose {paymentType === "mobile_money" ? "wallet" : "bank"}
                </p>
                {!providers ? (
                  <p className="text-sm text-slate-500">Loading options...</p>
                ) : providers.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    No active {paymentType === "mobile_money" ? "mobile money" : "bank"}{" "}
                    providers are available yet. Please contact support.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {providers.map((provider) => {
                      const active = selectedProviderId === provider._id;
                      return (
                        <button
                          key={provider._id}
                          type="button"
                          onClick={() => handleProviderSelect(provider._id)}
                          className={cn(
                            "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                            active
                              ? "border-brand-600 bg-brand-50 text-brand-800"
                              : "border-border text-stone-700 hover:bg-stone-50"
                          )}
                        >
                          {provider.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedProvider && (
              <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4">
                <p className={type.cardTitle}>Send payment to {selectedProvider.name}</p>
                <p className={`mt-2 font-mono text-lg ${type.price}`}>
                  {selectedProvider.accountNumber}
                </p>
                {selectedProvider.instructions && (
                  <p className={`mt-3 ${type.bodySm}`}>
                    {selectedProvider.instructions}
                  </p>
                )}
                <p className={`mt-3 ${type.bodySm}`}>
                  Send exactly {formatPrice(course.price, course.currency)} and keep
                  your transaction reference.
                </p>
              </div>
            )}

            <Button
              onClick={() => setStep(3)}
              className="w-full"
              disabled={!selectedProviderId}
            >
              I&apos;ve made the payment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Upload payment screenshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProvider && (
              <p className="text-sm text-slate-600">
                Upload proof for your {selectedProvider.name} payment.
              </p>
            )}
            <Input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileUpload(file);
              }}
            />
            {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
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
            <CardTitle>Review & submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProvider && (
              <div className="rounded-lg border border-border bg-stone-50 p-4 text-sm text-slate-600">
                <p>
                  <strong>Provider:</strong> {selectedProvider.name}
                </p>
                <p className="mt-1">
                  <strong>Number:</strong> {selectedProvider.accountNumber}
                </p>
              </div>
            )}
            <p className="text-sm text-slate-600">
              Your payment will be reviewed by our admin team. You&apos;ll receive a
              notification once approved.
            </p>
            <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
              Submit payment request
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
