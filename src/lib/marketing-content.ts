import { BookOpen, GraduationCap, ShieldCheck, Users } from "lucide-react";

/** Hardcoded marketing copy — not loaded from Convex. */
export const MARKETING_HERO = {
  rating: "4.8/5",
  studentsLabel: "500+ students",
  headline: "Learn skills. Build your",
  headlineAccent: "future.",
  subheadline:
    "Practical courses from industry experts. Study anytime, anywhere.",
} as const;

export const MARKETING_STATS = [
  { icon: Users, value: "500+", label: "Happy Students" },
  { icon: BookOpen, value: "20+", label: "Online Courses" },
  { icon: GraduationCap, value: "10+", label: "Expert Instructors" },
  { icon: ShieldCheck, value: "100%", label: "Trusted Platform" },
] as const;

export const MARKETING_AVATAR_COLORS = [
  "bg-brand-600",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
] as const;
