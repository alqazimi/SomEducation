import { Id } from "convex/_generated/dataModel";

export const PAYMENT_PROOF_ACCEPT = ".png,.jpg,.jpeg,.webp,.pdf";

export const PAYMENT_PROOF_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
] as const;

const EXTENSION_TO_MIME: Record<string, (typeof PAYMENT_PROOF_MIME_TYPES)[number]> =
  {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };

const MAX_PAYMENT_PROOF_SIZE = 5 * 1024 * 1024;

export function resolvePaymentProofMimeType(file: File) {
  if (
    file.type &&
    PAYMENT_PROOF_MIME_TYPES.includes(
      file.type as (typeof PAYMENT_PROOF_MIME_TYPES)[number]
    )
  ) {
    return file.type as (typeof PAYMENT_PROOF_MIME_TYPES)[number];
  }

  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (extension && EXTENSION_TO_MIME[extension]) {
    return EXTENSION_TO_MIME[extension];
  }

  throw new Error("Only PNG, JPG, JPEG, WEBP, and PDF files are allowed");
}

export function validatePaymentProofFile(file: File) {
  resolvePaymentProofMimeType(file);

  if (file.size > MAX_PAYMENT_PROOF_SIZE) {
    throw new Error("File must be under 5MB");
  }
}

export async function uploadPaymentProofToConvex(
  generateUploadUrl: () => Promise<string>,
  file: File
): Promise<Id<"_storage">> {
  validatePaymentProofFile(file);
  const contentType = resolvePaymentProofMimeType(file);

  const uploadUrl = await generateUploadUrl();
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!result.ok) {
    const detail = await result.text().catch(() => "");
    throw new Error(
      detail
        ? `Upload failed (${result.status}). Please try again.`
        : "Upload failed. Please sign in and try again."
    );
  }

  let payload: { storageId?: string };
  try {
    payload = await result.json();
  } catch {
    throw new Error("Upload completed but the server response was invalid.");
  }

  if (!payload.storageId) {
    throw new Error("Upload failed — no file id returned.");
  }

  return payload.storageId as Id<"_storage">;
}

export function isPdfProofUrl(url: string | null | undefined) {
  if (!url) return false;
  return url.toLowerCase().includes(".pdf") || url.includes("application%2Fpdf");
}
