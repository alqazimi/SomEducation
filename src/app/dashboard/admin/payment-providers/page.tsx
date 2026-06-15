import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { AdminPaymentProviders } from "@/features/admin/admin-payment-providers";

export default function AdminPaymentProvidersPage() {
  return (
    <DashboardLayoutClient allowedRoles={["admin", "owner"]}>
      <AdminPaymentProviders />
    </DashboardLayoutClient>
  );
}
