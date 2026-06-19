"use client";

import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";

export function useEnsureConvexUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const clerkSignedIn = clerkLoaded && !!clerkUser && isSignedIn;
  const shouldFetchUser = clerkSignedIn && !authLoading && isAuthenticated;
  const convexUser = useQuery(
    api.users.getMe,
    shouldFetchUser ? {} : "skip"
  );
  const syncUser = useMutation(api.users.syncUser);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const syncingRef = useRef(false);
  const diagnosedRef = useRef(false);

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

  const needsSync = shouldFetchUser && convexUser === null;

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

  // UserSync runs sync on mount; fallback once if profile still missing.
  useEffect(() => {
    if (!needsSync) return;

    const id = window.setTimeout(() => {
      if (syncingRef.current) return;
      void runSync();
    }, 2000);

    return () => window.clearTimeout(id);
  }, [needsSync, runSync]);

  const waitingForConvexAuth =
    clerkSignedIn && !authLoading && !isAuthenticated && !authError;

  useEffect(() => {
    if (!waitingForConvexAuth) {
      setAuthTimedOut(false);
      return;
    }

    const id = window.setTimeout(() => setAuthTimedOut(true), 12_000);
    return () => window.clearTimeout(id);
  }, [waitingForConvexAuth]);

  const isLoading =
    authLoading ||
    !clerkLoaded ||
    (shouldFetchUser &&
      convexUser === undefined &&
      !authTimedOut &&
      !authError) ||
    (waitingForConvexAuth && !authError && !authTimedOut) ||
    (needsSync && !syncError && !authError && !authTimedOut);

  const retrySync = useCallback(async () => {
    setAuthError(null);
    setSyncError(null);
    setAuthTimedOut(false);
    diagnosedRef.current = false;

    try {
      const token = await getToken({ template: "convex" });
      if (!token) {
        setAuthError(
          "Could not get a Convex token from Clerk. Add a JWT template named \"convex\" in Clerk Production."
        );
        return;
      }
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Clerk could not issue a Convex JWT."
      );
      return;
    }

    await runSync();
  }, [getToken, runSync]);

  const isSuspended = convexUser?.status === "suspended";

  return {
    user: convexUser ?? null,
    isSuspended,
    isLoading,
    syncError:
      authError ??
      syncError ??
      (authTimedOut
        ? "Timed out connecting Clerk to Convex. Check the JWT template named \"convex\" and your Convex production deployment."
        : null),
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
          <div className="max-w-lg space-y-4 text-left text-xs text-slate-600">
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="font-medium text-foreground">
                1. Clerk Production → JWT Templates
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>
                  Open{" "}
                  <a
                    href="https://dashboard.clerk.com/apps/setup/convex"
                    className="font-medium text-brand-700 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Clerk Convex setup
                  </a>{" "}
                  (Production instance, not Development)
                </li>
                <li>
                  Create template with the <strong>Convex</strong> preset
                </li>
                <li>
                  Name must be exactly: <strong>convex</strong>
                </li>
                <li>Save</li>
              </ol>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-950">
                2. Convex Production → environment variable
              </p>
              <p className="mt-2 text-amber-900">
                In Convex dashboard for <strong>precious-duck-100</strong>, set:
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-white p-2 font-mono text-[11px] text-stone-800">
                CLERK_JWT_ISSUER_DOMAIN=https://clerk.someducation.com
              </pre>
              <p className="mt-2 text-amber-900">
                Use your Clerk <strong>Production</strong> Frontend API URL — not
                the dev URL (<code>stirring-grizzly-43...</code>).
              </p>
              <p className="mt-2 font-mono text-[11px] text-amber-950">
                npx convex env set CLERK_JWT_ISSUER_DOMAIN
                https://clerk.someducation.com --prod
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="font-medium text-foreground">3. After fixing</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Sign out completely</li>
                <li>Hard refresh or use incognito</li>
                <li>Sign in again</li>
              </ol>
            </div>
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

export function SuspendedAccountState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Account suspended</h1>
      <p className="max-w-md text-sm text-slate-600">
        Your account has been suspended and you cannot use the dashboard right now.
        If you believe this is a mistake, contact platform support.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <SignOutButton>
          <Button variant="outline">Sign out</Button>
        </SignOutButton>
        <Link href="/courses">
          <Button variant="ghost">Browse courses</Button>
        </Link>
      </div>
    </div>
  );
}
