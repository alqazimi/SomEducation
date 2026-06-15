import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
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
      url: absoluteUrl("/support"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
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
    const courses = await client.query(api.courses.listPublished, { limit: 50 });

    const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
      url: absoluteUrl(`/courses/${course.slug}`),
      lastModified: new Date(course.updatedAt ?? course.createdAt ?? now),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...coursePages];
  } catch {
    return staticPages;
  }
}
