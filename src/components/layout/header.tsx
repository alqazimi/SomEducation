"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  getDashboardHref,
  isDashboardOverview,
  isDashboardPath,
} from "@/lib/dashboard-nav";
import { NotificationBell } from "@/features/notifications/notifications-inbox";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/support", label: "Support" },
];

const signedInNavLinks = [
  { href: "/dashboard/notifications", label: "Notifications" },
];

export function Header() {
  const pathname = usePathname();
  const user = useQuery(api.users.getMe);
  const dashboardHref = getDashboardHref(user?.role);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const showMobileMenu = !isDashboardPath(pathname);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {showMobileMenu && (
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 md:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}

            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-90"
              aria-label={`${PLATFORM_NAME} home`}
            >
              <SomEducationLogo size={32} />
              <SomEducationWordmark className="hidden min-[380px]:inline text-base sm:text-xl" />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/"
                  ? "text-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/courses")
                  ? "text-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Courses
            </Link>
            <Link
              href="/support"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/support"
                  ? "text-stone-900"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Support
            </Link>
            <Show when="signed-in">
              <Link
                href={dashboardHref}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isDashboardOverview(pathname)
                    ? "text-stone-900"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                Dashboard
              </Link>
            </Show>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Show when="signed-in">
              <NotificationBell />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </SignInButton>
              <Link href="/sign-up">
                <Button size="sm">Sign up</Button>
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
      </header>

      {showMobileMenu && mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-14 flex h-[calc(100dvh-3.5rem)] w-full max-w-sm flex-col border-b border-r border-border bg-white shadow-xl sm:top-16 sm:h-[calc(100dvh-4rem)]">
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {publicNavLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : link.href === "/support"
                      ? pathname === "/support"
                      : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-sm font-medium",
                      isActive
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Show when="signed-in">
                {!isDashboardPath(pathname) && (
                  <Link
                    href={dashboardHref}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-sm font-medium",
                      isDashboardOverview(pathname)
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    Dashboard
                  </Link>
                )}
                {signedInNavLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-sm font-medium",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </Show>
            </nav>
            <div className="border-t border-border p-4">
              <Show when="signed-out">
                <div className="flex flex-col gap-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              </Show>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
