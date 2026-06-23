"use client";

import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  payment_approved: "Payment",
  payment_rejected: "Payment",
  payment_resubmit: "Payment",
  new_message: "Message",
  teacher_approved: "Teacher",
  teacher_rejected: "Teacher",
  course_approved: "Course",
  course_rejected: "Course",
};

function notificationTypeBadgeClass(type: string, isNight: boolean) {
  const base =
    "rounded-full px-2.5 py-0.5 text-xs font-medium";

  switch (type) {
    case "payment_approved":
    case "course_approved":
    case "teacher_approved":
      return cn(
        base,
        isNight
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-emerald-50 text-emerald-700"
      );
    case "payment_rejected":
    case "course_rejected":
    case "teacher_rejected":
      return cn(
        base,
        isNight ? "bg-red-500/15 text-red-300" : "bg-red-50 text-red-700"
      );
    case "payment_resubmit":
      return cn(
        base,
        isNight ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-800"
      );
    case "new_message":
      return cn(
        base,
        isNight ? "bg-brand-600/20 text-brand-300" : "bg-brand-50 text-brand-700"
      );
    default:
      return cn(
        base,
        isNight ? "bg-white/10 text-slate-300" : "bg-muted text-muted-foreground"
      );
  }
}

function unreadNotificationClass(isNight: boolean) {
  return isNight
    ? "border-brand-500/35 bg-brand-600/10 shadow-sm shadow-brand-600/5"
    : "border-brand-200 bg-brand-50/70";
}

export function NotificationBell({ dark }: { dark?: boolean }) {
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.getMe, isAuthenticated ? {} : "skip");
  const canLoadNotifications = isAuthenticated && me?.status === "active";
  const unreadCount = useQuery(
    api.notifications.unreadCount,
    canLoadNotifications ? {} : "skip"
  );
  const count = unreadCount ?? 0;

  if (!canLoadNotifications) {
    return null;
  }

  return (
    <Link
      href="/dashboard/notifications"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        dark
          ? "text-slate-300 hover:bg-white/10 hover:text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export function NotificationsInbox() {
  const { isAuthenticated } = useConvexAuth();
  const { isNight } = useMarketingTheme();
  const me = useQuery(api.users.getMe, isAuthenticated ? {} : "skip");
  const canLoad = isAuthenticated && me?.status === "active";

  const notifications = useQuery(
    api.notifications.list,
    canLoad ? {} : "skip"
  );
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (me !== undefined && !canLoad) {
    return (
      <div>
        <DashboardPageHeader
          eyebrow="Updates"
          title="Notifications"
          description="Payment updates, course approvals, and messages."
        />
        <p className="mt-8 text-sm text-muted-foreground">
          Notifications are unavailable for your account right now.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Payment updates, course approvals, and messages."
      >
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2",
              isNight && "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
            )}
            onClick={() => void markAllRead()}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </DashboardPageHeader>

      <div className="mt-8 space-y-3">
        {notifications === undefined ? (
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div
            className={cn(
              "rounded-2xl border border-dashed px-6 py-16 text-center",
              isNight
                ? "border-white/15 bg-white/[0.03]"
                : "border-border bg-card"
            )}
          >
            <Bell
              className={cn(
                "mx-auto h-10 w-10",
                isNight ? "text-slate-500" : "text-muted-foreground"
              )}
            />
            <p className="mt-4 font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll see updates here when payments are reviewed or courses
              are approved.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={cn(
                "rounded-xl border border-border bg-card p-4 shadow-sm transition-colors sm:p-5",
                !notification.isRead && "notification-unread",
                !notification.isRead && unreadNotificationClass(isNight)
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={notificationTypeBadgeClass(
                        notification.type,
                        isNight
                      )}
                    >
                      {typeLabels[notification.type] ?? "Update"}
                    </span>
                    {!notification.isRead && (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          isNight ? "text-brand-400" : "text-brand-600"
                        )}
                      >
                        New
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-semibold text-foreground">
                    {notification.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.body}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {notification.link && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className={cn(
                        isNight &&
                          "border-white/15 bg-transparent text-slate-200 hover:bg-white/10"
                      )}
                    >
                      <Link href={notification.link}>View</Link>
                    </Button>
                  )}
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        isNight && "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                      onClick={() =>
                        void markRead({
                          notificationId:
                            notification._id as Id<"notifications">,
                        })
                      }
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
