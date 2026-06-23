"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/pwa/pwa-install-provider";
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
  const { canInstall, installing, install, platform } = usePwaInstall();

  if (!canInstall) return null;

  const isIos = platform === "ios";
  const label = isIos
    ? "Add to Home Screen"
    : installing
      ? "Installing…"
      : "Install app";

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("rounded-lg", className)}
      disabled={installing && !isIos}
      onClick={() => void install()}
    >
      {showIcon && <Download className="h-4 w-4" />}
      {label}
    </Button>
  );
}
