import Link from "next/link";
import { CalendarDays, Mail, Shield } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import type { LegalDocument } from "@/lib/legal/types";
import { type } from "@/lib/typography";
import { cn } from "@/lib/utils";

function LegalSectionBlock({
  section,
  index,
}: {
  section: LegalDocument["sections"][number];
  index: number;
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-b border-border pb-8 last:border-b-0 last:pb-0"
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
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
                <li
                  key={bullet.slice(0, 48)}
                  className={cn(type.body, "flex gap-3")}
                >
                  <span
                    aria-hidden
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function LegalDocumentPage({
  document,
  relatedDocument,
}: {
  document: LegalDocument;
  relatedDocument?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted">
        <PageHeader title={document.title} description={document.description} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {/* Mobile: table of contents + meta at top */}
          <Card className="mb-6 shadow-sm lg:hidden">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <div>
                  <p className={type.cardTitle}>{PLATFORM_NAME}</p>
                  <p className={`mt-1 ${type.caption}`}>
                    Last updated {document.lastUpdated}
                  </p>
                </div>
              </div>
              <nav aria-label="Table of contents">
                <p className={type.eyebrow}>On this page</p>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {document.sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={cn(
                          type.bodySm,
                          "block rounded-md px-2 py-2 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        )}
                      >
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                {relatedDocument && (
                  <Link
                    href={relatedDocument.href}
                    className={cn(
                      type.bodySm,
                      "rounded-md bg-stone-100 px-3 py-1.5 hover:bg-stone-200"
                    )}
                  >
                    {relatedDocument.label}
                  </Link>
                )}
                <Link
                  href="/support"
                  className={cn(
                    type.bodySm,
                    "rounded-md bg-stone-100 px-3 py-1.5 hover:bg-stone-200"
                  )}
                >
                  Support
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <Card className="shadow-sm">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <div>
                      <p className={type.cardTitle}>{PLATFORM_NAME}</p>
                      <p className={`mt-1 ${type.caption}`}>Legal document</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-stone-500">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <p className={type.caption}>
                      Last updated {document.lastUpdated}
                    </p>
                  </div>

                  <nav aria-label="Table of contents" className="hidden lg:block">
                    <p className={type.eyebrow}>On this page</p>
                    <ul className="mt-3 space-y-2">
                      {document.sections.map((section, index) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className={cn(
                              type.bodySm,
                              "block rounded-md px-2 py-1.5 transition-colors hover:bg-stone-100 hover:text-stone-900"
                            )}
                          >
                            {index + 1}. {section.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div className="border-t border-border pt-4">
                    <p className={type.eyebrow}>Related</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {relatedDocument && (
                        <Link
                          href={relatedDocument.href}
                          className={cn(
                            type.bodySm,
                            "rounded-md bg-stone-100 px-3 py-1.5 hover:bg-stone-200"
                          )}
                        >
                          {relatedDocument.label}
                        </Link>
                      )}
                      <Link
                        href="/support"
                        className={cn(
                          type.bodySm,
                          "rounded-md bg-stone-100 px-3 py-1.5 hover:bg-stone-200"
                        )}
                      >
                        Support
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <div className="min-w-0 space-y-8">
              <Card className="shadow-sm">
                <CardContent className="space-y-8 p-6 sm:p-8">
                  <p className={type.lead}>
                    Please read this document carefully. It describes your
                    rights and responsibilities when using {PLATFORM_NAME}.
                  </p>

                  {document.sections.map((section, index) => (
                    <LegalSectionBlock
                      key={section.id}
                      section={section}
                      index={index}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-brand-100 bg-brand-50/40 shadow-sm">
                <CardContent className="flex items-start gap-4 p-6">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
