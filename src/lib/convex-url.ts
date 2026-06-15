/** Production Convex deployment URL (not dev mild-seahorse-699). */
export function getConvexUrl() {
  return process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
}

const BUILD_PLACEHOLDER = "https://build-placeholder.convex.cloud";

export function isPlaceholderConvexUrl(url: string) {
  return url.includes("build-placeholder");
}

export function isConvexConfigured(url?: string) {
  const resolved = (url ?? getConvexUrl()).trim();
  return resolved.length > 0 && !isPlaceholderConvexUrl(resolved);
}

/** Build-safe fallback; prefer `convexUrl` prop from the server layout at runtime. */
export function getConvexClientUrl(convexUrl?: string) {
  const fromProp = convexUrl?.trim() ?? "";
  const fromEnv = getConvexUrl();
  const resolved = fromProp || fromEnv;
  if (resolved) return resolved;
  if (typeof window === "undefined") {
    return BUILD_PLACEHOLDER;
  }
  return BUILD_PLACEHOLDER;
}
