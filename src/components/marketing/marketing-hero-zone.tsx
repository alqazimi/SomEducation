"use client";

import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { cn } from "@/lib/utils";

/** Dark hero block above the courses band. */
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
        "relative overflow-x-clip",
        isDay ? "bg-marketing-hero pb-8 sm:pb-10" : "bg-marketing-bg pb-8 sm:pb-10",
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
