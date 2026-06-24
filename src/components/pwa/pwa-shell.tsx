"use client";

import dynamic from "next/dynamic";

const InstallPrompt = dynamic(
  () =>
    import("./install-prompt").then((mod) => ({ default: mod.InstallPrompt })),
  { ssr: false }
);

export function PwaShell() {
  return <InstallPrompt />;
}
