"use client";

import { useEffect } from "react";
import { InstallPrompt } from "./install-prompt";
import { registerServiceWorker } from "@/lib/pwa";

export function PwaShell() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return <InstallPrompt />;
}
