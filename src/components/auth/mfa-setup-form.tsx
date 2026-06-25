"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getConvexErrorMessage } from "@/lib/convex-error";

export function MfaSetupForm() {
  const router = useRouter();
  const beginMfaSetup = useMutation(api.mfa.beginMfaSetup);
  const confirmMfaSetup = useMutation(api.mfa.confirmMfaSetup);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void beginMfaSetup({})
      .then(async (result) => {
        if (cancelled) return;
        setSecret(result.secret);
        setOtpauthUrl(result.otpauthUrl);
        const dataUrl = await QRCode.toDataURL(result.otpauthUrl);
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch((setupError) => {
        if (!cancelled) {
          setError(getConvexErrorMessage(setupError, "Could not start MFA setup"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [beginMfaSetup]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await confirmMfaSetup({ code });
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
          Set up two-factor authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Staff accounts require an authenticator app.
        </p>
      </div>

      {qrDataUrl ? (
        <div className="flex justify-center">
          <img
            src={qrDataUrl}
            alt="MFA QR code"
            className="h-44 w-44 rounded-lg border border-border bg-white p-2"
          />
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {secret && (
        <div className="rounded-lg bg-muted px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Manual entry key</p>
          <p className="break-all font-mono text-sm">{secret}</p>
        </div>
      )}

      {otpauthUrl && (
        <p className="text-center text-xs text-muted-foreground">
          Scan the QR code with Google Authenticator, Authy, or a similar app.
        </p>
      )}

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
        <Button type="submit" className="w-full" disabled={loading || !secret}>
          {loading ? "Verifying..." : "Enable MFA"}
        </Button>
      </form>
    </div>
  );
}
