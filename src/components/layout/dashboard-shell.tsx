"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardRole,
  getNavForRole,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import {
  dashboardNavLinkClass,
  dashboardShellClass,
  dashboardSidebarClass,
} from "@/lib/marketing-theme";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Header } from "./header";

export { getNavForRole } from "@/lib/dashboard-nav";

export function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: DashboardRole;
}) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);
  const { isNight } = useMarketingTheme();

  return (
    <div className={dashboardShellClass}>
      <Header />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-4 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className={dashboardSidebarClass}>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                dashboardNavLinkClass(pathname === "/", isNight)
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              Home
            </Link>
            <div className="my-2 border-t border-border" />
            {navItems.map((item) => {
              const isActive = isDashboardNavActive(pathname, item.href, role);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    dashboardNavLinkClass(isActive, isNight)
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
