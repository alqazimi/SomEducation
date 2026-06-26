"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Shield } from "lucide-react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
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

export function MfaSetupForm() {
  const router = useRouter();
  const user = useQuery(api.users.getMe);
  const beginMfaSetup = useMutation(api.mfa.beginMfaSetup);
  const confirmMfaSetup = useMutation(api.mfa.confirmMfaSetup);
  const [secret, setSecret] = useState<string | null>(null);
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
        const dataUrl = await QRCode.toDataURL(result.otpauthUrl, {
          margin: 1,
          width: 220,
        });
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
      await confirmMfaSetup({ code: code.trim() });
      const destination = user ? getDashboardHref(user.role) : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (submitError) {
      setError(getConvexErrorMessage(submitError, "Invalid code"));
    } finally {
      setLoading(false);
    }
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Setup key copied");
    } catch {
      toast.error("Could not copy key");
    }
  }

  return (
    <AuthPageShell variant="mfa-setup">
      <AuthFormHeader
        title="Set up authenticator"
        subtitle="Staff accounts require two-factor authentication."
      />

      {error ? (
        <div className="mb-4">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}

      <div className="space-y-5">
        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl border border-marketing-border bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Scan with your authenticator app"
                className="h-44 w-44"
              />
            </div>
            <p className="text-center text-xs text-marketing-muted">
              Scan with Google Authenticator, Authy, 1Password, or similar.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-10">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        )}

        {secret ? (
          <div className="rounded-xl border border-marketing-border bg-marketing-elevated px-4 py-3">
            <p className="text-xs font-medium text-marketing-muted">
              Can&apos;t scan? Enter this key manually
            </p>
            <div className="mt-2 flex items-start gap-2">
              <p className="min-w-0 flex-1 break-all font-mono text-sm text-marketing-fg">
                {secret}
              </p>
              <button
                type="button"
                onClick={() => void copySecret()}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-marketing-border px-2 py-1 text-xs font-medium text-marketing-fg transition-colors hover:bg-marketing-bg-panel"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit}>
          <AuthField
            id="mfa-code"
            label="Verification code"
            hint="Enter the 6-digit code from your app to finish setup."
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
            loadingLabel="Enabling..."
            label="Enable authenticator"
          />
        </form>
      </div>
    </AuthPageShell>
  );
}
