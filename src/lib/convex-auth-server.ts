import type { ConvexAuthNextjsMiddlewareOptions } from "@convex-dev/auth/nextjs/server";
import { getConvexUrl } from "@/lib/convex-url";

const SESSION_MAX_AGE_SECONDS = 3 * 60 * 60;

const convexUrl = getConvexUrl();

/** Shared options for Convex Auth middleware. */
export const convexAuthServerOptions: ConvexAuthNextjsMiddlewareOptions = {
  ...(convexUrl ? { convexUrl } : {}),
  cookieConfig: { maxAge: SESSION_MAX_AGE_SECONDS },
  verbose: process.env.NODE_ENV === "development",
};
