"use client";

import { useQuery } from "convex/react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { CourseCard } from "@/components/courses/course-card";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
        <div className="min-h-screen bg-muted">
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-8">
            <Skeleton className="h-10 w-64" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          </main>
        </div>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
      setSearch(query);
    }
  }, [searchParams]);

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
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="border-b border-border/60 bg-gradient-to-b from-white to-brand-50/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
              Course Catalog
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Explore our courses
            </h1>
            <p className="mt-3 max-w-2xl text-base text-stone-600">
              Learn new skills with expert-led courses — structured programs you
              can study at your own pace.
            </p>
            <div className="relative mt-8 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search courses, topics, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-xl border-border bg-white pl-10 shadow-sm"
              />
            </div>
          </div>
        </section>

        <div className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <ConvexQueryGate
            isLoading={courses === undefined}
            errorTitle="Could not load courses"
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            }
          >
            {courses !== undefined && courses.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-slate-700">No courses found</p>
              <p className="mt-2 text-sm text-slate-500">
                Try different filters or check back soon for new courses.
              </p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : courses !== undefined ? (
            <>
              <p className="mb-6 text-sm text-slate-500">
                {courses.length} course{courses.length === 1 ? "" : "s"} found
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    href={`/courses/${course.slug}`}
                    title={course.title}
                    description={course.description}
                    thumbnailUrl={course.thumbnailUrl}
                    difficulty={course.difficulty}
                    categoryName={course.category?.name}
                    price={course.price}
                    currency={course.currency}
                    teacherName={
                      course.teacher
                        ? `${course.teacher.firstName} ${course.teacher.lastName}`
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          ) : null}
          </ConvexQueryGate>
        </div>
      </main>
      <Footer />
    </>
  );
}
