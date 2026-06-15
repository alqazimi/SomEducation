import Link from "next/link";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { PLATFORM_NAME } from "@/lib/brand";
import { type } from "@/lib/typography";

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <SomEducationLogo size={32} />
              <SomEducationWordmark />
            </Link>
            <p className={`mt-4 max-w-md ${type.bodySm}`}>
              Structured online courses from working instructors. Learn at your
              own pace with clear enrollment and support.
            </p>
          </div>
          <div>
            <h4 className={type.cardTitle}>Platform</h4>
            <ul className={`mt-3 space-y-2 ${type.bodySm}`}>
              <li>
                <Link href="/courses" className="hover:text-stone-900">
                  Browse courses
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-stone-900">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-stone-900">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={type.cardTitle}>Learn</h4>
            <ul className={`mt-3 space-y-2 ${type.bodySm}`}>
              <li>
                <Link href="/courses" className="hover:text-stone-900">
                  E-Learning courses
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-stone-900">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 text-center ${type.caption}`}
        >
          <p>
            © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-stone-600"
          >
            {legalLinks.map((link, index) => (
              <span key={link.href} className="inline-flex items-center">
                {index > 0 && (
                  <span aria-hidden className="mx-2 text-stone-300">
                    ·
                  </span>
                )}
                <Link href={link.href} className="hover:text-stone-900">
                  {link.label}
                </Link>
              </span>
            ))}
            <span aria-hidden className="mx-2 text-stone-300">
              ·
            </span>
            <Link href="/support" className="hover:text-stone-900">
              Support
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
