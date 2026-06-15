import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/icon(.*)",
  "/apple-icon(.*)",
  "/opengraph-image(.*)",
  "/courses",
  "/courses/:slug",
  "/courses/:slug/purchase",
  "/support",
  "/privacy",
  "/terms",
  "/learn/:slug",
  "/learn/:slug/lessons/:lessonId",
  "/learn/:slug/exams/:examId",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
