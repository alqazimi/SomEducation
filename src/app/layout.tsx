import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import {
  absoluteUrl,
  buildPageTitle,
  SITE_KEYWORDS,
  siteSeo,
} from "@/lib/seo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "@/lib/clerk-env";
import "./globals.css";

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() ?? "ca20de5c3c61d824";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: buildPageTitle(),
    template: `%s | ${siteSeo.name}`,
  },
  description: siteSeo.description,
  applicationName: siteSeo.name,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: siteSeo.name, url: absoluteUrl() }],
  creator: siteSeo.name,
  publisher: siteSeo.name,
  category: "education",
  alternates: {
    canonical: absoluteUrl(),
  },
  openGraph: {
    type: "website",
    locale: siteSeo.locale,
    url: absoluteUrl(),
    siteName: siteSeo.name,
    title: buildPageTitle(),
    description: siteSeo.description,
    images: [
      {
        url: absoluteUrl("/icon.svg"),
        width: 512,
        height: 512,
        alt: `${siteSeo.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteSeo.name,
    description: siteSeo.tagline,
    images: [absoluteUrl("/icon.svg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleVerification,
  },
  other: {
    "apple-mobile-web-app-title": siteSeo.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={clerkAppearance}
    >
      <html lang="en" className={`${dmSans.variable} h-full`} data-scroll-behavior="smooth">
        <body className="flex min-h-full flex-col overflow-x-hidden antialiased">
          <SiteJsonLd />
          <Providers convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL ?? ""}>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
