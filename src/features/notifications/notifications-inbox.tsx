"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
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

export function NotificationBell() {
  const unreadCount = useQuery(api.notifications.unreadCount);
  const count = unreadCount ?? 0;

  return (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-foreground"
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
  const notifications = useQuery(api.notifications.list, {});
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

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
            className="gap-2"
            onClick={() => void markAllRead()}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </DashboardPageHeader>

      <div className="mt-8 space-y-3">
        {notifications === undefined ? (
          <p className="text-sm text-slate-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <Bell className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-700">No notifications yet</p>
            <p className="mt-1 text-sm text-slate-500">
              You&apos;ll see updates here when payments are reviewed or courses
              are approved.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={cn(
                "rounded-xl border border-border bg-white p-4 shadow-sm transition-colors sm:p-5",
                !notification.isRead && "border-brand-100 bg-brand-50/30"
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {typeLabels[notification.type] ?? "Update"}
                    </span>
                    {!notification.isRead && (
                      <span className="text-xs font-medium text-brand-600">
                        New
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-semibold text-foreground">
                    {notification.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {notification.body}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {notification.link && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={notification.link}>View</Link>
                    </Button>
                  )}
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
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
