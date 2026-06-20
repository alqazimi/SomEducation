"use client";

import { useConvexAuth } from "convex/react";
import { useRef } from "react";

/**
 * Keeps uploads enabled during brief Convex auth reconnects so the payment
 * form is not stuck with a disabled file input.
 */
export function useConvexUploadReady() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const wasReadyRef = useRef(false);

  if (isAuthenticated && !authLoading) {
    wasReadyRef.current = true;
  }

  const canUpload =
    isAuthenticated || (wasReadyRef.current && authLoading);

  const statusMessage =
    authLoading && !isAuthenticated
      ? "Reconnecting to server…"
      : authLoading
        ? "Connecting your account…"
        : null;

  return {
    canUpload,
    statusMessage,
    isAuthenticated,
    authLoading,
  };
}
