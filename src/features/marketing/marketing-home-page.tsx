"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { MarketingHeroZone } from "@/components/marketing/marketing-hero-zone";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { HomepageCourseSectionsFallback } from "@/components/courses/homepage-course-sections";
import { MarketingHeroImage } from "@/components/marketing/marketing-hero-image";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import {
  MARKETING_HERO,
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

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-8">
          <div className="relative min-w-0 w-full sm:max-w-md sm:flex-1 lg:max-w-lg">
            <div className="relative z-10">
              <p
                className={cn(
                  "mb-1.5 text-xs font-semibold uppercase tracking-[0.12em]",
                  isDay ? "text-brand-600" : "text-brand-400"
                )}
              >
                {MARKETING_HERO.eyebrow}
              </p>
              <h1 className="text-2xl font-semibold leading-snug tracking-tight text-marketing-fg sm:text-3xl">
                {MARKETING_HERO.headlineBefore}
                <span className={isDay ? "text-brand-600" : "text-brand-500"}>
                  {MARKETING_HERO.headlineHighlight}
                </span>
              </h1>
              <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-marketing-muted sm:text-[15px]">
                {MARKETING_HERO.subheadline}
              </p>
            </div>

            <div className="relative z-10 mt-4">
              <Link href="/courses" className="inline-block">
                <Button
                  size="default"
                  className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-medium shadow-sm transition-colors hover:bg-brand-500"
                >
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <MarketingHeroImage className="shrink-0" />
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
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 sm:h-10 sm:w-10">
                <GraduationCap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
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
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 sm:h-10 sm:w-10">
              <GraduationCap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
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
      </MarketingHeroZone>
      <MarketingCoursesSurface>
        <HomepageCourseSections />
      </MarketingCoursesSurface>
      <MarketingCtaBanner />
    </MarketingShell>
  );
}
