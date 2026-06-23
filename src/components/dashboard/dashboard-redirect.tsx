"use client";

import { useAuth } from "@clerk/nextjs";
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
  const { isLoaded: clerkLoaded } = useAuth();
  const { user, isLoading, isSuspended, syncError, retrySync, clerkSignedIn } =
    useEnsureConvexUser();

  useEffect(() => {
    if (!clerkLoaded || isLoading) return;

    if (!clerkSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (!user || isSuspended) return;

    const target = getDashboardHref(user.role);
    if (window.location.pathname !== target) {
      router.replace(target);
    }
  }, [clerkLoaded, isLoading, clerkSignedIn, user, isSuspended, router]);

  if (!clerkLoaded || isLoading) {
    return <DashboardRedirectSkeleton />;
  }

  if (clerkSignedIn && isSuspended) {
    return <SuspendedAccountState />;
  }

  if (clerkSignedIn && !user) {
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
