"use client";

import { PLATFORM_NAME } from "@/lib/brand";
import { CourseDetailView } from "@/features/courses/course-detail-view";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function CourseDetailClient({ slug }: { slug: string }) {
  const course = useQuery(api.courses.getBySlug, { slug });

  return (
    <>
      <CourseDetailView slug={slug} />
      {course && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: course.title,
              description: course.description,
              provider: {
                "@type": "Organization",
                name: PLATFORM_NAME,
              },
              offers: {
                "@type": "Offer",
                price: course.price,
                priceCurrency: course.currency,
              },
            }),
          }}
        />
      )}
    </>
  );
}
