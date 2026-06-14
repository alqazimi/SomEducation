import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminSettings } from "@/features/admin/admin-settings";

export default function AdminSettingsPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminSettings />
    </DashboardLayoutClient>
  );
}
