import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClerkSetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">
          Clerk is not configured for local dev
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Your <code className="text-xs">.env.local</code> is missing Clerk API
          keys, so Clerk was trying to use temporary keyless/B2B mode. That is
          disabled — use your real SomEducation Clerk app instead.
        </p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-stone-700">
          <li>
            Open{" "}
            <a
              href="https://dashboard.clerk.com/last-active?path=api-keys"
              className="font-medium text-brand-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Clerk Dashboard → API Keys
            </a>{" "}
            (your SomEducation app).
          </li>
          <li>
            Or copy the same values from Vercel → Settings → Environment
            Variables.
          </li>
          <li>
            Paste into <code className="text-xs">.env.local</code>:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-stone-50 p-3 text-xs text-stone-800">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...`}
            </pre>
          </li>
          <li>Restart <code className="text-xs">npm run dev</code>.</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
