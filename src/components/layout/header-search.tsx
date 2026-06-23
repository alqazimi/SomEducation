"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function HeaderSearch({
  className,
  inputClassName,
  placeholder = "Search e-learning courses, topics, skills…",
  autoFocus = false,
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(urlSearch);
  const [syncedUrlSearch, setSyncedUrlSearch] = useState(urlSearch);

  if (urlSearch !== syncedUrlSearch) {
    setSyncedUrlSearch(urlSearch);
    setQuery(urlSearch);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed
        ? `/courses?search=${encodeURIComponent(trimmed)}`
        : "/courses"
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
      role="search"
    >
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className={cn(
          "h-10 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 transition-colors",
          "focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          inputClassName
        )}
      />
    </form>
  );
}
