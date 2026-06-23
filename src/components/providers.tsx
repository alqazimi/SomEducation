"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { ConvexAuthBanner } from "@/components/auth/convex-auth-banner";
import { UserSync } from "@/components/auth/user-sync";
import { getConvexClientUrl, isConvexConfigured } from "@/lib/convex-url";

function ConvexConfigBanner({ configured }: { configured: boolean }) {
  if (configured || process.env.NODE_ENV === "production") return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Backend URL is not configured. Set{" "}
      <code className="font-mono text-xs">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
      <code className="font-mono text-xs">.env.local</code> and restart dev.
    </div>
  );
}

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
        <ConvexAuthBanner />
        <ConvexConfigBanner configured={configured} />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  );
}
