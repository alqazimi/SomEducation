"use client";

import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "convex/_generated/api";
import { getDashboardHref } from "@/lib/dashboard-nav";

const MFA_PATHS = ["/mfa", "/mfa/setup"];
const AUTH_PATHS = ["/sign-in", "/sign-up"];

function isMfaPath(pathname: string) {
  return MFA_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function AuthSessionGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const mfaStatus = useQuery(
    api.mfa.getMfaStatus,
    isAuthenticated ? {} : "skip"
  );
  const user = useQuery(api.users.getMe, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (isLoading || !isAuthenticated || mfaStatus === undefined) return;

    if (isAuthPath(pathname)) {
      if (user && mfaStatus) {
        if (mfaStatus.needsSetup) {
          router.replace("/mfa/setup");
        } else if (mfaStatus.needsVerification) {
          router.replace("/mfa");
        } else {
          router.replace(getDashboardHref(user.role));
        }
      }
      return;
    }

    if (!mfaStatus?.required) return;

    if (mfaStatus.needsSetup && pathname !== "/mfa/setup") {
      router.replace("/mfa/setup");
      return;
    }

    if (
      mfaStatus.needsVerification &&
      !isMfaPath(pathname)
    ) {
      router.replace("/mfa");
    }
  }, [
    isAuthenticated,
    isLoading,
    mfaStatus,
    pathname,
    router,
    user,
  ]);

  return null;
}
