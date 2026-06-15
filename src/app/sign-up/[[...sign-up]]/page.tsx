"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { clerkAppearance } from "@/lib/clerk-appearance";

function SignUpClient() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SignUp
        forceRedirectUrl={redirectUrl}
        signInForceRedirectUrl={redirectUrl}
        appearance={clerkAppearance}
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted">
          Loading...
        </div>
      }
    >
      <SignUpClient />
    </Suspense>
  );
}
