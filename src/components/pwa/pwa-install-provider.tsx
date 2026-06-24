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
  isIosInstallable,
  isIosSafari,
  isStandaloneDisplay,
  PWA_INSTALLED_EVENT,
  PWA_INSTALL_AVAILABLE_EVENT,
  PWA_INSTALL_NEEDS_RETRY_EVENT,
  registerServiceWorker,
  triggerPwaInstallFromClick,
} from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaInstallPlatform = "native" | "ios" | "android" | "none";

type PwaInstallContextValue = {
  ready: boolean;
  platform: PwaInstallPlatform;
  canInstall: boolean;
  needsRetry: boolean;
  installFromClick: () => void;
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
  return window.__pwaDeferredInstall ?? null;
}

function clearDeferredInstallEvent() {
  window.__pwaDeferredInstall = undefined;
}

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getClientReadyServerSnapshot
  );
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [needsRetry, setNeedsRetry] = useState(false);
  const [installed, setInstalled] = useState(false);

  const syncDeferredPrompt = useCallback(() => {
    const event = readDeferredInstallEvent();
    if (event) {
      deferredRef.current = event;
      setHasNativePrompt(true);
      setNeedsRetry(false);
      return event;
    }
    return deferredRef.current;
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
      window.__pwaDeferredInstall = event as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
      setNeedsRetry(false);
    };

    const onInstallAvailable = () => {
      syncDeferredPrompt();
    };

    const onNeedsRetry = () => {
      if (!readDeferredInstallEvent()) {
        setNeedsRetry(true);
      }
    };

    const onInstalled = () => {
      deferredRef.current = null;
      clearDeferredInstallEvent();
      setHasNativePrompt(false);
      setNeedsRetry(false);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener(PWA_INSTALL_AVAILABLE_EVENT, onInstallAvailable);
    window.addEventListener(PWA_INSTALL_NEEDS_RETRY_EVENT, onNeedsRetry);
    window.addEventListener(PWA_INSTALLED_EVENT, onInstalled);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onInstallAvailable
      );
    }

    syncDeferredPrompt();

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener(PWA_INSTALL_AVAILABLE_EVENT, onInstallAvailable);
      window.removeEventListener(PWA_INSTALL_NEEDS_RETRY_EVENT, onNeedsRetry);
      window.removeEventListener(PWA_INSTALLED_EVENT, onInstalled);
      window.removeEventListener("appinstalled", onInstalled);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          onInstallAvailable
        );
      }
    };
  }, [ready, syncDeferredPrompt]);

  const isStandalone = (ready && isStandaloneDisplay()) || installed;

  const platform: PwaInstallPlatform = useMemo(() => {
    if (!ready || isStandalone) return "none";
    if (hasNativePrompt) return "native";
    if (isIosInstallable()) return "ios";
    if (isAndroid()) return "android";
    return "none";
  }, [ready, isStandalone, hasNativePrompt]);

  const canInstall =
    !isStandalone &&
    ready &&
    (hasNativePrompt || isIosInstallable() || isAndroid());

  const installFromClick = useCallback(() => {
    triggerPwaInstallFromClick();
  }, []);

  const value = useMemo(
    () => ({
      ready,
      platform,
      canInstall,
      needsRetry,
      installFromClick,
      isIosSafari: isIosSafari(),
      isStandalone,
    }),
    [ready, platform, canInstall, needsRetry, installFromClick, isStandalone]
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
