import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

/** Regenerate sitemap on each request so course URLs stay current on Vercel. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/courses"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/how-it-works"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/support"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/returns"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/sign-in"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/sign-up"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim().replace(/\/+$/, "");
  if (!convexUrl || convexUrl.includes("build-placeholder")) {
    return staticPages;
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const courses = await client.query(api.courses.listPublishedForSitemap, {});

    const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
      url: absoluteUrl(`/courses/${course.slug}`),
      lastModified: new Date(
        course.updatedAt ?? course.publishedAt ?? now.getTime()
      ),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...coursePages];
  } catch {
    return staticPages;
  }
}
