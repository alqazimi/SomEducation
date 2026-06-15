import type { Metadata } from "next";
import { PLATFORM_NAME, PLATFORM_TAGLINE } from "@/lib/brand";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: `${PLATFORM_NAME} — ${PLATFORM_TAGLINE}`,
    template: `%s | ${PLATFORM_NAME}`,
  },
  description:
    `Learn from expert teachers with ${PLATFORM_NAME}. Browse courses, submit manual payments, and start learning today.`,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: PLATFORM_NAME,
    title: `${PLATFORM_NAME} — ${PLATFORM_TAGLINE}`,
    description:
      `Learn from expert teachers with ${PLATFORM_NAME}. Browse courses and start your learning journey.`,
  },
  twitter: {
    card: "summary_large_image",
    title: PLATFORM_NAME,
    description: PLATFORM_TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full`} data-scroll-behavior="smooth">
        <body className="min-h-full flex flex-col antialiased">
          <Providers convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL ?? ""}>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
