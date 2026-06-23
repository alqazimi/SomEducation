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
        "marketing-course-card group relative flex h-full flex-col rounded-2xl border border-marketing-border bg-marketing-card p-5 transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-brand-500/40",
        className
      )}
    >
      <Link href={href} className="block">
        <div className="marketing-course-card-icon mb-4 flex h-24 items-center justify-center overflow-hidden rounded-xl">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <BookOpen className="h-10 w-10 text-brand-600/70" />
          )}
        </div>
      </Link>

      <div className="mb-2 flex flex-wrap items-center gap-2">
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
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-marketing-fg transition-colors group-hover:text-brand-600">
          {title}
        </h3>
      </Link>

      {description && (
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-marketing-muted">
          {description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 pr-12 text-[11px] text-marketing-muted">
        {durationHours !== undefined && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            {durationHours} Hours
          </span>
        )}
        {lessonCount !== undefined && (
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-brand-600" />
            {lessonCount} Lessons
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-brand-600" />
          {studentsLabel}
        </span>
      </div>

      {showPrice && !isFree && (
        <p className="mt-3 text-sm font-semibold text-marketing-fg">
          {formatPrice(price, currency)}
        </p>
      )}

      <Link
        href={href}
        className="absolute bottom-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-transform hover:scale-105 hover:bg-brand-500"
        aria-label={`View ${title}`}
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
