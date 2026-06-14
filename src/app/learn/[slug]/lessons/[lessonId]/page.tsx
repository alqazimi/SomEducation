"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  LessonDownload,
  LessonNotes,
  LessonViewerShell,
} from "@/components/learn/lesson-viewer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

function getNextLessonId(
  modules: Array<{ lessons: Array<{ _id: Id<"lessons"> }> }>,
  currentLessonId: Id<"lessons">
) {
  const flat = modules.flatMap((m) => m.lessons);
  const index = flat.findIndex((l) => l._id === currentLessonId);
  return index >= 0 && index < flat.length - 1 ? flat[index + 1]._id : null;
}

export default function LessonPage() {
  const params = useParams<{ slug: string; lessonId: string }>();
  const router = useRouter();
  const lessonId = params.lessonId as Id<"lessons">;

  const course = useQuery(api.courses.getBySlug, { slug: params.slug });
  const lesson = useQuery(api.lessons.getLesson, { lessonId });
  const progress = useQuery(
    api.progress.getForCourse,
    course?._id ? { courseId: course._id } : "skip"
  );
  const markComplete = useMutation(api.progress.markLessonComplete);
  const markIncomplete = useMutation(api.progress.markLessonIncomplete);

  const isLessonComplete =
    progress?.completedLessonIds.includes(lessonId) ?? false;

  async function handleToggleComplete() {
    if (isLessonComplete) {
      await markIncomplete({ lessonId });
    } else {
      await markComplete({ lessonId });
    }
  }

  async function handleGoToNext() {
    if (!course) return;
    if (!isLessonComplete) {
      await markComplete({ lessonId });
    }
    const nextId = getNextLessonId(course.modules, lessonId);
    if (nextId) {
      router.push(`/learn/${params.slug}/lessons/${nextId}`);
    }
  }

  if (course === undefined || lesson === undefined) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-100">
          <div className="border-b border-border bg-white px-4 py-3">
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="aspect-video w-full" />
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  if (!course || !lesson) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md text-center shadow-sm">
            <CardContent className="py-12">
              <h1 className="text-2xl font-bold">Lesson Not Found</h1>
              <Link href={`/learn/${params.slug}`} className="mt-6 inline-block">
                <Button variant="outline" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to course
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  if (lesson.locked) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md text-center shadow-sm">
            <CardContent className="py-12">
              <h1 className="text-xl font-bold">{lesson.title}</h1>
              <p className="mt-2 text-slate-500">
                Purchase this course to watch this lesson.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link href={`/courses/${params.slug}`}>
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <ChevronLeft className="h-4 w-4" />
                    View course
                  </Button>
                </Link>
                <Link href={`/courses/${params.slug}/purchase`}>
                  <Button className="w-full sm:w-auto">Buy Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const embedUrl = lesson.youtubeVideoId
    ? getYoutubeEmbedUrl(lesson.youtubeVideoId)
    : lesson.youtubeUrl
      ? getYoutubeEmbedUrl(lesson.youtubeUrl)
      : null;

  const hasNext = Boolean(getNextLessonId(course.modules, lessonId));

  return (
    <>
      <Header />
      <LessonViewerShell
        slug={params.slug}
        courseTitle={course.title}
        modules={course.modules}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        completedLessonIds={progress?.completedLessonIds ?? []}
        passedExamIds={progress?.passedExamIds ?? []}
        progressPercent={progress?.percent ?? 0}
        completedLessons={progress?.completedItems ?? progress?.completedLessons ?? 0}
        totalLessons={progress?.totalItems ?? progress?.totalLessons ?? 0}
        isLessonComplete={isLessonComplete}
        onToggleComplete={() => void handleToggleComplete()}
        onGoToNext={hasNext ? () => void handleGoToNext() : undefined}
        notes={
          lesson.content ? <LessonNotes content={lesson.content} /> : undefined
        }
        download={
          lesson.fileUrl ? <LessonDownload href={lesson.fileUrl} /> : undefined
        }
      >
        {embedUrl ? (
          <div className="aspect-video w-full max-h-[70vh]">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : lesson.videoUrl ? (
          <div className="aspect-video w-full max-h-[70vh]">
            <video src={lesson.videoUrl} controls className="h-full w-full" />
          </div>
        ) : (
          <div className="flex aspect-video w-full max-h-[70vh] items-center justify-center bg-slate-900 text-slate-400">
            <p className="text-sm">No video attached to this lesson yet.</p>
          </div>
        )}
      </LessonViewerShell>
    </>
  );
}
