"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CreditCard, Smartphone } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { paymentFormSchema, type PaymentFormValues } from "@/schemas";
import { PaymentFixFormFromRecord } from "@/features/student/payment-fix-form";
import { StripeCheckoutButton } from "@/features/student/stripe-checkout-button";
import {
  clearPaymentDraft,
  readPaymentDraft,
  writePaymentDraft,
} from "@/lib/payment-form-draft";
import { useConvexUploadReady } from "@/hooks/use-convex-upload-ready";
import {
  PAYMENT_PROOF_ACCEPT,
  uploadPaymentProofToConvex,
} from "@/lib/payment-upload";
import { type } from "@/lib/typography";
import { cn, formatPrice } from "@/lib/utils";

type PaymentType = "mobile_money" | "bank_transfer";

type PaymentMode = "choose" | "stripe" | "manual";

type PurchaseDraft = {
  paymentMode?: PaymentMode;
  step?: number;
  paymentType?: PaymentType | null;
  selectedProviderId?: string | null;
  screenshotId?: string | null;
  fullName?: string;
  phone?: string;
  transactionReference?: string;
  notes?: string;
  paymentProviderId?: string;
};

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
  const searchParams = useSearchParams();
  const draftKey = `purchase-draft:${params.slug}`;
  const stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
  const { canUpload, statusMessage } = useConvexUploadReady();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftRestoredRef = useRef(false);
  const [courseReady, setCourseReady] = useState(false);
  const [openPaymentReady, setOpenPaymentReady] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("choose");
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [screenshotId, setScreenshotId] = useState<Id<"_storage"> | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [selectedProviderId, setSelectedProviderId] =
    useState<Id<"paymentProviders"> | null>(null);

  const course = useQuery(api.courses.getBySlug, { slug: params.slug });
  const stripeConfig = useQuery(api.stripeConfig.getPublicConfig);
  const openPayment = useQuery(
    api.payments.getOpenForCourse,
    course ? { courseId: course._id } : "skip"
  );
  const suspendedAccess = useQuery(
    api.payments.getSuspendedForCourse,
    course ? { courseId: course._id } : "skip"
  );
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

  const formValues = useWatch({ control: form.control });

  const stripeAvailable =
    Boolean(stripeConfig?.stripeEnabled) && stripePublishableKey.length > 0;

  useEffect(() => {
    if (stripeConfig === undefined) return;
    if (!stripeAvailable && paymentMode === "choose") {
      setPaymentMode("manual");
    }
  }, [stripeConfig, stripeAvailable, paymentMode]);

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      toast.message("Checkout cancelled — you can try again when ready.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    const draft = readPaymentDraft<PurchaseDraft>(draftKey);
    if (!draft) return;

    queueMicrotask(() => {
      if (draft.paymentMode) setPaymentMode(draft.paymentMode);
      if (draft.step && draft.step >= 1 && draft.step <= 4) {
        setStep(draft.step);
      }
      if (draft.paymentType) setPaymentType(draft.paymentType);
      if (draft.selectedProviderId) {
        setSelectedProviderId(
          draft.selectedProviderId as Id<"paymentProviders">
        );
      }
      if (draft.screenshotId) {
        setScreenshotId(draft.screenshotId as Id<"_storage">);
      }
      form.reset({
        fullName: draft.fullName ?? "",
        phone: draft.phone ?? "",
        transactionReference: draft.transactionReference ?? "",
        notes: draft.notes ?? "",
        paymentProviderId: draft.paymentProviderId ?? "",
      });
    });
  }, [draftKey, form]);

  useEffect(() => {
    if (!draftRestoredRef.current) return;
    writePaymentDraft(draftKey, {
      paymentMode,
      step,
      paymentType,
      selectedProviderId,
      screenshotId,
      ...formValues,
    });
  }, [
    draftKey,
    paymentMode,
    step,
    paymentType,
    selectedProviderId,
    screenshotId,
    formValues,
  ]);

  if (course !== undefined && !courseReady) {
    setCourseReady(true);
  }
  if (openPayment !== undefined && !openPaymentReady) {
    setOpenPaymentReady(true);
  }

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
    if (!canUpload) {
      toast.error("Please wait until your account is connected, then try again.");
      return;
    }

    setUploading(true);
    try {
      const storageId = await uploadPaymentProofToConvex(
        () => generateUploadUrl(),
        file
      );
      setScreenshotId(storageId);
      toast.success("Payment screenshot uploaded");
    } catch (error) {
      setScreenshotId(null);
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Please sign in again and retry."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      clearPaymentDraft(draftKey);
      router.push("/dashboard/student/payments");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    }
  }

  if (course === undefined && !courseReady) {
    return <p className="text-sm text-muted-foreground">Loading course...</p>;
  }

  if (!course) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/courses" className="mt-4 inline-block">
          <Button variant="outline">Back to courses</Button>
        </Link>
      </div>
    );
  }

  if (course.isEnrolled) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">You already have access to this course.</p>
        <Link href={`/learn/${course.slug}`} className="mt-4 inline-block">
          <Button>Continue Learning</Button>
        </Link>
      </div>
    );
  }

  if (suspendedAccess) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Your access to this course is suspended. You cannot submit a new payment
          request until an administrator restores access or updates your payment
          status.
        </p>
        {suspendedAccess.adminNote && (
          <p className="mt-2 text-sm text-muted-foreground">
            Admin note: {suspendedAccess.adminNote}
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/student/payments">
            <Button variant="outline">View payment history</Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button>Contact support</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (openPayment === undefined && !openPaymentReady) {
    return <p className="text-sm text-muted-foreground">Loading payment status...</p>;
  }

  if (openPayment?.status === "pending") {
    if (openPayment.method === "stripe") {
      return (
        <div className="text-center">
          <p className="text-muted-foreground">
            You started a card checkout for this course. Complete payment or try
            again below.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <StripeCheckoutButton
              courseId={course._id}
              className="w-full max-w-sm"
            />
            <Link href="/dashboard/student/payments" className="text-sm text-muted-foreground hover:text-foreground">
              View payment history
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          You already submitted payment for this course. It is awaiting admin
          review.
        </p>
        <Link href="/dashboard/student/payments" className="mt-4 inline-block">
          <Button>View payment status</Button>
        </Link>
      </div>
    );
  }

  if (
    openPayment &&
    (openPayment.status === "rejected" ||
      openPayment.status === "resubmit_requested")
  ) {
    return (
      <>
        <Link
          href={`/courses/${params.slug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to course
        </Link>
        <h1 className={`mt-4 ${type.pageTitle}`}>Update payment: {course.title}</h1>
        <p className={`mt-1 ${type.muted}`}>
          Amount: {formatPrice(course.price, course.currency)}
        </p>
        <Card className="mt-8 border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <PaymentFixFormFromRecord
              payment={openPayment}
              showSupportLink={false}
              onSuccess={() => router.push("/dashboard/student/payments")}
            />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/courses/${params.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to course
      </Link>
      <h1 className={`mt-4 ${type.pageTitle}`}>Purchase: {course.title}</h1>
      <p className={`mt-1 ${type.muted}`}>
        Amount: {formatPrice(course.price, course.currency)}
      </p>

      {paymentMode === "choose" && course.price > 0 && (
        <Card className="mt-8 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>How would you like to pay?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {stripeAvailable && (
              <button
                type="button"
                onClick={() => setPaymentMode("stripe")}
                className="rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-brand-600 hover:bg-brand-50"
              >
                <CreditCard className="h-6 w-6 text-brand-600" />
                <p className="mt-3 font-semibold text-foreground">Card (Stripe)</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pay securely with debit or credit card. Instant access after
                  payment.
                </p>
              </button>
            )}
            <button
              type="button"
              onClick={() => setPaymentMode("manual")}
              className="rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-brand-600 hover:bg-brand-50"
            >
              <Smartphone className="h-6 w-6 text-brand-600" />
              <p className="mt-3 font-semibold text-foreground">
                Mobile money / Bank
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send payment manually and upload proof for admin review.
              </p>
            </button>
          </CardContent>
        </Card>
      )}

      {paymentMode === "stripe" && stripeAvailable && (
        <Card className="mt-8 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Pay with card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You&apos;ll be redirected to Stripe to complete payment. Access is
              granted automatically once payment succeeds.
            </p>
            <StripeCheckoutButton courseId={course._id} className="w-full" />
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setPaymentMode("choose")}
            >
              Choose another method
            </Button>
          </CardContent>
        </Card>
      )}

      {paymentMode === "manual" && (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Manual payment steps</p>
            {(stripeAvailable || paymentMode === "manual") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentMode("choose");
                  setStep(1);
                }}
              >
                Change method
              </Button>
            )}
          </div>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              s <= step ? "bg-brand-600" : "bg-muted-foreground/15"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card className="mt-8 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Your details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="ref">Transaction Reference</Label>
              <Input
                id="ref"
                {...form.register("transactionReference")}
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                className="mt-1 bg-background"
              />
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-8 border-border bg-card shadow-sm">
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
                        ? "border-brand-600 bg-brand-50 text-brand-900"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-brand-700" : "text-muted-foreground"
                      )}
                    />
                    <p className="mt-3 font-medium text-foreground">
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
                  <p className="text-sm text-muted-foreground">Loading options...</p>
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
                              : "border-border bg-background text-foreground hover:bg-muted"
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
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-brand-950">
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
        <Card className="mt-8 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Upload payment screenshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProvider && (
              <p className="text-sm text-muted-foreground">
                Upload proof for your {selectedProvider.name} payment.
              </p>
            )}
            <Input
              ref={fileInputRef}
              type="file"
              accept={PAYMENT_PROOF_ACCEPT}
              disabled={uploading || !canUpload}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileUpload(file);
              }}
            />
            {statusMessage && (
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            )}
            {uploading && (
              <p className="text-sm text-muted-foreground">Uploading… this may take a moment.</p>
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
        <Card className="mt-8 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Review & submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProvider && (
              <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                <p>
                  <strong>Provider:</strong> {selectedProvider.name}
                </p>
                <p className="mt-1">
                  <strong>Number:</strong> {selectedProvider.accountNumber}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
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
      )}
    </>
  );
}
