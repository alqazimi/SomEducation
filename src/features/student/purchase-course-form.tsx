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
  PAYMENT_PROOF_HINT,
  uploadPaymentProofToConvex,
} from "@/lib/payment-upload";
import { PurchaseStepNav } from "@/features/student/purchase-step-nav";
import { type } from "@/lib/typography";
import { cn, formatPrice } from "@/lib/utils";

type PaymentType = "mobile_money" | "bank_transfer";

type PurchaseDraft = {
  step?: number;
  paymentType?: PaymentType | null;
  selectedProviderId?: string | null;
  screenshotId?: string | null;
  fullName?: string;
  phone?: string;
  transactionReference?: string;
  notes?: string;
  paymentProviderId?: string;
  method?: PaymentType;
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
  const { canUpload, canTransact, statusMessage } = useConvexUploadReady();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftRestoredRef = useRef(false);
  const [courseReady, setCourseReady] = useState(false);
  const [openPaymentReady, setOpenPaymentReady] = useState(false);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(
    null
  );
  const screenshotPreviewRef = useRef<string | null>(null);
  const [screenshotId, setScreenshotId] = useState<Id<"_storage"> | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [selectedProviderId, setSelectedProviderId] =
    useState<Id<"paymentProviders"> | null>(null);

  const course = useQuery(api.courses.getBySlug, { slug: params.slug });
  const stripeConfig = useQuery(api.stripeConfig.getPublicConfig);
  const platformSettings = useQuery(api.settings.get);
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
      fullName: "",
      phone: "",
      transactionReference: "",
      notes: "",
      paymentProviderId: "",
      method: undefined,
    },
  });

  const formValues = useWatch({ control: form.control });
  const formErrors = form.formState.errors;

  const stripeConfigured = stripeConfig?.stripeConfigured === true;
  const stripeReady = stripeConfig?.stripeReady === true;

  const manualProvidersReady = providers !== undefined;
  const hasActiveProviders = (providers?.length ?? 0) > 0;
  const canContinueStep2 = Boolean(
    selectedProviderId ||
      (paymentType && manualProvidersReady && !hasActiveProviders)
  );

  useEffect(() => {
    return () => {
      if (screenshotPreviewRef.current) {
        URL.revokeObjectURL(screenshotPreviewRef.current);
      }
    };
  }, []);

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
      if (draft.step && draft.step >= 1 && draft.step <= 4) {
        setStep(draft.step);
      }
      if (draft.paymentType) setPaymentType(draft.paymentType);
      if (draft.screenshotId) {
        setScreenshotId(draft.screenshotId as Id<"_storage">);
      }
      const restoredProviderId = draft.selectedProviderId ?? draft.paymentProviderId;
      if (restoredProviderId) {
        setSelectedProviderId(restoredProviderId as Id<"paymentProviders">);
      }
      form.reset({
        fullName: draft.fullName ?? "",
        phone: draft.phone ?? "",
        transactionReference: draft.transactionReference ?? "",
        notes: draft.notes ?? "",
        paymentProviderId: restoredProviderId ?? "",
        method:
          restoredProviderId || !draft.paymentType
            ? undefined
            : draft.paymentType,
      });
    });
  }, [draftKey, form]);

  useEffect(() => {
    if (!draftRestoredRef.current) return;
    writePaymentDraft(draftKey, {
      step,
      paymentType,
      selectedProviderId,
      screenshotId,
      ...formValues,
    });
  }, [
    draftKey,
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

  function syncPaymentFields() {
    if (selectedProviderId) {
      form.setValue("paymentProviderId", selectedProviderId);
      form.setValue("method", undefined);
      return;
    }
    if (paymentType) {
      form.setValue("method", paymentType);
      form.setValue("paymentProviderId", "");
    }
  }

  function handleTypeChange(nextType: PaymentType) {
    setPaymentType(nextType);
    setSelectedProviderId(null);
    form.setValue("paymentProviderId", "");
    form.setValue("method", nextType);
  }

  function handleProviderSelect(providerId: Id<"paymentProviders">) {
    setSelectedProviderId(providerId);
    form.setValue("paymentProviderId", providerId);
    form.setValue("method", undefined);
  }

  async function goToStep2() {
    const valid = await form.trigger([
      "fullName",
      "phone",
      "transactionReference",
    ]);
    if (!valid) {
      const firstError = Object.values(form.formState.errors)[0];
      toast.error(
        firstError?.message?.toString() ?? "Please complete your details"
      );
      return;
    }
    setStep(2);
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
      if (screenshotPreviewRef.current) {
        URL.revokeObjectURL(screenshotPreviewRef.current);
      }
      if (file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name)) {
        const preview = URL.createObjectURL(file);
        screenshotPreviewRef.current = preview;
        setScreenshotPreviewUrl(preview);
      } else {
        screenshotPreviewRef.current = null;
        setScreenshotPreviewUrl(null);
      }
      toast.success("Payment screenshot uploaded");
    } catch (error) {
      setScreenshotId(null);
      setScreenshotPreviewUrl(null);
      if (screenshotPreviewRef.current) {
        URL.revokeObjectURL(screenshotPreviewRef.current);
        screenshotPreviewRef.current = null;
      }
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

  async function handleSubmitPayment() {
    if (!course || !screenshotId) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    if (!canTransact) {
      toast.error("Please wait until your account is connected, then try again.");
      return;
    }

    syncPaymentFields();

    const valid = await form.trigger();
    if (!valid) {
      const firstError = Object.values(form.formState.errors)[0];
      toast.error(
        firstError?.message?.toString() ?? "Please check your details and try again"
      );
      return;
    }

    const data = form.getValues();
    const providerId = data.paymentProviderId?.trim();
    if (!providerId && !data.method) {
      toast.error("Choose a payment method");
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      await submitPayment({
        courseId: course._id,
        fullName: data.fullName,
        phone: data.phone,
        paymentProviderId: providerId
          ? (providerId as Id<"paymentProviders">)
          : undefined,
        method: providerId ? undefined : data.method,
        transactionReference: data.transactionReference,
        notes: data.notes,
        screenshotStorageId: screenshotId,
      });
      toast.success("Payment submitted for review");
      clearPaymentDraft(draftKey);
      router.push("/dashboard/student/payments");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
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

      {course.price > 0 && (
        <Card className="relative z-10 mt-8 border-brand-200 bg-brand-50/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              Pay with card (Stripe)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fastest option — pay by debit or credit card and get instant access.
              No mobile wallet or bank provider setup needed.
            </p>
            {stripeReady ? (
              <StripeCheckoutButton courseId={course._id} className="w-full" />
            ) : stripeConfigured ? (
              <p className="text-sm text-amber-800">
                Card payments are turned off in admin settings.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Card payments are not configured yet. Use manual payment below.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-marketing-card px-3 text-sm text-muted-foreground">
            Or pay manually
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Mobile money / Bank transfer
        </p>
      </div>

      <div className="mt-6">
        <PurchaseStepNav
          step={step}
          onBack={
            step === 2
              ? () => setStep(1)
              : step === 3
                ? () => setStep(2)
                : step === 4
                  ? () => setStep(3)
                  : undefined
          }
        />
      </div>

      {step === 1 && (
        <Card className="mt-6 border-border bg-card shadow-sm">
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
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.fullName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="mt-1 bg-background"
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ref">Transaction Reference</Label>
              <Input
                id="ref"
                {...form.register("transactionReference")}
                className="mt-1 bg-background"
              />
              {formErrors.transactionReference && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.transactionReference.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                className="mt-1 bg-background"
              />
            </div>
            <Button type="button" onClick={() => void goToStep2()} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6 border-border bg-card shadow-sm">
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
                {!manualProvidersReady ? (
                  <p className="text-sm text-muted-foreground">Loading options...</p>
                ) : hasActiveProviders ? (
                  <>
                    <p className={type.cardTitle}>
                      Choose {paymentType === "mobile_money" ? "wallet" : "bank"}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {providers!.map((provider) => {
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
                  </>
                ) : (
                  <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-950">
                    <p className="font-medium">Payment instructions</p>
                    <p className="mt-2 whitespace-pre-wrap">
                      {platformSettings?.paymentInstructions ??
                        "Send the exact course amount using your preferred mobile money or bank app, then upload proof in the next step."}
                    </p>
                    <p className="mt-3">
                      Send exactly {formatPrice(course.price, course.currency)} and
                      keep your transaction reference.
                    </p>
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
              type="button"
              onClick={() => setStep(3)}
              className="w-full"
              disabled={!canContinueStep2}
            >
              I&apos;ve made the payment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-6 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Upload payment screenshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProvider ? (
              <p className="text-sm text-muted-foreground">
                Upload proof for your {selectedProvider.name} payment.
              </p>
            ) : paymentType ? (
              <p className="text-sm text-muted-foreground">
                Upload proof of your{" "}
                {paymentType === "mobile_money" ? "mobile money" : "bank"} payment.
              </p>
            ) : null}
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
            <p className="text-xs text-muted-foreground">{PAYMENT_PROOF_HINT}</p>
            {statusMessage && (
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            )}
            {uploading && (
              <p className="text-sm text-muted-foreground">Uploading… this may take a moment.</p>
            )}
            {screenshotId && (
              <p className="text-sm font-medium text-green-600">
                Screenshot uploaded successfully
              </p>
            )}
            {screenshotPreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screenshotPreviewUrl}
                alt="Payment proof preview"
                className="max-h-48 w-full rounded-lg border border-border object-contain"
              />
            )}
            <Button
              type="button"
              onClick={() => {
                syncPaymentFields();
                setStep(4);
              }}
              disabled={!screenshotId || uploading}
              className="w-full"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="mt-6 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Review & submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <p className="font-medium text-foreground">Your details</p>
              <dl className="mt-3 space-y-2 text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <dt>Name</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formValues.fullName || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Phone</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formValues.phone || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Reference</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formValues.transactionReference || "—"}
                  </dd>
                </div>
                {formValues.notes?.trim() && (
                  <div>
                    <dt>Notes</dt>
                    <dd className="mt-1 text-foreground">{formValues.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {selectedProvider ? (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Payment method</p>
                <p className="mt-2">
                  <strong>Provider:</strong> {selectedProvider.name}
                </p>
                <p className="mt-1">
                  <strong>Number:</strong> {selectedProvider.accountNumber}
                </p>
              </div>
            ) : paymentType ? (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Payment method</p>
                <p className="mt-2">
                  {paymentType === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                Choose a payment method before submitting.
              </p>
            )}

            {screenshotPreviewUrl ? (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Payment proof</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotPreviewUrl}
                  alt="Payment proof"
                  className="mt-3 max-h-52 w-full rounded-lg border border-border object-contain"
                />
              </div>
            ) : screenshotId ? (
              <p className="text-sm text-green-600">Payment proof uploaded</p>
            ) : null}

            <p className="text-sm text-muted-foreground">
              Your payment will be reviewed by our admin team. You&apos;ll receive a
              notification once approved.
            </p>
            {formErrors.paymentProviderId && (
              <p className="text-sm text-red-600">
                {formErrors.paymentProviderId.message}
              </p>
            )}
            {!canTransact && statusMessage && (
              <p className="text-sm text-amber-800">{statusMessage}</p>
            )}
            <Button
              type="button"
              onClick={() => void handleSubmitPayment()}
              className="w-full"
              disabled={submitting || !canTransact || !screenshotId}
            >
              {submitting ? "Submitting…" : "Submit payment request"}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
