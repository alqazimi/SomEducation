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
        "border-y border-marketing-border bg-marketing-card py-8",
        isNight && "shadow-[0_4px_24px_rgba(0,82,255,0.06)]",
        className
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {MARKETING_STATS.map((stat) => {
          const Icon = ICONS[stat.icon];
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  isNight
                    ? "bg-brand-600/15 text-brand-400"
                    : "bg-brand-50 text-brand-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-marketing-fg sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-sm text-marketing-muted">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
