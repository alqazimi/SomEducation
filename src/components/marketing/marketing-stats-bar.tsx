"use client";

import { BookOpen, GraduationCap, Shield, Users } from "lucide-react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { MARKETING_STATS } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

const ICONS = {
  users: Users,
  courses: BookOpen,
  teachers: GraduationCap,
  satisfaction: Shield,
} as const;

export function MarketingStatsBar({ className }: { className?: string }) {
  const { isDay, isNight } = useMarketingTheme();

  return (
    <section
      className={cn(
        "relative z-10 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-2xl border bg-marketing-card px-3 py-5 sm:px-0 sm:py-6 lg:py-7",
          isDay &&
            "border-marketing-border shadow-[0_8px_30px_rgba(15,23,42,0.08)] -mb-5 sm:-mb-7",
          isNight &&
            "border-marketing-border shadow-[0_12px_40px_rgba(0,82,255,0.14)] -mb-8 sm:-mb-10 lg:-mb-12"
        )}
      >
        <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-marketing-border/50">
          {MARKETING_STATS.map((stat, index) => {
            const Icon = ICONS[stat.icon];
            return (
              <div
                key={stat.label}
                className={cn(
                  "flex items-center gap-2.5 px-1 sm:gap-3 sm:px-5 lg:px-6",
                  index % 2 === 0 &&
                    "max-sm:border-r max-sm:border-marketing-border/40 max-sm:pr-3",
                  index < 2 &&
                    "max-sm:border-b max-sm:border-marketing-border/40 max-sm:pb-5"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 lg:h-12 lg:w-12",
                    isNight
                      ? "bg-brand-600/15 text-brand-400"
                      : "bg-brand-50 text-brand-600"
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-[1.35rem] lg:w-[1.35rem]" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none text-marketing-fg sm:text-xl lg:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] leading-snug text-marketing-muted sm:text-xs lg:text-sm">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
