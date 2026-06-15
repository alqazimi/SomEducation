import Link from "next/link";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { PLATFORM_NAME } from "@/lib/brand";
import { type } from "@/lib/typography";

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
            <h4 className={type.cardTitle}>Legal</h4>
            <ul className={`mt-3 space-y-2 ${type.bodySm}`}>
              <li>
                <Link href="/privacy" className="hover:text-stone-900">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-stone-900">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={`mt-8 border-t border-border pt-6 text-center ${type.caption}`}>
          © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
