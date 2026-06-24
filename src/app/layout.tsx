import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { ClerkSetupRequired } from "@/components/auth/clerk-setup-required";
import { PwaShell } from "@/components/pwa/pwa-shell";
import { PwaInstallProvider } from "@/components/pwa/pwa-install-provider";
import { MarketingThemeProvider } from "@/components/marketing/marketing-theme-provider";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import {
  absoluteUrl,
  buildPageTitle,
  SITE_KEYWORDS,
  siteSeo,
} from "@/lib/seo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { isClerkConfigured } from "@/lib/clerk-config";
import { PWA_EARLY_INSTALL_CAPTURE } from "@/lib/pwa";
import "@/lib/clerk-env";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteSeo.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkConfigured = isClerkConfigured();

  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full`}
      data-scroll-behavior="smooth"
      data-marketing-theme="night"
      suppressHydrationWarning
    >
      <head>
        {process.env.NEXT_PUBLIC_CONVEX_URL ? (
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_CONVEX_URL}
          />
        ) : null}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        <script
          dangerouslySetInnerHTML={{
            __html: PWA_EARLY_INSTALL_CAPTURE,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("someducation-marketing-theme");if(t==="day"||t==="night")document.documentElement.setAttribute("data-marketing-theme",t)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden antialiased">
        <MarketingThemeProvider>
          <PwaInstallProvider>
            <SiteJsonLd />
            <PwaShell />
            {clerkConfigured ? (
            <ClerkProvider
              signInUrl="/sign-in"
              signUpUrl="/sign-up"
              signInFallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
              appearance={clerkAppearance}
              publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            >
              <Providers convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL ?? ""}>
                {children}
              </Providers>
            </ClerkProvider>
          ) : (
            <ClerkSetupRequired />
          )}
          </PwaInstallProvider>
        </MarketingThemeProvider>
      </body>
    </html>
  );
}
