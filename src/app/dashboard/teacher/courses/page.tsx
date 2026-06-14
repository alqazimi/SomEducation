import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { TeacherDashboard } from "@/features/teacher/teacher-dashboard";

export default function TeacherCoursesPage() {
  return (
    <DashboardLayoutClient allowedRoles={["teacher", "admin", "owner"]}>
      <TeacherDashboard />
    </DashboardLayoutClient>
  );
}
