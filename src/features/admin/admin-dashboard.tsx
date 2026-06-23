"use client";

import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type } from "@/lib/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import {
  isAdminListDenied,
  isAdminListLoading,
} from "@/lib/admin-query-state";

export function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const analytics = useQuery(api.users.getAnalytics);
  const setup = useQuery(
    api.settings.getSetupStatus,
    isAuthenticated ? {} : "skip"
  );
  const dismissChecklist = useMutation(api.settings.dismissSetupChecklist);

  const setupSteps = [
    {
      done: setup?.hasCategories ?? false,
      label: "Add course categories",
      href: "/dashboard/admin/categories",
      action: "Manage",
    },
    {
      done: setup?.hasPaymentSettings ?? false,
      label: "Set up mobile money and bank numbers",
      href: "/dashboard/admin/payment-providers",
      action: "Manage",
    },
    {
      done: setup?.hasPublishedCourse ?? false,
      label: "Approve and publish a course",
      href: "/dashboard/admin/courses",
    },
    {
      done: setup?.hasApprovedPayment ?? false,
      label: "Approve a student payment",
      href: "/dashboard/admin/payments",
    },
  ];

  const completedCount = setupSteps.filter((step) => step.done).length;
  const setupLoading = isAdminListLoading(authLoading, isAuthenticated, setup);
  const setupDenied = isAdminListDenied(setup);
  const showChecklist =
    !setupDenied && setup && !setup.dismissed && !setup.allComplete;

  async function handleDismissChecklist() {
    try {
      await dismissChecklist({});
      toast.success("Setup checklist hidden");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers ?? 0 },
    { label: "Students", value: analytics?.totalStudents ?? 0 },
    { label: "Teachers", value: analytics?.totalTeachers ?? 0 },
    { label: "Published Courses", value: analytics?.publishedCourses ?? 0 },
    { label: "Pending Payments", value: analytics?.pendingPayments ?? 0 },
    {
      label: "Total Revenue",
      value: formatPrice(analytics?.totalRevenue ?? 0),
    },
  ];

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Platform overview"
        description="Monitor users, courses, payments, and launch checklist progress."
      />

      {setup?.allComplete && (
        <Card className="mt-8 border-green-200 bg-green-50/60">
          <CardContent className="flex items-center gap-3 py-5">
            <PartyPopper className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Platform setup complete</p>
              <p className="text-sm text-green-700">
                All launch checklist items are done. Your platform is ready.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {(setupLoading || showChecklist) && (
        <Card className="mt-8 border-brand-100 bg-brand-50/50">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Setup Checklist</CardTitle>
            {!setupLoading && setup && (
              <span className="text-sm text-muted-foreground">
                {completedCount}/{setupSteps.length} complete
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {setupLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Complete these steps to launch your learning platform.
                </p>
                <ul className="space-y-3">
                  {setupSteps.map((step) => (
                    <li key={step.label} className="flex items-center gap-3 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <span className={step.done ? "text-muted-foreground line-through" : ""}>
                        {step.label}
                      </span>
                      {!step.done && step.action && (
                        <Link href={step.href} className="ml-auto">
                          <Button variant="outline" size="sm">
                            {step.action}
                          </Button>
                        </Link>
                      )}
                      {!step.done && !step.action && (
                        <Link href={step.href} className="ml-auto">
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Use a real payment number (not the placeholder) and save
                    instructions in Admin → Settings.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDismissChecklist()}
                  >
                    Hide checklist
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className={type.muted}>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={type.stat}>
                {authLoading || !isAuthenticated || analytics === undefined
                  ? "…"
                  : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
