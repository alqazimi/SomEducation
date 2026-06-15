"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { sanitizeRedirectPath } from "@/lib/auth-urls";

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams.get("redirect_url"));

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-[min(100%,24rem)]">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl={redirectUrl}
          signInFallbackRedirectUrl={redirectUrl}
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
