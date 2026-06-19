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
import { useEffect } from "react";

export default function PurchasePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { user, isLoading, isSuspended, syncError, retrySync, clerkSignedIn } =
    useEnsureConvexUser();

  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(
    `/courses/${params.slug}/purchase`
  )}`;

  useEffect(() => {
    if (!isLoading && !clerkSignedIn) {
      router.replace(signInUrl);
    }
  }, [isLoading, clerkSignedIn, router, signInUrl]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted py-12">
        <div className="mx-auto max-w-2xl px-4">
          {isLoading || !clerkSignedIn ? (
            <AccountSetupState syncError={syncError} onRetry={() => void retrySync()} />
          ) : isSuspended ? (
            <SuspendedAccountState />
          ) : !user ? (
            <AccountSetupState syncError={syncError} onRetry={() => void retrySync()} />
          ) : (
            <PurchaseCourseForm />
          )}
        </div>
      </main>
    </>
  );
}
