const DEFAULT_AUTH_REDIRECT = "/dashboard";

/** Only allow safe in-app paths after sign-in / sign-up. */
export function sanitizeRedirectPath(path: string | null | undefined) {
  if (!path) return DEFAULT_AUTH_REDIRECT;

  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (
    trimmed.startsWith("/sign-in") ||
    trimmed.startsWith("/sign-up") ||
    trimmed.startsWith("/__clerk")
  ) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return trimmed;
}

export function getSignInUrl(redirectPath = DEFAULT_AUTH_REDIRECT) {
  const safePath = sanitizeRedirectPath(redirectPath);

  return `/sign-in?redirect_url=${encodeURIComponent(safePath)}`;
}

export function getSignUpUrl(redirectPath = DEFAULT_AUTH_REDIRECT) {
  const safePath = sanitizeRedirectPath(redirectPath);

  return `/sign-up?redirect_url=${encodeURIComponent(safePath)}`;
}
