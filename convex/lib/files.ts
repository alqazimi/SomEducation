import { MutationCtx } from "../_generated/server";
import { throwError } from "./errors";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateStorageFile(
  ctx: MutationCtx,
  storageId: string,
  options?: { maxSize?: number }
) {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;
  const metadata = await ctx.storage.getMetadata(storageId);

  if (!metadata) {
    throwError("File not found", "NOT_FOUND");
  }

  const contentType = metadata.contentType ?? "";
  const normalizedType =
    contentType === "application/octet-stream" ? "" : contentType.toLowerCase();

  if (
    normalizedType &&
    !ALLOWED_MIME_TYPES.has(normalizedType) &&
    !normalizedType.startsWith("image/")
  ) {
    throwError(
      "Invalid file type. Only PNG, JPG, JPEG, WEBP, and PDF are allowed.",
      "VALIDATION"
    );
  }

  if (!normalizedType && (!metadata.size || metadata.size <= 0)) {
    throwError(
      "Invalid file type. Only PNG, JPG, JPEG, WEBP, and PDF are allowed.",
      "VALIDATION"
    );
  }

  if (metadata.size && metadata.size > maxSize) {
    throwError(
      `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`,
      "VALIDATION"
    );
  }

  return metadata;
}

export async function validateImageStorageFile(
  ctx: MutationCtx,
  storageId: string,
  options?: { maxSize?: number }
) {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;
  const metadata = await ctx.storage.getMetadata(storageId);

  if (!metadata) {
    throwError("File not found", "NOT_FOUND");
  }

  const contentType = metadata.contentType ?? "";
  if (contentType && !IMAGE_MIME_TYPES.has(contentType)) {
    throwError(
      "Invalid image type. Only PNG, JPG, JPEG, and WEBP are allowed.",
      "VALIDATION"
    );
  }

  if (metadata.size && metadata.size > maxSize) {
    throwError(
      `Image too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`,
      "VALIDATION"
    );
  }

  return metadata;
}

export async function generateUploadUrl(ctx: MutationCtx) {
  return await ctx.storage.generateUploadUrl();
}
