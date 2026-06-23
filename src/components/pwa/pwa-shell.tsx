"use client";

import dynamic from "next/dynamic";

const InstallPrompt = dynamic(
  () =>
    import("./install-prompt").then((mod) => ({ default: mod.InstallPrompt })),
  { ssr: false }
);

const IosInstallGuide = dynamic(
  () =>
    import("./ios-install-guide").then((mod) => ({
      default: mod.IosInstallGuide,
    })),
  { ssr: false }
);

export function PwaShell() {
  return (
    <>
      <InstallPrompt />
      <IosInstallGuide />
    </>
  );
}
