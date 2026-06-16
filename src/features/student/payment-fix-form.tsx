"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { paymentFixSchema, type PaymentFixValues } from "@/schemas";
import {
  isPdfProofUrl,
  PAYMENT_PROOF_ACCEPT,
  uploadPaymentProofToConvex,
} from "@/lib/payment-upload";
import { cn } from "@/lib/utils";

type PaymentType = "mobile_money" | "bank_transfer";

const typeOptions: Array<{
  value: PaymentType;
  label: string;
  icon: typeof Smartphone;
}> = [
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
];

export type PaymentFixPayment = {
  _id: Id<"payments">;
  status: "rejected" | "resubmit_requested";
  method: PaymentType;
  paymentProviderId?: Id<"paymentProviders">;
  transactionReference: string;
  notes?: string;
  adminNote?: string;
  screenshotUrl?: string | null;
};

type PaymentFixFormProps = {
  payment: PaymentFixPayment;
  onSuccess?: () => void;
  showSupportLink?: boolean;
};

export function PaymentFixForm({
  payment,
  onSuccess,
  showSupportLink = true,
}: PaymentFixFormProps) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [paymentType, setPaymentType] = useState<PaymentType>(payment.method);
  const [selectedProviderId, setSelectedProviderId] =
    useState<Id<"paymentProviders"> | null>(payment.paymentProviderId ?? null);
  const [uploading, setUploading] = useState(false);
  const [screenshotId, setScreenshotId] = useState<Id<"_storage"> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const providers = useQuery(
    api.paymentProviders.list,
    paymentType ? { type: paymentType, activeOnly: true } : "skip"
  );
  const generateUploadUrl = useMutation(api.files.generateUploadUrlMutation);
  const fixAndResubmit = useMutation(api.payments.fixAndResubmit);

  const form = useForm<PaymentFixValues>({
    resolver: zodResolver(paymentFixSchema),
    defaultValues: {
      paymentProviderId: payment.paymentProviderId ?? "",
      transactionReference: payment.transactionReference,
      notes: payment.notes ?? "",
    },
  });

  const selectedProvider = useMemo(
    () => providers?.find((provider) => provider._id === selectedProviderId),
    [providers, selectedProviderId]
  );

  useEffect(() => {
    if (!providers || !selectedProviderId) return;
    const stillValid = providers.some(
      (provider) => provider._id === selectedProviderId
    );
    if (!stillValid) {
      setSelectedProviderId(null);
      form.setValue("paymentProviderId", "");
    }
  }, [providers, selectedProviderId, form]);

  useEffect(() => {
    if (selectedProviderId) {
      form.setValue("paymentProviderId", selectedProviderId);
    }
  }, [selectedProviderId, form]);

  useEffect(() => {
    if (
      paymentType !== payment.method ||
      !payment.paymentProviderId ||
      !providers ||
      selectedProviderId
    ) {
      return;
    }

    const original = providers.find(
      (provider) => provider._id === payment.paymentProviderId
    );
    if (original) {
      setSelectedProviderId(original._id);
      form.setValue("paymentProviderId", original._id);
    }
  }, [
    paymentType,
    payment.method,
    payment.paymentProviderId,
    providers,
    selectedProviderId,
    form,
  ]);

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
    if (!isAuthenticated) {
      toast.error("Please wait until you are signed in, then try again.");
      return;
    }

    setUploading(true);
    try {
      const storageId = await uploadPaymentProofToConvex(
        () => generateUploadUrl(),
        file
      );
      setScreenshotId(storageId);
      toast.success("New payment proof uploaded");
    } catch (error) {
      setScreenshotId(null);
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Please retry."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function onSubmit(data: PaymentFixValues) {
    if (!screenshotId) {
      toast.error("Please upload a new payment screenshot or receipt");
      return;
    }
    if (!selectedProviderId) {
      toast.error("Please choose a payment provider");
      return;
    }

    setSubmitting(true);
    try {
      await fixAndResubmit({
        paymentId: payment._id,
        screenshotStorageId: screenshotId,
        paymentProviderId: data.paymentProviderId as Id<"paymentProviders">,
        transactionReference: data.transactionReference,
        notes: data.notes?.trim() ? data.notes : undefined,
      });
      toast.success("Payment updated and sent back for review");
      setScreenshotId(null);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  const heading =
    payment.status === "rejected"
      ? "Fix your payment"
      : "Upload a new screenshot";

  const description =
    payment.status === "rejected"
      ? "Choose Mobile Money or Bank again, send payment, then upload new proof. You do not need to start a new purchase."
      : "Choose your payment method again if needed, then upload clearer proof.";

  const canContinueToDetails = Boolean(selectedProviderId);

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">{heading}</p>
      <p className="mt-1 text-sm text-amber-800">{description}</p>
      {payment.adminNote && (
        <p className="mt-2 text-sm text-amber-900">
          <strong>Admin note:</strong> {payment.adminNote}
        </p>
      )}
      {payment.screenshotUrl && !isPdfProofUrl(payment.screenshotUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={payment.screenshotUrl}
          alt="Previous payment screenshot"
          className="mt-3 max-h-40 rounded-lg border object-contain"
        />
      )}
      {payment.screenshotUrl && isPdfProofUrl(payment.screenshotUrl) && (
        <p className="mt-3 text-sm text-amber-900">
          Previous proof:{" "}
          <a
            href={payment.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            View PDF receipt
          </a>
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {[1, 2].map((value) => (
          <div
            key={value}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              value <= step ? "bg-amber-700" : "bg-amber-200"
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="mt-4 space-y-4">
          <div>
            <Label>Step 1 — Choose how you paid</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const active = paymentType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTypeChange(option.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                      active
                        ? "border-brand-600 bg-white shadow-sm"
                        : "border-amber-200 bg-white/60 hover:bg-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentType && (
            <div>
              <Label>
                Step 2 — Choose{" "}
                {paymentType === "mobile_money" ? "wallet" : "bank"}
              </Label>
              {!providers ? (
                <p className="mt-2 text-sm text-amber-800">
                  Loading providers...
                </p>
              ) : providers.length === 0 ? (
                <p className="mt-2 text-sm text-amber-800">
                  No active providers for this method.
                </p>
              ) : (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {providers.map((provider) => {
                    const active = selectedProviderId === provider._id;
                    return (
                      <button
                        key={provider._id}
                        type="button"
                        onClick={() => handleProviderSelect(provider._id)}
                        className={cn(
                          "rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors",
                          active
                            ? "border-brand-600 bg-white text-brand-800 shadow-sm"
                            : "border-amber-200 bg-white/60 text-stone-700 hover:bg-white"
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
            <div className="rounded-lg border border-amber-300 bg-white p-3 text-sm">
              <p className="font-medium">
                Send payment to {selectedProvider.name}
              </p>
              <p className="mt-1 font-mono text-base">
                {selectedProvider.accountNumber}
              </p>
              {selectedProvider.instructions && (
                <p className="mt-2 text-slate-600">
                  {selectedProvider.instructions}
                </p>
              )}
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={!canContinueToDetails}
            onClick={() => setStep(2)}
          >
            Continue to upload proof
          </Button>
        </div>
      )}

      {step === 2 && (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 space-y-4"
        >
          {selectedProvider && (
            <div className="rounded-lg border border-amber-300 bg-white p-3 text-sm">
              <p className="font-medium">Paying via {selectedProvider.name}</p>
              <p className="mt-1 font-mono">{selectedProvider.accountNumber}</p>
              <Button
                type="button"
                variant="link"
                className="mt-1 h-auto p-0 text-sm"
                onClick={() => setStep(1)}
              >
                Change payment method
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor={`ref-${payment._id}`}>Transaction reference</Label>
            <Input
              id={`ref-${payment._id}`}
              className="mt-1 bg-white"
              {...form.register("transactionReference")}
            />
            {form.formState.errors.transactionReference && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.transactionReference.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor={`notes-${payment._id}`}>Notes (optional)</Label>
            <Textarea
              id={`notes-${payment._id}`}
              className="mt-1 bg-white"
              rows={2}
              {...form.register("notes")}
            />
          </div>

          <div>
            <Label htmlFor={`screenshot-${payment._id}`}>
              Upload new payment screenshot or receipt
            </Label>
            <Input
              ref={fileInputRef}
              id={`screenshot-${payment._id}`}
              type="file"
              accept={PAYMENT_PROOF_ACCEPT}
              className="mt-1 bg-white"
              disabled={uploading || submitting || authLoading || !isAuthenticated}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFileUpload(file);
              }}
            />
            {authLoading && (
              <p className="mt-1 text-sm text-amber-800">
                Connecting your account...
              </p>
            )}
            {uploading && (
              <p className="mt-1 text-sm text-amber-800">Uploading...</p>
            )}
            {screenshotId && (
              <p className="mt-1 text-sm text-green-700">
                New proof ready to submit
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                !screenshotId ||
                !selectedProviderId ||
                uploading ||
                submitting ||
                !isAuthenticated
              }
            >
              {submitting ? "Submitting..." : "Submit for review"}
            </Button>
            {showSupportLink && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/messages">Message support</Link>
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function isFixableStatus(
  status: string
): status is "rejected" | "resubmit_requested" {
  return status === "rejected" || status === "resubmit_requested";
}

export function PaymentFixFormFromRecord({
  payment,
  onSuccess,
  showSupportLink,
}: {
  payment: {
    _id: Id<"payments">;
    status: string;
    method: string;
    paymentProviderId?: Id<"paymentProviders">;
    transactionReference: string;
    notes?: string;
    adminNote?: string;
    screenshotUrl?: string | null;
  };
  onSuccess?: () => void;
  showSupportLink?: boolean;
}) {
  if (!isFixableStatus(payment.status)) return null;
  if (payment.method !== "mobile_money" && payment.method !== "bank_transfer") {
    return null;
  }

  return (
    <PaymentFixForm
      payment={{
        ...payment,
        status: payment.status,
        method: payment.method,
      }}
      onSuccess={onSuccess}
      showSupportLink={showSupportLink}
    />
  );
}
