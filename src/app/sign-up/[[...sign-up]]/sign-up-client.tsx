"use client";

import { Suspense } from "react";
import { AuthSignUpForm } from "@/components/auth/auth-sign-up-form";
import { AuthPageLoading } from "@/components/auth/auth-page-loading";

export default function SignUpClient() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthSignUpForm />
    </Suspense>
  );
}
