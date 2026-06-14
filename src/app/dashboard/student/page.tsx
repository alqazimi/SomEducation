import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { StudentDashboard } from "@/features/student/student-dashboard";

export default function StudentDashboardPage() {
  return (
    <DashboardLayoutClient allowedRoles={["student", "admin", "teacher", "owner"]}>
      <StudentDashboard />
    </DashboardLayoutClient>
  );
}
