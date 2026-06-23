"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { HomepageCourseSections } from "@/components/courses/homepage-course-sections";
import { MarketingHeroImage } from "@/components/marketing/marketing-hero-image";
import { MarketingStatsBar } from "@/components/marketing/marketing-stats-bar";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import {
  MARKETING_HERO,
  MARKETING_HERO_DAY,
} from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

function MarketingHero() {
  const { isDay } = useMarketingTheme();
  const hero = isDay ? MARKETING_HERO_DAY : MARKETING_HERO;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-marketing-border",
        isDay ? "bg-marketing-hero" : "bg-marketing-bg"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16">
          <div className="relative w-full text-center md:max-w-xl md:text-left">
            <div className="relative z-10 mb-6 md:mb-8">
              <p
                className={cn(
                  "mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]",
                  isDay ? "text-brand-600" : "text-brand-400"
                )}
              >
                {hero.eyebrow}
              </p>
              <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-marketing-fg sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                {hero.headlineBefore}
                <span className={isDay ? "text-brand-600" : "text-brand-500"}>
                  {hero.headlineHighlight}
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-marketing-muted md:text-lg">
                {hero.subheadline}
              </p>
            </div>

            <div className="relative z-10 flex justify-center md:justify-start">
              <Link href="/courses">
                <Button
                  size="default"
                  className="h-11 rounded-lg bg-brand-600 px-6 text-sm font-semibold shadow-sm transition-colors hover:bg-brand-500"
                >
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <MarketingHeroImage />
        </div>
      </div>
    </section>
  );
}

function MarketingCtaBanner() {
  const { isDay } = useMarketingTheme();

  if (isDay) {
    return (
      <section className="pb-10 pt-2 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-100 bg-marketing-cta px-5 py-6 sm:flex-row sm:justify-between sm:px-8 sm:py-7">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 sm:flex">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-marketing-fg sm:text-lg">
                  Ready to start your learning journey?
                </h2>
                <p className="mt-1 text-xs text-marketing-muted sm:text-sm">
                  Join thousands of students learning new skills today.
                </p>
              </div>
            </div>
            <Link href="/courses" className="shrink-0">
              <Button
                size="default"
                className="h-10 rounded-lg bg-brand-600 px-5 text-sm text-white hover:bg-brand-500"
              >
                Browse All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-10 pt-2 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-600 px-5 py-6 shadow-lg shadow-brand-600/25 sm:flex-row sm:justify-between sm:px-8 sm:py-7">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Ready to start your learning journey?
              </h2>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Join thousands of students learning new skills today.
              </p>
            </div>
          </div>
          <Link href="/courses" className="shrink-0">
            <Button
              size="default"
              className={cn(
                "h-10 rounded-lg bg-white px-5 text-sm text-brand-600 hover:bg-blue-50"
              )}
            >
              Browse Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketingHomePage() {
  return (
    <MarketingShell className="pb-[max(1rem,env(safe-area-inset-bottom))]">
      <MarketingHero />
      <MarketingStatsBar />
      <MarketingCoursesSurface>
        <HomepageCourseSections />
      </MarketingCoursesSurface>
      <MarketingCtaBanner />
    </MarketingShell>
  );
}
