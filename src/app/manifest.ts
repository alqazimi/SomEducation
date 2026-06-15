import type { MetadataRoute } from "next";
import { PLATFORM_NAME, PLATFORM_TAGLINE } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PLATFORM_NAME} — ${PLATFORM_TAGLINE}`,
    short_name: PLATFORM_NAME,
    description:
      "SomEducation — browse expert-led online courses and start learning today.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
