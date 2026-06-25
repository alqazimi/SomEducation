import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  MARKETING_TESTIMONIALS,
  MARKETING_TESTIMONIALS_SECTION,
} from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-slate-300"
          )}
          strokeWidth={i < rating ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

function ReviewAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        className="h-12 w-12 shrink-0 rounded-full object-cover bg-muted"
      />
    );
  }

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
      aria-hidden
    >
      {initial}
    </div>
  );
}

function TestimonialCard({
  name,
  avatarUrl,
  rating,
  review,
  courseTitle,
  createdAt,
}: (typeof MARKETING_TESTIMONIALS)[number]) {
  return (
    <Card className="h-full border-border shadow-sm transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <ReviewAvatar name={name} avatarUrl={avatarUrl} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{createdAt}</p>
          </div>
        </div>
        <div className="mb-3">
          <StarRating rating={rating} />
        </div>
        <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{review}</p>
        <Link
          href="/courses"
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          {courseTitle}
        </Link>
      </CardContent>
    </Card>
  );
}

export function MarketingSocialProof() {
  const { title, description } = MARKETING_TESTIMONIALS_SECTION;

  return (
    <section
      aria-labelledby="student-reviews-heading"
      className="border-t border-border bg-muted/30 py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2
            id="student-reviews-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MARKETING_TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
