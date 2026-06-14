import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { MessagesInbox } from "@/features/messages/messages-inbox";

export default function MessagesPage() {
  return (
    <DashboardLayoutClient>
      <MessagesInbox />
    </DashboardLayoutClient>
  );
}
