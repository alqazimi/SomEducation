/** Shared type scale — editorial, restrained, human-readable. */
export const type = {
  display:
    "text-[1.5rem] font-medium leading-[1.3] tracking-[-0.02em] text-foreground sm:text-[1.75rem]",
  pageTitle:
    "text-lg font-medium leading-snug tracking-[-0.015em] text-foreground sm:text-[1.375rem]",
  sectionTitle:
    "text-base font-medium leading-snug tracking-[-0.01em] text-foreground",
  cardTitle: "text-[0.9375rem] font-medium leading-snug text-foreground",
  eyebrow:
    "text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground",
  lead: "text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base",
  body: "text-[0.9375rem] leading-relaxed text-foreground/90 sm:text-base",
  bodySm: "text-sm leading-relaxed text-muted-foreground",
  muted: "text-sm leading-normal text-muted-foreground",
  caption: "text-xs leading-normal text-muted-foreground",
  stat: "text-lg font-medium tabular-nums tracking-tight text-foreground sm:text-xl",
  price: "text-lg font-medium tabular-nums tracking-tight text-foreground sm:text-xl",
  nav: "text-sm font-medium text-muted-foreground",
} as const;
