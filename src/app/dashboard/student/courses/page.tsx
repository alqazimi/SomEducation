import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { StudentCoursesSection } from "@/features/student/student-courses-section";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";

export default function StudentCoursesPage() {
  return (
    <DashboardLayoutClient allowedRoles={["student", "teacher", "admin", "owner"]}>
      <DashboardPageHeader
        eyebrow="Dashboard"
        title="My courses"
        description="Continue learning or review courses you have completed."
      />
      <div className="mt-8">
        <StudentCoursesSection />
      </div>
    </DashboardLayoutClient>
  );
}
