import { cn } from "@/lib/utils";

/**
 * Course grids and catalog bands — follow global day/night theme.
 * Hero stays dark via MarketingHeroZone (.marketing-hero-night).
 */
export function MarketingCoursesSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-surface="courses-light"
      className={cn(
        "marketing-courses-band relative z-[1] isolate pt-6 sm:pt-8 lg:pt-10",
        className
      )}
    >
      {children}
    </div>
  );
}
