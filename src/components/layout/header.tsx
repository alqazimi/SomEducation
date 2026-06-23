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
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { MarketingThemeToggle } from "@/components/marketing/marketing-theme-toggle";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { isMarketingSitePath, marketingHeaderClass, marketingHeaderClassNight } from "@/lib/marketing-theme";
import { HeaderSearch } from "./header-search";
import { MobileNavDrawer } from "./mobile-nav-drawer";

const marketingNav = [
  { href: "/courses", label: "Courses" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
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

function isMarketingNavActive(pathname: string, href: string) {
  if (href === "/courses") return pathname.startsWith("/courses");
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
  const [navPathname, setNavPathname] = useState(pathname);
  const { isDay, isNight } = useMarketingTheme();
  const useDarkChrome = isNight && (isMarketing || isDashboard);

  if (pathname !== navPathname) {
    setNavPathname(pathname);
    setMobileOpen(false);
    setMobileSearchOpen(false);
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
      <header
        className={cn(
          "top-0 z-50 w-full",
          isMarketing && useDarkChrome ? "" : "backdrop-blur-md",
          isMarketing ? "fixed" : "sticky",
          (isMarketing || isDashboard) && "pt-[env(safe-area-inset-top,0px)]",
          useDarkChrome
            ? cn(
                isMarketing ? marketingHeaderClassNight : marketingHeaderClass,
                isDay && isMarketing && "shadow-sm"
              )
            : "border-b border-border/80 bg-background/95 shadow-sm"
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-7xl",
            isMarketing ? "px-3 sm:px-4 lg:px-8" : "px-3 sm:px-4 sm:px-6 lg:px-8"
          )}
        >
          <div
            className={cn(
              "flex h-14 items-center sm:h-16",
              isMarketing ? "gap-1 sm:gap-2 md:gap-6" : "gap-1 sm:gap-2 md:gap-3"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden sm:h-10 sm:w-10",
                  isMarketing || isDashboard
                    ? useDarkChrome
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-stone-600 hover:bg-stone-100"
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
                <SomEducationLogo size={30} className="sm:hidden" />
                <SomEducationLogo size={34} className="hidden sm:block" />
                <SomEducationWordmark
                  inverted={useDarkChrome}
                  className={cn(
                    useDarkChrome && "text-white",
                    (isMarketing || isDashboard) && "text-sm sm:text-[0.9375rem]"
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
                      isMarketingNavActive(pathname, item.href)
                        ? isMarketing
                          ? isDay
                            ? "text-brand-600"
                            : "text-brand-400"
                          : "text-brand-600"
                        : isMarketing
                          ? isDay
                            ? "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
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
                <Suspense fallback={<HeaderSearchFallback dark={useDarkChrome} />}>
                  <HeaderSearch dark={useDarkChrome} />
                </Suspense>
              </div>
            )}

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5 md:gap-2">
              {(isMarketing || isDashboard) && <MarketingThemeToggle />}

              {!isDashboard && !isSignedIn && (
                <Link
                  href="/courses"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10",
                    useDarkChrome
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
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg md:hidden sm:h-10 sm:w-10",
                    useDarkChrome
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-stone-600 hover:bg-stone-100"
                  )}
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
                      ? useDarkChrome
                        ? "text-brand-400"
                        : "text-brand-600"
                      : useDarkChrome
                        ? "text-slate-300 hover:bg-white/5 hover:text-white"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  Dashboard
                </Link>
                <NotificationBell dark={useDarkChrome} />
              </Show>

              <Show when="signed-out">
                {isMarketing && (
                  <InstallAppButton
                    className={cn(
                      "hidden h-9 border-white/20 bg-transparent text-white hover:bg-white/10 min-[400px]:inline-flex sm:h-10",
                      !useDarkChrome &&
                        "border-border text-foreground hover:bg-muted"
                    )}
                    variant="outline"
                  />
                )}
                {isMarketing ? (
                  <Link href={signInUrl}>
                    <Button
                      size="sm"
                      className="h-9 rounded-lg bg-brand-600 px-3.5 text-xs font-semibold hover:bg-brand-500 min-[400px]:px-5 min-[400px]:text-sm sm:h-10 sm:px-6"
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
              <Suspense fallback={<HeaderSearchFallback dark={useDarkChrome} />}>
                <HeaderSearch autoFocus dark={useDarkChrome} />
              </Suspense>
            </div>
          )}
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={user?.role}
        variant={isMarketing ? "marketing" : "dashboard"}
        onSearch={() => {
          setMobileOpen(false);
          if (isDashboard) setMobileSearchOpen(true);
        }}
      />
    </>
  );
}
