import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const SESSION_MAX_AGE_SECONDS = 3 * 60 * 60;

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
  "/returns",
  "/learn/:slug",
  "/learn/:slug/lessons/:lessonId",
  "/learn/:slug/exams/:examId",
]);

const isMfaRoute = createRouteMatcher(["/mfa(.*)"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated();

    if (isMfaRoute(request)) {
      if (!isAuthenticated) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }
      return NextResponse.next();
    }

    if (!isPublicRoute(request) && !isAuthenticated) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    cookieConfig: { maxAge: SESSION_MAX_AGE_SECONDS },
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
