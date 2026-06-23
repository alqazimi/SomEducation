export const PWA_DISMISS_KEY = "someducation-pwa-install-dismissed";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

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

/** True when iOS Safari can add to home screen (not Chrome/Firefox on iOS). */
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
      text: `Add ${title} to your home screen for quick access.`,
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

export function isInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(PWA_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_MS;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  try {
    window.localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV === "development") return;

  const register = () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.warn("[SomEducation] Service worker registration failed:", error);
    });
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
