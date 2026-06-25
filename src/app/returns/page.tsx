import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { returnPolicy } from "@/lib/legal/return-policy";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("Return & Refund Policy"),
  description: `Read the ${PLATFORM_NAME} 24-hour return and refund policy for paid course purchases.`,
  alternates: {
    canonical: absoluteUrl("/returns"),
  },
  openGraph: {
    title: buildPageTitle("Return & Refund Policy"),
    description: `24-hour return policy for ${PLATFORM_NAME} paid courses.`,
    url: absoluteUrl("/returns"),
  },
};

export default function ReturnPolicyPage() {
  return <LegalDocumentPage document={returnPolicy} />;
}
