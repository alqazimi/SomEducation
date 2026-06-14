import Link from "next/link";
import { BookOpen, PlayCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseProgressBar } from "@/components/ui/course-progress-bar";
import { cn, formatPrice } from "@/lib/utils";

type CourseCardProps = {
  href: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  difficulty?: string;
  categoryName?: string;
  price?: number;
  currency?: string;
  teacherName?: string;
  moduleCount?: number;
  lessonCount?: number;
  actionLabel?: string;
  actionHref?: string;
  variant?: "browse" | "enrolled";
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  className?: string;
};

export function CourseCard({
  href,
  title,
  description,
  thumbnailUrl,
  difficulty,
  categoryName,
  price,
  currency = "USD",
  teacherName,
  moduleCount,
  lessonCount,
  actionLabel,
  actionHref,
  variant = "browse",
  progressPercent,
  completedLessons,
  totalLessons,
  className,
}: CourseCardProps) {
  const isEnrolled = variant === "enrolled";

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border-border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100">
              <BookOpen className="h-10 w-10 text-brand-200" />
            </div>
          )}
          {isEnrolled && (
            <div className="absolute left-3 top-3">
              <Badge className="bg-white/95 text-foreground shadow-sm">
                Enrolled
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {difficulty && (
            <Badge variant="secondary" className="capitalize">
              {difficulty}
            </Badge>
          )}
          {categoryName && <Badge variant="outline">{categoryName}</Badge>}
        </div>

        <Link href={href} className="block">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-700 sm:text-lg">
            {title}
          </h3>
        </Link>

        {teacherName && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{teacherName}</span>
          </p>
        )}

        {description && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">
            {description}
          </p>
        )}

        {(moduleCount !== undefined || lessonCount !== undefined) && (
          <p className="mt-3 text-xs text-slate-400">
            {moduleCount ?? 0} modules · {lessonCount ?? 0} lessons
          </p>
        )}

        {isEnrolled && progressPercent !== undefined && (
          <div className="mt-3">
            <CourseProgressBar
              percent={progressPercent}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          {!isEnrolled && price !== undefined ? (
            <span className="text-lg font-bold text-brand-600">
              {formatPrice(price, currency)}
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-600">
              {progressPercent !== undefined && progressPercent >= 100
                ? "Completed"
                : "Continue your progress"}
            </span>
          )}

          {actionLabel && actionHref ? (
            <Button asChild size="sm" className="shrink-0">
              <Link href={actionHref}>
                <PlayCircle className="h-4 w-4" />
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href={href}>View course</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
