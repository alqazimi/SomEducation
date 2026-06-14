import { Id } from "convex/_generated/dataModel";

export const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp";
export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    throw new Error("Only PNG, JPG, JPEG, and WEBP images are allowed");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5MB");
  }
}

export async function uploadFileToConvex(
  generateUploadUrl: () => Promise<string>,
  file: File
): Promise<Id<"_storage">> {
  validateImageFile(file);
  const uploadUrl = await generateUploadUrl();
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!result.ok) {
    throw new Error("Upload failed");
  }
  const { storageId } = await result.json();
  return storageId as Id<"_storage">;
}
