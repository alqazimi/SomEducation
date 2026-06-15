"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { UserSync } from "@/components/auth/user-sync";
import { getConvexClientUrl, isConvexConfigured } from "@/lib/convex-url";

export function Providers({
  children,
  convexUrl = "",
}: {
  children: ReactNode;
  convexUrl?: string;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const convex = useMemo(
    () => new ConvexReactClient(getConvexClientUrl(convexUrl)),
    [convexUrl]
  );

  const configured = isConvexConfigured(convexUrl);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        <UserSync />
        {!configured && typeof window !== "undefined" && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
            Backend URL is not configured. Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_CONVEX_URL</code> on
            Vercel and redeploy.
          </div>
        )}
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  );
}
