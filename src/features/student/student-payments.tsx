"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        description="Track submissions and approval status for your course enrollments."
      />

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
                {payment.adminNote && (
                  <p className="mt-2 text-sm text-slate-600">
                    Admin note: {payment.adminNote}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
