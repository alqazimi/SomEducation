"use client";

import Image from "next/image";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/hero-student.png";

export function MarketingHeroImage({ className }: { className?: string }) {
  const { isNight } = useMarketingTheme();

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[280px] sm:max-w-xs lg:mx-0 lg:max-w-[min(100%,360px)]",
        className
      )}
    >
      {isNight ? (
        <div
          className="pointer-events-none absolute inset-[5%] -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(0,82,255,0.22),transparent_72%)]"
          aria-hidden
        />
      ) : (
        <div
          className="pointer-events-none absolute bottom-[6%] left-[10%] right-[10%] -z-10 h-[18%] rounded-full bg-slate-900/8 blur-2xl"
          aria-hidden
        />
      )}
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={HERO_IMAGE}
          alt="Student learning on a laptop"
          fill
          sizes="(max-width: 768px) 72vw, (max-width: 1200px) 32vw, 360px"
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}
