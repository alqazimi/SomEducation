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

export type PwaInstallPlatform =
  | "native"
  | "android-manual"
  | "ios"
  | "none";

type PwaInstallContextValue = {
  ready: boolean;
  platform: PwaInstallPlatform;
  canInstall: boolean;
  canShowBanner: boolean;
  installing: boolean;
  iosGuideOpen: boolean;
  manualGuideOpen: boolean;
  /** Call directly from a click handler — keeps the browser install prompt in the user gesture. */
  installFromClick: () => void;
  dismissBanner: () => void;
  closeIosGuide: () => void;
  closeManualGuide: () => void;
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
  const [manualGuideOpen, setManualGuideOpen] = useState(false);
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
      clearDeferredInstallEvent();
      setHasNativePrompt(false);
      setInstalled(true);
      setIosGuideOpen(false);
      setManualGuideOpen(false);
      setBannerDismissed(true);
      setInstalling(false);
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
    if (hasNativePrompt) return "native";
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

  const closeManualGuide = useCallback(() => {
    setManualGuideOpen(false);
  }, []);

  const installFromClick = useCallback(() => {
    const promptEvent = syncDeferredPrompt();

    if (promptEvent) {
      setInstalling(true);
      setIosGuideOpen(false);
      setManualGuideOpen(false);

      try {
        const promptPromise = promptEvent.prompt();
        void promptPromise
          .then(() => promptEvent.userChoice)
          .then(({ outcome }) => {
            if (outcome === "accepted") {
              deferredRef.current = null;
              clearDeferredInstallEvent();
              setHasNativePrompt(false);
              setInstalled(true);
              setBannerDismissed(true);
            }
          })
          .catch((error) => {
            console.warn("[SomEducation] PWA install failed:", error);
            if (isIosInstallable()) {
              setIosGuideOpen(true);
            } else {
              setManualGuideOpen(true);
            }
          })
          .finally(() => {
            setInstalling(false);
          });
      } catch (error) {
        console.warn("[SomEducation] PWA install failed:", error);
        setInstalling(false);
        if (isIosInstallable()) {
          setIosGuideOpen(true);
        } else {
          setManualGuideOpen(true);
        }
      }
      return;
    }

    if (isIosInstallable()) {
      setIosGuideOpen(true);
      return;
    }

    if (isAndroid()) {
      setManualGuideOpen(true);
    }
  }, [syncDeferredPrompt]);

  const value = useMemo(
    () => ({
      ready,
      platform,
      canInstall,
      canShowBanner,
      installing,
      iosGuideOpen,
      manualGuideOpen,
      installFromClick,
      dismissBanner,
      closeIosGuide,
      closeManualGuide,
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
      manualGuideOpen,
      installFromClick,
      dismissBanner,
      closeIosGuide,
      closeManualGuide,
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
