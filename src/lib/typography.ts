/** Shared type scale — editorial, restrained, human-readable. */
export const type = {
  display:
    "text-[1.5rem] font-medium leading-[1.3] tracking-[-0.02em] text-stone-900 sm:text-[1.75rem]",
  pageTitle:
    "text-lg font-medium leading-snug tracking-[-0.015em] text-stone-900 sm:text-[1.375rem]",
  sectionTitle:
    "text-base font-medium leading-snug tracking-[-0.01em] text-stone-900",
  cardTitle: "text-[0.9375rem] font-medium leading-snug text-stone-900",
  eyebrow:
    "text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-stone-500",
  lead: "text-[0.9375rem] leading-relaxed text-stone-600 sm:text-base",
  body: "text-[0.9375rem] leading-relaxed text-stone-700 sm:text-base",
  bodySm: "text-sm leading-relaxed text-stone-600",
  muted: "text-sm leading-normal text-stone-500",
  caption: "text-xs leading-normal text-stone-500",
  stat: "text-lg font-medium tabular-nums tracking-tight text-stone-900 sm:text-xl",
  price: "text-lg font-medium tabular-nums tracking-tight text-stone-900 sm:text-xl",
  nav: "text-sm font-medium text-stone-600",
} as const;
