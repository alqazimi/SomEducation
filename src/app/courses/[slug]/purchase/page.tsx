"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
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

  useEffect(() => {
    if (!isLoading && !clerkSignedIn) {
      router.replace(signInUrl);
    }
  }, [isLoading, clerkSignedIn, router, signInUrl]);

  useEffect(() => {
    if (!isLoading && clerkSignedIn && user && !isSuspended) {
      setAccountReady(true);
    }
  }, [isLoading, clerkSignedIn, user, isSuspended]);

  const showInitialSetup =
    !accountReady && (isLoading || !clerkSignedIn || !user);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted py-12">
        <div className="mx-auto max-w-2xl px-4">
          {showInitialSetup ? (
            <AccountSetupState
              syncError={syncError}
              onRetry={() => void retrySync()}
            />
          ) : isSuspended ? (
            <SuspendedAccountState />
          ) : (
            <>
              {isLoading && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Reconnecting to your account… You can keep filling the form.
                </p>
              )}
              <PurchaseCourseForm />
            </>
          )}
        </div>
      </main>
    </>
  );
}
