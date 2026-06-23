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
        "bg-marketing-bg pt-0 text-marketing-fg sm:pt-1 lg:pt-2",
        className
      )}
    >
      {children}
    </div>
  );
}
