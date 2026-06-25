import { Suspense } from "react";
import { MfaSetupForm } from "@/components/auth/mfa-setup-form";

export default function MfaSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-marketing-bg px-4 py-8">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        }
      >
        <MfaSetupForm />
      </Suspense>
    </div>
  );
}
