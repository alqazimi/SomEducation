"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardRedirect() {
  const router = useRouter();
  const user = useQuery(api.users.getMe);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    switch (user.role) {
      case "owner":
      case "admin":
        router.replace("/dashboard/admin");
        break;
      case "teacher":
        router.replace("/dashboard/teacher");
        break;
      default:
        router.replace("/dashboard/student");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-muted p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-64 w-full" />
    </div>
  );
}
