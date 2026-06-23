"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { ClerkSetupRequired } from "@/components/auth/clerk-setup-required";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkConfigured } from "@/lib/clerk-config";
import { sanitizeRedirectPath } from "@/lib/auth-urls";
import { marketingPageClass } from "@/lib/marketing-theme";

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams.get("redirect_url"));

  if (!isClerkConfigured()) {
    return <ClerkSetupRequired />;
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 py-8 ${marketingPageClass}`}
    >
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
