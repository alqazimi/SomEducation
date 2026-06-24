import { cn } from "@/lib/utils";

/** Learning pages follow the global day/night theme (Continue Learning, lessons, exams). */
export function LearnLightSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-surface="learn"
      className={cn("min-h-screen bg-background text-foreground", className)}
    >
      {children}
    </div>
  );
}
