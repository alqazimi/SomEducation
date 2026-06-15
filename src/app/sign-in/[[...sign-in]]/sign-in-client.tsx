"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SignIn
        forceRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
        appearance={clerkAppearance}
      />
    </div>
  );
}
