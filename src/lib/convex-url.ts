const BUILD_PLACEHOLDER = "https://build-placeholder.convex.cloud";

/** Strip whitespace and trailing slashes so Convex URLs don't become `...cloud//api/...`. */
export function normalizeConvexUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

/** Production Convex deployment URL (not dev mild-seahorse-699). */
export function getConvexUrl() {
  const raw = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
  return raw ? normalizeConvexUrl(raw) : "";
}

export function isPlaceholderConvexUrl(url: string) {
  return url.includes("build-placeholder");
}

export function isConvexConfigured(url?: string) {
  const resolved = url ? normalizeConvexUrl(url) : getConvexUrl();
  return resolved.length > 0 && !isPlaceholderConvexUrl(resolved);
}

/** Build-safe fallback; prefer `convexUrl` prop from the server layout at runtime. */
export function getConvexClientUrl(convexUrl?: string) {
  const fromProp = convexUrl ? normalizeConvexUrl(convexUrl) : "";
  const fromEnv = getConvexUrl();
  const resolved = fromProp || fromEnv;
  if (resolved) return resolved;
  return BUILD_PLACEHOLDER;
}
