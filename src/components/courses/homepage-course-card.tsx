import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

export type HomepageCourseCardProps = {
  href: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  enrollmentCount?: number;
  durationHours?: number;
  lessonCount?: number;
  price?: number;
  currency?: string;
  compareAtPrice?: number;
  difficulty?: string;
  bestseller?: boolean;
  showPrice?: boolean;
  className?: string;
};

export function HomepageCourseCard({
  href,
  title,
  description,
  thumbnailUrl,
  enrollmentCount = 0,
  durationHours,
  lessonCount,
  price = 0,
  currency = "USD",
  compareAtPrice,
  difficulty,
  bestseller = false,
  showPrice = false,
  className,
}: HomepageCourseCardProps) {
  const isFree = price === 0;
  const hasDiscount =
    !isFree &&
    compareAtPrice !== undefined &&
    compareAtPrice > price;
  const studentsLabel =
    enrollmentCount > 0
      ? enrollmentCount >= 1000
        ? `${(enrollmentCount / 1000).toFixed(1)}K Students`
        : `${enrollmentCount} Students`
      : "New";

  return (
    <article
      className={cn(
        "marketing-course-card group relative flex h-full gap-3.5 rounded-2xl border border-marketing-border bg-marketing-card p-4 transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-brand-500/40",
        "flex-row sm:gap-4 lg:flex-col lg:gap-0 lg:p-5",
        className
      )}
    >
      <Link href={href} className="shrink-0 lg:block">
        <div
          className={cn(
            "marketing-course-card-icon flex items-center justify-center overflow-hidden rounded-xl",
            "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20",
            "lg:mb-4 lg:h-24 lg:w-full"
          )}
        >
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <BookOpen className="h-8 w-8 text-brand-600/70 sm:h-10 sm:w-10" />
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col pb-10 lg:pb-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 lg:mb-2 lg:gap-2">
          {difficulty && (
            <Badge className="rounded-md border-0 bg-marketing-badge px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-marketing-badge-fg">
              {difficulty}
            </Badge>
          )}
          {bestseller && (
            <Badge className="rounded-md border-0 bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Bestseller
            </Badge>
          )}
          {isFree && (
            <Badge className="rounded-md border-0 bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Free
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="rounded-md border-0 bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Sale
            </Badge>
          )}
        </div>

        <Link href={href}>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-marketing-fg transition-colors group-hover:text-brand-600 sm:text-base">
            {title}
          </h3>
        </Link>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-marketing-muted sm:mt-2 sm:text-sm lg:flex-1">
            {description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-marketing-muted sm:mt-3 sm:gap-x-4 sm:text-[11px] lg:mt-4 lg:pr-12">
          {durationHours !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-brand-600 sm:h-3.5 sm:w-3.5" />
              {durationHours} Hours
            </span>
          )}
          {lessonCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-brand-600 sm:h-3.5 sm:w-3.5" />
              {lessonCount} Lessons
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-brand-600 sm:h-3.5 sm:w-3.5" />
            {studentsLabel}
          </span>
        </div>

        {showPrice && !isFree && (
          <p className="mt-2 text-sm font-semibold text-marketing-fg lg:mt-3">
            {formatPrice(price, currency)}
          </p>
        )}
      </div>

      <Link
        href={href}
        className="absolute bottom-3.5 right-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-transform hover:scale-105 hover:bg-brand-500 sm:bottom-4 sm:right-4 sm:h-10 sm:w-10 lg:bottom-5 lg:right-5"
        aria-label={`View ${title}`}
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
