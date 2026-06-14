import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { StudentPayments } from "@/features/student/student-payments";

export default function StudentPaymentsPage() {
  return (
    <DashboardLayoutClient>
      <StudentPayments />
    </DashboardLayoutClient>
  );
}
