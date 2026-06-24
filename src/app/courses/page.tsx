"use client";

import { useQuery } from "convex/react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { HomepageCourseCard } from "@/components/courses/homepage-course-card";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ConvexQueryGate } from "@/components/convex/convex-query-gate";

const difficulties = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <MarketingShell>
          <div className="mx-auto max-w-7xl px-4 py-8">
            <Skeleton className="h-8 w-64 bg-marketing-border/40" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] rounded-2xl bg-marketing-border/40" />
              ))}
            </div>
          </div>
        </MarketingShell>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [syncedUrlSearch, setSyncedUrlSearch] = useState(urlSearch);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  if (urlSearch !== syncedUrlSearch) {
    setSyncedUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const categories = useQuery(api.categories.list, { activeOnly: true });
  const courses = useQuery(api.courses.listPublished, {
    search: search.trim() || undefined,
    categoryId:
      categoryId !== "all" ? (categoryId as Id<"categories">) : undefined,
    difficulty:
      difficulty !== "all"
        ? (difficulty as "beginner" | "intermediate" | "advanced")
        : undefined,
  });

  const hasFilters =
    search.trim() || categoryId !== "all" || difficulty !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryId("all");
    setDifficulty("all");
  }

  return (
    <MarketingShell>
      <section className="border-b border-marketing-border bg-marketing-hero">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
            Course Catalog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-marketing-fg sm:text-3xl">
            Explore our courses
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-marketing-muted">
            Learn new skills with expert-led courses — structured programs you
            can study at your own pace.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marketing-muted" />
            <Input
              placeholder="Search courses, topics, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-lg border-marketing-border bg-marketing-card pl-10 text-marketing-fg placeholder:text-marketing-muted"
            />
          </div>
        </div>
      </section>

      <MarketingCoursesSurface>
        <div className="border-b border-marketing-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full border-marketing-border bg-marketing-card text-marketing-fg sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-marketing-border bg-white text-[#0f172a]">
                <SelectItem value="all" className="focus:bg-slate-100 focus:text-[#0f172a]">
                  All categories
                </SelectItem>
                {categories?.map((cat) => (
                  <SelectItem
                  key={cat._id}
                  value={cat._id}
                  className="focus:bg-slate-100 focus:text-[#0f172a]"
                >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full border-marketing-border bg-marketing-card text-marketing-fg sm:w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="border-marketing-border bg-white text-[#0f172a]">
                {difficulties.map((item) => (
                  <SelectItem
                  key={item.value}
                  value={item.value}
                  className="focus:bg-slate-100 focus:text-[#0f172a]"
                >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-marketing-muted hover:text-marketing-fg"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ConvexQueryGate
            isLoading={courses === undefined}
            errorTitle="Could not load courses"
            fallback={
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[280px] rounded-2xl bg-marketing-border/40 sm:h-[320px]" />
                ))}
              </div>
            }
          >
            {courses !== undefined && courses.length === 0 ? (
            <div className="rounded-2xl border border-marketing-border bg-marketing-card p-10 text-center">
              <p className="text-base font-medium text-marketing-fg">No courses found</p>
              <p className="mt-2 text-sm text-marketing-muted">
                Try different filters or check back soon for new courses.
              </p>
              {hasFilters && (
                <Button
                  variant="outline"
                  className="mt-4 border-marketing-border text-marketing-fg"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : courses !== undefined ? (
            <>
              <p className="mb-5 text-sm text-marketing-muted">
                {courses.length} course{courses.length === 1 ? "" : "s"} found
              </p>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                {courses.map((course) => (
                  <HomepageCourseCard
                    key={course._id}
                    href={`/courses/${course.slug}`}
                    title={course.title}
                    description={course.description}
                    thumbnailUrl={course.thumbnailUrl}
                    enrollmentCount={course.enrollmentCount}
                    durationHours={course.durationHours}
                    lessonCount={course.lessonCount}
                    difficulty={course.difficulty}
                    price={course.price}
                    compareAtPrice={course.compareAtPrice}
                    currency={course.currency}
                    teacherName={course.teacherName}
                    categoryName={course.categoryName}
                    hasFreePreview={course.hasFreePreview}
                    showPrice
                  />
                ))}
              </div>
            </>
          ) : null}
          </ConvexQueryGate>
        </div>
        </MarketingCoursesSurface>
    </MarketingShell>
  );
}
