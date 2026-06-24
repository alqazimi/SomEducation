"use client";

import Link from "next/link";
import { useState } from "react";
import { Show } from "@clerk/nextjs";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Globe,
  GraduationCap,
  PlayCircle,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { CoursePreviewHero } from "@/components/courses/course-preview-hero";
import { RelatedCoursesRow } from "@/components/courses/related-courses-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConvexQueryGate } from "@/components/convex/convex-query-gate";
import { cn, formatPrice } from "@/lib/utils";

type CourseDetail = NonNullable<
  ReturnType<typeof useQuery<typeof api.courses.getBySlug>>
>;

function SidebarRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-marketing-muted">
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        {label}
      </span>
      <span className="text-right font-medium capitalize text-marketing-fg">
        {value}
      </span>
    </div>
  );
}

function CourseEnrollActions({ course }: { course: CourseDetail }) {
  if (course.canLearn) {
    return (
      <Link href={`/learn/${course.slug}`} className="block">
        <Button className="h-11 w-full gap-2 text-base" size="lg">
          <PlayCircle className="h-5 w-5" />
          {course.isCourseInstructor ? "Preview Course" : "Continue Learning"}
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Show when="signed-in">
        {course.activePayment?.status === "pending" ? (
          <Link href="/dashboard/student/payments" className="block">
            <Button
              className="h-11 w-full border-marketing-border bg-marketing-card text-marketing-fg hover:bg-marketing-elevated"
              size="lg"
              variant="outline"
            >
              Payment Pending Review
            </Button>
          </Link>
        ) : course.activePayment?.status === "rejected" ||
          course.activePayment?.status === "resubmit_requested" ? (
          <Link href={`/courses/${course.slug}/purchase`} className="block">
            <Button className="h-11 w-full" size="lg">
              Fix Payment
            </Button>
          </Link>
        ) : (
          <Link href={`/courses/${course.slug}/purchase`} className="block">
            <Button className="h-11 w-full" size="lg">
              Enroll Now
            </Button>
          </Link>
        )}
      </Show>
      <Show when="signed-out">
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(
            `/courses/${course.slug}/purchase`
          )}`}
          className="block"
        >
          <Button className="h-11 w-full" size="lg">
            Sign in to Enroll
          </Button>
        </Link>
        <p className="text-center text-xs text-marketing-muted">
          Create an account to purchase this course.
        </p>
      </Show>
    </>
  );
}

function CourseDetailSidebar({ course }: { course: CourseDetail }) {
  const teacherName = course.teacher
    ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim()
    : "Instructor";

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24 space-y-5 rounded-xl border border-marketing-border bg-marketing-card p-5 shadow-sm">
        <div>
          {course.price === 0 ? (
            <p className="text-4xl font-bold text-emerald-600">FREE</p>
          ) : (
            <div className="space-y-1">
              {course.compareAtPrice && course.compareAtPrice > course.price && (
                <p className="text-lg text-marketing-muted line-through">
                  {formatPrice(course.compareAtPrice, course.currency)}
                </p>
              )}
              <p className="text-4xl font-bold text-marketing-fg">
                {formatPrice(course.price, course.currency)}
              </p>
            </div>
          )}
        </div>

        <CourseEnrollActions course={course} />

        <div className="space-y-4 border-t border-marketing-border pt-5">
          <SidebarRow
            icon={GraduationCap}
            label="Level"
            value={course.difficulty}
          />
          <SidebarRow icon={Globe} label="Expiry Period" value="Lifetime" />
        </div>

        <ul className="space-y-2 border-t border-marketing-border pt-4 text-sm text-marketing-muted">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Taught by {teacherName || "expert instructor"}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {course.lessonCount} structured lessons
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Manual payment verification
          </li>
        </ul>
      </div>
    </aside>
  );
}

function CourseWhatYouLearn({ course }: { course: CourseDetail }) {
  const outcomes = course.learningOutcomes?.filter(Boolean) ?? [];
  if (outcomes.length === 0) return null;

  return (
    <section className="rounded-xl border border-marketing-border bg-marketing-card p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-marketing-fg">
        What you&apos;ll learn
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {outcomes.map((outcome) => (
          <li
            key={outcome}
            className="flex gap-3 text-sm leading-relaxed text-marketing-muted sm:text-base"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CourseDetailHeader({ course }: { course: CourseDetail }) {
  const teacherName = course.teacher
    ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim()
    : "Instructor";

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-marketing-fg md:text-4xl">
          {course.title}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-marketing-muted">
          <span className="inline-flex items-center gap-1 capitalize">
            <GraduationCap className="h-4 w-4 text-brand-600" />
            {course.difficulty}
          </span>
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-4 w-4 text-brand-600" />
            {course.lessonCount} lessons
          </span>
          {course.totalDurationMinutes > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4 text-brand-600" />
              {Math.max(1, Math.round(course.totalDurationMinutes / 60))} hours
            </span>
          )}
          {course.enrollmentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-brand-600" />
              {course.enrollmentCount} students
            </span>
          )}
        </p>
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-marketing-muted md:text-lg">
          {course.description}
        </p>
        {course.teacher && (
          <div className="mt-5 flex items-center gap-2 text-sm text-marketing-fg">
            {course.teacher.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.teacher.imageUrl}
                alt={teacherName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                {teacherName.charAt(0) || "?"}
              </span>
            )}
            <span className="font-medium">{teacherName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCurriculum({ course }: { course: CourseDetail }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(course.modules.map((mod) => [mod._id, true]))
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-marketing-fg">
          Course Curriculum
        </h3>
        <p className="text-sm text-marketing-muted">
          {course.modules.length} modules · {course.lessonCount} lessons
        </p>
      </div>

      {course.modules.map((mod, moduleIndex) => {
        const isOpen = expanded[mod._id] ?? true;
        const lessonCount = mod.lessons.length;
        const moduleMinutes = mod.lessons.reduce(
          (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
          0
        );

        return (
          <div
            key={mod._id}
            className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-card"
          >
            <button
              type="button"
              className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-marketing-elevated/60 sm:items-center sm:px-5"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [mod._id]: !isOpen }))
              }
              aria-expanded={isOpen}
            >
              <ChevronDown
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0 text-marketing-muted transition-transform sm:mt-0",
                  !isOpen && "-rotate-90"
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-marketing-fg">
                  Module {moduleIndex + 1}: {mod.title}
                </p>
                <p className="mt-1 text-xs text-marketing-muted">
                  {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                  {moduleMinutes > 0 ? ` · ${moduleMinutes} min total` : ""}
                  {(mod.exams?.length ?? 0) > 0
                    ? ` · ${mod.exams?.length} exam${mod.exams?.length === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
            </button>

            {isOpen && (
              <ul className="divide-y divide-marketing-border border-t border-marketing-border">
                {mod.lessons.map((lesson, lessonIndex) => (
                  <li
                    key={lesson._id}
                    className="flex items-start gap-3 px-4 py-3 sm:items-center sm:px-5"
                  >
                    <PlayCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 sm:mt-0"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      {lesson.isFreePreview ? (
                        <Link
                          href={`/learn/${course.slug}/lessons/${lesson._id}`}
                          className="text-sm font-medium text-brand-600 hover:underline"
                        >
                          {lessonIndex + 1}. {lesson.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-marketing-fg">
                          {lessonIndex + 1}. {lesson.title}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      {lesson.isFreePreview && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Preview
                        </span>
                      )}
                      {lesson.durationMinutes ? (
                        <span className="inline-flex items-center gap-1 text-xs text-marketing-muted">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {lesson.durationMinutes}m
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}

                {(mod.exams ?? []).map((exam, examIndex) => (
                  <li
                    key={exam._id}
                    className="flex items-start gap-3 bg-marketing-elevated/40 px-4 py-3 sm:items-center sm:px-5"
                  >
                    <ClipboardCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 sm:mt-0"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-marketing-fg">
                        Exam {examIndex + 1}: {exam.title}
                      </p>
                      {exam.questionCount > 0 && (
                        <p className="mt-0.5 text-xs text-marketing-muted">
                          {exam.questionCount} questions · Pass {exam.passingScore}%
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CourseDetailTabs({ course }: { course: CourseDetail }) {
  return (
    <Tabs
      defaultValue="overview"
      className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-card shadow-sm"
    >
      <div className="overflow-x-auto border-b border-marketing-border">
        <TabsList className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-2 text-marketing-muted">
          <TabsTrigger
            value="overview"
            className="rounded-lg text-marketing-muted data-[state=active]:bg-marketing-elevated data-[state=active]:text-marketing-fg data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="curriculum"
            className="rounded-lg text-marketing-muted data-[state=active]:bg-marketing-elevated data-[state=active]:text-marketing-fg data-[state=active]:shadow-sm"
          >
            Curriculum
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0 p-5 sm:p-6">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-marketing-muted">
          {course.description}
        </p>
      </TabsContent>

      <TabsContent value="curriculum" className="mt-0 p-5 sm:p-6">
        <CourseCurriculum course={course} />
      </TabsContent>
    </Tabs>
  );
}

export function CourseDetailView({ slug }: { slug: string }) {
  const course = useQuery(api.courses.getBySlug, { slug });

  if (course === undefined) {
    return (
      <MarketingShell>
        <MarketingCoursesSurface>
          <div className="mx-auto max-w-7xl px-4 py-12">
            <ConvexQueryGate
              isLoading
              errorTitle="Could not load course"
              fallback={
                <Skeleton className="h-96 w-full rounded-xl bg-marketing-border/40" />
              }
            >
              <></>
            </ConvexQueryGate>
          </div>
        </MarketingCoursesSurface>
      </MarketingShell>
    );
  }

  if (!course) {
    return (
      <MarketingShell>
        <MarketingCoursesSurface>
          <div className="flex min-h-[50vh] items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-lg font-medium text-marketing-fg sm:text-xl">
                Course not found
              </h1>
              <Link href="/courses" className="mt-4 inline-block">
                <Button
                  variant="outline"
                  className="border-marketing-border bg-marketing-card text-marketing-fg hover:bg-marketing-elevated"
                >
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>
        </MarketingCoursesSurface>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <MarketingCoursesSurface>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-8 lg:col-span-2">
              <CoursePreviewHero
                slug={course.slug}
                title={course.title}
                thumbnailUrl={course.thumbnailUrl}
                previewLesson={course.previewLesson}
              />
              <CourseDetailHeader course={course} />
              <CourseWhatYouLearn course={course} />
              <CourseDetailTabs course={course} />
            </div>
            <CourseDetailSidebar course={course} />
          </div>
          <RelatedCoursesRow slug={slug} />
        </div>
      </MarketingCoursesSurface>
    </MarketingShell>
  );
}
