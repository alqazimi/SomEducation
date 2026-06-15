import { BRAND_BLUE } from "@/lib/brand";
import { LOGO_S_PATH } from "@/lib/logo-mark";
import { cn } from "@/lib/utils";

type SomEducationLogoProps = {
  className?: string;
  size?: number;
};

/** Coursera-style mark: blue tile with white S (vector path, not text). */
export function SomEducationLogo({
  className,
  size = 36,
}: SomEducationLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label="SomEducation"
      className={cn("shrink-0", className)}
    >
      <rect width="40" height="40" rx="8" fill={BRAND_BLUE} />
      <path fill="white" d={LOGO_S_PATH} />
    </svg>
  );
}

type SomEducationWordmarkProps = {
  className?: string;
  compact?: boolean;
};

export function SomEducationWordmark({
  className,
  compact = false,
}: SomEducationWordmarkProps) {
  return (
    <span
      className={cn(
        "truncate text-[0.9375rem] font-medium tracking-[-0.02em] sm:text-base",
        className
      )}
    >
      <span style={{ color: BRAND_BLUE }}>Som</span>
      <span className="text-stone-900">Education</span>
      {!compact && <span className="sr-only">SomEducation</span>}
    </span>
  );
}
