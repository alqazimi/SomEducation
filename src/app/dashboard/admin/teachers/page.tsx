import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminTeachers } from "@/features/admin/admin-teachers";

export default function AdminTeachersPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminTeachers />
    </DashboardLayoutClient>
  );
}
