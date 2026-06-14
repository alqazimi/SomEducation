import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { CreateCourseForm } from "@/features/teacher/create-course-form";

export default function NewCoursePage() {
  return (
    <DashboardLayoutClient allowedRoles={["teacher", "admin", "owner"]}>
      <CreateCourseForm />
    </DashboardLayoutClient>
  );
}
