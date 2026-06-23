/** Hardcoded marketing copy — not loaded from Convex. */
export const MARKETING_HERO = {
  eyebrow: "Online Learning",
  headlineBefore: "Learn Today. Build ",
  headlineHighlight: "Tomorrow.",
  subheadline:
    "Practical courses. Expert instructors. Learn at your own pace.",
} as const;

export const MARKETING_HERO_DAY = {
  eyebrow: "Online Learning",
  headlineBefore: "Learn new skills. Achieve ",
  headlineHighlight: "your goals.",
  subheadline:
    "Expert-led courses you can study at your own pace — practical skills, clear paths, and support when you need it.",
} as const;

export const MARKETING_STATS = [
  { icon: "users" as const, value: "500+", label: "Happy Students" },
  { icon: "courses" as const, value: "20+", label: "Courses" },
  { icon: "teachers" as const, value: "10+", label: "Expert Instructors" },
  { icon: "satisfaction" as const, value: "100%", label: "Trusted Platform" },
] as const;
