"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  ConvexSectionErrorBoundary,
} from "@/components/convex/convex-query-gate";
import { HomepageCourseCard } from "@/components/courses/homepage-course-card";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { isConvexConfigured } from "@/lib/convex-url";
import { cn } from "@/lib/utils";

type HomepageCourse = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  enrollmentCount: number;
  durationHours: number;
  lessonCount: number;
  price: number;
  currency: string;
  compareAtPrice?: number;
  difficulty: string;
};

const SECTIONS = [
  {
    key: "discounted" as const,
    eyebrow: "Special Offers",
    title: "Discounted Courses",
    description: "Great courses at special prices",
    href: "/courses",
  },
  {
    key: "recent" as const,
    eyebrow: "New Arrivals",
    title: "Recently Added Courses",
    description: "Explore our latest courses",
    href: "/courses",
  },
  {
    key: "popular" as const,
    eyebrow: "Popular Courses",
    title: "Start with our most popular courses",
    description: "Most loved by students on SomEducation",
    href: "/courses",
  },
  {
    key: "free" as const,
    eyebrow: "Free Learning",
    title: "Free Courses",
    description: "Start learning for free",
    href: "/courses",
  },
];

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[280px] rounded-2xl bg-marketing-border/40 sm:h-[320px]" />
      ))}
    </div>
  );
}

function HomepageCourseSection({
  sectionKey,
  eyebrow,
  title,
  description,
  href,
  courses,
}: {
  sectionKey: (typeof SECTIONS)[number]["key"];
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  courses: HomepageCourse[];
}) {
  const { isNight } = useMarketingTheme();

  if (courses.length === 0) return null;

  return (
    <section
      className={cn(
        "py-6 sm:py-8 lg:py-10",
        isNight
          ? "first:pt-8 sm:first:pt-10 lg:first:pt-12"
          : "first:pt-6 sm:first:pt-7 lg:first:pt-8"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">
              {eyebrow}
            </p>
            <h2 className="text-base font-semibold tracking-tight text-marketing-fg sm:text-lg lg:text-xl">
              {title}
            </h2>
            <p className="mt-1 text-xs text-marketing-muted sm:text-sm">{description}</p>
          </div>
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-500"
          >
            View all courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          {courses.slice(0, 4).map((course) => (
            <HomepageCourseCard
              key={course._id}
              href={`/courses/${course.slug}`}
              title={course.title}
              description={course.description}
              thumbnailUrl={course.thumbnailUrl}
              enrollmentCount={course.enrollmentCount}
              durationHours={course.durationHours}
              lessonCount={course.lessonCount}
              price={course.price}
              currency={course.currency}
              compareAtPrice={course.compareAtPrice}
              difficulty={course.difficulty}
              bestseller={sectionKey === "popular"}
              showPrice
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageCourseSectionsContent() {
  const queryReady = isConvexConfigured();
  const sections = useQuery(
    api.courses.listHomepageSections,
    queryReady ? {} : "skip"
  );

  if (sections === undefined) {
    return (
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-7 w-48 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-64 bg-white/5" />
          <div className="mt-6">
            <CourseGridSkeleton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {SECTIONS.map((section) => (
        <HomepageCourseSection
          key={section.key}
          sectionKey={section.key}
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          href={section.href}
          courses={sections[section.key]}
        />
      ))}
    </>
  );
}

export function HomepageCourseSectionsFallback() {
  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-48 bg-white/10" />
        <div className="mt-6">
          <CourseGridSkeleton />
        </div>
      </div>
    </section>
  );
}

export function HomepageCourseSections() {
  return (
    <ConvexSectionErrorBoundary fallback={<HomepageCourseSectionsFallback />}>
      <HomepageCourseSectionsContent />
    </ConvexSectionErrorBoundary>
  );
}
