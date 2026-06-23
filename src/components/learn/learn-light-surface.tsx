import { cn } from "@/lib/utils";

/** Forces readable light UI on learning pages regardless of day/night theme. */
export function LearnLightSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-surface="learn-light" className={cn("text-foreground", className)}>
      {children}
    </div>
  );
}
