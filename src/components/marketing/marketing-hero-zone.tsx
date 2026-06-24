import { cn } from "@/lib/utils";

/** Dark hero block above the courses band — always night styled. */
export function MarketingHeroZone({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "marketing-hero-night relative overflow-x-clip pb-4 sm:pb-5",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-[#0052ff]/18 blur-[60px] sm:-right-16 sm:h-48 sm:w-48 sm:blur-[70px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-14 bottom-0 h-32 w-32 rounded-full bg-[#0033ff]/8 blur-[50px] sm:h-40 sm:w-40 sm:blur-[60px]"
        aria-hidden
      />
      {children}
    </div>
  );
}
