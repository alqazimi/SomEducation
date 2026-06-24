"use client";

import { Share, SquarePlus, X } from "lucide-react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { PLATFORM_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function IosInstallGuide() {
  const { isNight } = useMarketingTheme();
  const { iosGuideOpen, closeIosGuide, isIosSafari: safari } = usePwaInstall();

  if (!iosGuideOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Install ${PLATFORM_NAME}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close guide"
        onClick={closeIosGuide}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border p-5 shadow-2xl sm:p-6",
          isNight
            ? "border-white/10 bg-[#0c1328] text-white"
            : "border-border bg-card text-foreground"
        )}
      >
        <button
          type="button"
          onClick={closeIosGuide}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg",
            isNight
              ? "text-slate-400 hover:bg-white/10 hover:text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <SquarePlus className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold sm:text-lg">
              Install {PLATFORM_NAME}
            </h2>
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              {safari
                ? "Tap Share at the bottom of Safari, then Add to Home Screen."
                : "Open this site in Safari, then tap Install app again."}
            </p>
          </div>
        </div>

        {safari ? (
          <div
            className={cn(
              "mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed",
              isNight
                ? "border-white/10 bg-white/5 text-slate-200"
                : "border-slate-200 bg-slate-50 text-slate-700"
            )}
          >
            <p className="font-medium">Share → Add to Home Screen → Add</p>
            <p className="mt-2 flex items-center gap-2 text-xs">
              <Share className="h-4 w-4 shrink-0 text-brand-500" />
              Look for the Share icon in Safari&apos;s bottom bar.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "mt-4 rounded-xl border px-3 py-3 text-sm",
              isNight
                ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
                : "border-amber-200 bg-amber-50 text-amber-900"
            )}
          >
            iPhone install works best in <strong>Safari</strong>. Copy the site
            URL from your browser and open it in Safari first.
          </div>
        )}

        <Button
          type="button"
          className="mt-5 h-10 w-full rounded-lg"
          onClick={closeIosGuide}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
