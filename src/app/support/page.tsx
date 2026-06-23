import type { Metadata } from "next";
import { SupportPage } from "@/features/support/support-page";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("Help Center"),
  description: `Payment help for ${PLATFORM_NAME} — how to pay, upload proof, and get course access.`,
  alternates: {
    canonical: absoluteUrl("/support"),
  },
  openGraph: {
    title: buildPageTitle("Help Center"),
    description: `Payment help for ${PLATFORM_NAME} — how to pay, upload proof, and get course access.`,
    url: absoluteUrl("/support"),
  },
};

export default function Page() {
  return <SupportPage />;
}
