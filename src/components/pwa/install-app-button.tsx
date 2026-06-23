"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

type InstallAppButtonProps = {
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost";
  showIcon?: boolean;
};

export function InstallAppButton({
  className,
  size = "sm",
  variant = "outline",
  showIcon = true,
}: InstallAppButtonProps) {
  const { canPrompt, installing, install, platform } = usePwaInstall();

  if (!canPrompt) return null;

  const label =
    platform === "ios"
      ? installing
        ? "Installing…"
        : "Install app"
      : installing
        ? "Installing…"
        : "Install app";

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("rounded-lg", className)}
      disabled={installing}
      onClick={() => void install()}
    >
      {showIcon && <Download className="h-4 w-4" />}
      {label}
    </Button>
  );
}
