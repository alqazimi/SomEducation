"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentFixFormFromRecord } from "@/features/student/payment-fix-form";
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

export function StudentPayments() {
  const payments = useQuery(api.payments.listMine);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Billing"
        title="Payment history"
        description="One payment request per course. If rejected, fix and resubmit here — no need to purchase again."
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
                {payment.status === "pending" && (
                  <p className="mt-3 text-sm text-slate-600">
                    Your payment is awaiting admin review. You will be notified
                    when it is approved.
                  </p>
                )}
                {payment.status === "suspended" && (
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>
                      Your course access for this payment has been suspended. You
                      cannot submit a new purchase request for this course.
                    </p>
                    <p>
                      Wait for an administrator to restore access, or contact
                      support if you have questions.
                    </p>
                    {payment.adminNote && (
                      <p>Admin note: {payment.adminNote}</p>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/messages">Contact support</Link>
                    </Button>
                  </div>
                )}
                <PaymentFixFormFromRecord payment={payment} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
