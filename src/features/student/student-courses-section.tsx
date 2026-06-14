"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { BookOpen, Compass } from "lucide-react";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EnrolledCourse = NonNullable<
  FunctionReturnType<typeof api.lessons.listEnrolledCourses>[number]
>;

function isEnrolledCourse(
  course: EnrolledCourse | null | undefined
): course is EnrolledCourse {
  return Boolean(course);
}

function renderCourseGrid(items: EnrolledCourse[], emptyLabel: string) {
  if (items.length === 0) {
    if (!emptyLabel) return null;
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((course) => (
        <CourseCard
          key={course._id}
          variant="enrolled"
          href={`/learn/${course.slug}`}
          actionHref={`/learn/${course.slug}`}
          actionLabel={
            (course.progress?.percent ?? 0) >= 100 ? "Review" : "Continue"
          }
          title={course.title}
          description={course.description}
          thumbnailUrl={course.thumbnailUrl}
          difficulty={course.difficulty}
          progressPercent={course.progress?.percent}
          completedLessons={
            course.progress?.completedItems ?? course.progress?.completedLessons
          }
          totalLessons={
            course.progress?.totalItems ?? course.progress?.totalLessons
          }
        />
      ))}
    </div>
  );
}

export function StudentCoursesSection() {
  const courses = useQuery(api.lessons.listEnrolledCourses);

  const enrolled = courses?.filter(isEnrolledCourse) ?? [];
  const inProgress = enrolled.filter((c) => (c.progress?.percent ?? 0) < 100);
  const completed = enrolled.filter((c) => (c.progress?.percent ?? 0) >= 100);

  if (courses === undefined) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl bg-slate-200"
          />
        ))}
      </div>
    );
  }

  if (enrolled.length === 0) {
    return (
      <Card className="overflow-hidden border-dashed">
        <CardContent className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">No courses yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Browse the catalog, enroll in a course, and it will appear here on
            your dashboard.
          </p>
          <Link href="/courses" className="mt-6">
            <Button size="lg" className="gap-2">
              <Compass className="h-4 w-4" />
              Browse Courses
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-lg font-semibold">In progress</h2>
          <Badge variant="secondary">{inProgress.length}</Badge>
        </div>
        {renderCourseGrid(
          inProgress,
          "You have no courses in progress right now."
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold">Completed</h2>
            <Badge variant="secondary">{completed.length}</Badge>
          </div>
          {renderCourseGrid(completed, "")}
        </section>
      )}
    </div>
  );
}
