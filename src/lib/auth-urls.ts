const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSignInUrl(redirectPath = DEFAULT_AUTH_REDIRECT) {
  const safePath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : DEFAULT_AUTH_REDIRECT;

  return `/sign-in?redirect_url=${encodeURIComponent(safePath)}`;
}

export function getSignUpUrl(redirectPath = DEFAULT_AUTH_REDIRECT) {
  const safePath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : DEFAULT_AUTH_REDIRECT;

  return `/sign-up?redirect_url=${encodeURIComponent(safePath)}`;
}
