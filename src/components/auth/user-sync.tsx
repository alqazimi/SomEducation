"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "convex/_generated/api";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || convexAuthLoading || !isAuthenticated || !user) return;
    if (syncedRef.current === user.id) return;

    syncedRef.current = user.id;
    void syncUser({
      email: user.primaryEmailAddress?.emailAddress ?? "",
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    }).catch(() => {
      syncedRef.current = null;
    });
  }, [isLoaded, convexAuthLoading, isAuthenticated, user, syncUser]);

  return null;
}
