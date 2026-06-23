import { cn } from "@/lib/utils";

/**
 * Mockup-aligned band: white background for course grids in night mode
 * (dark hero/stats above, blue CTA + dark footer below).
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
        "bg-marketing-bg pt-2 text-marketing-fg sm:pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
