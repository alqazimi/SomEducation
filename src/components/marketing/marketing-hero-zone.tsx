"use client";

import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { cn } from "@/lib/utils";

/** Dark hero + stats block (mockup: one navy zone, stats anchors the bottom). */
export function MarketingHeroZone({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isDay, isNight } = useMarketingTheme();

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isDay ? "bg-marketing-hero" : "bg-marketing-bg pb-4 sm:pb-5",
        className
      )}
    >
      {isNight && (
        <div
          className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#0052ff]/18 blur-[90px] sm:-right-24 sm:top-4 sm:h-72 sm:w-72"
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
