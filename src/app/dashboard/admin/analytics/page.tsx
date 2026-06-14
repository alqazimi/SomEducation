import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminDashboard />
    </DashboardLayoutClient>
  );
}
