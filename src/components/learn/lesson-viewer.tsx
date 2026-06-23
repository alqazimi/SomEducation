"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  List,
  PlayCircle,
  X,
} from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseProgressBar } from "@/components/ui/course-progress-bar";
import { LearnLightSurface } from "@/components/learn/learn-light-surface";
import { cn } from "@/lib/utils";
import { type } from "@/lib/typography";

type ExamItem = {
  _id: Id<"exams">;
  title: string;
  hasPassed?: boolean;
  bestScore?: number | null;
};

type LessonItem = {
  _id: Id<"lessons">;
  title: string;
  durationMinutes?: number;
  isFreePreview?: boolean;
};

type ModuleItem = {
  _id: Id<"modules">;
  title: string;
  lessons: LessonItem[];
  exams?: ExamItem[];
};

type LessonNav = {
  prev: LessonItem | null;
  next: LessonItem | null;
  index: number;
  total: number;
  moduleTitle?: string;
};

function getLessonNavigation(
  modules: ModuleItem[],
  currentLessonId: Id<"lessons">
): LessonNav {
  const flat = modules.flatMap((mod) =>
    mod.lessons.map((lesson) => ({ ...lesson, moduleTitle: mod.title }))
  );
  const index = flat.findIndex((l) => l._id === currentLessonId);
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
    index: index >= 0 ? index + 1 : 0,
    total: flat.length,
    moduleTitle: flat[index]?.moduleTitle,
  };
}

function SyllabusPanel({
  slug,
  modules,
  currentLessonId,
  completedLessonIds,
  passedExamIds,
  onLessonClick,
  className,
}: {
  slug: string;
  modules: ModuleItem[];
  currentLessonId: Id<"lessons">;
  completedLessonIds: Set<string>;
  passedExamIds?: Set<string>;
  onLessonClick?: () => void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      modules.map((mod) => [
        mod._id,
        mod.lessons.some((l) => l._id === currentLessonId),
      ])
    )
  );

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground">Course content</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {modules.length} modules ·{" "}
          {modules.reduce((n, m) => n + m.lessons.length, 0)} lessons
          {modules.some((m) => (m.exams?.length ?? 0) > 0)
            ? ` · ${modules.reduce((n, m) => n + (m.exams?.length ?? 0), 0)} exams`
            : ""}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {modules.map((mod, modIndex) => {
            const isOpen = expanded[mod._id] ?? true;
            return (
              <div
                key={mod._id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-muted"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [mod._id]: !isOpen }))
                  }
                >
                  <span className="line-clamp-2">
                    Module {modIndex + 1}: {mod.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <ul className="border-t border-border pb-1">
                    {mod.lessons.map((lesson, lessonIndex) => {
                      const active = lesson._id === currentLessonId;
                      const done = completedLessonIds.has(lesson._id);
                      return (
                        <li key={lesson._id}>
                          <Link
                            href={`/learn/${slug}/lessons/${lesson._id}`}
                            onClick={onLessonClick}
                            className={cn(
                              "flex items-start gap-3 px-3 py-2.5 text-sm transition-colors",
                              active
                                ? "bg-brand-50 text-brand-700"
                                : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {done ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <PlayCircle
                                className={cn(
                                  "mt-0.5 h-4 w-4 shrink-0",
                                  active ? "text-brand-600" : "text-muted-foreground"
                                )}
                              />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium leading-snug">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                              {lesson.durationMinutes && (
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {lesson.durationMinutes} min
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                    {(mod.exams ?? []).map((exam, examIndex) => {
                      const passed =
                        passedExamIds?.has(exam._id) || exam.hasPassed;
                      return (
                        <li key={exam._id}>
                          <Link
                            href={`/learn/${slug}/exams/${exam._id}`}
                            onClick={onLessonClick}
                            className="flex items-start gap-3 border-t border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
                          >
                            {passed ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium leading-snug">
                                Exam {examIndex + 1}: {exam.title}
                              </span>
                              {exam.bestScore != null && (
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  Best score: {exam.bestScore}%
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type LessonViewerShellProps = {
  slug: string;
  courseTitle: string;
  modules: ModuleItem[];
  lessonId: Id<"lessons">;
  lessonTitle: string;
  children: React.ReactNode;
  notes?: React.ReactNode;
  download?: React.ReactNode;
  completedLessonIds?: Id<"lessons">[];
  passedExamIds?: Id<"exams">[];
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  isLessonComplete?: boolean;
  onToggleComplete?: () => void;
  togglingComplete?: boolean;
  onGoToNext?: () => void;
};

export function LessonViewerShell({
  slug,
  courseTitle,
  modules,
  lessonId,
  lessonTitle,
  children,
  notes,
  download,
  completedLessonIds = [],
  passedExamIds = [],
  progressPercent = 0,
  completedLessons = 0,
  totalLessons = 0,
  isLessonComplete = false,
  onToggleComplete,
  togglingComplete = false,
  onGoToNext,
}: LessonViewerShellProps) {
  const [mobileSyllabusOpen, setMobileSyllabusOpen] = useState(false);
  const nav = getLessonNavigation(modules, lessonId);
  const completedSet = new Set(completedLessonIds);
  const passedExamSet = new Set(passedExamIds);

  return (
    <LearnLightSurface className="min-h-screen">
      {/* Coursera-style learning bar */}
      <div className="sticky top-16 z-40 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href={`/learn/${slug}`}
            className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-700"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="hidden truncate sm:inline">Back to course home</span>
            <span className="truncate sm:hidden">Back</span>
          </Link>

          <p className="hidden min-w-0 flex-1 truncate px-4 text-center text-sm font-medium text-foreground md:block">
            {courseTitle}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 lg:hidden"
            onClick={() => setMobileSyllabusOpen(true)}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Course content</span>
            <span className="sm:hidden">Content</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px]">
        {/* Main lesson area */}
        <div className="min-w-0 flex-1">
          <div className="bg-black">{children}</div>

          <div className="space-y-6 bg-card px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {nav.moduleTitle && (
                  <p className={type.eyebrow}>
                    {nav.moduleTitle}
                  </p>
                )}
                <h1 className={`mt-1 ${type.pageTitle}`}>
                  {lessonTitle}
                </h1>
                <p className={`mt-2 ${type.caption}`}>
                  Lesson {nav.index} of {nav.total}
                </p>
              </div>
              {onToggleComplete && (
                <Button
                  variant={isLessonComplete ? "secondary" : "default"}
                  className="shrink-0 gap-2"
                  disabled={togglingComplete}
                  onClick={onToggleComplete}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isLessonComplete ? "Completed" : "Mark as complete"}
                </Button>
              )}
            </div>

            {totalLessons > 0 && (
              <CourseProgressBar
                percent={progressPercent}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
              />
            )}

            {notes}
            {download}

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              {nav.prev ? (
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href={`/learn/${slug}/lessons/${nav.prev._id}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="truncate">Previous: {nav.prev.title}</span>
                  </Link>
                </Button>
              ) : (
                <div />
              )}
              {nav.next && onGoToNext ? (
                <Button
                  className="justify-end gap-2 sm:ml-auto"
                  onClick={onGoToNext}
                >
                  <span className="truncate">Next: {nav.next.title}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button asChild variant="secondary" className="sm:ml-auto">
                  <Link href={`/learn/${slug}`}>Back to course home</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop syllabus */}
        <aside className="hidden w-[min(100%,360px)] shrink-0 border-l border-border bg-card lg:flex lg:flex-col lg:sticky lg:top-[7.25rem] lg:h-[calc(100vh-7.25rem)]">
          <div className="border-b border-border px-4 py-3">
            <CourseProgressBar
              percent={progressPercent}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
          </div>
          <SyllabusPanel
            slug={slug}
            modules={modules}
            currentLessonId={lessonId}
            completedLessonIds={completedSet}
            passedExamIds={passedExamSet}
          />
        </aside>
      </div>

      {/* Mobile syllabus drawer */}
      {mobileSyllabusOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close course content"
            onClick={() => setMobileSyllabusOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-semibold text-foreground">Course content</h2>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setMobileSyllabusOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SyllabusPanel
              slug={slug}
              modules={modules}
              currentLessonId={lessonId}
              completedLessonIds={completedSet}
              passedExamIds={passedExamSet}
              onLessonClick={() => setMobileSyllabusOpen(false)}
              className="min-h-0 flex-1"
            />
          </div>
        </div>
      )}
    </LearnLightSurface>
  );
}

export function LessonNotes({ content }: { content: string }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <FileText className="h-4 w-4 text-brand-600" />
          Lesson notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}

export function LessonDownload({ href }: { href: string }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="font-medium text-foreground">Lesson resources</p>
          <p className="text-sm text-muted-foreground">Download attached file</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
