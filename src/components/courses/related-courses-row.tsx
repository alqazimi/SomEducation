"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { HomepageCourseCard } from "@/components/courses/homepage-course-card";
import { Skeleton } from "@/components/ui/skeleton";

export function RelatedCoursesRow({ slug }: { slug: string }) {
  const related = useQuery(api.courses.listRelated, { slug, limit: 4 });

  if (related === undefined) {
    return (
      <section className="mt-12 border-t border-marketing-border pt-10">
        <Skeleton className="h-7 w-48 bg-marketing-border/40" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[280px] rounded-2xl bg-marketing-border/40"
            />
          ))}
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-12 border-t border-marketing-border pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-marketing-fg sm:text-2xl">
            You might also like
          </h2>
          <p className="mt-1 text-sm text-marketing-muted">
            More courses from the same category and beyond
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500"
        >
          Browse all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((course) => (
          <HomepageCourseCard
            key={course._id}
            href={`/courses/${course.slug}`}
            slug={course.slug}
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
            teacherName={course.teacherName}
            categoryName={course.categoryName}
            hasFreePreview={course.hasFreePreview}
            isEnrolled={course.isEnrolled}
            canLearn={course.canLearn}
            showPrice
          />
        ))}
      </div>
    </section>
  );
}
