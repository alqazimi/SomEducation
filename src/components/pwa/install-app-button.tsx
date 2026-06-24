"use client";

import { Download } from "lucide-react";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { triggerPwaInstallFromClick } from "@/lib/pwa";
import { cn } from "@/lib/utils";

type InstallAppButtonProps = {
  className?: string;
  showIcon?: boolean;
};

function handleInstallClick(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  triggerPwaInstallFromClick();
}

export function InstallAppButton({
  className,
  showIcon = true,
}: InstallAppButtonProps) {
  const { canInstall, needsRetry } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      aria-label="Install app"
      className={cn(
        "relative z-10 inline-flex h-8 touch-manipulation cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-600/10 active:scale-95",
        needsRetry && "animate-pulse",
        className
      )}
      onClick={handleInstallClick}
    >
      {showIcon && <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      Install
    </button>
  );
}
