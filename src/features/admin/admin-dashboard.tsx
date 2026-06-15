"use client";

import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const analytics = useQuery(api.users.getAnalytics);
  const setup = useQuery(
    api.settings.getSetupStatus,
    isAuthenticated ? {} : "skip"
  );
  const seedCategories = useMutation(api.seed.seedCategories);
  const dismissChecklist = useMutation(api.settings.dismissSetupChecklist);

  const setupSteps = [
    {
      done: setup?.hasCategories ?? false,
      label: "Seed course categories",
      href: "/dashboard/admin/settings",
      action: "Seed now",
    },
    {
      done: setup?.hasPaymentSettings ?? false,
      label: "Configure payment phone and instructions",
      href: "/dashboard/admin/settings",
      action: "Open settings",
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
  const checklistLoading = isAuthenticated && setup === undefined;
  const showChecklist =
    setup && !setup.dismissed && !setup.allComplete;

  async function handleSeedCategories() {
    try {
      await seedCategories({});
      toast.success("Default categories created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

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
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-1 text-slate-500">Platform overview</p>

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

      {(checklistLoading || showChecklist) && (
        <Card className="mt-8 border-brand-100 bg-brand-50/50">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Setup Checklist</CardTitle>
            {!checklistLoading && setup && (
              <span className="text-sm text-slate-500">
                {completedCount}/{setupSteps.length} complete
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {checklistLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Complete these steps to launch your learning platform.
                </p>
                <ul className="space-y-3">
                  {setupSteps.map((step) => (
                    <li key={step.label} className="flex items-center gap-3 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-slate-400" />
                      )}
                      <span className={step.done ? "text-slate-500 line-through" : ""}>
                        {step.label}
                      </span>
                      {!step.done && step.action === "Seed now" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={() => void handleSeedCategories()}
                        >
                          {step.action}
                        </Button>
                      )}
                      {!step.done && step.action === "Open settings" && (
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
                  <p className="text-xs text-slate-500">
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
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {authLoading || analytics === undefined ? "…" : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
