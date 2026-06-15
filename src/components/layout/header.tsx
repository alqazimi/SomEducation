"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { Compass, Menu, Search, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_NAME } from "@/lib/brand";
import { getSignInUrl, getSignUpUrl } from "@/lib/auth-urls";
import {
  getDashboardHref,
  isDashboardOverview,
} from "@/lib/dashboard-nav";
import { NotificationBell } from "@/features/notifications/notifications-inbox";
import { HeaderSearch } from "./header-search";
import { MobileNavDrawer } from "./mobile-nav-drawer";

function HeaderSearchFallback() {
  return (
    <div className="h-10 w-full animate-pulse rounded-full bg-stone-100" />
  );
}

export function Header() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const convexReady = clerkLoaded && isSignedIn && isAuthenticated;
  const user = useQuery(api.users.getMe, convexReady ? {} : "skip");
  const dashboardHref = getDashboardHref(user?.role);
  const signInUrl = getSignInUrl(pathname || "/dashboard");
  const signUpUrl = getSignUpUrl(pathname || "/dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen && !mobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, mobileSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* Main row — Coursera-style: menu | logo + explore | search | auth */}
          <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => {
                  setMobileSearchOpen(false);
                  setMobileOpen((open) => !open);
                }}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <Link
                href="/"
                className="flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-90"
                aria-label={`${PLATFORM_NAME} home`}
              >
                <SomEducationLogo size={32} />
                <div className="hidden min-w-0 flex-col min-[400px]:flex">
                  <SomEducationWordmark className="text-sm sm:text-base" />
                  <span className="hidden text-[10px] font-medium uppercase tracking-wide text-stone-400 sm:block">
                    E-Learning
                  </span>
                </div>
              </Link>

              <Link
                href="/courses"
                className={cn(
                  "ml-1 hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:inline-flex",
                  pathname.startsWith("/courses")
                    ? "bg-brand-50 text-brand-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <Compass className="h-4 w-4 shrink-0" />
                Explore
              </Link>
            </div>

            {/* Desktop search — center */}
            <div className="hidden min-w-0 flex-1 px-2 md:block md:max-w-xl lg:max-w-2xl lg:px-4">
              <Suspense fallback={<HeaderSearchFallback />}>
                <HeaderSearch />
              </Suspense>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 md:hidden"
                aria-label={mobileSearchOpen ? "Close search" : "Search courses"}
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSearchOpen((open) => !open);
                }}
              >
                {mobileSearchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>

              <Show when="signed-in">
                <Link
                  href={dashboardHref}
                  className={cn(
                    "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:inline-flex",
                    isDashboardOverview(pathname)
                      ? "bg-brand-50 text-brand-700"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  Dashboard
                </Link>
                <NotificationBell />
              </Show>

              <Show when="signed-out">
                <Link href={signInUrl} className="hidden sm:inline-flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-700"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href={signUpUrl} className="hidden sm:inline-flex">
                  <Button size="sm">Join for free</Button>
                </Link>
                <Link href={signUpUrl} className="sm:hidden">
                  <Button size="sm" className="h-9 px-3 text-xs">
                    Join
                  </Button>
                </Link>
              </Show>

              <Show when="signed-in">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              </Show>
            </div>
          </div>

          {/* Mobile search row */}
          {mobileSearchOpen && (
            <div className="border-t border-border pb-3 pt-2 md:hidden">
              <Suspense fallback={<HeaderSearchFallback />}>
                <HeaderSearch autoFocus />
              </Suspense>
              <p className="mt-2 px-1 text-xs text-stone-500">
                Find courses, topics, and skills across SomEducation.
              </p>
            </div>
          )}
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={user?.role}
        onSearch={() => {
          setMobileOpen(false);
          setMobileSearchOpen(true);
        }}
      />
    </>
  );
}
