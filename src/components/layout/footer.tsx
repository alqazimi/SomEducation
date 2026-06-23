"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLATFORM_NAME } from "@/lib/brand";
import { isMarketingSitePath } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/support", label: "Contact Us" },
] as const;

const supportLinks = [
  { href: "/support", label: "Help Center" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function Footer({ variant = "default" }: { variant?: "default" | "marketing" | "light" }) {
  const pathname = usePathname();
  const isMarketing =
    variant === "marketing" ||
    (variant === "default" && isMarketingSitePath(pathname));

  return (
    <footer
      className={cn(
        "mt-auto border-t",
        isMarketing
          ? "border-white/10 bg-[#060a12] text-slate-300"
          : "border-border bg-stone-50"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <SomEducationLogo size={36} />
              <SomEducationWordmark
                inverted={isMarketing}
                className={cn(isMarketing && "text-white")}
              />
            </Link>
            <p
              className={cn(
                "mt-4 max-w-xs text-sm leading-relaxed",
                isMarketing ? "text-slate-400" : "text-stone-600"
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
                isMarketing ? "text-white" : "text-stone-900"
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
                      isMarketing
                        ? "text-slate-400 hover:text-brand-400"
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
                isMarketing ? "text-white" : "text-stone-900"
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
                      isMarketing
                        ? "text-slate-400 hover:text-brand-400"
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
                isMarketing ? "text-white" : "text-stone-900"
              )}
            >
              Newsletter
            </h4>
            <p
              className={cn(
                "mt-4 text-sm leading-relaxed",
                isMarketing ? "text-slate-400" : "text-stone-600"
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
                  isMarketing
                    ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500"
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
            isMarketing
              ? "border-white/10 text-slate-500"
              : "border-border text-stone-500"
          )}
        >
          © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
