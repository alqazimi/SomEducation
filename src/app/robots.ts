import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/courses", "/courses/", "/support", "/how-it-works", "/contact", "/returns", "/privacy", "/terms", "/sign-in", "/sign-up"],
      disallow: ["/dashboard/", "/learn/", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
