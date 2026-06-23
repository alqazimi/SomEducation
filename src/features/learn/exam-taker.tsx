"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  XCircle,
} from "lucide-react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { LearnLightSurface } from "@/components/learn/learn-light-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/ui/typography";
import { type } from "@/lib/typography";
import { cn } from "@/lib/utils";

type ExamTakerProps = {
  slug: string;
  examId: Id<"exams">;
};

export function ExamTaker({ slug, examId }: ExamTakerProps) {
  const examData = useQuery(api.exams.getExamToTake, { examId });
  const submitAttempt = useMutation(api.exams.submitAttempt);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultAttemptId, setResultAttemptId] =
    useState<Id<"examAttempts"> | null>(null);

  const result = useQuery(
    api.exams.getAttemptResult,
    resultAttemptId ? { attemptId: resultAttemptId } : "skip"
  );

  async function handleSubmit() {
    if (!examData) return;

    const payload = examData.questions.map((q) => ({
      questionId: q._id,
      selectedOptionId: answers[q._id] ?? "",
    }));

    if (payload.some((a) => !a.selectedOptionId)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitAttempt({ examId, answers: payload });
      setResultAttemptId(response.attemptId);
      if (response.passed) {
        toast.success(`Passed with ${response.scorePercent}%`);
      } else {
        toast.message(`Score: ${response.scorePercent}% — keep practicing!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (examData === undefined) {
    return (
      <>
        <Header />
        <LearnLightSurface className="min-h-screen">
          <main className="mx-auto max-w-3xl px-4 py-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-6 h-96 w-full rounded-xl" />
          </main>
        </LearnLightSurface>
      </>
    );
  }

  if (!examData) {
    return (
      <>
        <Header />
        <LearnLightSurface className="min-h-screen">
          <main className="flex min-h-[60vh] items-center justify-center px-4">
            <Card className="w-full max-w-md border-border bg-card text-center">
              <CardContent className="py-12">
                <PageTitle>Exam not found</PageTitle>
                <Link href={`/learn/${slug}`} className="mt-4 inline-block">
                  <Button variant="outline">Back to course</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </LearnLightSurface>
      </>
    );
  }

  if (result && resultAttemptId) {
    return (
      <>
        <Header />
        <LearnLightSurface className="min-h-screen">
          <main>
            <div className="border-b border-border bg-card">
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                <Link
                  href={`/learn/${slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to course home
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h1 className={type.pageTitle}>{result.exam.title}</h1>
                  <Badge variant={result.attempt.passed ? "default" : "secondary"}>
                    {result.attempt.passed ? "Passed" : "Not passed"}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Your score:{" "}
                  <span className="font-semibold text-foreground">
                    {result.attempt.scorePercent}%
                  </span>{" "}
                  · Need {result.exam.passingScore}% to pass
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
              {result.breakdown.map((item, index) => (
                <Card key={item.questionId} className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-start gap-2 text-base text-foreground">
                      {item.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                      )}
                      <span>
                        {index + 1}. {item.questionText}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {item.options.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "rounded-lg border border-border px-3 py-2",
                          option.id === item.correctOptionId &&
                            "border-emerald-200 bg-emerald-50",
                          option.id === item.selectedOptionId &&
                            option.id !== item.correctOptionId &&
                            "border-red-200 bg-red-50"
                        )}
                      >
                        {option.text}
                        {option.id === item.correctOptionId && (
                          <span className="ml-2 text-xs font-medium text-emerald-700">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                    {item.explanation && (
                      <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
                        {item.explanation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex flex-wrap gap-3 pt-4">
                <Button asChild variant="outline">
                  <Link href={`/learn/${slug}`}>Back to course</Link>
                </Button>
                {examData.exam.maxAttempts === 0 ||
                examData.exam.attemptsUsed + 1 < examData.exam.maxAttempts ? (
                  <Button
                    onClick={() => {
                      setResultAttemptId(null);
                      setAnswers({});
                    }}
                  >
                    Try Again
                  </Button>
                ) : null}
              </div>
            </div>
          </main>
        </LearnLightSurface>
      </>
    );
  }

  return (
    <>
      <Header />
      <LearnLightSurface className="min-h-screen">
        <main>
          <div className="border-b border-border bg-card">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
              <Link
                href={`/learn/${slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to course home
              </Link>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {examData.moduleTitle}
                  </p>
                  <h1 className={type.pageTitle}>{examData.exam.title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {examData.exam.questionCount} questions · Pass{" "}
                    {examData.exam.passingScore}%
                    {examData.exam.timeLimitMinutes
                      ? ` · ${examData.exam.timeLimitMinutes} min limit`
                      : ""}
                    {examData.exam.maxAttempts > 0
                      ? ` · Attempt ${examData.exam.attemptsUsed + 1} of ${examData.exam.maxAttempts}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
            {examData.questions.map((question, index) => (
              <Card key={question._id} className="border-border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">
                    {index + 1}. {question.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted",
                        answers[question._id] === option.id &&
                          "border-brand-300 bg-brand-50"
                      )}
                    >
                      <input
                        type="radio"
                        name={question._id}
                        checked={answers[question._id] === option.id}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question._id]: option.id,
                          }))
                        }
                      />
                      {option.text}
                    </label>
                  ))}
                </CardContent>
              </Card>
            ))}

            <div className="sticky bottom-4 flex justify-end pt-2">
              <Button
                size="lg"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? "Submitting..." : "Submit Exam"}
              </Button>
            </div>
          </div>
        </main>
      </LearnLightSurface>
    </>
  );
}
