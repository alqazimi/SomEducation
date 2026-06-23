"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  canUseWebShare,
  isAndroid,
  isInstallPromptDismissed,
  isIosInstallable,
  isIosSafari,
  isStandaloneDisplay,
  openInstallShareSheet,
  registerServiceWorker,
} from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaInstallPlatform = "android-native" | "android-manual" | "ios" | "none";

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

export function usePwaInstall() {
  const ready = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getClientReadyServerSnapshot
  );
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [androidManual, setAndroidManual] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!ready || isStandaloneDisplay()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || isStandaloneDisplay() || isIosInstallable() || hasNativePrompt) {
      return;
    }
    if (!isAndroid()) return;

    const timer = window.setTimeout(() => setAndroidManual(true), 5000);
    return () => window.clearTimeout(timer);
  }, [ready, hasNativePrompt]);

  const platform: PwaInstallPlatform = !ready || isStandaloneDisplay()
    ? "none"
    : hasNativePrompt
      ? "android-native"
      : isIosInstallable()
        ? "ios"
        : androidManual && isAndroid()
          ? "android-manual"
          : "none";

  const canPrompt =
    platform !== "none" && !isInstallPromptDismissed() && !isStandaloneDisplay();

  const install = useCallback(async (): Promise<"installed" | "cancelled" | "manual"> => {
    if (platform === "android-native" && deferredRef.current) {
      const promptEvent = deferredRef.current;
      setInstalling(true);
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          deferredRef.current = null;
          setHasNativePrompt(false);
          return "installed";
        }
        return "cancelled";
      } catch (error) {
        console.warn("[SomEducation] PWA install failed:", error);
        return "cancelled";
      } finally {
        setInstalling(false);
      }
    }

    if (platform === "ios" && canUseWebShare()) {
      setInstalling(true);
      try {
        const result = await openInstallShareSheet(PLATFORM_NAME);
        return result === "shared" ? "manual" : "cancelled";
      } finally {
        setInstalling(false);
      }
    }

    return "manual";
  }, [platform]);

  return {
    ready,
    platform,
    canPrompt,
    installing,
    install,
    isIosSafari: isIosSafari(),
    isStandalone: isStandaloneDisplay(),
  };
}
