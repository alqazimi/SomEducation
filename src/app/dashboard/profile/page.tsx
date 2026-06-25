import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { ProfileSettingsPage } from "@/features/profile/profile-settings-page";

export default function ProfilePage() {
  return (
    <DashboardLayoutClient>
      <ProfileSettingsPage />
    </DashboardLayoutClient>
  );
}
