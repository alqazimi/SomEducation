import { cn } from "@/lib/utils";

/**
 * Mockup-aligned band: white background for course grids in night mode
 * (dark hero above, blue CTA + dark footer below).
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
