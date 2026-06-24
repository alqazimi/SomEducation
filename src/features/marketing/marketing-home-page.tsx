"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { MarketingHeroZone } from "@/components/marketing/marketing-hero-zone";
import { MarketingStatsBar } from "@/components/marketing/marketing-stats-bar";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { HomepageCourseSectionsFallback } from "@/components/courses/homepage-course-sections";
import { MarketingHeroImage } from "@/components/marketing/marketing-hero-image";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import {
  MARKETING_HERO,
  MARKETING_HERO_DAY,
} from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

const HomepageCourseSections = dynamic(
  () =>
    import("@/components/courses/homepage-course-sections").then((mod) => ({
      default: mod.HomepageCourseSections,
    })),
  { loading: () => <HomepageCourseSectionsFallback /> }
);

function MarketingHero() {
  const { isDay } = useMarketingTheme();
  const hero = isDay ? MARKETING_HERO_DAY : MARKETING_HERO;

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10 lg:px-8">
        <div className="flex flex-col items-stretch justify-between gap-8 lg:flex-row lg:items-center lg:gap-10">
          <div className="relative min-w-0 w-full lg:max-w-[480px] lg:flex-1">
            <div className="relative z-10 mb-6">
              <p
                className={cn(
                  "mb-2 text-lg font-medium",
                  isDay ? "text-brand-600" : "text-brand-400"
                )}
              >
                {hero.eyebrow}
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-marketing-fg sm:text-4xl lg:text-[42px] lg:leading-[3.5rem]">
                {hero.headlineBefore}
                <span className={isDay ? "text-brand-600" : "text-brand-500"}>
                  {hero.headlineHighlight}
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-marketing-muted">
                {hero.subheadline}
              </p>
            </div>

            <div className="relative z-10">
              <Link href="/courses" className="inline-block">
                <Button
                  size="lg"
                  className="h-auto rounded-lg bg-brand-600 px-5 py-2.5 text-lg font-medium shadow-sm transition-colors hover:bg-brand-500"
                >
                  Browse Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <MarketingHeroImage className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-[min(100%,520px)] lg:shrink-0" />
        </div>
      </div>
    </section>
  );
}

function MarketingCtaBanner() {
  const { isDay } = useMarketingTheme();

  if (isDay) {
    return (
      <section className="bg-marketing-bg pb-10 pt-2 sm:pb-12">
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
    <section className="bg-marketing-bg pb-8 pt-2 sm:pb-10 sm:pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-600 px-5 py-6 shadow-lg shadow-brand-600/25 sm:flex-row sm:justify-between sm:px-8 sm:py-7">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 sm:h-12 sm:w-12">
              <GraduationCap className="h-5 w-5 text-white sm:h-6 sm:w-6" />
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
      <MarketingHeroZone>
        <MarketingHero />
        <MarketingStatsBar className="relative z-10 -mb-4 sm:-mb-6 lg:-mb-8" />
      </MarketingHeroZone>
      <MarketingCoursesSurface>
        <HomepageCourseSections />
      </MarketingCoursesSurface>
      <MarketingCtaBanner />
    </MarketingShell>
  );
}
