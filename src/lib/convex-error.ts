const CONVEX_ERROR_PREFIX =
  /\[CONVEX [^\]]+\]\s*(?:\[Request ID:[^\]]+\]\s*)?/;

export function getConvexErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
) {
  if (!(error instanceof Error)) return fallback;

  const raw = error.message.trim();
  if (!raw) return fallback;

  const lower = raw.toLowerCase();
  if (lower.includes("already exists") || lower.includes("already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (lower.includes("invalid credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("could not find public function")) {
    return "Auth service is not deployed yet. Redeploy the Convex backend and try again.";
  }
  if (lower.includes("missing environment variable")) {
    return "Site configuration error. Contact support if this continues.";
  }

  const withoutPrefix = raw.replace(CONVEX_ERROR_PREFIX, "").trim();
  if (
    withoutPrefix &&
    withoutPrefix !== "Server Error" &&
    withoutPrefix !== "Called by client"
  ) {
    return withoutPrefix.replace(/\s*Called by client\s*$/i, "").trim();
  }

  const data = (error as Error & { data?: unknown }).data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message.trim();
  }

  if (raw.includes("Account has been deleted")) {
    return "Account has been deleted";
  }

  return fallback;
}

export function isAuthSetupError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("authentication required") ||
    lower.includes("not authenticated") ||
    lower.includes("user not found")
  );
}

export function isDeletedAccountError(message: string) {
  return message.toLowerCase().includes("account has been deleted");
}
