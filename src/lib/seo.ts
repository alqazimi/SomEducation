import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL, PLATFORM_TAGLINE } from "@/lib/brand";

export const SITE_KEYWORDS = [
  PLATFORM_NAME,
  "Som Education",
  "someducation",
  "online learning",
  "online courses",
  "learn online",
  "premium courses",
  "Somalia education",
  "e-learning platform",
] as const;

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (path === "/" || path === "") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const siteSeo = {
  name: PLATFORM_NAME,
  tagline: PLATFORM_TAGLINE,
  description:
    "SomEducation is a premium online learning platform. Browse expert-led courses, learn new skills, and grow your career with structured lessons and exams.",
  supportEmail: PLATFORM_SUPPORT_EMAIL,
  alternateNames: ["Som Education", "someducation", "Som Education Platform"],
  locale: "en_US",
} as const;

export function buildPageTitle(page?: string) {
  if (!page) return `${siteSeo.name} — ${siteSeo.tagline}`;
  return `${page} | ${siteSeo.name}`;
}
