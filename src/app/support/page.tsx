import type { Metadata } from "next";
import { SupportPage } from "@/features/support/support-page";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("Support"),
  description: `Get help with ${PLATFORM_NAME} — how to pay for courses, payment methods, and support contact.`,
  alternates: {
    canonical: absoluteUrl("/support"),
  },
  openGraph: {
    title: buildPageTitle("Support"),
    description: `Payment help and support for ${PLATFORM_NAME} online courses.`,
    url: absoluteUrl("/support"),
  },
};

export default function Page() {
  return <SupportPage />;
}
