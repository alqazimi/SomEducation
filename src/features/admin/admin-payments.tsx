"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatPrice } from "@/lib/utils";

type NoteAction = "reject" | "resubmit";

export function AdminPayments() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const payments = useQuery(
    api.payments.listForAdmin,
    isAuthenticated ? { status: "pending" } : "skip"
  );
  const approve = useMutation(api.payments.approve);
  const reject = useMutation(api.payments.reject);
  const requestResubmit = useMutation(api.payments.requestResubmit);

  const [noteDialog, setNoteDialog] = useState<{
    paymentId: Id<"payments">;
    action: NoteAction;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleApprove(paymentId: Id<"payments">) {
    try {
      await approve({ paymentId });
      toast.success("Payment approved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function handleNoteConfirm(note?: string) {
    if (!noteDialog || !note?.trim()) return;

    setActionLoading(true);
    try {
      if (noteDialog.action === "reject") {
        await reject({ paymentId: noteDialog.paymentId, note });
        toast.success("Payment rejected");
      } else {
        await requestResubmit({ paymentId: noteDialog.paymentId, note });
        toast.success("Resubmit request sent");
      }
      setNoteDialog(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Payment verification"
        description="Review and approve student payment submissions."
      />

      <div className="mt-8 space-y-6">
        {authLoading || (isAuthenticated && payments === undefined) ? (
          <p>Loading...</p>
        ) : payments === null ? (
          <p className="text-sm text-slate-500">
            Could not load payments. Check your admin access and Convex
            connection.
          </p>
        ) : !payments || payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No pending payments
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{payment.course?.title}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {payment.student?.firstName} {payment.student?.lastName} ·{" "}
                      {payment.student?.email}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="text-sm">
                    <p>
                      <strong>Amount:</strong>{" "}
                      {formatPrice(payment.amount, payment.currency)}
                    </p>
                    <p>
                      <strong>Method:</strong>{" "}
                      {payment.provider?.name ??
                        (payment.method === "mobile_money"
                          ? "Mobile Money"
                          : payment.method === "bank_transfer"
                            ? "Bank Transfer"
                            : payment.method)}
                    </p>
                    <p>
                      <strong>Reference:</strong> {payment.transactionReference}
                    </p>
                    <p>
                      <strong>Phone:</strong> {payment.phone}
                    </p>
                    <p>
                      <strong>Submitted:</strong> {formatDate(payment.createdAt)}
                    </p>
                  </div>
                  {payment.screenshotUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={payment.screenshotUrl}
                      alt="Payment screenshot"
                      className="max-h-48 rounded-lg border object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(payment._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setNoteDialog({
                        paymentId: payment._id,
                        action: "reject",
                      })
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setNoteDialog({
                        paymentId: payment._id,
                        action: "resubmit",
                      })
                    }
                  >
                    Request New Screenshot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={noteDialog?.action === "reject"}
        onOpenChange={(open) => !open && setNoteDialog(null)}
        title="Reject payment"
        description="Tell the student why this payment was rejected."
        confirmLabel="Reject payment"
        variant="destructive"
        inputMode="textarea"
        inputLabel="Message to student"
        inputPlaceholder="e.g. Transaction reference does not match the screenshot"
        requiredInput
        loading={actionLoading}
        onConfirm={handleNoteConfirm}
      />

      <ConfirmDialog
        open={noteDialog?.action === "resubmit"}
        onOpenChange={(open) => !open && setNoteDialog(null)}
        title="Request new screenshot"
        description="Explain what the student should fix or upload again."
        confirmLabel="Send request"
        inputMode="textarea"
        inputLabel="Message to student"
        inputPlaceholder="e.g. Please upload a clearer screenshot showing the full transaction details"
        defaultInputValue="Please upload a clearer screenshot showing the full transaction details."
        requiredInput
        loading={actionLoading}
        onConfirm={handleNoteConfirm}
      />
    </div>
  );
}
