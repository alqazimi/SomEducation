import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default function TeacherCourseEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutClient allowedRoles={["teacher", "admin", "owner"]}>
      {children}
    </DashboardLayoutClient>
  );
}
