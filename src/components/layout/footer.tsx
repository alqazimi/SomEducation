import Link from "next/link";
import {
  SomEducationLogo,
  SomEducationWordmark,
} from "@/components/brand/som-education-logo";
import { PLATFORM_NAME } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <SomEducationLogo size={32} />
              <SomEducationWordmark className="text-lg" />
            </Link>
            <p className="mt-4 max-w-md text-sm text-slate-500">
              Premium online learning platform. Learn from expert teachers,
              grow your skills, and advance your career.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/courses" className="hover:text-brand-600">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-brand-600">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-brand-600">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>
                <Link href="#" className="hover:text-brand-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
