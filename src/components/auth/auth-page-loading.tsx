"use client";

import { marketingPageClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

export function AuthPageLoading() {
  return (
    <div
      className={cn(
        marketingPageClass,
        "flex min-h-screen items-center justify-center"
      )}
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}
