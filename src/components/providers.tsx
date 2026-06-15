"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { UserSync } from "@/components/auth/user-sync";
import { getConvexClientUrl } from "@/lib/convex-url";

const convex = new ConvexReactClient(getConvexClientUrl());

export function Providers({ children }: { children: ReactNode }) {
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

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        <UserSync />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  );
}
