"use client";

import { useParams } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { ExamTaker } from "@/features/learn/exam-taker";

export default function ExamPage() {
  const params = useParams<{ slug: string; examId: string }>();

  return (
    <ExamTaker
      slug={params.slug}
      examId={params.examId as Id<"exams">}
    />
  );
}
