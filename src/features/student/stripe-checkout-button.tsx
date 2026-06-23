"use client";

import { useAction } from "convex/react";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export function StripeCheckoutButton({
  courseId,
  className,
}: {
  courseId: Id<"courses">;
  className?: string;
}) {
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const result = await createCheckout({ courseId });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      toast.error("Could not start checkout");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      className={className}
      disabled={loading}
      onClick={() => void handlePay()}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <CreditCard className="h-5 w-5" />
      )}
      Pay with card (Stripe)
    </Button>
  );
}
