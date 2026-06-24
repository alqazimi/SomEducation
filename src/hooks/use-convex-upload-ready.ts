"use client";

import { useConvexAuth } from "convex/react";
import { useState } from "react";

/**
 * Keeps uploads enabled during brief Convex auth reconnects so the payment
 * form is not stuck with a disabled file input.
 */
export function useConvexUploadReady() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [wasReady, setWasReady] = useState(false);

  if (isAuthenticated && !authLoading && !wasReady) {
    setWasReady(true);
  }

  const canUpload = isAuthenticated || (wasReady && authLoading);

  const statusMessage =
    authLoading && !isAuthenticated
      ? "Reconnecting to server…"
      : authLoading
        ? "Connecting your account…"
        : null;

  return {
    /** File uploads (keeps working across brief auth reconnects). */
    canUpload,
    /** Stripe checkout + payment mutations — same reconnect behavior. */
    canTransact: canUpload,
    statusMessage,
    isAuthenticated,
    authLoading,
  };
}
