"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { dismissInstallBanner } from "@/lib/pwa";
import { PLATFORM_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 800;

export function InstallPrompt() {
  const { isNight } = useMarketingTheme();
  const {
    canShowBanner,
    platform,
    installing,
    install,
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

  const handleInstall = async () => {
    const result = await install();
    if (result === "installed") {
      dismissBanner();
    }
  };

  if (!canShowBanner || !bannerReady) return null;

  const isIos = platform === "ios";
  const isAndroidManual = platform === "android-manual";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      role="dialog"
      aria-label={`Install ${PLATFORM_NAME}`}
    >
      <div
        className={cn(
          "mx-auto flex max-w-lg items-start gap-3 rounded-2xl border p-4 shadow-xl",
          isNight
            ? "border-white/10 bg-marketing-panel shadow-black/40"
            : "border-border bg-card shadow-black/10"
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

          {platform === "android-native" && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Tap Install — one step adds the app to your home screen.
            </p>
          )}

          {isIos && !isIosSafari && (
            <p
              className={cn(
                "mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed",
                isNight
                  ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              )}
            >
              Open this site in <strong>Safari</strong>, then tap Install app.
            </p>
          )}

          {isIos && isIosSafari && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Tap Install, then choose{" "}
              <strong className={isNight ? "text-white" : "text-foreground"}>
                Add to Home Screen
              </strong>
              .
            </p>
          )}

          {isAndroidManual && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Tap Install, or use browser menu{" "}
              <strong className={isNight ? "text-white" : "text-foreground"}>
                (⋮) → Install app
              </strong>
              .
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => void handleInstall()}
              disabled={installing}
            >
              {installing ? "Installing…" : "Install app"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "h-9 rounded-lg",
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
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
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
