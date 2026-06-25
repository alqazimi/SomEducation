import { Suspense } from "react";
import SignInClient from "./sign-in-client";
import { AuthPageLoading } from "@/components/auth/auth-page-loading";

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <SignInClient />
    </Suspense>
  );
}
