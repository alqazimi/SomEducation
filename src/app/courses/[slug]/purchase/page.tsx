"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import {
  AccountSetupState,
  SuspendedAccountState,
  useEnsureConvexUser,
} from "@/hooks/use-ensure-convex-user";
import { PurchaseCourseForm } from "@/features/student/purchase-course-form";
import { useEffect, useState } from "react";

export default function PurchasePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { user, isLoading, isSuspended, syncError, retrySync, clerkSignedIn } =
    useEnsureConvexUser();
  const [accountReady, setAccountReady] = useState(false);

  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(
    `/courses/${params.slug}/purchase`
  )}`;

  const isReadyNow =
    !isLoading && clerkSignedIn && !!user && !isSuspended;
  if (isReadyNow && !accountReady) {
    setAccountReady(true);
  }

  useEffect(() => {
    if (!isLoading && !clerkSignedIn) {
      router.replace(signInUrl);
    }
  }, [isLoading, clerkSignedIn, router, signInUrl]);

  const showInitialSetup =
    !accountReady && (isLoading || !clerkSignedIn || !user);

  return (
    <MarketingShell>
      <MarketingCoursesSurface>
        <div className="mx-auto max-w-2xl px-4 py-10">
          {showInitialSetup ? (
            <div className="marketing-form-surface p-6 sm:p-8">
              <AccountSetupState
                syncError={syncError}
                onRetry={() => void retrySync()}
              />
            </div>
          ) : isSuspended ? (
            <div className="marketing-form-surface p-6 sm:p-8">
              <SuspendedAccountState />
            </div>
          ) : (
            <div className="marketing-form-surface p-6 sm:p-8">
              {isLoading && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Reconnecting to your account… You can keep filling the form.
                </p>
              )}
              <PurchaseCourseForm />
            </div>
          )}
        </div>
      </MarketingCoursesSurface>
    </MarketingShell>
  );
}
