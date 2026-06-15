"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, HelpCircle, Home, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DashboardNavItem,
  DashboardRole,
  dashboardMenuNavItem,
  getMobilePrimaryNav,
  getNavForRole,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  role,
  pathname,
  onNavigate,
  compact = false,
}: {
  item: DashboardNavItem;
  role: DashboardRole;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const isActive = isDashboardNavActive(pathname, item.href, role);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        compact
          ? "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium sm:text-xs"
          : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
        isActive
          ? compact
            ? "text-brand-700"
            : "bg-brand-50 text-brand-700"
          : compact
            ? "text-stone-500"
            : "text-stone-700 hover:bg-stone-50"
      )}
    >
      <item.icon
        className={cn(
          compact ? "h-5 w-5" : "h-4 w-4 shrink-0",
          isActive ? "text-brand-600" : compact ? "text-stone-400" : "text-stone-500"
        )}
      />
      <span className={compact ? "truncate" : undefined}>{item.label}</span>
    </Link>
  );
}

function SiteLink({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  pathname: string;
  onNavigate: () => void;
}) {
  const isActive =
    href === "/"
      ? pathname === "/"
      : href === "/support"
        ? pathname === "/support"
        : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
        isActive
          ? "bg-brand-50 text-brand-700"
          : "text-stone-700 hover:bg-stone-50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-stone-500" />
      {label}
    </Link>
  );
}

function DashboardNavDrawer({
  role,
  open,
  onClose,
}: {
  role: DashboardRole;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dashboard menu"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-sm font-medium text-stone-900">Menu</p>
            <p className="text-xs text-stone-500">Dashboard and site pages</p>
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
        <nav className="max-h-[calc(85vh-4.5rem)] overflow-y-auto p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <p className="px-4 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-stone-400">
            Dashboard
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              role={role}
              pathname={pathname}
              onNavigate={onClose}
            />
          ))}
          <div className="my-3 border-t border-border" />
          <p className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-stone-400">
            Website
          </p>
          <SiteLink
            href="/"
            label="Home"
            icon={Home}
            pathname={pathname}
            onNavigate={onClose}
          />
          <SiteLink
            href="/courses"
            label="Courses"
            icon={BookOpen}
            pathname={pathname}
            onNavigate={onClose}
          />
          <SiteLink
            href="/support"
            label="Support"
            icon={HelpCircle}
            pathname={pathname}
            onNavigate={onClose}
          />
        </nav>
      </div>
    </div>
  );
}

export function DashboardMobileNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryItems = getMobilePrimaryNav(role);
  const allItems = getNavForRole(role);
  const menuActive =
    allItems.some((item) => isDashboardNavActive(pathname, item.href, role)) &&
    !primaryItems.some((item) => isDashboardNavActive(pathname, item.href, role));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <DashboardNavDrawer
        role={role}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <nav
        aria-label="Dashboard navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1">
          {primaryItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              role={role}
              pathname={pathname}
              compact
            />
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium sm:text-xs",
              menuOpen || menuActive ? "text-brand-700" : "text-stone-500"
            )}
          >
            <dashboardMenuNavItem.icon
              className={cn(
                "h-5 w-5",
                menuOpen || menuActive ? "text-brand-600" : "text-stone-400"
              )}
            />
            <span className="truncate">{dashboardMenuNavItem.label}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
