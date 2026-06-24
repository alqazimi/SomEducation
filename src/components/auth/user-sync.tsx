"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "convex/_generated/api";
import { getDisplayProfileImageUrl } from "@/lib/profile-image";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || convexAuthLoading || !isAuthenticated || !user) return;
    if (syncedRef.current === user.id) return;

    const runSync = () => {
      syncedRef.current = user.id;
      void syncUser({
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        imageUrl: getDisplayProfileImageUrl(user.imageUrl),
      }).catch(() => {
        syncedRef.current = null;
        window.setTimeout(() => {
          if (syncedRef.current === user.id) return;
          syncedRef.current = user.id;
          void syncUser({
            email: user.primaryEmailAddress?.emailAddress ?? "",
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            imageUrl: getDisplayProfileImageUrl(user.imageUrl),
          }).catch(() => {
            syncedRef.current = null;
          });
        }, 3000);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(runSync, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = globalThis.setTimeout(runSync, 0);
    return () => globalThis.clearTimeout(timer);
  }, [isLoaded, convexAuthLoading, isAuthenticated, user, syncUser]);

  return null;
}
