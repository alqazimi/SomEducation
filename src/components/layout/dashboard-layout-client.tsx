"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/ui/typography";
import {
  AccountSetupState,
  SuspendedAccountState,
  useEnsureConvexUser,
} from "@/hooks/use-ensure-convex-user";

export function DashboardLayoutClient({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Array<"owner" | "admin" | "teacher" | "student">;
}) {
  const { user, isLoading, isSuspended, syncError, retrySync } =
    useEnsureConvexUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center p-8">
          <AccountSetupState syncError={syncError} onRetry={() => void retrySync()} />
        </div>
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <SuspendedAccountState />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <PageTitle className="mt-5">Access denied</PageTitle>
            <p className="mt-2 text-slate-500">
              You don&apos;t have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
