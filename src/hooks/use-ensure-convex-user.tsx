"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";

export function useEnsureConvexUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const convexUser = useQuery(api.users.getMe);
  const syncUser = useMutation(api.users.syncUser);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const diagnosedRef = useRef(false);

  const clerkSignedIn = clerkLoaded && !!clerkUser && isSignedIn;

  const runSync = useCallback(async () => {
    if (!clerkUser || syncingRef.current) return;

    syncingRef.current = true;
    setSyncError(null);

    try {
      await syncUser({
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        firstName: clerkUser.firstName ?? undefined,
        lastName: clerkUser.lastName ?? undefined,
        imageUrl: clerkUser.imageUrl ?? undefined,
      });
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "Failed to set up your account"
      );
    } finally {
      syncingRef.current = false;
    }
  }, [clerkUser, syncUser]);

  const needsSync =
    clerkSignedIn && !authLoading && isAuthenticated && convexUser === null;

  // Clerk signed in but Convex never authenticated → usually missing JWT template
  useEffect(() => {
    if (!clerkSignedIn || authLoading || isAuthenticated || diagnosedRef.current) {
      return;
    }

    diagnosedRef.current = true;

    void getToken({ template: "convex" })
      .then((token) => {
        if (!token) {
          setAuthError(
            "Could not get a Convex token from Clerk. Add a JWT template named \"convex\" in your Clerk dashboard."
          );
        }
      })
      .catch((error: unknown) => {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Clerk could not issue a Convex JWT. Check your JWT template named \"convex\"."
        );
      });
  }, [clerkSignedIn, authLoading, isAuthenticated, getToken]);

  useEffect(() => {
    if (!needsSync) return;
    queueMicrotask(() => {
      void runSync();
    });
  }, [needsSync, runSync]);

  const waitingForConvexAuth =
    clerkSignedIn && !authLoading && !isAuthenticated && !authError;

  const isLoading =
    authLoading ||
    !clerkLoaded ||
    convexUser === undefined ||
    waitingForConvexAuth ||
    (needsSync && !syncError && !authError);

  const retrySync = useCallback(async () => {
    setAuthError(null);
    setSyncError(null);
    diagnosedRef.current = false;
    await runSync();
  }, [runSync]);

  return {
    user: convexUser ?? null,
    isLoading,
    syncError: authError ?? syncError,
    retrySync,
    isAuthenticated,
    clerkSignedIn,
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
          <p className="max-w-md text-sm text-slate-500">{syncError}</p>
          <div className="max-w-md rounded-lg border border-border bg-white p-4 text-left text-xs text-slate-600">
            <p className="font-medium text-foreground">Fix in Clerk Dashboard:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Go to JWT Templates → New template</li>
              <li>Choose the <strong>Convex</strong> preset</li>
              <li>Name must be exactly: <strong>convex</strong></li>
              <li>Save, then refresh this page</li>
            </ol>
          </div>
          <Button onClick={onRetry}>Try again</Button>
        </>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="text-slate-500">Setting up your account...</p>
          <p className="max-w-sm text-xs text-slate-400">
            Connecting Clerk to Convex and creating your profile.
          </p>
        </>
      )}
    </div>
  );
}
