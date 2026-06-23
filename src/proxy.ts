import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/sw.js",
  "/icon(.*)",
  "/apple-icon(.*)",
  "/opengraph-image(.*)",
  "/courses",
  "/courses/:slug",
  "/courses/:slug/purchase",
  "/support",
  "/how-it-works",
  "/contact",
  "/privacy",
  "/terms",
  "/learn/:slug",
  "/learn/:slug/lessons/:lessonId",
  "/learn/:slug/exams/:examId",
]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
);

const withClerk = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default function proxy(
  request: NextRequest,
  event: Parameters<typeof withClerk>[1]
) {
  if (!clerkConfigured) {
    return NextResponse.next();
  }

  return withClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
