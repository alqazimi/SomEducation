import { absoluteUrl, siteSeo } from "@/lib/seo";

export function SiteJsonLd() {
  const siteUrl = absoluteUrl();
  const logoUrl = absoluteUrl("/icon");

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteSeo.name,
    alternateName: siteSeo.alternateNames,
    url: siteUrl,
    description: siteSeo.description,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: siteSeo.name,
      url: siteUrl,
      logo: logoUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/courses")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSeo.name,
    alternateName: siteSeo.alternateNames,
    url: siteUrl,
    logo: logoUrl,
    description: siteSeo.description,
    email: siteSeo.supportEmail,
    sameAs: [] as string[],
  };

  const educational = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteSeo.name,
    alternateName: siteSeo.alternateNames,
    url: siteUrl,
    description: siteSeo.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educational) }}
      />
    </>
  );
}
