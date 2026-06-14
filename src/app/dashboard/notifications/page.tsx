import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { NotificationsInbox } from "@/features/notifications/notifications-inbox";

export default function NotificationsPage() {
  return (
    <DashboardLayoutClient>
      <NotificationsInbox />
    </DashboardLayoutClient>
  );
}
