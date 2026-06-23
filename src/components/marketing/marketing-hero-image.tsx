"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_ILLUSTRATION = "/images/hero-illustration.svg";

export function MarketingHeroImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[320px] sm:max-w-[380px] md:mx-0 md:max-w-[440px] lg:max-w-[480px]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#0052ff]/25 blur-[90px]"
        aria-hidden
      />
      <div className="relative aspect-[6/5] w-full">
        <Image
          src={HERO_ILLUSTRATION}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 44vw, 480px"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
