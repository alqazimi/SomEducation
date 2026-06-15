import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminCategories } from "@/features/admin/admin-categories";

export default function AdminCategoriesPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminCategories />
    </DashboardLayoutClient>
  );
}
