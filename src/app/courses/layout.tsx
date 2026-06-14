import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse SomEducation courses — expert-led programs with structured lessons and exams.",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
