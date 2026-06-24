import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CourseHoverPreview,
  type CourseHoverPreviewData,
} from "@/components/courses/course-hover-preview";
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
  teacherName?: string;
  categoryName?: string;
  hasFreePreview?: boolean;
  bestseller?: boolean;
  showPrice?: boolean;
  hoverPreview?: boolean;
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
  teacherName,
  categoryName,
  hasFreePreview = false,
  bestseller = false,
  showPrice = false,
  hoverPreview = true,
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

  const previewData: CourseHoverPreviewData = {
    href,
    title,
    description,
    thumbnailUrl,
    teacherName,
    categoryName,
    enrollmentCount,
    durationHours,
    lessonCount,
    price,
    currency,
    compareAtPrice,
    difficulty,
    bestseller,
    hasFreePreview,
    showPrice,
  };

  const card = (
    <article
      className={cn(
        "marketing-course-card group flex h-full flex-col overflow-hidden rounded-2xl border border-marketing-border bg-marketing-card shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-md",
        className
      )}
    >
      <Link href={href} className="block">
        <div className="marketing-course-card-icon relative aspect-[16/10] w-full overflow-hidden">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-brand-600/70" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
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
            <Badge className="rounded-md border-0 bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Free
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="rounded-md border-0 bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
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

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-marketing-muted">
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

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-marketing-border pt-4">
          {showPrice ? (
            <div className="min-w-0">
              {isFree ? (
                <p className="text-sm font-semibold text-emerald-600">Free</p>
              ) : (
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-base font-bold text-marketing-fg">
                    {formatPrice(price, currency)}
                  </p>
                  {hasDiscount && (
                    <p className="text-sm text-marketing-muted line-through">
                      {formatPrice(compareAtPrice!, currency)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span />
          )}

          <Link
            href={href}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition-transform hover:scale-105 hover:bg-brand-500"
            aria-label={`View ${title}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );

  if (!hoverPreview) return card;

  return (
    <CourseHoverPreview preview={previewData} className="h-full">
      {card}
    </CourseHoverPreview>
  );
}
