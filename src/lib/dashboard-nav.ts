import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CreditCard,
  GraduationCap,
  History,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PenLine,
  Settings,
  Tags,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";

export type DashboardRole = "owner" | "admin" | "teacher" | "student";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Activity", href: "/dashboard/admin/activity", icon: History },
  { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
  {
    label: "Payment Methods",
    href: "/dashboard/admin/payment-providers",
    icon: Wallet,
  },
  { label: "Course Review", href: "/dashboard/admin/courses", icon: BookOpen },
  { label: "Categories", href: "/dashboard/admin/categories", icon: Tags },
  { label: "My Courses", href: "/dashboard/teacher/courses", icon: PenLine },
  { label: "Teachers", href: "/dashboard/admin/teachers", icon: GraduationCap },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

const teacherNav: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/teacher", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/teacher/courses", icon: BookOpen },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

const studentNav: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/student/courses", icon: BookOpen },
  { label: "Payments", href: "/dashboard/student/payments", icon: CreditCard },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  {
    label: "Become Teacher",
    href: "/dashboard/student/become-teacher",
    icon: GraduationCap,
  },
];

export function getNavForRole(role: DashboardRole): DashboardNavItem[] {
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

export function getDashboardHref(role: DashboardRole | undefined) {
  switch (role) {
    case "owner":
    case "admin":
      return "/dashboard/admin";
    case "teacher":
      return "/dashboard/teacher";
    default:
      return "/dashboard/student";
  }
}

export function getDashboardOverviewHref(role: DashboardRole) {
  return getDashboardHref(role);
}

export function isDashboardNavActive(
  pathname: string,
  href: string,
  role: DashboardRole
) {
  const overviewHref = getDashboardOverviewHref(role);
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  if (href === overviewHref) {
    return pathname === overviewHref;
  }
  return pathname.startsWith(`${href}/`);
}

/** Shortcuts for desktop sidebar grouping only; mobile uses one header menu. */
export function getMobilePrimaryNav(role: DashboardRole): DashboardNavItem[] {
  switch (role) {
    case "owner":
    case "admin":
      return [adminNav[0], adminNav[3], adminNav[8]];
    case "teacher":
      return [teacherNav[0], teacherNav[1], teacherNav[2]];
    default:
      return [studentNav[0], studentNav[1], studentNav[2]];
  }
}


export const dashboardMenuNavItem: DashboardNavItem = {
  label: "Menu",
  href: "#menu",
  icon: Menu,
};

export function isDashboardOverview(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/dashboard/student" ||
    pathname === "/dashboard/student/courses" ||
    pathname === "/dashboard/teacher" ||
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/learn/")
  );
}

export function isDashboardPath(pathname: string) {
  return pathname.startsWith("/dashboard");
}
