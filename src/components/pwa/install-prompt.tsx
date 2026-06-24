"use client";

import { Download } from "lucide-react";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { triggerPwaInstallFromClick } from "@/lib/pwa";
import { cn } from "@/lib/utils";

function handleInstallClick(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  triggerPwaInstallFromClick();
}

/** Small floating install button — one tap, no explanation text. */
export function InstallPrompt() {
  const { canInstall, needsRetry } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] pb-[env(safe-area-inset-bottom)]">
      <button
        type="button"
        aria-label="Install app"
        className={cn(
          "inline-flex h-9 touch-manipulation cursor-pointer items-center gap-1.5 rounded-full bg-brand-600 px-3.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-500 active:scale-95",
          needsRetry && "animate-pulse"
        )}
        onClick={handleInstallClick}
      >
        <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Install
      </button>
    </div>
  );
}
