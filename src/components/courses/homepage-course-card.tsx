import Link from "next/link";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

export type HomepageCourseCardProps = {
  href: string;
  title: string;
  thumbnailUrl?: string | null;
  enrollmentCount?: number;
  durationHours?: number;
  lessonCount?: number;
  price?: number;
  currency?: string;
  compareAtPrice?: number;
  difficulty?: string;
  rating?: number;
  className?: string;
};

export function HomepageCourseCard({
  href,
  title,
  thumbnailUrl,
  enrollmentCount = 0,
  durationHours,
  lessonCount,
  price = 0,
  currency = "USD",
  compareAtPrice,
  difficulty,
  rating = 4.8,
  className,
}: HomepageCourseCardProps) {
  const isFree = price === 0;
  const hasDiscount =
    !isFree &&
    compareAtPrice !== undefined &&
    compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0;
  const studentsLabel =
    enrollmentCount > 0
      ? enrollmentCount >= 1000
        ? `${(enrollmentCount / 1000).toFixed(1)}K`
        : `${enrollmentCount}`
      : "New";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-marketing-border bg-marketing-card shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-brand-500/50 hover:bg-marketing-card-hover hover:shadow-lg",
        className
      )}
    >
      <Link href={href} className="block p-2.5 pb-0">
        <div className="relative h-[170px] overflow-hidden rounded-lg bg-marketing-elevated sm:h-[180px]">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-600/15">
              <BookOpen className="h-10 w-10 text-brand-400/50" />
            </div>
          )}

          {isFree && (
            <Badge className="absolute left-2 top-2 border-0 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              Free
            </Badge>
          )}

          {hasDiscount && discountPercent > 0 && (
            <Badge className="absolute left-2 top-2 border-0 bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              {discountPercent}% OFF
            </Badge>
          )}

          {difficulty && (
            <Badge className="absolute right-2 top-2 border-0 bg-marketing-badge px-2 py-0.5 text-[10px] font-semibold capitalize text-marketing-badge-fg backdrop-blur-sm">
              {difficulty}
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="mb-2 flex items-center gap-3 text-[11px] text-marketing-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-brand-400" />
            {studentsLabel} students
          </span>
          {durationHours !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-brand-400" />
              {durationHours}h
            </span>
          )}
          {lessonCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-brand-400" />
              {lessonCount}
            </span>
          )}
        </div>

        <Link href={href}>
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-marketing-fg transition-colors group-hover:text-brand-600">
            {title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-marketing-muted">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-marketing-fg-subtle">
            {rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            {isFree ? (
              <p className="text-base font-bold text-emerald-400">FREE</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {hasDiscount && (
                  <span className="text-xs text-marketing-muted line-through">
                    {formatPrice(compareAtPrice!, currency)}
                  </span>
                )}
                <span className="text-base font-bold text-marketing-fg">
                  {formatPrice(price, currency)}
                </span>
              </div>
            )}
          </div>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 shrink-0 rounded-lg border-marketing-border bg-transparent px-3 text-xs text-marketing-fg-subtle transition-colors group-hover:border-brand-500 group-hover:bg-brand-600 group-hover:text-white"
          >
            <Link href={href}>View</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
