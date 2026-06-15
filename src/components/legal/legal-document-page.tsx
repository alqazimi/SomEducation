import Link from "next/link";
import { Mail } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/layout/page-header";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import type { LegalDocument } from "@/lib/legal/types";
import { type } from "@/lib/typography";
import { cn } from "@/lib/utils";

function LegalSectionBlock({
  section,
}: {
  section: LegalDocument["sections"][number];
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-b border-border pb-8 last:border-b-0 last:pb-0"
    >
      <h2 className={type.sectionTitle}>{section.title}</h2>
      <div className="mt-3 space-y-3">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className={type.body}>
            {paragraph}
          </p>
        ))}
      </div>
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {section.bullets.map((bullet) => (
            <li key={bullet.slice(0, 48)} className={cn(type.body, "flex gap-3")}>
              <span
                aria-hidden
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <PageHeader title={document.title} description={document.description} />

        <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className={type.caption}>Last updated {document.lastUpdated}</p>

          <p className={`mt-6 ${type.lead}`}>
            Please read this document carefully. It describes your rights and
            responsibilities when using {PLATFORM_NAME}.
          </p>

          <div className="mt-10 space-y-8">
            {document.sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}
          </div>

          <div className="mt-10 rounded-lg border border-brand-100 bg-brand-50/40 p-6">
            <div className="flex items-start gap-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className={type.cardTitle}>Questions about this document?</p>
                <p className={`mt-2 ${type.bodySm}`}>
                  Contact our team at{" "}
                  <a
                    href={`mailto:${PLATFORM_SUPPORT_EMAIL}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {PLATFORM_SUPPORT_EMAIL}
                  </a>
                  . You can also visit our{" "}
                  <Link
                    href="/support"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    Support page
                  </Link>{" "}
                  for help with payments and account issues.
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
