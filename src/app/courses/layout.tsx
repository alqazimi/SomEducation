import type { Metadata } from "next";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildPageTitle("Courses"),
  description:
    "Browse SomEducation courses — expert-led online programs with structured lessons, exams, and career-focused skills.",
  alternates: {
    canonical: absoluteUrl("/courses"),
  },
  openGraph: {
    title: buildPageTitle("Courses"),
    description:
      "Browse SomEducation courses — expert-led online programs with structured lessons and exams.",
    url: absoluteUrl("/courses"),
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
