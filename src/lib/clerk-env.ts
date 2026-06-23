/**
 * Warn during production builds/deploys when Clerk test keys are used.
 * Production must use pk_live_ / sk_live_ from the Clerk Dashboard.
 */
import { isClerkConfigured } from "./clerk-config";

export function assertClerkProductionKeys() {
  if (!isClerkConfigured() && process.env.NODE_ENV === "development") {
    console.error(
      "[SomEducation] Clerk is not configured. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and " +
        "CLERK_SECRET_KEY to .env.local (from Clerk Dashboard or Vercel). " +
        "Keyless/B2B mode is disabled — the app will not use temporary Clerk keys."
    );
    return;
  }

  if (process.env.NODE_ENV !== "production") return;

  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

  if (publishableKey.startsWith("pk_test_")) {
    console.warn(
      "[SomEducation] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is a development key (pk_test_). " +
        "Set production keys (pk_live_ / sk_live_) in Vercel for www.someducation.com."
    );
  }
}

assertClerkProductionKeys();
