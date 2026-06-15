/**
 * Warn during production builds/deploys when Clerk test keys are used.
 * Production must use pk_live_ / sk_live_ from the Clerk Dashboard.
 */
export function assertClerkProductionKeys() {
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
