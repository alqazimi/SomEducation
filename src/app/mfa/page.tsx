import { Suspense } from "react";
import { MfaVerifyForm } from "@/components/auth/mfa-verify-form";

export default function MfaVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-marketing-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <MfaVerifyForm />
    </Suspense>
  );
}
