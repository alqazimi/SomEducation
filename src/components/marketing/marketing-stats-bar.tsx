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
  const { isNight } = useMarketingTheme();

  return (
    <section
      className={cn(
        "relative z-10 px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-2xl border border-marketing-border bg-marketing-card px-4 py-6 sm:px-6 sm:py-7 lg:px-8",
          isNight && "shadow-[0_8px_32px_rgba(0,82,255,0.12)]",
          "-mt-4 sm:-mt-6 lg:-mt-8"
        )}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6">
          {MARKETING_STATS.map((stat) => {
            const Icon = ICONS[stat.icon];
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:gap-3 sm:text-left"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11",
                    isNight
                      ? "bg-brand-600/15 text-brand-400"
                      : "bg-brand-50 text-brand-600"
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-marketing-fg sm:text-xl lg:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-[11px] leading-tight text-marketing-muted sm:text-sm">
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
