import type { Metadata } from "next";
import { HowItWorksPage } from "@/features/marketing/how-it-works-page";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: buildPageTitle("How It Works"),
  description: `Learn how ${PLATFORM_NAME} works — browse courses, enroll, and study at your own pace.`,
  alternates: {
    canonical: absoluteUrl("/how-it-works"),
  },
  openGraph: {
    title: buildPageTitle("How It Works"),
    description: `Learn how ${PLATFORM_NAME} works — browse courses, enroll, and study at your own pace.`,
    url: absoluteUrl("/how-it-works"),
  },
};

export default function Page() {
  return <HowItWorksPage />;
}
