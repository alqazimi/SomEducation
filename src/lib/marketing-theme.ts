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

export const marketingPageClass =
  "marketing-page min-h-screen bg-marketing-bg text-marketing-fg";

export const marketingBackgroundClass = "bg-marketing-bg";

export const marketingMutedText = "text-marketing-muted";

export const marketingCardClass =
  "rounded-2xl border border-marketing-border bg-marketing-card shadow-sm";

export const marketingHeaderClassDay =
  "border-b border-slate-200 bg-white/95 text-slate-900";

export const marketingHeaderClassNight =
  "border-transparent bg-[#0a0e1a] text-white";

/** Dashboard header — still follows global day/night tokens. */
export const dashboardHeaderClass =
  "border-b border-marketing-border bg-marketing-bg/95";

export const marketingFooterClassDay =
  "border-slate-200 bg-white text-slate-600";

export const marketingFooterClassNight =
  "border-white/10 bg-[#01040f] text-slate-400";

export const marketingElevatedClass = "bg-marketing-elevated";

export const marketingPanelClass = "bg-marketing-panel";

export const marketingInputClass =
  "border-marketing-border bg-marketing-elevated text-marketing-fg";

export const marketingCtaDarkButtonClass =
  "bg-marketing-bg hover:bg-marketing-panel text-marketing-fg";

export const marketingPageHeaderClass = "marketing-page-header";

export const marketingPageHeaderEyebrowClass = "marketing-page-header-eyebrow";

export const marketingPageHeaderTitleClass = "text-marketing-fg";

export const marketingPageHeaderMutedClass = "marketing-page-header-muted";

export const marketingHeadingClass = "text-marketing-fg";

export const marketingLinkClass =
  "text-marketing-muted transition-colors hover:text-brand-600";

export const marketingLinkClassNight =
  "text-marketing-muted transition-colors hover:text-brand-400";

/** Dashboard chrome — follows the same day/night tokens as marketing. */
export const dashboardShellClass = "min-h-screen bg-muted text-foreground";

export const dashboardSidebarClass =
  "sticky top-20 max-h-[calc(100vh-6rem)] space-y-1 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-sm";

export function dashboardNavLinkClass(active: boolean, isNight: boolean) {
  if (active) {
    return isNight
      ? "bg-brand-600/15 text-brand-400"
      : "bg-brand-50 text-brand-700";
  }
  return isNight
    ? "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    : "text-muted-foreground hover:bg-muted hover:text-foreground";
}

