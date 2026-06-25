"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Shield } from "lucide-react";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { MarketingThemeToggle } from "@/components/marketing/marketing-theme-toggle";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { marketingPageClass } from "@/lib/marketing-theme";
import { PLATFORM_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: GraduationCap,
    title: "Expert-led courses",
    description: "Learn from verified teachers across Somalia and beyond.",
  },
  {
    icon: BookOpen,
    title: "Learn at your pace",
    description: "Structured lessons, exams, and progress tracking.",
  },
  {
    icon: Shield,
    title: "Secure accounts",
    description: "Password protection with staff MFA and safe sessions.",
  },
] as const;

export function AuthPageShell({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "sign-in" | "sign-up";
}) {
  const { isNight } = useMarketingTheme();

  return (
    <div className={cn(marketingPageClass, "relative min-h-screen overflow-hidden")}>
      <div
        className="pointer-events-none absolute inset-0 marketing-dot-grid opacity-60"
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl",
          isNight ? "bg-brand-600/25" : "bg-brand-400/20"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full blur-3xl",
          isNight ? "bg-indigo-600/20" : "bg-sky-300/30"
        )}
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg transition-opacity hover:opacity-90"
          >
            <SomEducationLogo size={32} />
            <SomEducationWordmark
              inverted={isNight}
              className={cn("hidden sm:inline", !isNight && "text-slate-900")}
            />
          </Link>
          <div className="flex items-center gap-1">
            <MarketingThemeToggle />
            <Link
              href="/"
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                isNight
                  ? "text-slate-300 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-16 xl:grid-cols-[1.1fr_minmax(0,26rem)]">
            <aside className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">
                {variant === "sign-in" ? "Welcome back" : "Join SomEducation"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-marketing-fg xl:text-4xl">
                {variant === "sign-in"
                  ? "Continue your learning journey"
                  : "Start learning something new today"}
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-marketing-muted">
                {PLATFORM_TAGLINE}. Sign in to access your dashboard, courses, and
                certificates.
              </p>

              <ul className="mt-10 space-y-5">
                {highlights.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        isNight
                          ? "bg-brand-600/15 text-brand-400"
                          : "bg-brand-50 text-brand-600"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-marketing-fg">{item.title}</p>
                      <p className="mt-0.5 text-sm text-marketing-muted">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="marketing-form-surface relative overflow-hidden p-6 shadow-xl sm:p-8">
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                  isNight
                    ? "from-brand-600 via-brand-400 to-indigo-500"
                    : "from-brand-600 via-brand-500 to-sky-500"
                )}
                aria-hidden
              />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthFormHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 space-y-1.5 text-center lg:text-left">
      <h2 className="text-2xl font-semibold tracking-tight text-marketing-fg">
        {title}
      </h2>
      <p className="text-sm text-marketing-muted">{subtitle}</p>
    </div>
  );
}

export function AuthAlert({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "error";
}) {
  const { isNight } = useMarketingTheme();

  return (
    <p
      role={variant === "error" ? "alert" : undefined}
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        variant === "error"
          ? isNight
            ? "border-red-500/30 bg-red-500/10 text-red-200"
            : "border-red-200 bg-red-50 text-red-800"
          : isNight
            ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
            : "border-amber-200 bg-amber-50 text-amber-900"
      )}
    >
      {children}
    </p>
  );
}

export function AuthField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-marketing-fg-subtle"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-xs text-marketing-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function authInputClassName() {
  return cn(
    "flex h-11 w-full rounded-xl border border-marketing-border bg-marketing-elevated px-3.5 text-[0.9375rem] text-marketing-fg shadow-sm",
    "placeholder:text-marketing-muted",
    "focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
  );
}

export function AuthFooterLink({
  prompt,
  href,
  linkLabel,
}: {
  prompt: string;
  href: string;
  linkLabel: string;
}) {
  const { isNight } = useMarketingTheme();

  return (
    <p className="mt-6 text-center text-sm text-marketing-muted lg:text-left">
      {prompt}{" "}
      <Link
        href={href}
        className={cn(
          "font-semibold transition-colors hover:underline",
          isNight ? "text-brand-400" : "text-brand-600"
        )}
      >
        {linkLabel}
      </Link>
    </p>
  );
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  label,
}: {
  loading: boolean;
  loadingLabel: string;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "mt-1 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-lg transition-all",
        "bg-brand-600 hover:bg-brand-500",
        "shadow-brand-600/25 hover:shadow-brand-500/30",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
