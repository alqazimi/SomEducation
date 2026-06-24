/** Clerk default avatar URLs embed a base64 payload with `"type":"default"`. */
function decodeClerkImagePayload(url: string): { type?: string } | null {
  const match = url.match(/img\.clerk\.com\/([^?]+)/);
  if (!match) return null;

  const token = match[1];
  try {
    const padded = token + "=".repeat((4 - (token.length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { type?: string };
  } catch {
    return null;
  }
}

export function isClerkDefaultAvatarUrl(imageUrl?: string | null): boolean {
  if (!imageUrl?.trim()) return false;
  if (!imageUrl.includes("img.clerk.com/")) return false;
  const payload = decodeClerkImagePayload(imageUrl);
  return payload?.type === "default";
}

/** Returns a profile image URL only when it is a real user photo. */
export function getDisplayProfileImageUrl(
  imageUrl?: string | null
): string | undefined {
  if (!imageUrl?.trim() || isClerkDefaultAvatarUrl(imageUrl)) {
    return undefined;
  }
  return imageUrl;
}
