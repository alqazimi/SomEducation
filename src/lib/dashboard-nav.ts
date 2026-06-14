export function getDashboardHref(
  role: "owner" | "admin" | "teacher" | "student" | undefined
) {
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
