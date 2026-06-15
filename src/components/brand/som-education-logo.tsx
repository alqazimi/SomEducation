import { BRAND_BLUE } from "@/lib/brand";
import { cn } from "@/lib/utils";

type SomEducationLogoProps = {
  className?: string;
  size?: number;
};

/** Coursera-style mark: blue tile with white S. */
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
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="26"
        fontWeight="700"
        fontFamily="var(--font-dm-sans), 'DM Sans', system-ui, sans-serif"
      >
        S
      </text>
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
