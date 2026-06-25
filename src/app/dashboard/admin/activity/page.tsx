import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminActivityLog } from "@/features/admin/admin-activity-log";

export default function AdminActivityPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminActivityLog />
    </DashboardLayoutClient>
  );
}
