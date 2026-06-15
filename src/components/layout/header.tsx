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
} from "@/lib/dashboard-nav";
import { NotificationBell } from "@/features/notifications/notifications-inbox";
import { MobileNavDrawer } from "./mobile-nav-drawer";

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
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={user?.role}
      />
    </>
  );
}
