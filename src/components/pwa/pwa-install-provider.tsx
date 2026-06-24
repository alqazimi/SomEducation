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
  isAndroid,
  isIosInstallable,
  isIosSafari,
  isStandaloneDisplay,
  openInstallShareSheet,
  PWA_INSTALLED_EVENT,
  PWA_INSTALL_AVAILABLE_EVENT,
  registerServiceWorker,
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
  installing: boolean;
  /** Call directly from a click handler — prompt() must run in the same user gesture. */
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
  return (
    (window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent })
      .__pwaDeferredInstall ?? null
  );
}

function clearDeferredInstallEvent() {
  (
    window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent }
  ).__pwaDeferredInstall = undefined;
}

function captureDeferredInstallEvent(event: Event): BeforeInstallPromptEvent {
  const promptEvent = event as BeforeInstallPromptEvent;
  (
    window as Window & { __pwaDeferredInstall?: BeforeInstallPromptEvent }
  ).__pwaDeferredInstall = promptEvent;
  return promptEvent;
}

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getClientReadyServerSnapshot
  );
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const syncDeferredPrompt = useCallback(() => {
    const event = readDeferredInstallEvent();
    if (event) {
      deferredRef.current = event;
      setHasNativePrompt(true);
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
      deferredRef.current = captureDeferredInstallEvent(event);
      setHasNativePrompt(true);
    };

    const onInstallAvailable = () => {
      syncDeferredPrompt();
    };

    const onInstalled = () => {
      deferredRef.current = null;
      clearDeferredInstallEvent();
      setHasNativePrompt(false);
      setInstalled(true);
      setInstalling(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener(PWA_INSTALL_AVAILABLE_EVENT, onInstallAvailable);
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
    let promptEvent = readDeferredInstallEvent() ?? deferredRef.current;

    if (!promptEvent) {
      syncDeferredPrompt();
      promptEvent = readDeferredInstallEvent() ?? deferredRef.current;
    }

    if (promptEvent) {
      try {
        void promptEvent
          .prompt()
          .then(() => promptEvent.userChoice)
          .then(({ outcome }) => {
            if (outcome === "accepted") {
              deferredRef.current = null;
              clearDeferredInstallEvent();
              setHasNativePrompt(false);
              setInstalled(true);
            }
          })
          .catch((error) => {
            console.warn("[SomEducation] PWA install failed:", error);
          })
          .finally(() => {
            setInstalling(false);
          });
        setInstalling(true);
      } catch (error) {
        console.warn("[SomEducation] PWA install failed:", error);
        setInstalling(false);
      }
      return;
    }

    if (isIosInstallable()) {
      openInstallShareSheet(PLATFORM_NAME);
    }
  }, [syncDeferredPrompt]);

  const value = useMemo(
    () => ({
      ready,
      platform,
      canInstall,
      installing,
      installFromClick,
      isIosSafari: isIosSafari(),
      isStandalone,
    }),
    [ready, platform, canInstall, installing, installFromClick, isStandalone]
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
