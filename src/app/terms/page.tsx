import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { termsOfService } from "@/lib/legal/terms-of-service";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("Terms of Service"),
  description: `Read the ${PLATFORM_NAME} Terms of Service — rules for using our online learning platform.`,
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
  openGraph: {
    title: buildPageTitle("Terms of Service"),
    description: `Terms of Service for ${PLATFORM_NAME} online learning platform.`,
    url: absoluteUrl("/terms"),
  },
};

export default function TermsOfServicePage() {
  return <LegalDocumentPage document={termsOfService} />;
}
