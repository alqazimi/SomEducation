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

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-4 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-1 overflow-y-auto rounded-xl border border-border bg-white p-3 shadow-sm">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/"
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
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
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
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
