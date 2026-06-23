"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  canUseWebShare,
  isAndroid,
  isInstallBannerDismissed,
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

type PwaInstallContextValue = {
  ready: boolean;
  platform: PwaInstallPlatform;
  canInstall: boolean;
  canShowBanner: boolean;
  installing: boolean;
  install: () => Promise<"installed" | "cancelled" | "manual">;
  dismissBanner: () => void;
  isIosSafari: boolean;
  isStandalone: boolean;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

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

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getClientReadyServerSnapshot
  );
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    registerServiceWorker();
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

  const isStandalone = ready && isStandaloneDisplay();

  const platform: PwaInstallPlatform = useMemo(() => {
    if (!ready || isStandalone) return "none";
    if (hasNativePrompt) return "android-native";
    if (isIosInstallable()) return "ios";
    if (isAndroid()) return "android-manual";
    return "none";
  }, [ready, isStandalone, hasNativePrompt]);

  const canInstall = platform !== "none" && !isStandalone;

  const canShowBanner =
    canInstall && !bannerDismissed && !isInstallBannerDismissed();

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  const install = useCallback(async (): Promise<
    "installed" | "cancelled" | "manual"
  > => {
    if (deferredRef.current) {
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

  const value = useMemo(
    () => ({
      ready,
      platform,
      canInstall,
      canShowBanner,
      installing,
      install,
      dismissBanner,
      isIosSafari: isIosSafari(),
      isStandalone,
    }),
    [
      ready,
      platform,
      canInstall,
      canShowBanner,
      installing,
      install,
      dismissBanner,
      isStandalone,
    ]
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return context;
}
