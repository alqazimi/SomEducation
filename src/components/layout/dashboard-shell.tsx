"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  CreditCard,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageSquare,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { DashboardMobileNav } from "./dashboard-mobile-nav";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
  { label: "Course Review", href: "/dashboard/admin/courses", icon: BookOpen },
  { label: "My Courses", href: "/dashboard/teacher/courses", icon: PenLine },
  { label: "Teachers", href: "/dashboard/admin/teachers", icon: GraduationCap },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

const teacherNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/teacher", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/teacher/courses", icon: BookOpen },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

const studentNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "Payments", href: "/dashboard/student/payments", icon: CreditCard },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Become Teacher", href: "/dashboard/student/become-teacher", icon: GraduationCap },
];

export function getNavForRole(role: "owner" | "admin" | "teacher" | "student") {
  switch (role) {
    case "owner":
    case "admin":
      return adminNav;
    case "teacher":
      return teacherNav;
    default:
      return studentNav;
  }
}

export function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "owner" | "admin" | "teacher" | "student";
}) {
  const pathname = usePathname();
  const navItems = getNavForRole(role);

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-8 pb-24">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1 rounded-xl border border-border bg-white p-3 shadow-sm">
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
              const isActive =
                pathname === item.href ||
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
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <DashboardMobileNav role={role} />
    </div>
  );
}
