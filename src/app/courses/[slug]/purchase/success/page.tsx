import { Suspense } from "react";
import { PurchaseSuccessClient } from "./purchase-success-client";

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <PurchaseSuccessClient />
    </Suspense>
  );
}
