import { BookOpen, GraduationCap, ShieldCheck, Users } from "lucide-react";

/** Hardcoded marketing copy — not loaded from Convex. */
export const MARKETING_HERO = {
  rating: "4.8",
  studentsLabel: "500+ active students",
  eyebrow: "Transform Your Future",
  headline: "Learn a skill or teach!",
  subheadline:
    "Make learning more effective with practical courses, expert instructors, and flexible study at your own pace.",
} as const;

export const MARKETING_STATS = [
  { icon: Users, value: "500+", label: "Happy Students" },
  { icon: BookOpen, value: "20+", label: "Online Courses" },
  { icon: GraduationCap, value: "10+", label: "Expert Instructors" },
  { icon: ShieldCheck, value: "100%", label: "Trusted Platform" },
] as const;
