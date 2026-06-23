"use client";

import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  canUseWebShare,
  dismissInstallPrompt,
  isAndroid,
  isInstallPromptDismissed,
  isIosInstallable,
  isIosSafari,
  isStandaloneDisplay,
  openInstallShareSheet,
} from "@/lib/pwa";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallMode = "android" | "android-manual" | "ios";

const SHOW_DELAY_MS = 2500;
const ANDROID_FALLBACK_MS = 7000;

function subscribeClientReady(listener: () => void) {
  listener();
  return () => undefined;
}

function getClientReadySnapshot() {
  return true;
}

function getClientReadyServerSnapshot() {
  return false;
}

export function InstallPrompt() {
  const { isNight } = useMarketingTheme();
  const ready = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getClientReadyServerSnapshot
  );
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [androidFallback, setAndroidFallback] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || isInstallPromptDismissed()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (!ready || isStandaloneDisplay() || isInstallPromptDismissed()) return;
    if (isIosInstallable() || deferredPrompt) return;
    if (!isAndroid()) return;

    const timer = window.setTimeout(() => {
      setAndroidFallback(true);
    }, ANDROID_FALLBACK_MS);

    return () => window.clearTimeout(timer);
  }, [ready, deferredPrompt]);

  const installMode: InstallMode | null = ready
    ? deferredPrompt
      ? "android"
      : isIosInstallable()
        ? "ios"
        : androidFallback && isAndroid()
          ? "android-manual"
          : null
    : null;

  const blocked =
    !ready || isStandaloneDisplay() || isInstallPromptDismissed();

  useEffect(() => {
    if (blocked || !installMode) return;

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [blocked, installMode]);

  const handleDismiss = useCallback(() => {
    dismissInstallPrompt();
    setVisible(false);
  }, []);

  const handleInstall = useCallback(() => {
    if (!deferredPrompt) return;

    const promptEvent = deferredPrompt;
    setInstalling(true);

    try {
      void promptEvent
        .prompt()
        .then(() => promptEvent.userChoice)
        .then(({ outcome }) => {
          if (outcome === "accepted") {
            setVisible(false);
          }
        })
        .catch((error) => {
          console.warn("[SomEducation] PWA install prompt failed:", error);
        })
        .finally(() => {
          setInstalling(false);
          setDeferredPrompt(null);
        });
    } catch (error) {
      console.warn("[SomEducation] PWA install prompt failed:", error);
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleIosShare = useCallback(() => {
    if (!canUseWebShare()) {
      setShowIosSteps(true);
      return;
    }

    setSharing(true);
    void openInstallShareSheet(PLATFORM_NAME)
      .then((result) => {
        if (result === "unavailable") {
          setShowIosSteps(true);
        }
      })
      .finally(() => {
        setSharing(false);
      });
  }, []);

  if (!visible || !installMode) return null;

  const isIos = installMode === "ios";
  const isAndroidNative = installMode === "android";
  const isAndroidManual = installMode === "android-manual";

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
          {isIos ? (
            <Share className="h-5 w-5" aria-hidden />
          ) : (
            <Download className="h-5 w-5" aria-hidden />
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

          {isIos && !isIosSafari() && (
            <p
              className={cn(
                "mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed",
                isNight
                  ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              )}
            >
              Open this page in <strong>Safari</strong> to install on your home
              screen.
            </p>
          )}

          {isAndroidNative && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Add the app to your home screen for quick access to your courses.
            </p>
          )}

          {isAndroidManual && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Tap the browser menu{" "}
              <strong className={isNight ? "text-white" : "text-foreground"}>
                (⋮)
              </strong>
              , then choose{" "}
              <strong className={isNight ? "text-white" : "text-foreground"}>
                Install app
              </strong>{" "}
              or{" "}
              <strong className={isNight ? "text-white" : "text-foreground"}>
                Add to Home screen
              </strong>
              .
            </p>
          )}

          {isIos && (
            <>
              <p
                className={cn(
                  "mt-1 text-sm leading-relaxed",
                  isNight ? "text-slate-300" : "text-muted-foreground"
                )}
              >
                Tap the button below, then choose{" "}
                <strong className={isNight ? "text-white" : "text-foreground"}>
                  Add to Home Screen
                </strong>{" "}
                in the share menu.
              </p>
              {(showIosSteps || !canUseWebShare()) && (
                <ol
                  className={cn(
                    "mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed",
                    isNight ? "text-slate-300" : "text-muted-foreground"
                  )}
                >
                  <li>
                    Tap{" "}
                    <strong className={isNight ? "text-white" : "text-foreground"}>
                      Share
                    </strong>{" "}
                    at the bottom of Safari (square with arrow).
                  </li>
                  <li>
                    Scroll and tap{" "}
                    <strong className={isNight ? "text-white" : "text-foreground"}>
                      Add to Home Screen
                    </strong>
                    .
                  </li>
                  <li>Tap Add in the top-right corner.</li>
                </ol>
              )}
            </>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {isAndroidNative && (
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-lg"
                onClick={handleInstall}
                disabled={installing || !deferredPrompt}
              >
                {installing ? "Installing…" : "Install app"}
              </Button>
            )}
            {isIos && (
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-lg"
                onClick={handleIosShare}
                disabled={sharing}
              >
                <Share className="h-4 w-4" />
                {sharing ? "Opening…" : "Open Share menu"}
              </Button>
            )}
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
