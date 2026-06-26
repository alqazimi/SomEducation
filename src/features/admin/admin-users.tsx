"use client";

import { useMutation, useQuery } from "convex/react";
import { Crown, Search, Shield, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";

type RoleFilter = "all" | "owner" | "admin" | "teacher" | "student";
type StatusFilter = "all" | "active" | "suspended";
type ManageableRole = "student" | "teacher" | "admin";

type UserRow = {
  _id: Id<"users">;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: RoleFilter extends "all" ? string : RoleFilter;
  status: "active" | "suspended" | "deleted";
  createdAt: number;
  canManage: boolean;
};

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [extraUsers, setExtraUsers] = useState<UserRow[]>([]);

  const [removeTarget, setRemoveTarget] = useState<{
    userId: Id<"users">;
    email: string;
  } | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState<{
    userId: Id<"users">;
    email: string;
    suspend: boolean;
  } | null>(null);
  const [suspendLoading, setSuspendLoading] = useState(false);

  const [roleTarget, setRoleTarget] = useState<{
    userId: Id<"users">;
    email: string;
    currentRole: string;
  } | null>(null);
  const [nextRole, setNextRole] = useState<ManageableRole>("student");
  const [roleReason, setRoleReason] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  const me = useQuery(api.users.getMe);
  const page = useQuery(api.users.listUsers, {
    search: search.trim() || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    status: statusFilter,
    cursor,
  });

  const updateRole = useMutation(api.users.updateUserRole);
  const suspendUser = useMutation(api.users.suspendUser);
  const deleteUser = useMutation(api.users.deleteUser);

  const isOwner = me?.role === "owner";

  useEffect(() => {
    setCursor(undefined);
    setExtraUsers([]);
  }, [search, roleFilter, statusFilter]);

  const users = [...(cursor ? extraUsers : []), ...(page?.users ?? [])] as UserRow[];

  async function handleRoleChangeConfirm() {
    if (!roleTarget) return;
    setRoleLoading(true);
    try {
      await updateRole({
        userId: roleTarget.userId,
        role: nextRole,
        reason: roleReason.trim() || undefined,
      });
      toast.success("Role updated");
      setRoleTarget(null);
      setRoleReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setRoleLoading(false);
    }
  }

  async function handleSuspendConfirm() {
    if (!suspendTarget) return;
    setSuspendLoading(true);
    try {
      await suspendUser({
        userId: suspendTarget.userId,
        suspend: suspendTarget.suspend,
      });
      toast.success(suspendTarget.suspend ? "User suspended" : "User unsuspended");
      setSuspendTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setSuspendLoading(false);
    }
  }

  async function handleRemoveConfirm() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      await deleteUser({ userId: removeTarget.userId });
      toast.success("User removed");
      setRemoveTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove user");
    } finally {
      setRemoveLoading(false);
    }
  }

  function openRoleDialog(user: UserRow) {
    setRoleTarget({
      userId: user._id,
      email: user.email ?? "No email",
      currentRole: user.role,
    });
    setNextRole(
      user.role === "admin" || user.role === "teacher" || user.role === "student"
        ? user.role
        : "student"
    );
    setRoleReason("");
  }

  function renderRoleBadge(user: UserRow) {
    if (user.role === "owner") {
      return (
        <Badge className="gap-1 capitalize">
          <Crown className="h-3 w-3" />
          Owner
        </Badge>
      );
    }

    if (user.role === "admin") {
      return (
        <Badge variant="secondary" className="gap-1 capitalize">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    }

    return <Badge variant="outline" className="capitalize">{user.role}</Badge>;
  }

  function renderActions(user: UserRow) {
    const isSelf = me?._id === user._id;
    const canManage = user.canManage ?? false;

    if (!canManage || isSelf) {
      return <span className="text-xs text-muted-foreground">Protected</span>;
    }

    const canChangeRole =
      user.role !== "owner" && (isOwner || user.role === "student" || user.role === "teacher");

    return (
      <div className="flex flex-wrap gap-2">
        {canChangeRole && (
          <Button size="sm" variant="outline" onClick={() => openRoleDialog(user)}>
            Change role
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setSuspendTarget({
              userId: user._id,
              email: user.email ?? "No email",
              suspend: user.status === "active",
            })
          }
        >
          {user.status === "active" ? "Suspend" : "Unsuspend"}
        </Button>
        {(user.role === "student" ||
          (isOwner && (user.role === "admin" || user.role === "teacher"))) && (
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() =>
              setRemoveTarget({ userId: user._id, email: user.email ?? "No email" })
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>
    );
  }

  function renderUserTableBody() {
    if (page === undefined) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
            Loading users...
          </td>
        </tr>
      );
    }

    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
            No users found
          </td>
        </tr>
      );
    }

    return users.map((user) => (
      <tr key={user._id} className="border-b last:border-0">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">
                {user.firstName || user.lastName
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                  : "Unnamed user"}
              </div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
            {me?._id === user._id && (
              <Badge variant="outline" className="shrink-0">
                You
              </Badge>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
        <td className="px-4 py-3">{renderRoleBadge(user)}</td>
        <td className="px-4 py-3">
          <Badge
            variant={user.status === "active" ? "success" : "destructive"}
            className="capitalize"
          >
            {user.status}
          </Badge>
        </td>
        <td className="px-4 py-3">{renderActions(user)}</td>
      </tr>
    ));
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="User management"
        description={
          isOwner
            ? "Manage admins, teachers, and students across the platform."
            : "Manage students and teachers. Admin accounts are owner-only."
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as RoleFilter)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="owner">Owners</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="student">Students</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>{renderUserTableBody()}</tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4 md:hidden">
        {page === undefined ? (
          <p className="text-center text-sm text-muted-foreground">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No users found</p>
        ) : (
          users.map((user) => (
            <Card key={user._id}>
              <CardContent className="space-y-4 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {user.firstName || user.lastName
                        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                        : "Unnamed user"}
                    </h3>
                    {me?._id === user._id && <Badge variant="outline">You</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {renderRoleBadge(user)}
                  <Badge
                    variant={user.status === "active" ? "success" : "destructive"}
                    className="capitalize"
                  >
                    {user.status}
                  </Badge>
                </div>
                {renderActions(user)}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {page?.hasMore && page.nextCursor !== undefined && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setExtraUsers((current) => [...current, ...(page.users as UserRow[])]);
              setCursor(page.nextCursor);
            }}
          >
            Load more users
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove user?"
        description={
          removeTarget
            ? `Remove ${removeTarget.email}? Their account will be marked deleted, signed out immediately, and hidden from the user list.`
            : ""
        }
        confirmLabel="Remove User"
        variant="destructive"
        loading={removeLoading}
        onConfirm={() => void handleRemoveConfirm()}
      />

      <ConfirmDialog
        open={suspendTarget !== null}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={suspendTarget?.suspend ? "Suspend user?" : "Unsuspend user?"}
        description={
          suspendTarget
            ? suspendTarget.suspend
              ? `Suspend ${suspendTarget.email}? They will be signed out immediately and cannot sign in until unsuspended.`
              : `Restore access for ${suspendTarget.email}?`
            : ""
        }
        confirmLabel={suspendTarget?.suspend ? "Suspend User" : "Unsuspend User"}
        variant={suspendTarget?.suspend ? "destructive" : "default"}
        loading={suspendLoading}
        onConfirm={() => void handleSuspendConfirm()}
      />

      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close dialog"
            onClick={() => setRoleTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">Change role</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update role for {roleTarget.email}. Current role:{" "}
              <span className="font-medium capitalize">{roleTarget.currentRole}</span>.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="new-role">New role</Label>
                <Select
                  value={nextRole}
                  onValueChange={(value) => setNextRole(value as ManageableRole)}
                >
                  <SelectTrigger id="new-role" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    {isOwner && <SelectItem value="admin">Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role-reason">Reason (optional)</Label>
                <Textarea
                  id="role-reason"
                  className="mt-1"
                  rows={3}
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  placeholder="Why is this role changing?"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={roleLoading}
                onClick={() => setRoleTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={roleLoading || nextRole === roleTarget.currentRole}
                onClick={() => void handleRoleChangeConfirm()}
              >
                {roleLoading ? "Saving..." : "Save role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
