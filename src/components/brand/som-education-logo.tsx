import { cn } from "@/lib/utils";

type SomEducationLogoProps = {
  className?: string;
  size?: number;
};

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
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="somLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="somAccentGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#somLogoGradient)" />
      <path
        d="M11 12.5c0-1.2 1-2 2.2-1.7 5.2 1.1 8.8 1.1 14 0 1.2-.3 2.2.5 2.2 1.7v15c0 1-.7 1.7-1.6 1.9-5.4 1.2-9.8 1.2-15.2 0-1-.2-1.6-.9-1.6-1.9v-15z"
        fill="rgba(255,255,255,0.14)"
      />
      <path
        d="M20 11.5v17M14.5 13.5c2.8-.6 5.5-.6 8.3 0M14.5 18.5c2.5-.5 5-.5 7.5 0M14.5 23.5c2.8-.6 5.5-.6 8.3 0"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M15.5 14.5c3.2 2.8 3.2 8.2 0 11M24.5 14.5c-3.2 2.8-3.2 8.2 0 11"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28.5" cy="11.5" r="3.2" fill="url(#somAccentGradient)" />
      <path
        d="M28.5 9.8v3.4M27.1 11.5h2.8"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
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
      <span className="text-brand-700">Som</span>
      <span className="text-stone-900">Education</span>
      {!compact && <span className="sr-only">SomEducation</span>}
    </span>
  );
}
