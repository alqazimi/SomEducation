"use client";

import { Download } from "lucide-react";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { cn } from "@/lib/utils";

/** Small floating install button — one tap, no explanation text. */
export function InstallPrompt() {
  const { canInstall, installing, installFromClick } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <button
        type="button"
        aria-label="Install app"
        disabled={installing}
        className={cn(
          "pointer-events-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-brand-600 px-3 text-xs font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-500 disabled:opacity-70"
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          installFromClick();
        }}
      >
        <Download className="h-3.5 w-3.5" aria-hidden />
        {installing ? "…" : "Install"}
      </button>
    </div>
  );
}
