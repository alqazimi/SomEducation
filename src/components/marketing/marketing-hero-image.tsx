"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/hero-student.png";

export function MarketingHeroImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-xs mx-auto sm:max-w-sm lg:mx-0 lg:max-w-[min(100%,420px)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#0052ff]/25 blur-[90px]"
        aria-hidden
      />
      <div className="relative aspect-[522/713] w-full">
        <Image
          src={HERO_IMAGE}
          alt="Student learning on a laptop"
          fill
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 36vw, 420px"
          className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,82,255,0.15)]"
          priority
        />
      </div>
    </div>
  );
}
