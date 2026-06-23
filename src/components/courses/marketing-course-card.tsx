import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MarketingCourseCardProps = {
  href: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  difficulty?: string;
  durationHours?: number;
  lessonCount?: number;
  enrollmentCount?: number;
  bestseller?: boolean;
  className?: string;
};

export function MarketingCourseCard({
  href,
  title,
  description,
  thumbnailUrl,
  difficulty,
  durationHours,
  lessonCount,
  enrollmentCount,
  bestseller = true,
  className,
}: MarketingCourseCardProps) {
  const studentsLabel =
    enrollmentCount && enrollmentCount > 0
      ? enrollmentCount >= 1000
        ? `${(enrollmentCount / 1000).toFixed(1)}K Students`
        : `${enrollmentCount} Students`
      : "New course";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141c30] transition-all hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-600/10",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={href}
          className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#0d1324] sm:aspect-auto sm:w-44 md:w-52 lg:w-56"
        >
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:min-h-[180px]"
            />
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center bg-brand-600/20 sm:min-h-[180px]">
              <BookOpen className="h-12 w-12 text-brand-400/60" />
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {difficulty && (
              <Badge className="rounded-md border-0 bg-brand-600/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-300">
                {difficulty}
              </Badge>
            )}
            {bestseller && (
              <Badge className="rounded-md border-0 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Bestseller
              </Badge>
            )}
          </div>

          <Link href={href}>
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white transition-colors group-hover:text-brand-300">
              {title}
            </h3>
          </Link>

          {description && (
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {durationHours !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand-400" />
                {durationHours} Hours
              </span>
            )}
            {lessonCount !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand-400" />
                {lessonCount} Lessons
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-brand-400" />
              {studentsLabel}
            </span>
          </div>
        </div>
      </div>

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
