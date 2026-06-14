"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavForRole } from "./dashboard-shell";

export function DashboardMobileNav({
  role,
}: {
  role: "owner" | "admin" | "teacher" | "student";
}) {
  const pathname = usePathname();
  const items = [
    { label: "Home", href: "/", icon: Home },
    ...getNavForRole(role).slice(0, 3),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                (item.href !==
                  (role === "owner" || role === "admin"
                    ? "/dashboard/admin"
                    : `/dashboard/${role}`) &&
                  pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium sm:text-xs",
                isActive ? "text-brand-700" : "text-slate-500"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-brand-600" : "text-slate-400"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
