import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminUsers } from "@/features/admin/admin-users";

export default function AdminUsersPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminUsers />
    </DashboardLayoutClient>
  );
}
