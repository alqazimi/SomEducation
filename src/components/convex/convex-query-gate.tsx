"use client";

import { useConvexConnectionState } from "convex/react";
import { RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { isConvexConfigured } from "@/lib/convex-url";

export function ConvexConnectionError({
  title = "Could not connect to the server",
  description,
}: {
  title?: string;
  description?: string;
}) {
  const configured = isConvexConfigured();

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        {description ??
          (configured
            ? "The app could not reach Convex. Check that your production deployment is running and try again."
            : "NEXT_PUBLIC_CONVEX_URL is missing. Add it in Vercel environment variables, then redeploy.")}
      </p>
      {!configured && (
        <div className="mt-4 max-w-md rounded-lg border border-border bg-white p-4 text-left text-xs text-slate-600">
          <p className="font-medium text-foreground">Vercel → Settings → Environment Variables</p>
          <p className="mt-2 font-mono text-[11px] text-brand-700">
            NEXT_PUBLIC_CONVEX_URL=https://precious-duck-100.eu-west-1.convex.cloud
          </p>
        </div>
      )}
      <Button
        variant="outline"
        className="mt-6 gap-2"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

export function ConvexQueryGate({
  isLoading,
  children,
  fallback,
  errorTitle,
}: {
  isLoading: boolean;
  children: ReactNode;
  fallback: ReactNode;
  errorTitle?: string;
}) {
  const connection = useConvexConnectionState();

  if (!isLoading) {
    return <>{children}</>;
  }

  if (!isConvexConfigured()) {
    return <ConvexConnectionError title={errorTitle} />;
  }

  if (connection.connectionRetries > 2 && !connection.hasEverConnected) {
    return <ConvexConnectionError title={errorTitle} />;
  }

  return <>{fallback}</>;
}

type ConvexSectionErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ConvexSectionErrorBoundaryState = {
  hasError: boolean;
};

export class ConvexSectionErrorBoundary extends Component<
  ConvexSectionErrorBoundaryProps,
  ConvexSectionErrorBoundaryState
> {
  state: ConvexSectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function useConvexQueryReady() {
  const connection = useConvexConnectionState();
  return isConvexConfigured() && connection.hasEverConnected;
}
