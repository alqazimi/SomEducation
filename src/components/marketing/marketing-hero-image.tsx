"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/hero-student.png";

export function MarketingHeroImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[320px] xl:max-w-[380px]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-[5%] -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(0,82,255,0.22),transparent_72%)]"
        aria-hidden
      />
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={HERO_IMAGE}
          alt="Student learning on a laptop"
          fill
          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 32vw, 380px"
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}
