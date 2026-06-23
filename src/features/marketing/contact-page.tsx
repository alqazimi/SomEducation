"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";
import { api } from "convex/_generated/api";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import { marketingCardClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

export function ContactPage() {
  const settings = useQuery(api.settings.get);
  const supportEmail = settings?.supportEmail ?? PLATFORM_SUPPORT_EMAIL;

  return (
    <MarketingShell>
      <PageHeader
        variant="marketing"
        eyebrow="Get in touch"
        title="Contact us"
        description={`Questions about ${PLATFORM_NAME}? We are here to help.`}
      />

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardContent className="flex items-start gap-4 p-6">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
            <div>
              <p className="text-sm font-medium text-marketing-fg">Email support</p>
              <p className="mt-1 text-sm leading-relaxed text-marketing-muted">
                Send us a message anytime at{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-medium text-brand-400 hover:underline"
                >
                  {supportEmail}
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardContent className="flex items-start gap-4 p-6">
            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
            <div>
              <p className="text-sm font-medium text-marketing-fg">
                Message from your dashboard
              </p>
              <p className="mt-1 text-sm leading-relaxed text-marketing-muted">
                Signed-in students can reach support from Dashboard → Messages for
                faster help with enrollments and payments.
              </p>
              <Link href="/sign-in" className="mt-4 inline-block">
                <Button size="sm">Sign in to message support</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardContent className="flex items-start gap-4 p-6">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
            <div>
              <p className="text-sm font-medium text-marketing-fg">
                Payment & account help
              </p>
              <p className="mt-1 text-sm leading-relaxed text-marketing-muted">
                Step-by-step guides for paying, uploading proof, and accessing
                courses are in our Help Center.
              </p>
              <Link href="/support" className="mt-4 inline-block">
                <Button size="sm" variant="outline" className="border-marketing-border text-marketing-fg">
                  Open Help Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
