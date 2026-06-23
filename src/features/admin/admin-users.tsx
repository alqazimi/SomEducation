"use client";

import { useMutation, useQuery } from "convex/react";
import { Crown, Search, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";

type RoleFilter = "all" | "owner" | "admin" | "teacher" | "student";
type StatusFilter = "all" | "active" | "suspended";
type ManageableRole = "student" | "teacher" | "admin";

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [removeTarget, setRemoveTarget] = useState<{
    userId: Id<"users">;
    email: string;
  } | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const me = useQuery(api.users.getMe);
  const users = useQuery(api.users.listUsers, {
    search: search.trim() || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    status: statusFilter,
  });
  const updateRole = useMutation(api.users.updateUserRole);
  const suspendUser = useMutation(api.users.suspendUser);
  const deleteUser = useMutation(api.users.deleteUser);

  const isOwner = me?.role === "owner";

  async function handleRoleChange(
    userId: Id<"users">,
    role: ManageableRole | "owner"
  ) {
    try {
      await updateRole({ userId, role });
      toast.success("Role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  }

  async function handleSuspend(userId: Id<"users">, suspend: boolean) {
    try {
      await suspendUser({ userId, suspend });
      toast.success(suspend ? "User suspended" : "User unsuspended");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
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

  function renderRoleControl(user: NonNullable<typeof users>[number]) {
    if (user.role === "owner") {
      return (
        <Badge className="gap-1 capitalize">
          <Crown className="h-3 w-3" />
          Owner
        </Badge>
      );
    }

    if (user.role === "admin" && !isOwner) {
      return (
        <Badge variant="secondary" className="gap-1 capitalize">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    }

    if (isOwner && user.role === "admin") {
      return (
        <Select
          value={user.role}
          onValueChange={(role) =>
            void handleRoleChange(user._id, role as ManageableRole)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Select
        value={user.role}
        onValueChange={(role) =>
          void handleRoleChange(user._id, role as ManageableRole)
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="teacher">Teacher</SelectItem>
          {isOwner && <SelectItem value="admin">Admin</SelectItem>}
        </SelectContent>
      </Select>
    );
  }

  function renderActions(user: NonNullable<typeof users>[number]) {
    const isSelf = me?._id === user._id;
    const canManage = user.canManage ?? false;

    if (!canManage || isSelf) {
      return <span className="text-xs text-muted-foreground">Protected</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleSuspend(user._id, user.status === "active")}
        >
          {user.status === "active" ? "Suspend" : "Unsuspend"}
        </Button>
        {isOwner && (user.role === "admin" || user.role === "teacher") && (
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() =>
              setRemoveTarget({ userId: user._id, email: user.email })
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>
    );
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
          <tbody>
            {users === undefined ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">{renderRoleControl(user)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        user.status === "active" ? "success" : "destructive"
                      }
                      className="capitalize"
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{renderActions(user)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4 md:hidden">
        {users === undefined ? (
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
                {renderRoleControl(user)}
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

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove user?"
        description={
          removeTarget
            ? `Remove ${removeTarget.email} from the platform? Their account will be marked as deleted.`
            : ""
        }
        confirmLabel="Remove User"
        variant="destructive"
        loading={removeLoading}
        onConfirm={() => void handleRemoveConfirm()}
      />
    </div>
  );
}
