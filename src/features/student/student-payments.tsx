"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatPrice } from "@/lib/utils";

const statusVariant: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  resubmit_requested: "secondary",
  suspended: "destructive",
};

const PAYMENT_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

function PaymentResubmitSection({
  paymentId,
  adminNote,
  currentScreenshotUrl,
}: {
  paymentId: Id<"payments">;
  adminNote?: string;
  currentScreenshotUrl?: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [screenshotId, setScreenshotId] = useState<Id<"_storage"> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrlMutation);
  const resubmitScreenshot = useMutation(api.payments.resubmitScreenshot);

  async function handleFileUpload(file: File) {
    if (!PAYMENT_FILE_TYPES.includes(file.type)) {
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
      toast.success("New screenshot uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Please retry."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleResubmit() {
    if (!screenshotId) {
      toast.error("Please upload a new payment screenshot");
      return;
    }

    setSubmitting(true);
    try {
      await resubmitScreenshot({
        paymentId,
        screenshotStorageId: screenshotId,
      });
      toast.success("Screenshot resubmitted for review");
      setScreenshotId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resubmit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">
        New screenshot required
      </p>
      {adminNote && (
        <p className="mt-1 text-sm text-amber-800">{adminNote}</p>
      )}
      {currentScreenshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentScreenshotUrl}
          alt="Previous payment screenshot"
          className="mt-3 max-h-40 rounded-lg border object-contain"
        />
      )}
      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor={`screenshot-${paymentId}`}>Upload new screenshot</Label>
          <Input
            id={`screenshot-${paymentId}`}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            className="mt-1"
            disabled={uploading || submitting}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!screenshotId || uploading || submitting}
            onClick={() => void handleResubmit()}
          >
            {submitting ? "Submitting..." : "Resubmit for review"}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/messages">Message support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StudentPayments() {
  const payments = useQuery(api.payments.listMine);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Billing"
        title="Payment history"
        description="Track submissions and approval status for your course enrollments."
      >
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/messages">Contact support</Link>
        </Button>
      </DashboardPageHeader>

      <div className="mt-8 space-y-4">
        {!payments ? (
          <p>Loading...</p>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No payment requests yet.
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment._id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {payment.course?.title ?? "Course"}
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
                <Badge variant={statusVariant[payment.status] ?? "outline"}>
                  {payment.status.replace(/_/g, " ")}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    Amount:{" "}
                    <strong>
                      {formatPrice(payment.amount, payment.currency)}
                    </strong>
                  </span>
                  <span>Ref: {payment.transactionReference}</span>
                  {payment.provider && (
                    <span>Via: {payment.provider.name}</span>
                  )}
                </div>
                {payment.adminNote && payment.status !== "resubmit_requested" && (
                  <p className="mt-2 text-sm text-slate-600">
                    Admin note: {payment.adminNote}
                  </p>
                )}
                {payment.status === "resubmit_requested" && (
                  <PaymentResubmitSection
                    paymentId={payment._id}
                    adminNote={payment.adminNote}
                    currentScreenshotUrl={payment.screenshotUrl}
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
