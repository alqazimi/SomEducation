"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export function ConvexAuthBanner() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [tokenMissing, setTokenMissing] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || isLoading || isAuthenticated) {
      setVisible(false);
      setTokenMissing(false);
      return;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 4000);

    void getToken({ template: "convex" })
      .then((token) => {
        if (!token) setTokenMissing(true);
      })
      .catch(() => setTokenMissing(true));

    return () => window.clearTimeout(showTimer);
  }, [isLoaded, isSignedIn, isLoading, isAuthenticated, getToken]);

  if (!visible) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
      <p className="font-medium">Signed in with Clerk, but the app backend is not connected.</p>
      <p className="mt-1 text-xs text-amber-900">
        {tokenMissing
          ? "Add a JWT template named \"convex\" in Clerk Production, then sign out and sign in again."
          : "If this persists, sign out, hard refresh, and sign in again."}{" "}
        <Link href="/dashboard" className="font-medium underline underline-offset-2">
          Open dashboard for setup steps
        </Link>
        {" · "}
        <a
          href="https://dashboard.clerk.com/apps/setup/convex"
          className="font-medium underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Clerk Convex setup
        </a>
      </p>
    </div>
  );
}
