"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PURCHASE_STEP_LABELS = [
  "Your details",
  "Payment method",
  "Upload proof",
  "Review & submit",
] as const;

export function PurchaseStepNav({
  step,
  total = PURCHASE_STEP_LABELS.length,
  onBack,
  className,
}: {
  step: number;
  total?: number;
  onBack?: () => void;
  className?: string;
}) {
  const label = PURCHASE_STEP_LABELS[step - 1] ?? "";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Step {step} of {total}
          </p>
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        {onBack && step > 1 && (
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index + 1 <= step ? "bg-brand-600" : "bg-muted-foreground/15"
            )}
          />
        ))}
      </div>
    </div>
  );
}
