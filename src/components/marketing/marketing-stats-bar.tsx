"use client";

import { BookOpen, GraduationCap, Shield, Users } from "lucide-react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { cn } from "@/lib/utils";

const STATS = [
  { icon: Users, value: "500+", label: "Happy Students" },
  { icon: BookOpen, value: "20+", label: "Courses" },
  { icon: GraduationCap, value: "10+", label: "Expert Instructors" },
  { icon: Shield, value: "100%", label: "Trusted Platform" },
] as const;

export function MarketingStatsBar({ className }: { className?: string }) {
  const { isNight } = useMarketingTheme();

  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      <div
        className={cn(
          "grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl px-4 py-5 sm:grid-cols-4 sm:gap-6 sm:px-8 sm:py-6",
          isNight
            ? "border border-white/10 bg-[#111827] shadow-lg shadow-black/20"
            : "border border-marketing-border bg-marketing-card shadow-sm"
        )}
      >
        {STATS.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center sm:items-start sm:text-left"
          >
            <Icon className="h-5 w-5 text-brand-600" aria-hidden />
            <p className="mt-2 text-lg font-bold text-marketing-fg sm:text-xl">
              {value}
            </p>
            <p className="mt-0.5 text-xs text-marketing-muted sm:text-sm">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
