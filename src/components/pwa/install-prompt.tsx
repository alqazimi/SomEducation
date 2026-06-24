"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { dismissInstallBanner } from "@/lib/pwa";
import { PLATFORM_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 600;

export function InstallPrompt() {
  const { isNight } = useMarketingTheme();
  const {
    canShowBanner,
    platform,
    installing,
    installFromClick,
    dismissBanner,
    isIosSafari,
  } = usePwaInstall();
  const [bannerReady, setBannerReady] = useState(false);

  useEffect(() => {
    if (!canShowBanner) return;

    const timer = window.setTimeout(() => setBannerReady(true), SHOW_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      setBannerReady(false);
    };
  }, [canShowBanner]);

  const handleDismiss = () => {
    dismissInstallBanner();
    dismissBanner();
  };

  if (!canShowBanner || !bannerReady) return null;

  const isNative = platform === "native";
  const isIos = platform === "ios";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      role="dialog"
      aria-label={`Install ${PLATFORM_NAME}`}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-lg items-start gap-3 rounded-2xl border p-4 shadow-xl",
          isNight
            ? "border-white/10 bg-[#0c1328] text-white shadow-black/40"
            : "border-border bg-card text-foreground shadow-black/10"
        )}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Download className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold",
              isNight ? "text-white" : "text-foreground"
            )}
          >
            Install {PLATFORM_NAME}
          </p>

          {isNative && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              One tap opens the install dialog.
            </p>
          )}

          {isIos && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              {isIosSafari
                ? "Tap Install, then Share → Add to Home Screen → Add."
                : "Open in Safari, then tap Install."}
            </p>
          )}

          {platform === "android-manual" && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Tap Install for browser menu steps.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="pointer-events-auto h-9 cursor-pointer rounded-lg"
              disabled={installing}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                installFromClick();
              }}
            >
              {installing ? "Installing…" : "Install app"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "pointer-events-auto h-9 cursor-pointer rounded-lg",
                isNight
                  ? "border-white/20 bg-transparent text-white hover:bg-white/10"
                  : undefined
              )}
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            "pointer-events-auto inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg",
            isNight
              ? "text-slate-400 hover:bg-white/10 hover:text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
