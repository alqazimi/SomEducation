"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { Shield } from "lucide-react";
import { api } from "convex/_generated/api";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { getDashboardHref } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import {
  AuthAlert,
  AuthField,
  AuthFormHeader,
  AuthPageShell,
  AuthSubmitButton,
  authInputClassName,
} from "./auth-page-shell";

export function MfaVerifyForm() {
  const router = useRouter();
  const user = useQuery(api.users.getMe);
  const verifyMfaLogin = useMutation(api.mfa.verifyMfaLogin);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyMfaLogin({ code: code.trim() });
      const destination = user ? getDashboardHref(user.role) : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (submitError) {
      setError(getConvexErrorMessage(submitError, "Invalid code"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell variant="mfa">
      <AuthFormHeader
        title="Authenticator code"
        subtitle="Open your authenticator app and enter the 6-digit code."
      />

      {error ? (
        <div className="mb-4">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <AuthField
          id="mfa-code"
          label="Verification code"
          hint="Codes refresh every 30 seconds."
        >
          <div className="relative">
            <Shield className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marketing-muted" />
            <input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              placeholder="000000"
              className={cn(
                authInputClassName(),
                "pl-10 text-center font-mono text-lg tracking-[0.35em]"
              )}
            />
          </div>
        </AuthField>

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Verifying..."
          label="Continue"
        />
      </form>
    </AuthPageShell>
  );
}
