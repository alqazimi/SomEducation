import { MutationCtx } from "../_generated/server";
import { throwError } from "./errors";

const RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 30;

export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  maxRequests = DEFAULT_MAX_REQUESTS
) {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    if (existing) {
      await ctx.db.patch(existing._id, { count: 1, windowStart: now });
    } else {
      await ctx.db.insert("rateLimits", { key, count: 1, windowStart: now });
    }
    return;
  }

  if (existing.count >= maxRequests) {
    throwError("Too many requests. Please try again later.", "RATE_LIMITED");
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

export function sanitizeText(input: string, maxLength = 5000): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s+\-()]{7,20}$/.test(phone);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0 && price <= 1_000_000;
}

/** Regular price must be above sale price to count as a discount. */
export function resolveCompareAtPrice(
  compareAtPrice: number | undefined,
  salePrice: number
): number | undefined {
  if (compareAtPrice === undefined) return undefined;
  if (!validatePrice(compareAtPrice)) {
    throw new Error("Invalid regular price");
  }
  if (compareAtPrice <= salePrice) return undefined;
  return compareAtPrice;
}

export function validateImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
