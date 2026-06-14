import type { Metadata } from "next";
import { SupportPage } from "@/features/support/support-page";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Support",
  description: `Learn how to pay for courses on ${PLATFORM_NAME} — payment steps, methods, and help.`,
};

export default function Page() {
  return <SupportPage />;
}
