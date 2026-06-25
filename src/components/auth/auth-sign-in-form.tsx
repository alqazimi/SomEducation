"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { sanitizeRedirectPath } from "@/lib/auth-urls";
import { cn } from "@/lib/utils";
import {
  AuthAlert,
  AuthField,
  AuthFooterLink,
  AuthFormHeader,
  AuthPageShell,
  AuthSubmitButton,
  authInputClassName,
} from "./auth-page-shell";

export function AuthSignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams.get("redirect_url"));
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: "signIn",
      });
      router.replace(redirectUrl);
      router.refresh();
    } catch (submitError) {
      setError(getConvexErrorMessage(submitError, "Could not sign in"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell variant="sign-in">
      <AuthFormHeader
        title="Sign in"
        subtitle="Welcome back — enter your account details."
      />

      <div className="space-y-4">
        {reason === "expired" && (
          <AuthAlert>Your session expired. Please sign in again.</AuthAlert>
        )}
        {reason === "other_device" && (
          <AuthAlert>
            Your account was signed in on another device.
          </AuthAlert>
        )}
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <AuthField id="email" label="Email address">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marketing-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(authInputClassName(), "pl-10")}
            />
          </div>
        </AuthField>

        <AuthField id="password" label="Password">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marketing-muted" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className={cn(authInputClassName(), "pl-10")}
            />
          </div>
        </AuthField>

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Signing in..."
          label="Sign in"
        />
      </form>

      <AuthFooterLink
        prompt="No account yet?"
        href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
        linkLabel="Create one free"
      />
    </AuthPageShell>
  );
}
