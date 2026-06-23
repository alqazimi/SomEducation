"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { Menu, Search, X } from "lucide-react";
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
import { isMarketingSitePath } from "@/lib/marketing-theme";
import { HeaderSearch } from "./header-search";
import { MobileNavDrawer } from "./mobile-nav-drawer";

const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/support", label: "How It Works" },
  { href: "/privacy", label: "About Us" },
  { href: "/support", label: "Contact" },
] as const;

function HeaderSearchFallback({ dark }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "h-10 w-full animate-pulse rounded-full",
        dark ? "bg-white/10" : "bg-stone-100"
      )}
    />
  );
}

function isMarketingNavActive(pathname: string, href: string, label: string) {
  if (href === "/") return pathname === "/";
  if (href === "/courses") return pathname.startsWith("/courses");
  if (label === "Contact" || label === "How It Works") return pathname === "/support";
  if (href === "/privacy") return pathname === "/privacy";
  if (href === "/terms") return pathname === "/terms";
  return pathname === href;
}

export function Header({ variant = "default" }: { variant?: "default" | "marketing" | "light" }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isMarketing =
    variant === "marketing" ||
    (variant === "default" && isMarketingSitePath(pathname));
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const convexReady = clerkLoaded && isSignedIn && isAuthenticated;
  const user = useQuery(api.users.getMe, convexReady ? {} : "skip");
  const dashboardHref = getDashboardHref(user?.role);
  const signInUrl = getSignInUrl(pathname || "/dashboard");
  const signUpUrl = getSignUpUrl(pathname || "/dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen && !mobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, mobileSearchOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b backdrop-blur-md",
          isMarketing
            ? "border-white/10 bg-[#080c16]/95"
            : "border-border/80 bg-white/95 shadow-sm"
        )}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3">
            <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-lg lg:hidden",
                  isMarketing
                    ? "text-slate-300 hover:bg-white/10"
                    : "text-stone-600 hover:bg-stone-100"
                )}
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
                className="flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-90 sm:gap-2.5"
                aria-label={`${PLATFORM_NAME} home`}
              >
                <SomEducationLogo size={32} className="sm:hidden" />
                <SomEducationLogo size={36} className="hidden sm:block" />
                <SomEducationWordmark
                  inverted={isMarketing}
                  className={cn(
                    isMarketing && "text-white",
                    isMarketing && isSignedIn && "hidden min-[380px]:inline"
                  )}
                />
              </Link>
            </div>

            {/* Center nav hidden on mobile — use drawer; lg+ only */}
            {!isDashboard && (
              <nav className="mx-auto hidden items-center justify-center gap-0.5 lg:flex xl:gap-1">
                {marketingNav.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      isMarketingNavActive(pathname, item.href, item.label)
                        ? isMarketing
                          ? "text-brand-400"
                          : "text-brand-600"
                        : isMarketing
                          ? "text-slate-300 hover:bg-white/5 hover:text-white"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            {isDashboard && (
              <div className="hidden min-w-0 flex-1 px-2 md:block md:max-w-xl lg:max-w-2xl">
                <Suspense fallback={<HeaderSearchFallback />}>
                  <HeaderSearch />
                </Suspense>
              </div>
            )}

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              {!isDashboard && !isSignedIn && (
                <Link
                  href="/courses"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-lg",
                    isMarketing
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-stone-600 hover:bg-stone-100"
                  )}
                  aria-label="Search courses"
                >
                  <Search className="h-5 w-5" />
                </Link>
              )}

              {isDashboard && (
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 md:hidden"
                  aria-label={mobileSearchOpen ? "Close search" : "Search"}
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
              )}

              <Show when="signed-in">
                <Link
                  href={dashboardHref}
                  className={cn(
                    "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:inline-flex",
                    isDashboardOverview(pathname)
                      ? isMarketing
                        ? "text-brand-400"
                        : "text-brand-600"
                      : isMarketing
                        ? "text-slate-300 hover:bg-white/5 hover:text-white"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  Dashboard
                </Link>
                <NotificationBell dark={isMarketing} />
              </Show>

              <Show when="signed-out">
                {isMarketing ? (
                  <Link href={signInUrl}>
                    <Button
                      size="sm"
                      className="h-9 rounded-lg bg-brand-600 px-5 hover:bg-brand-500 sm:h-10 sm:px-6"
                    >
                      Login
                    </Button>
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
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

          {isDashboard && mobileSearchOpen && (
            <div className="border-t border-border pb-3 pt-2 md:hidden">
              <Suspense fallback={<HeaderSearchFallback />}>
                <HeaderSearch autoFocus />
              </Suspense>
            </div>
          )}
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={user?.role}
        variant={isMarketing ? "marketing" : "default"}
        onSearch={() => {
          setMobileOpen(false);
          if (isDashboard) setMobileSearchOpen(true);
        }}
      />
    </>
  );
}
