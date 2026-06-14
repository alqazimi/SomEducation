import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminPayments } from "@/features/admin/admin-payments";

export default function AdminPaymentsPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminPayments />
    </DashboardLayoutClient>
  );
}
