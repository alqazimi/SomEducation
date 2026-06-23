export function isClerkConfigured() {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  return publishableKey.length > 0;
}
