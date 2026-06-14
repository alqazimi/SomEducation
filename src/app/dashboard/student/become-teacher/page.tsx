import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { BecomeTeacherForm } from "@/features/student/become-teacher-form";

export default function BecomeTeacherPage() {
  return (
    <DashboardLayoutClient>
      <BecomeTeacherForm />
    </DashboardLayoutClient>
  );
}
