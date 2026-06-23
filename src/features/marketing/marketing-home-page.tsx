"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { HomepageCourseSections } from "@/components/courses/homepage-course-sections";
import { MarketingStatsBar } from "@/components/marketing/marketing-stats-bar";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import {
  MARKETING_HERO,
  MARKETING_HERO_DAY,
} from "@/lib/marketing-content";
import { marketingCtaDarkButtonClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

function MarketingHero() {
  const { isDay } = useMarketingTheme();

  if (isDay) {
    return (
      <section className="relative overflow-hidden bg-marketing-hero">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16">
            <div className="relative w-full text-center md:max-w-xl md:text-left">
              <div className="relative z-10 mb-6 md:mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-600">
                  {MARKETING_HERO_DAY.eyebrow}
                </p>
                <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-marketing-fg sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                  {MARKETING_HERO_DAY.headlineBefore}
                  <span className="text-brand-600">
                    {MARKETING_HERO_DAY.headlineHighlight}
                  </span>
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-marketing-muted md:text-lg">
                  {MARKETING_HERO_DAY.subheadline}
                </p>
              </div>

              <div className="relative z-10 mb-8 flex justify-center md:mb-10 md:justify-start">
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

              <div className="relative z-10 flex flex-col items-center gap-1 md:items-start">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="font-medium text-marketing-fg">
                    {MARKETING_HERO_DAY.rating}
                  </p>
                </div>
                <p className="text-sm text-marketing-muted">
                  {MARKETING_HERO_DAY.studentsLabel}
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:mx-0 md:max-w-[420px] lg:max-w-[460px]">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/images/hero-student.png"
                  alt="Smiling student with backpack ready to learn"
                  fill
                  sizes="(max-width: 768px) 85vw, (max-width: 1200px) 42vw, 460px"
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16">
          <div className="relative w-full text-center md:max-w-xl md:text-left">
            <div className="relative z-10 mb-6 md:mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-400">
                {MARKETING_HERO.eyebrow}
              </p>
              <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-marketing-fg sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                {MARKETING_HERO.headline}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-marketing-muted md:text-lg">
                {MARKETING_HERO.subheadline}
              </p>
            </div>

            <div className="relative z-10 mb-8 flex justify-center md:mb-10 md:justify-start">
              <Link href="/courses">
                <Button
                  size="default"
                  className="h-11 rounded-lg bg-brand-600 px-6 text-sm font-semibold shadow-none transition-colors hover:bg-brand-500"
                >
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1 md:items-start">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="font-medium text-marketing-fg">
                  {MARKETING_HERO.rating}
                </p>
              </div>
              <p className="text-sm text-marketing-muted">
                {MARKETING_HERO.studentsLabel}
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:mx-0 md:max-w-[420px] lg:max-w-[460px]">
            <div
              className="pointer-events-none absolute inset-x-0 bottom-8 top-12 -z-10 rounded-full bg-[#0052ff]/30 blur-[72px]"
              aria-hidden
            />
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/hero-student.png"
                alt="Smiling student with backpack ready to learn"
                fill
                sizes="(max-width: 768px) 85vw, (max-width: 1200px) 42vw, 460px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
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
                <ArrowRight className="h-5 w-5 text-white" />
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
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
              <ArrowRight className="h-5 w-5 text-white" />
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
                "h-10 rounded-lg px-5 text-sm text-white",
                marketingCtaDarkButtonClass
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
  const { isDay } = useMarketingTheme();

  return (
    <MarketingShell className="pb-[max(1rem,env(safe-area-inset-bottom))]">
      <MarketingHero />
      {isDay && <MarketingStatsBar />}
      <HomepageCourseSections />
      <MarketingCtaBanner />
    </MarketingShell>
  );
}
