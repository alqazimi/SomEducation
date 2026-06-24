export const PWA_BANNER_DISMISS_KEY = "someducation-pwa-banner-dismissed";
export const PWA_INSTALL_AVAILABLE_EVENT = "pwa-install-available";
export const PWA_INSTALLED_EVENT = "pwa-installed";

/** Capture install prompt before React hydrates (Android one-tap install). */
export const PWA_EARLY_INSTALL_CAPTURE = `
(function(){
  if(typeof window==="undefined")return;
  window.__pwaDeferredInstall=null;
  window.addEventListener("beforeinstallprompt",function(e){
    e.preventDefault();
    window.__pwaDeferredInstall=e;
    window.dispatchEvent(new Event("${PWA_INSTALL_AVAILABLE_EVENT}"));
  });
  window.addEventListener("appinstalled",function(){
    window.__pwaDeferredInstall=null;
    window.dispatchEvent(new Event("${PWA_INSTALLED_EVENT}"));
  });
})();
`;

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function isIosInstallable(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document)
  );
}

export function isIosSafari(): boolean {
  if (typeof window === "undefined" || !isIosInstallable()) return false;
  const ua = window.navigator.userAgent;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(window.navigator.userAgent);
}

export function canUseWebShare(): boolean {
  if (typeof window === "undefined") return false;
  return typeof navigator.share === "function";
}

export function getPwaShareUrl(): string {
  if (typeof window === "undefined") return "/";
  return window.location.origin + "/";
}

export async function openInstallShareSheet(
  title: string
): Promise<"shared" | "cancelled" | "unavailable"> {
  if (!canUseWebShare()) return "unavailable";

  try {
    await navigator.share({
      title,
      text: `Install ${title} on your home screen.`,
      url: getPwaShareUrl(),
    });
    return "shared";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return "cancelled";
    }
    console.warn("[SomEducation] Web Share failed:", error);
    return "unavailable";
  }
}

/** Banner hidden for current browser tab/session only — resets on next visit. */
export function isInstallBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PWA_BANNER_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallBanner(): void {
  try {
    sessionStorage.setItem(PWA_BANNER_DISMISS_KEY, "1");
  } catch {
    // ignore storage errors
  }
}

function shouldRegisterServiceWorker(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return window.location.protocol === "https:";
  }
  return window.location.protocol === "https:" || host.endsWith(".vercel.app");
}

export function registerServiceWorker(): void {
  if (!shouldRegisterServiceWorker()) return;

  const register = () => {
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.warn("[SomEducation] Service worker registration failed:", error);
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
}
