"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminTeachers() {
  const requests = useQuery(api.teacherRequests.listPending);
  const approve = useMutation(api.teacherRequests.approve);
  const reject = useMutation(api.teacherRequests.reject);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Teacher requests"
        description="Approve or reject applications to become an instructor."
      />

      <div className="mt-8 space-y-4">
        {!requests ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No pending requests
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req._id}>
              <CardHeader>
                <CardTitle>
                  {req.user?.firstName} {req.user?.lastName}
                </CardTitle>
                <p className="text-sm text-slate-500">{req.user?.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{req.reason}</p>
                {req.experience && (
                  <p className="text-sm text-slate-600">
                    Experience: {req.experience}
                  </p>
                )}
                <Badge variant="warning">Pending</Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      approve({ requestId: req._id }).then(() =>
                        toast.success("Approved")
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      reject({ requestId: req._id }).then(() =>
                        toast.success("Rejected")
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
