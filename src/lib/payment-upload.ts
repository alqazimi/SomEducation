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
const UPLOAD_TIMEOUT_MS = 60_000;
const UPLOAD_URL_TIMEOUT_MS = 30_000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Upload timed out. Check your internet connection and try again."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

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

  const uploadUrl = await withTimeout(
    generateUploadUrl(),
    UPLOAD_URL_TIMEOUT_MS,
    "Could not start upload. Check your connection and sign-in, then try again."
  );

  const result = await fetchWithTimeout(
    uploadUrl,
    {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: file,
    },
    UPLOAD_TIMEOUT_MS
  );

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
