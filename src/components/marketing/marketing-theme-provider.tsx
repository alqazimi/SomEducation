"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type MarketingThemeMode = "day" | "night";

export const MARKETING_THEME_STORAGE_KEY = "someducation-marketing-theme";

type MarketingThemeContextValue = {
  mode: MarketingThemeMode;
  setMode: (mode: MarketingThemeMode) => void;
  toggleMode: () => void;
  isDay: boolean;
  isNight: boolean;
};

const MarketingThemeContext =
  createContext<MarketingThemeContextValue | null>(null);

const DEFAULT_MODE: MarketingThemeMode = "night";

type ThemeListener = () => void;
const themeListeners = new Set<ThemeListener>();

function emitThemeChange() {
  for (const listener of themeListeners) {
    listener();
  }
}

function readMarketingThemeMode(): MarketingThemeMode {
  if (typeof window === "undefined") return DEFAULT_MODE;

  try {
    const attr = document.documentElement.getAttribute("data-marketing-theme");
    if (attr === "day" || attr === "night") return attr;

    const stored = localStorage.getItem(MARKETING_THEME_STORAGE_KEY);
    if (stored === "day" || stored === "night") return stored;
  } catch {
    // ignore storage errors
  }

  return DEFAULT_MODE;
}

function subscribeToMarketingTheme(listener: ThemeListener) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function getMarketingThemeSnapshot(): MarketingThemeMode {
  return readMarketingThemeMode();
}

function getMarketingThemeServerSnapshot(): MarketingThemeMode {
  return DEFAULT_MODE;
}

function applyMarketingThemeMode(next: MarketingThemeMode) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-marketing-theme", next);
  }

  try {
    localStorage.setItem(MARKETING_THEME_STORAGE_KEY, next);
  } catch {
    // ignore storage errors
  }

  emitThemeChange();
}

export function MarketingThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = useSyncExternalStore(
    subscribeToMarketingTheme,
    getMarketingThemeSnapshot,
    getMarketingThemeServerSnapshot
  );

  const setMode = useCallback((next: MarketingThemeMode) => {
    applyMarketingThemeMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    const current = getMarketingThemeSnapshot();
    applyMarketingThemeMode(current === "day" ? "night" : "day");
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isDay: mode === "day",
      isNight: mode === "night",
    }),
    [mode, setMode, toggleMode]
  );

  return (
    <MarketingThemeContext.Provider value={value}>
      {children}
    </MarketingThemeContext.Provider>
  );
}

const FALLBACK_THEME: MarketingThemeContextValue = {
  mode: DEFAULT_MODE,
  setMode: () => undefined,
  toggleMode: () => undefined,
  isDay: false,
  isNight: true,
};

export function useMarketingTheme() {
  const context = useContext(MarketingThemeContext);
  return context ?? FALLBACK_THEME;
}

export function useMarketingThemeOptional() {
  return useContext(MarketingThemeContext);
}
