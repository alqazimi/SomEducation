"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { ClerkSetupRequired } from "@/components/auth/clerk-setup-required";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkConfigured } from "@/lib/clerk-config";
import { sanitizeRedirectPath } from "@/lib/auth-urls";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams.get("redirect_url"));

  if (!isClerkConfigured()) {
    return <ClerkSetupRequired />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-marketing-bg px-4 py-8">
      <div className="w-full max-w-[min(100%,24rem)] text-stone-900">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl={redirectUrl}
          signUpFallbackRedirectUrl={redirectUrl}
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
