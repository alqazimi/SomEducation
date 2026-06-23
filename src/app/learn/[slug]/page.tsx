"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, ClipboardCheck, PlayCircle } from "lucide-react";
import { api } from "convex/_generated/api";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseProgressBar } from "@/components/ui/course-progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ConvexQueryGate } from "@/components/convex/convex-query-gate";
import { LearnLightSurface } from "@/components/learn/learn-light-surface";
import { PageEyebrow, PageLead, PageTitle } from "@/components/ui/typography";
import { type } from "@/lib/typography";

export default function LearnPage() {
  const params = useParams<{ slug: string }>();
  const course = useQuery(api.courses.getBySlug, { slug: params.slug });
  const progress = useQuery(
    api.progress.getForCourse,
    course?._id && course.canLearn ? { courseId: course._id } : "skip"
  );

  if (course === undefined) {
    return (
      <>
        <Header />
        <LearnLightSurface className="min-h-screen">
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ConvexQueryGate
            isLoading
            errorTitle="Could not load course"
            fallback={
              <>
                <Skeleton className="h-10 w-72" />
                <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
              </>
            }
          >
            <></>
          </ConvexQueryGate>
        </main>
        </LearnLightSurface>
      </>
    );
  }

  if (!course || !course.canLearn) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
          <Card className="w-full max-w-lg text-center shadow-sm">
            <CardContent className="px-6 py-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <BookOpen className="h-7 w-7" />
              </div>
              <PageTitle className="mt-5">Access required</PageTitle>
              <PageLead className="mt-2">
                Sign in and purchase this course to access the content.
              </PageLead>
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(
                  `/courses/${params.slug}/purchase`
                )}`}
                className="mt-6 inline-block"
              >
                <Button size="lg">Sign in to Buy Course</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const totalExams = course.modules.reduce(
    (acc, m) => acc + (m.exams?.length ?? 0),
    0
  );

  return (
    <>
      <Header />
      <LearnLightSurface className="min-h-screen">
        <main>
          <div className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
              <ChevronLeft className="h-4 w-4" />
              Back to my courses
            </Link>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <PageEyebrow>Course home</PageEyebrow>
                <h1 className={`mt-1 ${type.display}`}>{course.title}</h1>
                <p className={`mt-3 max-w-3xl ${type.lead}`}>
                  {course.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {course.difficulty}
                  </Badge>
                  {course.category && (
                    <Badge variant="outline">{course.category.name}</Badge>
                  )}
                  <Badge variant="outline">
                    {course.modules.length} modules · {totalLessons} lessons
                    {totalExams > 0 ? ` · ${totalExams} exams` : ""}
                  </Badge>
                </div>
              </div>
              {firstLesson && (
                <Link
                  href={`/learn/${params.slug}/lessons/${firstLesson._id}`}
                  className="shrink-0"
                >
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    <PlayCircle className="h-5 w-5" />
                    {firstLesson ? "Start Learning" : "Open Course"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground">
                Course content
              </h2>
              {course.modules.map((mod, index) => (
                <Card key={mod._id} className="overflow-hidden border-border bg-card shadow-sm">
                  <CardHeader className="border-b border-border bg-muted/60 py-4">
                    <CardTitle className="text-base text-foreground">
                      Module {index + 1}: {mod.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                      {mod.lessons.map((lesson, lessonIndex) => (
                        <li key={lesson._id}>
                          <Link
                            href={`/learn/${params.slug}/lessons/${lesson._id}`}
                            className="flex items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-muted sm:gap-4 sm:px-5"
                          >
                            <PlayCircle className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-foreground">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                              {lesson.durationMinutes && (
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {lesson.durationMinutes} min
                                </span>
                              )}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {(mod.exams ?? []).length > 0 && (
                      <ul className="divide-y divide-border border-t border-border bg-muted/30">
                        {mod.exams.map((exam) => (
                          <li key={exam._id}>
                            <Link
                              href={`/learn/${params.slug}/exams/${exam._id}`}
                              className="flex items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-muted sm:gap-4 sm:px-5"
                            >
                              <ClipboardCheck
                                className={`h-4 w-4 shrink-0 ${
                                  exam.hasPassed
                                    ? "text-emerald-600"
                                    : "text-brand-600"
                                }`}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block font-medium text-foreground">
                                  Exam: {exam.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {exam.questionCount} questions · Pass{" "}
                                  {exam.passingScore}%
                                  {exam.bestScore != null
                                    ? ` · Best: ${exam.bestScore}%`
                                    : ""}
                                </span>
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <aside className="space-y-4">
              {course.thumbnailUrl && (
                <Card className="overflow-hidden border-border bg-card shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="aspect-video w-full object-cover"
                  />
                </Card>
              )}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Your progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CourseProgressBar
                    percent={progress?.percent ?? 0}
                    completedLessons={progress?.completedItems ?? progress?.completedLessons ?? 0}
                    totalLessons={progress?.totalItems ?? progress?.totalLessons ?? totalLessons}
                  />
                  {firstLesson && (
                    <Link
                      href={`/learn/${params.slug}/lessons/${firstLesson._id}`}
                    >
                      <Button className="w-full gap-2">
                        <PlayCircle className="h-4 w-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
        </main>
      </LearnLightSurface>
      <Footer />
    </>
  );
}
