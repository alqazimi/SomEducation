"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show } from "@clerk/nextjs";
import {
  BookOpen,
  HelpCircle,
  Home,
  LayoutDashboard,
  Search,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DashboardRole,
  getDashboardHref,
  getNavForRole,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { PLATFORM_TAGLINE } from "@/lib/brand";
import { getSignInUrl, getSignUpUrl } from "@/lib/auth-urls";
import { cn } from "@/lib/utils";

const exploreLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/support", label: "Support", icon: HelpCircle },
] as const;

function isExploreActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/support") return pathname === "/support";
  return pathname.startsWith(href);
}

function DrawerLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-700"
          : "text-stone-700 hover:bg-stone-50"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-brand-600" : "text-stone-500"
        )}
      />
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-stone-400 first:pt-1">
      {children}
    </p>
  );
}

export function MobileNavDrawer({
  open,
  onClose,
  role,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  role?: DashboardRole;
  onSearch?: () => void;
}) {
  const pathname = usePathname();
  const dashboardItems = role ? getNavForRole(role) : [];
  const dashboardHref = getDashboardHref(role);
  const signInUrl = getSignInUrl(pathname || "/dashboard");
  const signUpUrl = getSignUpUrl(pathname || "/dashboard");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-sm font-medium text-stone-900">Menu</p>
            <p className="text-xs text-stone-500">{PLATFORM_TAGLINE}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {onSearch && (
            <button
              type="button"
              onClick={() => {
                onSearch();
                onClose();
              }}
              className="mb-2 flex w-full items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm text-stone-500 transition-colors hover:bg-stone-100"
            >
              <Search className="h-4 w-4 shrink-0" />
              Search e-learning courses…
            </button>
          )}

          <SectionLabel>E-Learning</SectionLabel>
          {exploreLinks.map((link) => (
            <DrawerLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isExploreActive(pathname, link.href)}
              onNavigate={onClose}
            />
          ))}

          <Show when="signed-in">
            {dashboardItems.length > 0 && (
              <>
                <SectionLabel>Dashboard</SectionLabel>
                <DrawerLink
                  href={dashboardHref}
                  label="Overview"
                  icon={LayoutDashboard}
                  active={
                    role
                      ? isDashboardNavActive(pathname, dashboardHref, role)
                      : false
                  }
                  onNavigate={onClose}
                />
                {dashboardItems
                  .filter((item) => item.href !== dashboardHref)
                  .map((item) => (
                    <DrawerLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={
                        role
                          ? isDashboardNavActive(pathname, item.href, role)
                          : false
                      }
                      onNavigate={onClose}
                    />
                  ))}
              </>
            )}
          </Show>
        </nav>

        <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Show when="signed-out">
            <div className="flex flex-col gap-2">
              <Link href={signInUrl} className="w-full" onClick={onClose}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href={signUpUrl} className="w-full" onClick={onClose}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
