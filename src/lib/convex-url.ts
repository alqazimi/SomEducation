/** Production Convex deployment URL (not dev mild-seahorse-699). */
export function getConvexUrl() {
  return process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
}

/** Avoid build failure when env is missing; runtime still requires a real URL on Vercel. */
export function getConvexClientUrl() {
  return getConvexUrl() || "https://build-placeholder.convex.cloud";
}
