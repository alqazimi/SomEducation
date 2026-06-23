"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Languages,
  PlayCircle,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConvexQueryGate } from "@/components/convex/convex-query-gate";
import { formatCourseDuration } from "@/lib/course-duration";
import { formatPrice } from "@/lib/utils";

type CourseDetail = NonNullable<
  ReturnType<typeof useQuery<typeof api.courses.getBySlug>>
>;

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-marketing-fg">
      <Icon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

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
            <Button className="h-11 w-full" size="lg" variant="outline">
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
  const duration = formatCourseDuration(course.totalDurationMinutes);
  const teacherName = course.teacher
    ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim()
    : "Instructor";

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24 space-y-5 rounded-xl border border-marketing-border bg-marketing-card p-5 shadow-sm">
        {course.thumbnailUrl && (
          <div className="overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

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
            icon={Users}
            label="Students"
            value={course.enrollmentCount}
          />
          <SidebarRow icon={Languages} label="Language" value="English" />
          <SidebarRow icon={Clock} label="Duration" value={duration} />
          <SidebarRow
            icon={GraduationCap}
            label="Level"
            value={course.difficulty}
          />
          <SidebarRow icon={Globe} label="Expiry Period" value="Lifetime" />
          <SidebarRow icon={Award} label="Certificate Included" value="Yes" />
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

function CourseDetailHeader({ course }: { course: CourseDetail }) {
  const teacherName = course.teacher
    ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim()
    : "Instructor";
  const duration = formatCourseDuration(course.totalDurationMinutes);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-marketing-fg md:text-4xl">
          {course.title}
        </h1>
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-marketing-muted md:text-lg">
          {course.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {course.teacher && (
          <MetaItem icon={Users}>
            <span className="flex items-center gap-2">
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
            </span>
          </MetaItem>
        )}
        <MetaItem icon={Languages}>
          <span>English</span>
        </MetaItem>
        <MetaItem icon={Award}>
          <span>Course Certificate</span>
        </MetaItem>
        <MetaItem icon={Users}>
          <span>
            {course.enrollmentCount} Enrolled Student
            {course.enrollmentCount === 1 ? "" : "s"}
          </span>
        </MetaItem>
        <MetaItem icon={Clock}>
          <span>{duration}</span>
        </MetaItem>
        {course.category && (
          <MetaItem icon={BookOpen}>
            <span>{course.category.name}</span>
          </MetaItem>
        )}
      </div>
    </div>
  );
}

function CourseCurriculum({ course }: { course: CourseDetail }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-marketing-muted">
        {course.modules.length} modules · {course.lessonCount} lessons
      </p>
      {course.modules.map((mod, i) => (
        <div
          key={mod._id}
          className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-card"
        >
          <div className="border-b border-marketing-border bg-marketing-elevated px-4 py-3 sm:px-5">
            <h3 className="font-semibold text-marketing-fg">
              Module {i + 1}: {mod.title}
            </h3>
          </div>
          <ul className="divide-y divide-marketing-border">
            {mod.lessons.map((lesson) => (
              <li
                key={lesson._id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                {lesson.isFreePreview ? (
                  <Link
                    href={`/learn/${course.slug}/lessons/${lesson._id}`}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    {lesson.title}
                  </Link>
                ) : (
                  <span className="font-medium text-marketing-fg">
                    {lesson.title}
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-marketing-muted">
                  {lesson.isFreePreview && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Preview
                    </span>
                  )}
                  {lesson.durationMinutes ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.durationMinutes}m
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CourseDetailTabs({ course }: { course: CourseDetail }) {
  const outcomes = course.learningOutcomes?.filter(Boolean) ?? [];

  return (
    <Tabs
      defaultValue="overview"
      className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-card shadow-sm"
    >
      <div className="overflow-x-auto border-b border-marketing-border">
        <TabsList className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-2">
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-lg">
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg">
            Details
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0 space-y-8 p-5 sm:p-6">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-marketing-muted">
          {course.description}
        </p>

        {outcomes.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-marketing-fg">
              What You&apos;ll Master
            </h3>
            <ul className="mt-4 space-y-3">
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
          </div>
        )}
      </TabsContent>

      <TabsContent value="curriculum" className="mt-0 p-5 sm:p-6">
        <CourseCurriculum course={course} />
      </TabsContent>

      <TabsContent value="details" className="mt-0 p-5 sm:p-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-marketing-fg">
              Course info
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-marketing-muted">
              <li className="flex justify-between gap-4 border-b border-marketing-border pb-3">
                <span>Level</span>
                <span className="font-medium capitalize text-marketing-fg">
                  {course.difficulty}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-marketing-border pb-3">
                <span>Language</span>
                <span className="font-medium text-marketing-fg">English</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-marketing-border pb-3">
                <span>Students</span>
                <span className="font-medium text-marketing-fg">
                  {course.enrollmentCount}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-marketing-border pb-3">
                <span>Duration</span>
                <span className="font-medium text-marketing-fg">
                  {formatCourseDuration(course.totalDurationMinutes)}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-marketing-border pb-3">
                <span>Certificate</span>
                <span className="font-medium text-marketing-fg">Yes</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Access</span>
                <span className="font-medium text-marketing-fg">Lifetime</span>
              </li>
            </ul>
          </div>

          {outcomes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-marketing-fg">
                Outcomes
              </h3>
              <ul className="mt-4 space-y-3">
                {outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex gap-3 text-sm leading-relaxed text-marketing-muted"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
                <Button variant="outline">Back to Courses</Button>
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
              <CourseDetailHeader course={course} />
              <CourseDetailTabs course={course} />
            </div>
            <CourseDetailSidebar course={course} />
          </div>
        </div>
      </MarketingCoursesSurface>
    </MarketingShell>
  );
}
