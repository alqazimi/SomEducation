import type { Metadata } from "next";
import { ContactPage } from "@/features/marketing/contact-page";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("Contact"),
  description: `Contact ${PLATFORM_NAME} — email support and get help with courses and payments.`,
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
  openGraph: {
    title: buildPageTitle("Contact"),
    description: `Contact ${PLATFORM_NAME} — email support and get help with courses and payments.`,
    url: absoluteUrl("/contact"),
  },
};

export default function Page() {
  return <ContactPage />;
}
