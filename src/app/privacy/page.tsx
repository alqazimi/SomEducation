import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { privacyPolicy } from "@/lib/legal/privacy-policy";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("Privacy Policy"),
  description: `Read the ${PLATFORM_NAME} Privacy Policy — how we collect, use, and protect your personal information.`,
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
  openGraph: {
    title: buildPageTitle("Privacy Policy"),
    description: `Privacy Policy for ${PLATFORM_NAME} online learning platform.`,
    url: absoluteUrl("/privacy"),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      document={privacyPolicy}
      relatedDocument={{ href: "/terms", label: "Terms of service" }}
    />
  );
}
