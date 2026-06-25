"use client";

import { Suspense } from "react";
import { AuthSignInForm } from "@/components/auth/auth-sign-in-form";
import { AuthPageLoading } from "@/components/auth/auth-page-loading";

export default function SignInClient() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthSignInForm />
    </Suspense>
  );
}
