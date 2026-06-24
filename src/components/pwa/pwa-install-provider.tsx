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
import {
  isAndroid,
  isInstallBannerDismissed,
  isIosInstallable,
  isIosSafari,
  isStandaloneDisplay,
  PWA_INSTALLED_EVENT,
  PWA_INSTALL_AVAILABLE_EVENT,
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
  iosGuideOpen: boolean;
  install: () => Promise<"installed" | "cancelled" | "manual" | "guide">;
  dismissBanner: () => void;
  closeIosGuide: () => void;
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

function readDeferredInstallEvent(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return (
    (window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent })
      .__pwaDeferredInstall ?? null
  );
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
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  const syncDeferredPrompt = useCallback(() => {
    const event = readDeferredInstallEvent();
    if (event) {
      deferredRef.current = event;
      setHasNativePrompt(true);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    registerServiceWorker();
    syncDeferredPrompt();
  }, [syncDeferredPrompt]);

  useEffect(() => {
    if (!ready || isStandaloneDisplay()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      (
        window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent }
      ).__pwaDeferredInstall = event as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
    };

    const onInstallAvailable = () => {
      syncDeferredPrompt();
    };

    const onInstalled = () => {
      deferredRef.current = null;
      (
        window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent }
      ).__pwaDeferredInstall = undefined;
      setHasNativePrompt(false);
      setInstalled(true);
      setIosGuideOpen(false);
      setBannerDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener(PWA_INSTALL_AVAILABLE_EVENT, onInstallAvailable);
    window.addEventListener(PWA_INSTALLED_EVENT, onInstalled);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener(PWA_INSTALL_AVAILABLE_EVENT, onInstallAvailable);
      window.removeEventListener(PWA_INSTALLED_EVENT, onInstalled);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [ready, syncDeferredPrompt]);

  const isStandalone = (ready && isStandaloneDisplay()) || installed;

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

  const closeIosGuide = useCallback(() => {
    setIosGuideOpen(false);
  }, []);

  const runNativeInstall = useCallback(async () => {
    const promptEvent = deferredRef.current ?? readDeferredInstallEvent();
    if (!promptEvent) return null;

    deferredRef.current = promptEvent;
    setInstalling(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        deferredRef.current = null;
        (
          window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent }
        ).__pwaDeferredInstall = undefined;
        setHasNativePrompt(false);
        setInstalled(true);
        return "installed" as const;
      }
      return "cancelled" as const;
    } catch (error) {
      console.warn("[SomEducation] PWA install failed:", error);
      return "cancelled" as const;
    } finally {
      setInstalling(false);
    }
  }, []);

  const install = useCallback(async (): Promise<
    "installed" | "cancelled" | "manual" | "guide"
  > => {
    syncDeferredPrompt();

    if (deferredRef.current || readDeferredInstallEvent()) {
      const result = await runNativeInstall();
      if (result) return result;
    }

    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.ready;
        syncDeferredPrompt();
        if (deferredRef.current || readDeferredInstallEvent()) {
          const result = await runNativeInstall();
          if (result) return result;
        }
      } catch {
        // ignore SW readiness errors
      }
    }

    if (platform === "ios") {
      setIosGuideOpen(true);
      return "guide";
    }

    return "manual";
  }, [platform, runNativeInstall, syncDeferredPrompt]);

  const value = useMemo(
    () => ({
      ready,
      platform,
      canInstall,
      canShowBanner,
      installing,
      iosGuideOpen,
      install,
      dismissBanner,
      closeIosGuide,
      isIosSafari: isIosSafari(),
      isStandalone,
    }),
    [
      ready,
      platform,
      canInstall,
      canShowBanner,
      installing,
      iosGuideOpen,
      install,
      dismissBanner,
      closeIosGuide,
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
