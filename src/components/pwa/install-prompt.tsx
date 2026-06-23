"use client";

import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  dismissInstallPrompt,
  isInstallPromptDismissed,
  isIosInstallable,
  isStandaloneDisplay,
} from "@/lib/pwa";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const SHOW_DELAY_MS = 2500;

export function InstallPrompt() {
  const { isNight } = useMarketingTheme();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || isInstallPromptDismissed()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setMode("android");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay() || isInstallPromptDismissed()) return;

    if (deferredPrompt) {
      const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (isIosInstallable()) {
      const timer = window.setTimeout(() => {
        setMode("ios");
        setVisible(true);
      }, SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    dismissInstallPrompt();
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      }
    } catch (error) {
      console.warn("[SomEducation] PWA install prompt failed:", error);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!visible || !mode) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
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
          {mode === "android" ? (
            <Download className="h-5 w-5" />
          ) : (
            <Share className="h-5 w-5" />
          )}
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
          {mode === "android" ? (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Add the app to your home screen for quick access to your courses.
            </p>
          ) : (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Tap <strong className={isNight ? "text-white" : "text-foreground"}>Share</strong>, then{" "}
              <strong className={isNight ? "text-white" : "text-foreground"}>Add to Home Screen</strong>.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {mode === "android" && (
              <Button
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => void handleInstall()}
                disabled={installing}
              >
                {installing ? "Installing…" : "Install app"}
              </Button>
            )}
            <Button
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
