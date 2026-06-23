"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  List,
  Play,
  Star,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  ConvexSectionErrorBoundary,
  useConvexQueryReady,
} from "@/components/convex/convex-query-gate";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingCourseCard } from "@/components/courses/marketing-course-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MARKETING_AVATAR_COLORS,
  MARKETING_HERO,
  MARKETING_STATS,
} from "@/lib/marketing-content";

function MarketingFeaturedCourses() {
  const queryReady = useConvexQueryReady();
  const featuredCourses = useQuery(
    api.courses.listFeatured,
    queryReady ? { limit: 4 } : "skip"
  );

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
              Popular Courses
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Start learning with our most popular courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            View all courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {featuredCourses === undefined ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-36 rounded-2xl bg-white/5 sm:h-40"
              />
            ))
          ) : featuredCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center">
              <p className="text-sm text-slate-400">Courses coming soon.</p>
              <Link href="/courses" className="mt-3 inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white"
                >
                  Browse catalog
                </Button>
              </Link>
            </div>
          ) : (
            featuredCourses.map((course) => (
              <MarketingCourseCard
                key={course._id}
                href={`/courses/${course.slug}`}
                title={course.title}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                difficulty={course.difficulty}
                durationHours={course.durationHours}
                lessonCount={course.lessonCount}
                enrollmentCount={course.enrollmentCount}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedCoursesFallback() {
  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
          Popular Courses
        </p>
        <h2 className="mt-1.5 text-xl font-semibold text-white sm:text-2xl">
          Start learning with our most popular courses
        </h2>
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-36 rounded-2xl bg-white/5 sm:h-40"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

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
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-16 top-8 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
              Online Learning
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              {MARKETING_HERO.headline}{" "}
              <span className="text-brand-400">
                {MARKETING_HERO.headlineAccent}
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              {MARKETING_HERO.subheadline}
            </p>
            <div className="mt-6">
              <Link href="/courses">
                <Button
                  size="default"
                  className="h-11 rounded-lg bg-brand-600 px-6 text-sm shadow-md hover:bg-brand-500"
                >
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {MARKETING_AVATAR_COLORS.map((color, index) => (
                  <div
                    key={color}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#080c16] text-[10px] font-semibold text-white ${color}`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 sm:text-sm">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
                  ))}
                </div>
                <span className="font-medium text-white">
                  {MARKETING_HERO.rating}
                </span>
                <span>from {MARKETING_HERO.studentsLabel}</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1324] shadow-xl">
              <Image
                src="/images/hero-student.png"
                alt="Student learning online with a laptop"
                width={640}
                height={480}
                className="h-auto w-full object-cover"
                priority
              />
              <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="absolute right-5 top-10 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
                <Play className="h-4 w-4 fill-current" />
              </div>
              <div className="absolute bottom-6 left-6 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
                <List className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingStatsBar />

      <ConvexSectionErrorBoundary fallback={<FeaturedCoursesFallback />}>
        <MarketingFeaturedCourses />
      </ConvexSectionErrorBoundary>

      <section className="pb-10 pt-2 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-brand-600 px-5 py-8 sm:flex-row sm:justify-between sm:px-8">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  Ready to start your learning journey?
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  Join thousands of students learning new skills today.
                </p>
              </div>
            </div>
            <Link href="/courses" className="shrink-0">
              <Button
                size="default"
                className="h-11 rounded-lg bg-[#080c16] px-6 text-sm text-white hover:bg-[#121a2e]"
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
