"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  PlayCircle,
  UserPlus,
} from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_NAME } from "@/lib/brand";
import { marketingCardClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: BookOpen,
    title: "Browse courses",
    description:
      "Explore our catalog and pick a course that matches your goals.",
  },
  {
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up free, then open the course page to enroll or purchase access.",
  },
  {
    icon: PlayCircle,
    title: "Learn at your pace",
    description:
      "Watch lessons, complete modules, and take exams when you are ready.",
  },
  {
    icon: GraduationCap,
    title: "Track your progress",
    description:
      "Use your dashboard to continue lessons, view payments, and message instructors.",
  },
] as const;

export function HowItWorksPage() {
  return (
    <MarketingShell>
      <PageHeader
        variant="marketing"
        eyebrow="Simple process"
        title="How it works"
        description={`Start learning on ${PLATFORM_NAME} in a few clear steps.`}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <Card key={step.title} className={cn(marketingCardClass, "shadow-none")}>
              <CardContent className="p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/15 text-sm font-semibold text-brand-400">
                  {index + 1}
                </div>
                <step.icon className="mt-4 h-5 w-5 text-brand-400" />
                <p className="mt-3 text-sm font-medium text-marketing-fg">
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-marketing-muted">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardHeader>
            <CardTitle className="text-marketing-fg">Paid courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-marketing-muted">
            <p>
              For paid courses, you submit payment proof after checkout. Our team
              reviews it and unlocks access — usually within a short time.
            </p>
            <Link href="/support">
              <Button variant="outline" className="border-marketing-border text-marketing-fg">
                See payment help
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href="/courses">
            <Button>Browse courses</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-marketing-border text-marketing-fg">
              Contact us
            </Button>
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
