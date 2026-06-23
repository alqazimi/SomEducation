import type { Metadata } from "next";
import { absoluteUrl, buildPageTitle, siteSeo } from "@/lib/seo";
import { MarketingHomePage } from "@/features/marketing/marketing-home-page";

export const metadata: Metadata = {
  title: buildPageTitle(),
  description: siteSeo.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: buildPageTitle(),
    description: siteSeo.description,
    url: absoluteUrl("/"),
    type: "website",
  },
};

export default function HomePage() {
  return <MarketingHomePage />;
}
