/** Hardcoded marketing copy — not loaded from Convex. Same on all themes and screen sizes. */
export const MARKETING_HERO = {
  eyebrow: "Transform Your Future",
  headlineBefore: "Learn a skill or ",
  headlineHighlight: "teach!",
  subheadline:
    "Make learning and teaching more effective with active participation and student collaboration.",
} as const;

/** Kept for imports; identical copy so day/night always show the same hero text. */
export const MARKETING_HERO_DAY = MARKETING_HERO;
