"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function AdminActivityLog() {
  const logs = useQuery(api.audit.listRecent, { limit: 75, entityType: "users" });

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="User activity log"
        description="Recent admin actions on user accounts."
      />

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">When</th>
                  <th className="px-4 py-3 text-left font-medium">Actor</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs === undefined ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Loading activity...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No user activity logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {log.actorName ?? log.actorEmail ?? "System"}
                      </td>
                      <td className="px-4 py-3 font-medium">{log.action}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.details ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {logs === undefined ? (
              <p className="text-center text-sm text-muted-foreground">Loading activity...</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No user activity logged yet.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{log.action}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(log.createdAt)} · {log.actorName ?? log.actorEmail ?? "System"}
                  </p>
                  {log.details ? (
                    <p className="mt-2 text-sm text-muted-foreground">{log.details}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
