"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { PLATFORM_NAME } from "@/lib/brand";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { isMarketingSitePath, isLearnPath, marketingFooterClassDay, marketingFooterClassNight } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact Us" },
] as const;

const supportLinks = [
  { href: "/support", label: "Help Center" },
  { href: "/returns", label: "Return Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function Footer({ variant = "default" }: { variant?: "default" | "marketing" | "light" }) {
  const pathname = usePathname();
  const isLearn = isLearnPath(pathname);
  const isMarketing =
    variant === "marketing" ||
    (variant === "default" && isMarketingSitePath(pathname));
  const usesThemedFooter = isMarketing || isLearn;
  const { isDay, isNight } = useMarketingTheme();

  return (
    <footer
      className={cn(
        usesThemedFooter
          ? cn(
              "mt-auto border-t",
              isNight ? marketingFooterClassNight : marketingFooterClassDay
            )
          : "mt-auto border-t border-border bg-stone-50"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <SomEducationLogo size={36} />
              <SomEducationWordmark
                inverted={usesThemedFooter && isNight}
                className={cn(usesThemedFooter && isNight && "text-white")}
              />
            </Link>
            <p
              className={cn(
                "mt-4 max-w-xs text-sm leading-relaxed",
                usesThemedFooter ? "text-marketing-muted" : "text-stone-600"
              )}
            >
              Structured online courses from working instructors. Learn at your
              own pace with clear enrollment and support.
            </p>
          </div>

          <div>
            <h4
              className={cn(
                "text-sm font-semibold",
                usesThemedFooter ? "text-marketing-fg" : "text-stone-900"
              )}
            >
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "transition-colors",
                      usesThemedFooter
                        ? isDay
                          ? "text-marketing-muted hover:text-brand-600"
                          : "text-marketing-muted hover:text-brand-400"
                        : "text-stone-600 hover:text-brand-600"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className={cn(
                "text-sm font-semibold",
                usesThemedFooter ? "text-marketing-fg" : "text-stone-900"
              )}
            >
              Support
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "transition-colors",
                      usesThemedFooter
                        ? isDay
                          ? "text-marketing-muted hover:text-brand-600"
                          : "text-marketing-muted hover:text-brand-400"
                        : "text-stone-600 hover:text-brand-600"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {usesThemedFooter && (
                <li>
                  <InstallAppButton
                    showIcon={false}
                    className={cn(
                      isDay
                        ? "text-marketing-muted hover:bg-transparent hover:text-brand-600"
                        : "text-marketing-muted hover:bg-transparent hover:text-brand-400"
                    )}
                  />
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4
              className={cn(
                "text-sm font-semibold",
                usesThemedFooter ? "text-marketing-fg" : "text-stone-900"
              )}
            >
              Newsletter
            </h4>
            <p
              className={cn(
                "mt-4 text-sm leading-relaxed",
                usesThemedFooter ? "text-marketing-muted" : "text-stone-600"
              )}
            >
              Subscribe for updates and new course alerts.
            </p>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "h-10 rounded-lg",
                  usesThemedFooter
                    ? "border-marketing-border bg-marketing-elevated text-marketing-fg placeholder:text-marketing-muted"
                    : "bg-white"
                )}
                aria-label="Email for newsletter"
              />
              <Button
                type="submit"
                className="h-10 shrink-0 rounded-lg px-5"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <p
          className={cn(
            "mt-10 border-t pt-6 text-center text-sm",
            usesThemedFooter
              ? "border-marketing-border text-marketing-muted"
              : "border-border text-stone-500"
          )}
        >
          © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
