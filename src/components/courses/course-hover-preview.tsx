"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  PlayCircle,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

export type CourseHoverPreviewData = {
  href: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  teacherName?: string;
  categoryName?: string;
  enrollmentCount?: number;
  durationHours?: number;
  lessonCount?: number;
  price?: number;
  currency?: string;
  compareAtPrice?: number;
  difficulty?: string;
  bestseller?: boolean;
  hasFreePreview?: boolean;
  showPrice?: boolean;
};

const PANEL_WIDTH = 320;
const HOVER_DELAY_MS = 350;

function studentsLabel(count: number) {
  if (count <= 0) return "New course";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K students`;
  return `${count} students`;
}

function CourseHoverPreviewPanel({
  preview,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  preview: CourseHoverPreviewData;
  style: React.CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const isFree = (preview.price ?? 0) === 0;
  const hasDiscount =
    !isFree &&
    preview.compareAtPrice !== undefined &&
    preview.compareAtPrice > (preview.price ?? 0);

  return (
    <div
      className="pointer-events-auto fixed z-[80] w-[320px] overflow-hidden rounded-xl border border-marketing-border bg-marketing-card shadow-2xl shadow-black/20"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
    >
      {preview.thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-marketing-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          {preview.hasFreePreview && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
              <PlayCircle className="h-3.5 w-3.5" />
              Free preview
            </span>
          )}
        </div>
      ) : null}

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {preview.difficulty && (
            <Badge className="rounded-md border-0 bg-marketing-badge px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-marketing-badge-fg">
              {preview.difficulty}
            </Badge>
          )}
          {preview.bestseller && (
            <Badge className="rounded-md border-0 bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Bestseller
            </Badge>
          )}
          {preview.categoryName && (
            <Badge variant="outline" className="text-[10px]">
              {preview.categoryName}
            </Badge>
          )}
        </div>

        <h4 className="line-clamp-2 text-base font-semibold leading-snug text-marketing-fg">
          {preview.title}
        </h4>

        {preview.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-marketing-muted">
            {preview.description}
          </p>
        )}

        {preview.teacherName && (
          <p className="flex items-center gap-1.5 text-xs text-marketing-muted">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{preview.teacherName}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-marketing-muted">
          {preview.durationHours !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-600" />
              {preview.durationHours}h
            </span>
          )}
          {preview.lessonCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-brand-600" />
              {preview.lessonCount} lessons
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-brand-600" />
            {studentsLabel(preview.enrollmentCount ?? 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-marketing-border pt-3">
          {preview.showPrice ? (
            isFree ? (
              <span className="text-sm font-semibold text-emerald-600">Free</span>
            ) : (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-base font-bold text-marketing-fg">
                  {formatPrice(preview.price ?? 0, preview.currency ?? "USD")}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-marketing-muted line-through">
                    {formatPrice(
                      preview.compareAtPrice!,
                      preview.currency ?? "USD"
                    )}
                  </span>
                )}
              </div>
            )
          ) : (
            <span />
          )}

          <Link href={preview.href}>
            <Button size="sm" className="h-8 gap-1 px-3 text-xs">
              View course
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CourseHoverPreview({
  preview,
  children,
  className,
  enabled = true,
}: {
  preview: CourseHoverPreviewData;
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const canHover = useCallback(() => {
    if (!enabled || typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;
  }, [enabled]);

  const updatePosition = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const gap = 12;
    let left = rect.right + gap;
    let top = rect.top;

    if (left + PANEL_WIDTH > window.innerWidth - 16) {
      left = rect.left - PANEL_WIDTH - gap;
    }
    if (left < 16) {
      left = Math.max(16, rect.left);
      top = rect.bottom + gap;
    }

    const maxTop = window.innerHeight - 420;
    top = Math.max(16, Math.min(top, maxTop));

    setPosition({ top, left });
  }, []);

  const clearTimers = () => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleShow = () => {
    if (!canHover()) return;
    clearTimers();
    showTimerRef.current = window.setTimeout(() => {
      updatePosition();
      setOpen(true);
    }, HOVER_DELAY_MS);
  };

  const scheduleHide = () => {
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => setOpen(false), 120);
  };

  const keepOpen = () => {
    clearTimers();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  return (
    <div
      ref={anchorRef}
      className={cn("relative h-full", className)}
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
      onFocus={scheduleShow}
      onBlur={scheduleHide}
    >
      {children}
      {mounted && open && canHover()
        ? createPortal(
            <CourseHoverPreviewPanel
              preview={preview}
              style={{ top: position.top, left: position.left }}
              onMouseEnter={keepOpen}
              onMouseLeave={scheduleHide}
            />,
            document.body
          )
        : null}
    </div>
  );
}
