"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { marketingPageClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

function MarketingAmbientBackground() {
  const { isNight } = useMarketingTheme();

  if (!isNight) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#0052ff]/20 blur-[120px]" />
      <div className="absolute -left-32 top-[38%] h-80 w-80 rounded-full bg-[#0033ff]/12 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#0052ff]/10 blur-[90px]" />
      <div
        className="marketing-dot-grid absolute right-0 top-0 h-72 w-72 opacity-40"
        aria-hidden
      />
    </div>
  );
}

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(marketingPageClass, "relative", className)}>
      <MarketingAmbientBackground />
      <div className="relative z-[1]">
        <Header />
        <main className="pb-8 pt-16">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
