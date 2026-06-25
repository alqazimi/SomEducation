import { Star } from "lucide-react";
import { MARKETING_HERO_TRUST } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

function HeroStarRating() {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-amber-400 text-amber-400"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

export function MarketingHeroTrust({ className }: { className?: string }) {
  const { avatars, ratings, subscribers } = MARKETING_HERO_TRUST;

  return (
    <div className={cn("relative z-10 flex items-center gap-3", className)}>
      <div className="flex -space-x-4">
        {avatars.map((avatar, index) => (
          <img
            key={avatar.id}
            src={avatar.image}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
            className="h-11 w-11 rounded-full border-2 border-[#0a0e1a] object-cover grayscale ring-2 ring-[#0a0e1a]"
            style={{ zIndex: avatars.length - index }}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <HeroStarRating />
          <p className="font-medium text-white">{ratings}</p>
        </div>
        <p className="text-sm text-slate-400">{subscribers}</p>
      </div>
    </div>
  );
}
