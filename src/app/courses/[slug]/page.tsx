import { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/brand";
import { CourseDetailClient } from "./course-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    description: `Learn ${slug.replace(/-/g, " ")} on ${PLATFORM_NAME}`,
    openGraph: {
      title: slug.replace(/-/g, " "),
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
