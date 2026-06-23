"use client";

import Image from "next/image";
import { GraduationCap, Play } from "lucide-react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { MARKETING_HERO_IMAGE } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

export function MarketingHeroImage({ className }: { className?: string }) {
  const { isNight } = useMarketingTheme();

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:mx-0 md:max-w-[440px] lg:max-w-[480px]",
        className
      )}
    >
      {isNight && (
        <div
          className="pointer-events-none absolute inset-x-4 bottom-6 top-8 -z-10 rounded-full bg-[#0052ff]/35 blur-[80px]"
          aria-hidden
        />
      )}

      {isNight && (
        <>
          <div
            className="pointer-events-none absolute -left-2 top-[18%] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40"
            aria-hidden
          >
            <GraduationCap className="h-5 w-5" />
          </div>
          <div
            className="pointer-events-none absolute -right-1 top-[42%] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/90 text-white shadow-lg shadow-brand-600/30"
            aria-hidden
          >
            <Play className="h-4 w-4 fill-current" />
          </div>
        </>
      )}

      <div className="relative aspect-[4/5] w-full sm:aspect-[5/6]">
        <Image
          src={MARKETING_HERO_IMAGE}
          alt="Student learning online with a laptop"
          fill
          sizes="(max-width: 768px) 85vw, (max-width: 1200px) 42vw, 480px"
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}
