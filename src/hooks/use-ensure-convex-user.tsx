"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { getConvexErrorMessage } from "@/lib/convex-error";

export function useEnsureConvexUser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const convexUser = useQuery(
    api.users.getMe,
    isAuthenticated ? {} : "skip"
  );
  const ensureProfile = useMutation(api.users.ensureProfile);
  const [profileError, setProfileError] = useState<string | null>(null);
  const ensuringRef = useRef(false);

  const runEnsureProfile = useCallback(async () => {
    if (!isAuthenticated || ensuringRef.current) return;

    ensuringRef.current = true;
    setProfileError(null);

    try {
      await ensureProfile({});
    } catch (error) {
      setProfileError(
        getConvexErrorMessage(error, "Failed to set up your account")
      );
    } finally {
      ensuringRef.current = false;
    }
  }, [ensureProfile, isAuthenticated]);

  const needsProfile = isAuthenticated && convexUser === null;

  useEffect(() => {
    if (!needsProfile) return;

    const id = window.setTimeout(() => {
      void runEnsureProfile();
    }, 500);

    return () => window.clearTimeout(id);
  }, [needsProfile, runEnsureProfile]);

  const isLoading =
    authLoading ||
    (isAuthenticated && convexUser === undefined && !profileError) ||
    (needsProfile && !profileError);

  const isSuspended = convexUser?.status === "suspended";

  return {
    user: convexUser ?? null,
    isSuspended,
    isLoading,
    syncError: profileError,
    retrySync: runEnsureProfile,
    isAuthenticated,
    isSignedIn: isAuthenticated,
  };
}

export function AccountSetupState({
  syncError,
  onRetry,
}: {
  syncError: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-8 text-center">
      {syncError ? (
        <>
          <h1 className="text-xl font-semibold">Could not set up your account</h1>
          <p className="max-w-md text-sm text-muted-foreground">{syncError}</p>
          <Button onClick={onRetry}>Try again</Button>
        </>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </>
      )}
    </div>
  );
}

export function SuspendedAccountState() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">Account suspended</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your account has been suspended and you cannot use the dashboard right now.
        If you believe this is a mistake, contact platform support.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
        <Link href="/courses">
          <Button variant="ghost">Browse courses</Button>
        </Link>
      </div>
    </div>
  );
}
