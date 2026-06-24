"use client";

import Link from "next/link";
import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type CoursePreviewHeroProps = {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  previewLesson?: {
    _id: string;
    title: string;
    youtubeVideoId?: string | null;
    videoUrl?: string | null;
  } | null;
};

export function CoursePreviewHero({
  slug,
  title,
  thumbnailUrl,
  previewLesson,
}: CoursePreviewHeroProps) {
  const [playing, setPlaying] = useState(false);

  const embedUrl = previewLesson?.youtubeVideoId
    ? getYoutubeEmbedUrl(previewLesson.youtubeVideoId)
    : previewLesson?.videoUrl
      ? previewLesson.videoUrl
      : null;
  const previewHref = previewLesson
    ? `/learn/${slug}/lessons/${previewLesson._id}`
    : null;
  const canPlayInline = !!embedUrl;

  return (
    <div className="overflow-hidden rounded-xl border border-marketing-border bg-marketing-card shadow-sm">
      <div className="relative aspect-video w-full bg-marketing-elevated">
        {playing && canPlayInline ? (
          previewLesson?.youtubeVideoId ? (
            <iframe
              src={`${embedUrl}?autoplay=1&rel=0`}
              title={`Preview: ${previewLesson.title}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={previewLesson?.videoUrl ?? undefined}
              controls
              autoPlay
              className="absolute inset-0 h-full w-full object-contain"
            />
          )
        ) : (
          <>
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-marketing-elevated" />
            )}
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              {canPlayInline ? (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="group flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform hover:scale-105"
                  aria-label="Play course preview"
                >
                  <PlayCircle className="h-8 w-8 transition-transform group-hover:scale-110" />
                </button>
              ) : previewHref ? (
                <Link href={previewHref}>
                  <Button
                    size="lg"
                    className="gap-2 bg-white text-brand-700 hover:bg-white/90"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Preview this course
                  </Button>
                </Link>
              ) : null}
              {previewLesson && (
                <p className="max-w-md text-sm font-medium text-white drop-shadow">
                  Preview: {previewLesson.title}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      {previewLesson && previewHref && playing && (
        <div className="flex items-center justify-between gap-3 border-t border-marketing-border px-4 py-3 text-sm">
          <span className="text-marketing-muted">
            Watching free preview lesson
          </span>
          <Link
            href={previewHref}
            className={cn(
              "font-medium text-brand-600 hover:text-brand-500 hover:underline"
            )}
          >
            Open full lesson
          </Link>
        </div>
      )}
    </div>
  );
}
