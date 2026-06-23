import Link from "next/link";
import { Mail } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import type { LegalDocument } from "@/lib/legal/types";
import { marketingCardClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

function LegalSectionBlock({
  section,
}: {
  section: LegalDocument["sections"][number];
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-b border-white/10 pb-8 last:border-b-0 last:pb-0"
    >
      <h2 className="text-base font-medium leading-snug tracking-[-0.01em] text-white">
        {section.title}
      </h2>
      <div className="mt-3 space-y-3">
        {section.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]"
          >
            {paragraph}
          </p>
        ))}
      </div>
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {section.bullets.map((bullet) => (
            <li
              key={bullet.slice(0, 48)}
              className="flex gap-3 text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]"
            >
              <span
                aria-hidden
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <MarketingShell>
      <PageHeader
        variant="marketing"
        title={document.title}
        description={document.description}
      />

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-xs text-slate-500">
          Last updated {document.lastUpdated}
        </p>

        <p className="mt-6 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
          Please read this document carefully. It describes your rights and
          responsibilities when using {PLATFORM_NAME}.
        </p>

        <div className="mt-10 space-y-8">
          {document.sections.map((section) => (
            <LegalSectionBlock key={section.id} section={section} />
          ))}
        </div>

        <div className={cn(marketingCardClass, "mt-10 p-6")}>
          <div className="flex items-start gap-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
            <div>
              <p className="text-sm font-medium text-white">
                Questions about this document?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Contact our team at{" "}
                <a
                  href={`mailto:${PLATFORM_SUPPORT_EMAIL}`}
                  className="font-medium text-brand-400 hover:underline"
                >
                  {PLATFORM_SUPPORT_EMAIL}
                </a>
                . You can also visit our{" "}
                <Link
                  href="/support"
                  className="font-medium text-brand-400 hover:underline"
                >
                  Support page
                </Link>{" "}
                for help with payments and account issues.
              </p>
            </div>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}
