import type { Metadata } from "next";
import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/brand";
import { absoluteUrl, buildPageTitle, siteSeo } from "@/lib/seo";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Shield,
  Users,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/typography";
import { type } from "@/lib/typography";

export const metadata: Metadata = {
  title: buildPageTitle(),
  description: siteSeo.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: buildPageTitle(),
    description: siteSeo.description,
    url: absoluteUrl("/"),
    type: "website",
  },
};

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description:
      "Learn from industry professionals with structured modules and hands-on lessons.",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description:
      "Enterprise-grade security with verified payments and protected content access.",
  },
  {
    icon: Users,
    title: "Community Learning",
    description:
      "Connect with teachers and administrators for personalized support.",
  },
  {
    icon: Award,
    title: "Career Growth",
    description:
      "Build in-demand skills with courses designed for real-world application.",
  },
];

const steps = [
  "Browse and choose your course",
  "Submit payment with screenshot",
  "Get verified by our admin team",
  "Start learning immediately",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className={type.eyebrow}>Online learning</p>
              <h1 className={`mt-3 ${type.display}`}>
                Learn with purpose on{" "}
                <span className="text-brand-700">{PLATFORM_NAME}</span>
              </h1>
              <p className={`mx-auto mt-5 max-w-xl ${type.lead}`}>
                Structured courses from working instructors. Browse programs,
                submit payment proof, and study at your own pace.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/courses">
                  <Button size="lg" className="gap-2">
                    Browse Courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="outline" size="lg">
                    Create account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <SectionTitle>Why {PLATFORM_NAME}</SectionTitle>
              <p className={`mt-3 ${type.lead}`}>
                Practical courses, clear enrollment, and support when you need it.
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className={`mt-4 ${type.cardTitle}`}>
                      {feature.title}
                    </h3>
                    <p className={`mt-2 ${type.bodySm}`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <SectionTitle>How payment works</SectionTitle>
                <p className={`mt-3 ${type.lead}`}>
                  Pay by bank transfer or mobile money, upload your receipt, and
                  start once an admin confirms enrollment.
                </p>
                <ul className="mt-8 space-y-3">
                  {steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                        {i + 1}
                      </div>
                      <span className={type.body}>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-md border border-border bg-white p-3.5"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        <span className="text-sm font-medium text-slate-800">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <SectionTitle className="text-center">Start learning</SectionTitle>
            <p className={`mt-3 text-center ${type.lead}`}>
              Browse the catalog and enroll in your first course today.
            </p>
            <div className="mt-7 text-center">
              <Link href="/courses">
                <Button size="lg" className="gap-2">
                  Browse all courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
