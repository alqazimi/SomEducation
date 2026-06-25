import { Suspense } from "react";
import SignUpClient from "./sign-up-client";
import { AuthPageLoading } from "@/components/auth/auth-page-loading";

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <SignUpClient />
    </Suspense>
  );
}
