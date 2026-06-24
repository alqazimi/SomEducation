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
  const { isNight } = useMarketingTheme();

  return (
    <div
      className={cn(
        "relative overflow-x-clip",
        isNight ? "marketing-hero-night pb-6 sm:pb-8" : "bg-marketing-hero pb-8 sm:pb-10",
        className
      )}
    >
      {isNight && (
        <>
          <div
            className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#0052ff]/25 blur-[80px] sm:-right-24 sm:h-72 sm:w-72 sm:blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[#0033ff]/10 blur-[70px] sm:h-64 sm:w-64 sm:blur-[90px]"
            aria-hidden
          />
        </>
      )}
      {children}
    </div>
  );
}
