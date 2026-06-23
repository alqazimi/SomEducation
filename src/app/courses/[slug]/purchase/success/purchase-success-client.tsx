"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "convex/_generated/api";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketingCoursesSurface } from "@/components/marketing/marketing-courses-surface";
import { Button } from "@/components/ui/button";

export function PurchaseSuccessClient() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const verifyCheckout = useAction(api.stripe.verifyCheckoutSession);
  const [verified, setVerified] = useState(false);

  const status = useQuery(
    api.stripeConfig.getCheckoutStatus,
    sessionId ? { sessionId } : "skip"
  );

  useEffect(() => {
    if (!sessionId || verified) return;
    void verifyCheckout({ sessionId })
      .then(() => setVerified(true))
      .catch(() => setVerified(true));
  }, [sessionId, verified, verifyCheckout]);

  const isReady = status?.isEnrolled || status?.paymentStatus === "approved";
  const isLoading = !sessionId || status === undefined || (!isReady && !verified);

  return (
    <MarketingShell>
      <MarketingCoursesSurface>
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
          {isLoading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
              <p className="mt-4 text-marketing-muted">
                Confirming your payment…
              </p>
            </>
          ) : isReady ? (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              <h1 className="mt-4 text-2xl font-semibold text-marketing-fg">
                Payment successful
              </h1>
              <p className="mt-2 text-marketing-muted">
                {status?.courseTitle
                  ? `You now have access to ${status.courseTitle}.`
                  : "Your course access is active."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={
                    status?.courseSlug
                      ? `/learn/${status.courseSlug}`
                      : "/dashboard/student/courses"
                  }
                >
                  <Button size="lg">Start learning</Button>
                </Link>
                <Link href={`/courses/${params.slug}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-marketing-border bg-marketing-card text-marketing-fg hover:bg-marketing-elevated"
                  >
                    Back to course
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-marketing-fg">
                Payment processing
              </h1>
              <p className="mt-2 text-marketing-muted">
                Your payment is being confirmed. This usually takes a few
                seconds. Check your dashboard for updates.
              </p>
              <Link href="/dashboard/student/payments" className="mt-6 inline-block">
                <Button>View payments</Button>
              </Link>
            </>
          )}
        </div>
      </MarketingCoursesSurface>
    </MarketingShell>
  );
}
