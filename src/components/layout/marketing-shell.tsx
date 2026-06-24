"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { marketingPageClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(marketingPageClass, "relative", className)}>
      <div className="relative z-[1]">
        <Header />
        <main className="pb-8 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
