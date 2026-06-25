"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getConvexErrorMessage } from "@/lib/convex-error";

export function MfaVerifyForm() {
  const router = useRouter();
  const verifyMfaLogin = useMutation(api.mfa.verifyMfaLogin);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyMfaLogin({ code });
      router.replace("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(getConvexErrorMessage(submitError, "Invalid code"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Two-factor authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the code from your authenticator app.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification code</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
