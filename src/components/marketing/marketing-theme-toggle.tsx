"use client";

import { Moon, Sun } from "lucide-react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { cn } from "@/lib/utils";

export function MarketingThemeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = useMarketingTheme();

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        mode === "night"
          ? "text-slate-300 hover:bg-white/10 hover:text-white"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
        className
      )}
      aria-label={mode === "night" ? "Switch to day mode" : "Switch to night mode"}
      title={mode === "night" ? "Day mode" : "Night mode"}
    >
      {mode === "night" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
