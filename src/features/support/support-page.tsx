"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Mail,
  Smartphone,
} from "lucide-react";
import { api } from "convex/_generated/api";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import { marketingCardClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const paymentSteps = [
  {
    title: "Choose a course",
    description: "Open a course page and click Buy or Enroll.",
  },
  {
    title: "Sign in",
    description: "Create a free account or sign in before submitting payment.",
  },
  {
    title: "Send the payment",
    description:
      "Pick Mobile Money or Bank Transfer, choose your provider, and pay the number shown for that provider only.",
  },
  {
    title: "Upload proof",
    description:
      "Submit your payment screenshot or receipt (PNG, JPG, or PDF, under 5MB).",
  },
  {
    title: "Wait for approval",
    description:
      "Our team reviews your payment. You will get a notification when access is granted.",
  },
  {
    title: "Start learning",
    description: "Open your dashboard and continue the course immediately after approval.",
  },
];

const paymentMethods = [
  {
    icon: Smartphone,
    label: "Mobile Money",
    hint: "Choose EVC Plus, Zaad, eDahab, Sahal, or another wallet on the purchase page.",
  },
  {
    icon: CreditCard,
    label: "Bank Transfer",
    hint: "Choose your bank on the purchase page and send to the account number shown.",
  },
];

export function SupportPage() {
  const settings = useQuery(api.settings.get);

  return (
    <MarketingShell>
      <PageHeader
        variant="marketing"
        title="Support"
        description={`Payment steps and help for ${PLATFORM_NAME} courses.`}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <HelpCircle className="h-4 w-4 text-brand-400" />
              How to pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {paymentSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {paymentMethods.map((method) => (
            <Card key={method.label} className={cn(marketingCardClass, "shadow-none")}>
              <CardContent className="p-5">
                <method.icon className="h-5 w-5 text-brand-400" />
                <p className="mt-3 text-sm font-medium text-white">
                  {method.label}
                </p>
                <p className="mt-1 text-sm text-slate-400">{method.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-brand-500/30 bg-brand-600/10 shadow-none">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
              <div>
                <p className="text-sm font-medium text-white">After you pay</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  Track your submission under Dashboard → Payments. If
                  rejected or asked for a new screenshot, fix the same
                  payment there — upload new proof or change your payment
                  method without starting over.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" className="border-white/20 text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardContent className="flex items-start gap-4 p-6">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-white">Need more help?</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Email us at{" "}
                <a
                  href={`mailto:${settings?.supportEmail ?? PLATFORM_SUPPORT_EMAIL}`}
                  className="font-medium text-brand-400 hover:underline"
                >
                  {settings?.supportEmail ?? PLATFORM_SUPPORT_EMAIL}
                </a>{" "}
                or message an admin from your dashboard after signing in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
