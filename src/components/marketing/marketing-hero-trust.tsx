import { Star } from "lucide-react";
import { MARKETING_HERO_TRUST } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

function HeroStarRating() {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-amber-400 text-amber-400 sm:h-[18px] sm:w-[18px]"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

export function MarketingHeroTrust({ className }: { className?: string }) {
  const { ratings, subscribers } = MARKETING_HERO_TRUST;

  return (
    <div className={cn("relative z-10", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <HeroStarRating />
        <p className="text-base font-semibold text-white sm:text-lg">{ratings}</p>
      </div>
      <p className="mt-1 text-sm text-slate-300 sm:text-base">{subscribers}</p>
    </div>
  );
}
