"use client";

import { Copy, Share, SquarePlus, X } from "lucide-react";
import { useState } from "react";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
import { getPwaShareUrl } from "@/lib/pwa";
import { PLATFORM_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

function Step({
  number,
  title,
  children,
  isNight,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  isNight: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isNight ? "bg-brand-600 text-white" : "bg-brand-600 text-white"
        )}
      >
        {number}
      </span>
      <div className="min-w-0 pt-0.5">
        <p
          className={cn(
            "text-sm font-medium",
            isNight ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "mt-1 text-sm leading-relaxed",
            isNight ? "text-slate-300" : "text-muted-foreground"
          )}
        >
          {children}
        </p>
      </div>
    </li>
  );
}

export function IosInstallGuide() {
  const { isNight } = useMarketingTheme();
  const { iosGuideOpen, closeIosGuide, isIosSafari: safari } = usePwaInstall();
  const [copied, setCopied] = useState(false);

  if (!iosGuideOpen) return null;

  const handleCopy = async () => {
    const url = getPwaShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link and open it in Safari:", url);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${PLATFORM_NAME} to Home Screen`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close guide"
        onClick={closeIosGuide}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border p-5 shadow-2xl sm:p-6",
          isNight
            ? "border-white/10 bg-marketing-panel text-marketing-fg"
            : "border-border bg-card text-foreground"
        )}
      >
        <button
          type="button"
          onClick={closeIosGuide}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg",
            isNight
              ? "text-slate-400 hover:bg-white/10 hover:text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <SquarePlus className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold sm:text-lg">
              Add {PLATFORM_NAME} to Home Screen
            </h2>
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isNight ? "text-slate-300" : "text-muted-foreground"
              )}
            >
              Apple does not allow automatic install on iPhone. Follow these
              quick steps — it takes about 10 seconds.
            </p>
          </div>
        </div>

        {!safari && (
          <div
            className={cn(
              "mt-4 rounded-xl border px-3 py-3 text-sm",
              isNight
                ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
                : "border-amber-200 bg-amber-50 text-amber-900"
            )}
          >
            <p className="font-medium">Use Safari for the easiest install</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              Copy the link below, open <strong>Safari</strong>, paste it in the
              address bar, then follow the steps.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "mt-3 h-9 w-full rounded-lg",
                isNight &&
                  "border-white/20 bg-transparent text-white hover:bg-white/10"
              )}
              onClick={() => void handleCopy()}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Link copied!" : "Copy site link"}
            </Button>
          </div>
        )}

        <ol className="mt-5 space-y-4">
          <Step number={1} title="Tap the Share button" isNight={isNight}>
            {safari ? (
              <>
                At the <strong>bottom of Safari</strong>, tap the{" "}
                <Share className="inline h-4 w-4 align-text-bottom" /> Share
                icon (square with an arrow pointing up).
              </>
            ) : (
              <>
                In your browser menu, tap <strong>Share</strong>{" "}
                <Share className="inline h-4 w-4 align-text-bottom" /> or the
                three dots, then look for share options.
              </>
            )}
          </Step>

          <Step number={2} title='Choose "Add to Home Screen"' isNight={isNight}>
            Scroll the share menu and tap{" "}
            <strong>Add to Home Screen</strong>
            {safari ? " (you may need to scroll down in the list)." : "."}
          </Step>

          <Step number={3} title='Tap "Add"' isNight={isNight}>
            Confirm the name and tap <strong>Add</strong> in the top-right
            corner. The app icon will appear on your home screen.
          </Step>
        </ol>

        <Button
          type="button"
          className="mt-6 h-10 w-full rounded-lg"
          onClick={closeIosGuide}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
