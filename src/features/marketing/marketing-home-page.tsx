"use client";

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
import { FunctionReturnType } from "convex/server";
import {
  ConvexSectionErrorBoundary,
  useConvexQueryReady,
} from "@/components/convex/convex-query-gate";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MarketingCourseCard } from "@/components/courses/marketing-course-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MARKETING_AVATAR_COLORS,
  MARKETING_HERO,
  MARKETING_STATS,
} from "@/lib/marketing-content";

type FeaturedCourse = FunctionReturnType<typeof api.courses.listFeatured>[number];

function MarketingFeaturedCourses() {
  const queryReady = useConvexQueryReady();
  const featuredCourses = useQuery(
    api.courses.listFeatured,
    queryReady ? { limit: 4 } : "skip"
  );

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
              Popular Courses
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Start learning with our most popular courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
          >
            View all courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {featuredCourses === undefined ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-44 rounded-2xl bg-white/5 sm:h-48"
              />
            ))
          ) : featuredCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
              <p className="text-slate-400">Courses coming soon.</p>
              <Link href="/courses" className="mt-4 inline-block">
                <Button variant="outline" className="border-white/20 text-white">
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
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
              Popular Courses
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Start learning with our most popular courses
            </h2>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-44 rounded-2xl bg-white/5 sm:h-48"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketingStatsBar() {
  return (
    <section className="border-y border-white/10 bg-[#0d1324]/80 py-10 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {MARKETING_STATS.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">
                {item.value}
              </p>
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-[#080c16] text-white">
      <Header variant="marketing" />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
          >
            <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
                Online Learning
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                {MARKETING_HERO.headline}{" "}
                <span className="text-brand-400">{MARKETING_HERO.headlineAccent}</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                {MARKETING_HERO.subheadline}
              </p>
              <div className="mt-8">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="h-12 rounded-xl bg-brand-600 px-8 text-base shadow-lg shadow-brand-600/25 hover:bg-brand-500"
                  >
                    Browse Courses
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                  {MARKETING_AVATAR_COLORS.map((color, index) => (
                    <div
                      key={color}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#080c16] text-xs font-semibold text-white ${color}`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-medium text-white">
                    {MARKETING_HERO.rating}
                  </span>
                  <span>from {MARKETING_HERO.studentsLabel}</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141c30] to-[#0d1324] p-8 shadow-2xl shadow-black/40">
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600/30 to-brand-800/20">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-600/40 ring-4 ring-brand-500/30">
                    <GraduationCap className="h-14 w-14 text-white" />
                  </div>
                </div>
                <div className="absolute left-6 top-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="absolute right-8 top-16 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div className="absolute bottom-10 left-10 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg">
                  <List className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarketingStatsBar />

        <ConvexSectionErrorBoundary fallback={<FeaturedCoursesFallback />}>
          <MarketingFeaturedCourses />
        </ConvexSectionErrorBoundary>

        {/* CTA */}
        <section className="pb-16 pt-4 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand-600 px-6 py-10 sm:flex-row sm:justify-between sm:px-10 lg:py-12">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    Ready to start your learning journey?
                  </h2>
                  <p className="mt-1 text-sm text-blue-100 sm:text-base">
                    Join thousands of students learning new skills today.
                  </p>
                </div>
              </div>
              <Link href="/courses" className="shrink-0">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-[#080c16] px-8 text-base text-white hover:bg-[#121a2e]"
                >
                  Browse Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer variant="marketing" />
    </div>
  );
}
