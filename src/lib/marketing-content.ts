/** Hardcoded marketing copy — not loaded from Convex. */
export const MARKETING_HERO = {
  rating: "4.8",
  studentsLabel: "500+ active students",
  eyebrow: "Transform Your Future",
  headline: "Learn a skill or teach!",
  subheadline:
    "Make learning more effective with practical courses, expert instructors, and flexible study at your own pace.",
} as const;

export const MARKETING_HERO_DAY = {
  rating: "4.8/5",
  studentsLabel: "from 500+ students",
  eyebrow: "Online Learning",
  headlineBefore: "Learn new skills. Achieve ",
  headlineHighlight: "your goals.",
  subheadline:
    "Expert-led courses you can study at your own pace — practical skills, clear paths, and support when you need it.",
} as const;

export const MARKETING_STATS = [
  { icon: "users" as const, value: "500+", label: "Happy Students" },
  { icon: "courses" as const, value: "20+", label: "Expert Courses" },
  { icon: "teachers" as const, value: "10+", label: "Qualified Teachers" },
  { icon: "satisfaction" as const, value: "100%", label: "Satisfaction" },
] as const;
