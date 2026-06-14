"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/utils";

export function AdminPayments() {
  const payments = useQuery(api.payments.listForAdmin, { status: "pending" });
  const approve = useMutation(api.payments.approve);
  const reject = useMutation(api.payments.reject);
  const requestResubmit = useMutation(api.payments.requestResubmit);

  async function handleApprove(paymentId: Id<"payments">) {
    try {
      await approve({ paymentId });
      toast.success("Payment approved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Payment Verification</h1>
      <p className="mt-1 text-slate-500">Review and verify student payments</p>

      <div className="mt-8 space-y-6">
        {!payments ? (
          <p>Loading...</p>
        ) : payments.length === 0 ? (
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
                      reject({
                        paymentId: payment._id,
                        note: "Payment could not be verified",
                      })
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      requestResubmit({
                        paymentId: payment._id,
                        note: "Please upload a clearer screenshot",
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
    </div>
  );
}
