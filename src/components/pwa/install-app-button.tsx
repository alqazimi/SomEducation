"use client";

import { Download } from "lucide-react";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { cn } from "@/lib/utils";

type InstallAppButtonProps = {
  className?: string;
  showIcon?: boolean;
};

export function InstallAppButton({
  className,
  showIcon = true,
}: InstallAppButtonProps) {
  const { canInstall, installing, installFromClick } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      aria-label="Install app"
      disabled={installing}
      className={cn(
        "pointer-events-auto inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-600/10 disabled:opacity-70",
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        installFromClick();
      }}
    >
      {showIcon && <Download className="h-3.5 w-3.5" aria-hidden />}
      {installing ? "…" : "Install"}
    </button>
  );
}
