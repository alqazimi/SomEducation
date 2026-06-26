"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { ProfileAvatarUpload } from "@/components/profile/profile-avatar-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getConvexErrorMessage } from "@/lib/convex-error";
import {
  deleteAccountSchema,
  passwordChangeSchema,
  profileFormSchema,
  type DeleteAccountValues,
  type PasswordChangeValues,
  type ProfileFormValues,
} from "@/schemas";

export function ProfileSettingsPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getMe);
  const updateProfile = useMutation(api.users.updateProfile);
  const changePassword = useAction(api.password.changePassword);
  const deleteMyAccount = useAction(api.account.deleteMyAccount);
  const signOutOtherSessions = useMutation(api.sessions.signOutOtherSessions);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      bio: "",
    },
  });

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteForm = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      currentPassword: "",
      confirmation: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
    });
  }, [user, profileForm]);

  async function onSaveProfile(data: ProfileFormValues) {
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        bio: data.bio,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not update profile"));
    }
  }

  async function onSignOutOtherSessions() {
    try {
      await signOutOtherSessions({});
      toast.success("Signed out on all other devices");
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not sign out other sessions"));
    }
  }

  async function onChangePassword(data: PasswordChangeValues) {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed");
      passwordForm.reset();
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not change password"));
    }
  }

  async function onDeleteAccount(data: DeleteAccountValues) {
    try {
      await deleteMyAccount({
        currentPassword: data.currentPassword,
        confirmation: data.confirmation,
      });
      toast.success("Account deleted");
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not delete account"));
    }
  }

  if (user === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Account"
        title="Profile settings"
        description="Update your photo, personal details, and password."
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileAvatarUpload
              imageUrl={user.profileImageUrl}
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(onSaveProfile)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    className="mt-1"
                    {...profileForm.register("firstName")}
                  />
                  {profileForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    className="mt-1"
                    {...profileForm.register("lastName")}
                  />
                  {profileForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  className="mt-1"
                  value={user.email ?? ""}
                  disabled
                  readOnly
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email is tied to your sign-in account and cannot be changed here.
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  className="mt-1"
                  {...profileForm.register("phone")}
                />
                {profileForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  className="mt-1"
                  rows={4}
                  {...profileForm.register("bio")}
                />
                {profileForm.formState.errors.bio && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? "Saving..." : "Save profile"}
                </Button>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(onChangePassword)}
            >
              <div>
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className="mt-1"
                  {...passwordForm.register("currentPassword")}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1"
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting
                  ? "Updating..."
                  : "Change password"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Changing your password signs you out on all other devices.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you signed in on another phone or computer, sign out everywhere except
              this browser.
            </p>
            <Button type="button" variant="outline" onClick={() => void onSignOutOtherSessions()}>
              Sign out other devices
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Delete account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently remove your account from the platform. You will be signed out
              immediately and will need to sign up again to return.
              {user.role === "owner"
                ? " You cannot delete the last owner account."
                : null}
            </p>
            {!deleteOpen ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete my account
              </Button>
            ) : (
              <form
                className="space-y-4 rounded-lg border border-red-200 p-4 dark:border-red-900/50"
                onSubmit={deleteForm.handleSubmit(onDeleteAccount)}
              >
                <div>
                  <Label htmlFor="delete-password">Current password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    className="mt-1"
                    {...deleteForm.register("currentPassword")}
                  />
                  {deleteForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {deleteForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="delete-confirmation">
                    Type <span className="font-mono">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirmation"
                    className="mt-1 font-mono"
                    autoComplete="off"
                    {...deleteForm.register("confirmation")}
                  />
                  {deleteForm.formState.errors.confirmation && (
                    <p className="mt-1 text-sm text-red-600">
                      {deleteForm.formState.errors.confirmation.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={deleteForm.formState.isSubmitting}
                  >
                    {deleteForm.formState.isSubmitting
                      ? "Deleting..."
                      : "Permanently delete account"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deleteForm.formState.isSubmitting}
                    onClick={() => {
                      setDeleteOpen(false);
                      deleteForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
