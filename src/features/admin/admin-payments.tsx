"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import {
  isAdminListDenied,
  isAdminListLoading,
  isAdminListReady,
} from "@/lib/admin-query-state";

type StatusFilter =
  | "pending"
  | "approved"
  | "rejected"
  | "resubmit_requested"
  | "suspended"
  | "all";

type DialogState =
  | { type: "approve"; paymentId: Id<"payments">; title: string; student: string }
  | { type: "reject"; paymentId: Id<"payments"> }
  | { type: "resubmit"; paymentId: Id<"payments"> }
  | { type: "revoke"; paymentId: Id<"payments">; title: string; student: string }
  | { type: "suspend"; paymentId: Id<"payments">; title: string; student: string }
  | { type: "restore"; paymentId: Id<"payments">; title: string; student: string }
  | null;

type PaymentRow = NonNullable<
  FunctionReturnType<typeof api.payments.listForAdmin>
>[number];

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "resubmit_requested", label: "Resubmit" },
  { id: "suspended", label: "Suspended" },
  { id: "all", label: "All" },
];

const statusBadge: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  resubmit_requested: "secondary",
  suspended: "destructive",
};

function methodLabel(payment: PaymentRow) {
  return (
    payment.provider?.name ??
    (payment.method === "mobile_money"
      ? "Mobile Money"
      : payment.method === "bank_transfer"
        ? "Bank Transfer"
        : payment.method)
  );
}

function PaymentDetails({ payment }: { payment: PaymentRow }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 text-sm">
        <p>
          <strong>Amount:</strong> {formatPrice(payment.amount, payment.currency)}
        </p>
        <p>
          <strong>Method:</strong> {methodLabel(payment)}
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
        {payment.reviewedAt && (
          <p>
            <strong>Reviewed:</strong> {formatDate(payment.reviewedAt)}
          </p>
        )}
        {payment.adminNote && (
          <p className="rounded-md bg-muted px-3 py-2 text-foreground/90">
            <strong>Admin note:</strong> {payment.adminNote}
          </p>
        )}
      </div>
      {payment.screenshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={payment.screenshotUrl}
          alt="Payment screenshot"
          className="max-h-56 rounded-lg border object-contain"
        />
      )}
    </div>
  );
}

export function AdminPayments() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const payments = useQuery(
    api.payments.listForAdmin,
    isAuthenticated
      ? filter === "all"
        ? {}
        : { status: filter }
      : "skip"
  );

  const approve = useMutation(api.payments.approve);
  const reject = useMutation(api.payments.reject);
  const requestResubmit = useMutation(api.payments.requestResubmit);
  const revokeApproval = useMutation(api.payments.revokeApproval);
  const suspendAccess = useMutation(api.payments.suspendAccess);
  const restoreAccess = useMutation(api.payments.restoreAccess);

  async function handleDialogConfirm(note?: string) {
    if (!dialog) return;

    setActionLoading(true);
    try {
      if (dialog.type === "approve") {
        await approve({ paymentId: dialog.paymentId });
        toast.success("Payment approved");
      } else if (dialog.type === "reject") {
        if (!note?.trim()) return;
        await reject({ paymentId: dialog.paymentId, note: note.trim() });
        toast.success("Payment rejected");
      } else if (dialog.type === "resubmit") {
        if (!note?.trim()) return;
        await requestResubmit({ paymentId: dialog.paymentId, note: note.trim() });
        toast.success("Resubmit request sent");
      } else if (dialog.type === "revoke") {
        if (!note?.trim()) return;
        await revokeApproval({
          paymentId: dialog.paymentId,
          note: note.trim(),
        });
        toast.success("Approval revoked — student can fix payment");
      } else if (dialog.type === "suspend") {
        await suspendAccess({
          paymentId: dialog.paymentId,
          note: note?.trim() || undefined,
        });
        toast.success("Access suspended");
      } else if (dialog.type === "restore") {
        await restoreAccess({
          paymentId: dialog.paymentId,
          note: note?.trim() || undefined,
        });
        toast.success("Access restored");
      }
      setDialog(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setActionLoading(false);
    }
  }

  const emptyLabel =
    filter === "pending"
      ? "No pending payments"
      : filter === "approved"
        ? "No approved payments"
        : "No payments found";

  const isLoading = isAdminListLoading(authLoading, isAuthenticated, payments);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Payment verification"
        description="Review pending payments, revisit approved ones, and undo mistakes."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === item.id
                ? "bg-brand-600 text-white"
                : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isAdminListDenied(payments) ? (
          <p className="text-sm text-muted-foreground">
            Could not load payments. Check your admin access and Convex connection.
          </p>
        ) : isAdminListReady(payments) && payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {emptyLabel}
            </CardContent>
          </Card>
        ) : isAdminListReady(payments) ? (
          payments.map((payment) => {
            const studentName =
              `${payment.student?.firstName ?? ""} ${payment.student?.lastName ?? ""}`.trim() ||
              payment.student?.email ||
              "Student";
            const courseTitle = payment.course?.title ?? "Course";

            return (
              <Card key={payment._id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{courseTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {studentName} · {payment.student?.email}
                      </p>
                    </div>
                    <Badge variant={statusBadge[payment.status] ?? "secondary"}>
                      {payment.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PaymentDetails payment={payment} />

                  <div className="flex flex-wrap gap-2">
                    {payment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            setDialog({
                              type: "approve",
                              paymentId: payment._id,
                              title: courseTitle,
                              student: studentName,
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setDialog({ type: "reject", paymentId: payment._id })
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDialog({
                              type: "resubmit",
                              paymentId: payment._id,
                            })
                          }
                        >
                          Request New Screenshot
                        </Button>
                      </>
                    )}

                    {payment.status === "approved" && (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setDialog({
                              type: "revoke",
                              paymentId: payment._id,
                              title: courseTitle,
                              student: studentName,
                            })
                          }
                        >
                          Revoke Approval
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDialog({
                              type: "suspend",
                              paymentId: payment._id,
                              title: courseTitle,
                              student: studentName,
                            })
                          }
                        >
                          Suspend Access
                        </Button>
                      </>
                    )}

                    {payment.status === "suspended" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          setDialog({
                            type: "restore",
                            paymentId: payment._id,
                            title: courseTitle,
                            student: studentName,
                          })
                        }
                      >
                        Restore Access
                      </Button>
                    )}

                    {(payment.status === "rejected" ||
                      payment.status === "resubmit_requested") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDialog({
                            type: "resubmit",
                            paymentId: payment._id,
                          })
                        }
                      >
                        Request New Screenshot
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : null}
      </div>

      <ConfirmDialog
        open={dialog?.type === "approve"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Approve payment?"
        description={
          dialog?.type === "approve"
            ? `Approve ${dialog.student}'s payment for "${dialog.title}"? The student will get immediate course access.`
            : ""
        }
        confirmLabel="Approve payment"
        loading={actionLoading}
        onConfirm={() => void handleDialogConfirm()}
      />

      <ConfirmDialog
        open={dialog?.type === "reject"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Reject payment"
        description="Tell the student why this payment was rejected."
        confirmLabel="Reject payment"
        variant="destructive"
        inputMode="textarea"
        inputLabel="Message to student"
        inputPlaceholder="e.g. Transaction reference does not match the screenshot"
        requiredInput
        loading={actionLoading}
        onConfirm={handleDialogConfirm}
      />

      <ConfirmDialog
        open={dialog?.type === "resubmit"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Request new screenshot"
        description="Explain what the student should fix or upload again."
        confirmLabel="Send request"
        inputMode="textarea"
        inputLabel="Message to student"
        inputPlaceholder="e.g. Please upload a clearer screenshot showing the full transaction details"
        defaultInputValue="Please upload a clearer screenshot showing the full transaction details."
        requiredInput
        loading={actionLoading}
        onConfirm={handleDialogConfirm}
      />

      <ConfirmDialog
        open={dialog?.type === "revoke"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Revoke approval?"
        description={
          dialog?.type === "revoke"
            ? `Undo approval for ${dialog.student} — "${dialog.title}". Course access will be removed and the student can fix and resubmit this payment.`
            : ""
        }
        confirmLabel="Revoke approval"
        variant="destructive"
        inputMode="textarea"
        inputLabel="Reason (shown to student)"
        inputPlaceholder="e.g. Approved by mistake — please resubmit your payment proof"
        defaultInputValue="This payment was approved by mistake. Please update your payment from your dashboard."
        requiredInput
        loading={actionLoading}
        onConfirm={handleDialogConfirm}
      />

      <ConfirmDialog
        open={dialog?.type === "suspend"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Suspend course access?"
        description={
          dialog?.type === "suspend"
            ? `Remove ${dialog.student}'s access to "${dialog.title}" while keeping the payment marked approved.`
            : ""
        }
        confirmLabel="Suspend access"
        variant="destructive"
        inputMode="textarea"
        inputLabel="Message to student (optional)"
        inputPlaceholder="Optional note explaining why access was suspended"
        loading={actionLoading}
        onConfirm={handleDialogConfirm}
      />

      <ConfirmDialog
        open={dialog?.type === "restore"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Restore course access?"
        description={
          dialog?.type === "restore"
            ? `Restore ${dialog.student}'s access to "${dialog.title}". The payment will be marked approved again.`
            : ""
        }
        confirmLabel="Restore access"
        inputMode="textarea"
        inputLabel="Message to student (optional)"
        inputPlaceholder="Optional note for the student"
        loading={actionLoading}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}
