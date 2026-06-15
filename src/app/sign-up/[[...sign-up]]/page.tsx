import { Suspense } from "react";
import SignUpClient from "./sign-up-client";

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
