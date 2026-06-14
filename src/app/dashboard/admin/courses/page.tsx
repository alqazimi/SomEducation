import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminCourses } from "@/features/admin/admin-courses";

export default function AdminCoursesPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminCourses />
    </DashboardLayoutClient>
  );
}
