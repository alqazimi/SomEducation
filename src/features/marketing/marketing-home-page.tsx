"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { HomepageCourseSections } from "@/components/courses/homepage-course-sections";
import { Button } from "@/components/ui/button";
import {
  MARKETING_AVATAR_COLORS,
  MARKETING_HERO,
  MARKETING_STATS,
} from "@/lib/marketing-content";

function MarketingStatsBar() {
  return (
    <section className="border-y border-white/10 bg-[#0d1324]/80 py-7 sm:py-8">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {MARKETING_STATS.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketingHomePage() {
  return (
    <MarketingShell className="pb-[max(1rem,env(safe-area-inset-bottom))]">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-14 sm:pt-28 md:pt-32 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center md:gap-6 lg:gap-10">
            <div className="relative w-full md:max-w-[480px]">
              <div
                className="pointer-events-none absolute -right-20 top-0 h-[240px] w-[240px] rounded-full bg-brand-600/35 blur-[120px]"
                aria-hidden
              />

              <div className="relative z-10 mb-6">
                <p className="mb-2 text-base font-medium text-slate-300 sm:text-lg">
                  {MARKETING_HERO.eyebrow}
                </p>
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[42px] lg:leading-[3.25rem]">
                  {MARKETING_HERO.headline}
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
                  {MARKETING_HERO.subheadline}
                </p>
              </div>

              <div className="relative z-10 mb-10 md:mb-14">
                <Link href="/courses">
                  <Button
                    size="default"
                    className="h-10 rounded-lg bg-brand-600 px-5 text-sm font-medium shadow-none transition-colors hover:bg-brand-500"
                  >
                    Browse Courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {MARKETING_AVATAR_COLORS.map((color, index) => (
                    <div
                      key={color}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#080c16] text-[10px] font-semibold text-white ring-2 ring-[#080c16] sm:h-10 sm:w-10 sm:text-xs ${color}`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-white">
                      {MARKETING_HERO.rating}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 sm:text-sm">
                    {MARKETING_HERO.studentsLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full max-w-[640px]">
              <div
                className="pointer-events-none absolute bottom-20 right-0 h-[240px] w-[240px] rounded-full bg-emerald-500/25 blur-[120px]"
                aria-hidden
              />
              <Image
                src="/images/hero-student.png"
                alt="Student learning with a laptop"
                width={640}
                height={520}
                className="relative z-10 h-auto w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <MarketingStatsBar />

      <HomepageCourseSections />

      <section className="pb-10 pt-2 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-600 px-5 py-6 sm:flex-row sm:justify-between sm:px-8 sm:py-7">
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
                className="h-10 rounded-lg bg-[#080c16] px-5 text-sm text-white hover:bg-[#121a2e]"
              >
                Browse Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
