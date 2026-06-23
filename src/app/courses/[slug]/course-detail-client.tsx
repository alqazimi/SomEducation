"use client";

import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/brand";
import { useQuery } from "convex/react";
import { Show } from "@clerk/nextjs";
import { BookOpen, CheckCircle2, Clock, PlayCircle, User } from "lucide-react";
import { api } from "convex/_generated/api";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConvexQueryGate } from "@/components/convex/convex-query-gate";
import { marketingCardClass } from "@/lib/marketing-theme";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CourseDetailClient({ slug }: { slug: string }) {
  const course = useQuery(api.courses.getBySlug, { slug });

  if (course === undefined) {
    return (
      <MarketingShell>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <ConvexQueryGate
            isLoading
            errorTitle="Could not load course"
            fallback={<Skeleton className="h-96 w-full rounded-xl bg-white/5" />}
          >
            <></>
          </ConvexQueryGate>
        </div>
      </MarketingShell>
    );
  }

  if (!course) {
    return (
      <MarketingShell>
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-lg font-medium text-white sm:text-xl">
              Course not found
            </h1>
            <Link href="/courses" className="mt-4 inline-block">
              <Button variant="outline" className="border-white/20 text-white">
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </MarketingShell>
    );
  }

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <MarketingShell>
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="capitalize bg-white/10 text-slate-200"
                >
                  {course.difficulty}
                </Badge>
                {course.category && (
                  <Badge
                    variant="outline"
                    className="border-white/20 text-slate-300"
                  >
                    {course.category.name}
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                {course.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                {course.teacher && (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {course.teacher.firstName} {course.teacher.lastName}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {course.modules.length} modules · {totalLessons} lessons
                </span>
              </div>

              {course.thumbnailUrl && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 lg:hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}
            </div>

            <Card
              className={cn(
                marketingCardClass,
                "sticky top-20 overflow-hidden shadow-none lg:top-24"
              )}
            >
              {course.thumbnailUrl && (
                <div className="hidden lg:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}
              <CardContent className="space-y-4 p-6">
                <div className="text-xl font-medium tabular-nums tracking-tight text-white">
                  {formatPrice(course.price, course.currency)}
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Full lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Structured video lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Manual payment verification
                  </li>
                </ul>
                {course.canLearn ? (
                  <Link href={`/learn/${course.slug}`} className="block">
                    <Button className="w-full gap-2" size="lg">
                      <PlayCircle className="h-5 w-5" />
                      {course.isCourseInstructor
                        ? "Preview Course"
                        : "Continue Learning"}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Show when="signed-in">
                      {course.activePayment?.status === "pending" ? (
                        <Link
                          href="/dashboard/student/payments"
                          className="block"
                        >
                          <Button
                            className="w-full border-white/20 text-white"
                            size="lg"
                            variant="outline"
                          >
                            Payment Pending Review
                          </Button>
                        </Link>
                      ) : course.activePayment?.status === "rejected" ||
                        course.activePayment?.status ===
                          "resubmit_requested" ? (
                        <Link
                          href={`/courses/${course.slug}/purchase`}
                          className="block"
                        >
                          <Button className="w-full" size="lg">
                            Fix Payment
                          </Button>
                        </Link>
                      ) : (
                        <Link
                          href={`/courses/${course.slug}/purchase`}
                          className="block"
                        >
                          <Button className="w-full" size="lg">
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
                        <Button className="w-full" size="lg">
                          Sign in to Enroll
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-slate-500">
                        Create an account to purchase this course.
                      </p>
                    </Show>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-base font-medium text-white sm:text-lg">
          What you&apos;ll learn
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
          A structured curriculum designed to take you from fundamentals to
          practical skills step by step.
        </p>

        <div className="mt-8 space-y-4">
          {course.modules.map((mod, i) => (
            <Card
              key={mod._id}
              className={cn(marketingCardClass, "overflow-hidden shadow-none")}
            >
              <CardHeader className="border-b border-white/10 bg-white/[0.03] py-4">
                <CardTitle className="text-base text-white">
                  Module {i + 1}: {mod.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-white/10">
                  {mod.lessons.map((lesson) => (
                    <li
                      key={lesson._id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      {lesson.isFreePreview ? (
                        <Link
                          href={`/learn/${slug}/lessons/${lesson._id}`}
                          className="font-medium text-brand-400 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-200">
                          {lesson.title}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-slate-500">
                        {lesson.isFreePreview && (
                          <Badge variant="success">Preview</Badge>
                        )}
                        {lesson.durationMinutes && (
                          <span className="flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.durationMinutes}m
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: course.description,
            provider: {
              "@type": "Organization",
              name: PLATFORM_NAME,
            },
            offers: {
              "@type": "Offer",
              price: course.price,
              priceCurrency: course.currency,
            },
          }),
        }}
      />
    </MarketingShell>
  );
}
