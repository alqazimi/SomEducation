"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Lock, Mail, User } from "lucide-react";
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

export function AuthSignUpForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams.get("redirect_url"));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        flow: "signUp",
      });
      router.replace(redirectUrl);
      router.refresh();
    } catch (submitError) {
      setError(getConvexErrorMessage(submitError, "Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell variant="sign-up">
      <AuthFormHeader
        title="Create account"
        subtitle="Join SomEducation to learn, teach, or manage courses."
      />

      {error && (
        <div className="mb-4">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <AuthField id="firstName" label="First name">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marketing-muted" />
              <input
                id="firstName"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                className={cn(authInputClassName(), "pl-10")}
              />
            </div>
          </AuthField>
          <AuthField id="lastName" label="Last name">
            <input
              id="lastName"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last"
              className={authInputClassName()}
            />
          </AuthField>
        </div>

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

        <AuthField
          id="password"
          label="Password"
          hint="At least 12 characters. Use an email you can access later."
        >
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marketing-muted" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className={cn(authInputClassName(), "pl-10")}
            />
          </div>
        </AuthField>

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Creating account..."
          label="Create account"
        />
      </form>

      <AuthFooterLink
        prompt="Already have an account?"
        href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
        linkLabel="Sign in"
      />
    </AuthPageShell>
  );
}
