import { MARKETING_TRUSTED_BY } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

function TrustedLogo({
  name,
  logo,
  className,
}: {
  name: string;
  logo: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-8 min-w-[5.5rem] items-center justify-center sm:h-9",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={`${name} logo`}
        width={120}
        height={32}
        loading="lazy"
        decoding="async"
        className="max-h-7 w-auto max-w-[7.5rem] object-contain opacity-80 transition-opacity hover:opacity-100 sm:max-h-8 sm:max-w-[8.5rem] dark:brightness-200 dark:opacity-70"
      />
    </div>
  );
}

export function MarketingTrustedBy({ className }: { className?: string }) {
  const { headline, companies } = MARKETING_TRUSTED_BY;

  return (
    <section
      aria-label="Trusted by leading companies"
      className={cn(
        "border-b border-marketing-border bg-marketing-bg py-8 sm:py-10",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-marketing-muted sm:text-base">
          {headline}
        </p>

        <ul
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10 md:gap-x-12 lg:gap-x-14"
          role="list"
        >
          {companies.map((company) => (
            <li key={company.id} className="list-none">
              <TrustedLogo name={company.name} logo={company.logo} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
