import { QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

function isLegacyDefaultAvatarUrl(imageUrl?: string | null): boolean {
  if (!imageUrl?.trim()) return false;
  if (!imageUrl.includes("img.clerk.com/")) return false;
  return imageUrl.includes("type%22%3A%22default%22") || imageUrl.includes('"type":"default"');
}

export async function resolveProfileImageUrl(
  ctx: QueryCtx,
  user: Pick<Doc<"users">, "profileImageStorageId" | "imageUrl" | "image">
): Promise<string | undefined> {
  if (user.profileImageStorageId) {
    const url = await ctx.storage.getUrl(user.profileImageStorageId);
    if (url) return url;
  }

  const legacyUrl = user.imageUrl ?? user.image;
  if (!legacyUrl?.trim() || isLegacyDefaultAvatarUrl(legacyUrl)) {
    return undefined;
  }

  return legacyUrl;
}
