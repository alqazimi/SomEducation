"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  AccountSetupState,
  SuspendedAccountState,
  useEnsureConvexUser,
} from "@/hooks/use-ensure-convex-user";
import { getDashboardHref } from "@/lib/dashboard-nav";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardRedirect() {
  const router = useRouter();
  const { user, isLoading, isSuspended, syncError, retrySync, isSignedIn } =
    useEnsureConvexUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (!user || isSuspended) return;

    const target = getDashboardHref(user.role);
    if (window.location.pathname !== target) {
      router.replace(target);
    }
  }, [isLoading, isSignedIn, user, isSuspended, router]);

  if (isLoading) {
    return <DashboardRedirectSkeleton />;
  }

  if (isSignedIn && isSuspended) {
    return <SuspendedAccountState />;
  }

  if (isSignedIn && !user) {
    return (
      <AccountSetupState
        syncError={syncError}
        onRetry={() => void retrySync()}
      />
    );
  }

  return <DashboardRedirectSkeleton />;
}

function DashboardRedirectSkeleton() {
  return (
    <div className="min-h-screen bg-muted p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-64 w-full" />
      <p className="mt-4 text-sm text-muted-foreground">Preparing your dashboard...</p>
    </div>
  );
}
