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
  const { canInstall, installing, installFromClick } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("pointer-events-auto cursor-pointer rounded-lg", className)}
      disabled={installing}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        installFromClick();
      }}
    >
      {showIcon && <Download className="h-4 w-4" />}
      {installing ? "Installing…" : "Install app"}
    </Button>
  );
}
