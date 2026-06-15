import { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { PLATFORM_NAME } from "@/lib/brand";
import { absoluteUrl, buildPageTitle } from "@/lib/seo";
import { CourseDetailClient } from "./course-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fallbackTitle = titleFromSlug(slug);
  let title = fallbackTitle;
  let description = `Learn ${fallbackTitle} on ${PLATFORM_NAME}. Expert-led lessons, structured modules, and career-focused skills.`;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim().replace(/\/+$/, "");
  if (convexUrl && !convexUrl.includes("build-placeholder")) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      const course = await client.query(api.courses.getBySlug, { slug });
      if (course) {
        title = course.title;
        description = course.description.slice(0, 160);
      }
    } catch {
      // Use slug-based fallback metadata.
    }
  }

  const pageUrl = absoluteUrl(`/courses/${slug}`);

  return {
    title: buildPageTitle(title),
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: buildPageTitle(title),
      description,
      url: pageUrl,
      type: "website",
      siteName: PLATFORM_NAME,
      images: [{ url: absoluteUrl("/icon.svg"), alt: `${title} on ${PLATFORM_NAME}` }],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
