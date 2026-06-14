import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/brand";
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
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-brand-100 bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
                Premium Online Learning
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Learn Without Limits on{" "}
                <span className="text-brand-600">{PLATFORM_NAME}</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                A modern learning platform built for students, teachers, and
                administrators. Browse courses, verify payments manually, and
                access premium content securely.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/courses">
                  <Button size="lg" className="gap-2">
                    Browse Courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="outline" size="lg">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Why Choose {PLATFORM_NAME}?
              </h2>
              <p className="mt-4 text-slate-600">
                Built with enterprise standards for security, performance, and
                user experience.
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Simple Payment Flow
                </h2>
                <p className="mt-4 text-slate-600">
                  No automated payment gateways needed. Submit your payment
                  proof, get verified by our team, and start learning.
                </p>
                <ul className="mt-8 space-y-4">
                  {steps.map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                        {i + 1}
                      </div>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {steps.map((step) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-lg border border-border p-4"
                      >
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="text-sm font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Start Learning?
            </h2>
            <p className="mt-4 text-slate-600">
              Join thousands of learners on {PLATFORM_NAME} and take the next step in
              your career.
            </p>
            <Link href="/courses" className="mt-8 inline-block">
              <Button size="lg" className="gap-2">
                Browse All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
