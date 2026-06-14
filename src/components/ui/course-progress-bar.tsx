import { cn } from "@/lib/utils";

type CourseProgressBarProps = {
  percent: number;
  completedLessons?: number;
  totalLessons?: number;
  className?: string;
  showLabel?: boolean;
};

export function CourseProgressBar({
  percent,
  completedLessons,
  totalLessons,
  className,
  showLabel = true,
}: CourseProgressBarProps) {
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">
            {safePercent}% complete
          </span>
          {completedLessons !== undefined && totalLessons !== undefined && (
            <span className="text-slate-400">
              {completedLessons}/{totalLessons} items
            </span>
          )}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
