/** Public site pages that use the dark marketing chrome (not dashboard / learn player). */
export function isMarketingSitePath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/learn")) return false;
  return true;
}

export const marketingPageClass =
  "min-h-screen bg-[#080c16] text-white";

export const marketingMutedText = "text-slate-400";

export const marketingCardClass =
  "rounded-2xl border border-white/10 bg-[#141c30]";
