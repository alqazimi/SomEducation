/** Public site pages that use the dark marketing chrome (not dashboard / learn player). */
export function isMarketingSitePath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/learn")) return false;
  return true;
}

/** Mockup-aligned marketing palette — deep navy + electric blue (night). */
export const MARKETING_COLORS = {
  background: "#0a0e1a",
  backgroundFooter: "#01040f",
  backgroundCard: "#0f172a",
  backgroundCardHover: "#151f3d",
  backgroundElevated: "#0b1224",
  backgroundPanel: "#0c1328",
  accent: "#0052ff",
  accentGlow: "#0033ff",
  textMuted: "#94a3b8",
} as const;

export const marketingPageClass = "min-h-screen bg-marketing-bg text-marketing-fg";

export const marketingBackgroundClass = "bg-marketing-bg";

export const marketingMutedText = "text-marketing-muted";

export const marketingCardClass =
  "rounded-2xl border border-marketing-border bg-marketing-card shadow-sm";

export const marketingHeaderClass =
  "border-b border-marketing-border bg-marketing-bg/95";

export const marketingFooterClass =
  "border-marketing-border bg-marketing-bg-footer text-marketing-muted";

export const marketingElevatedClass = "bg-marketing-elevated";

export const marketingPanelClass = "bg-marketing-panel";

export const marketingInputClass =
  "border-marketing-border bg-marketing-elevated text-marketing-fg";

export const marketingCtaDarkButtonClass =
  "bg-marketing-bg hover:bg-marketing-panel text-marketing-fg";

export const marketingHeroClass = "bg-marketing-hero";

export const marketingHeadingClass = "text-marketing-fg";

export const marketingLinkClass =
  "text-marketing-muted transition-colors hover:text-brand-600";

export const marketingLinkClassNight =
  "text-marketing-muted transition-colors hover:text-brand-400";
