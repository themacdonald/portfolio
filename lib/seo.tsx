import type { Metadata } from "next";

import { identity } from "@/data/config/identity";
import { caseStudies } from "@/data/config/case-studies";
import { agenticPortfolioPayload } from "@/lib/payload";

const dashboard = agenticPortfolioPayload.dashboard;

export const metadata: Metadata = {
  metadataBase: new URL(identity.siteUrl),
  title: `${identity.name} — ${identity.jobTitle}`,
  description: `${identity.jobTitle} and ${identity.secondaryTitle} in ${identity.location}. Model evaluation, preference data, fairness auditing and business intelligence dashboards.`,
  keywords: [
    "LLM evaluation",
    "AI data quality",
    "RLHF",
    "DPO",
    "fairness auditing",
    "data analyst",
    "Power BI",
    "analytical SQL",
    identity.name,
  ],
  authors: [{ name: identity.name, url: identity.github }],
  creator: identity.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: `${identity.name} — ${identity.jobTitle}`,
    description: `${identity.secondaryTitle}. ${dashboard.metrics.length} sourced metrics, ${dashboard.repositories.length} tracked repositories.`,
    url: identity.siteUrl,
    siteName: identity.name,
    locale: "en_US",
    images: [{ url: identity.ogImage, width: 1200, height: 630, alt: identity.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${identity.name} — ${identity.jobTitle}`,
    description: `${identity.secondaryTitle} and ${identity.jobTitle}.`,
    images: [identity.ogImage],
  },
  robots: { index: true, follow: true },
};

/**
 * JSON-LD profile graph. The same payload that renders the page also feeds
 * structured data, so cached search results cannot drift from the site.
 */
export function ProfileJsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${identity.siteUrl}/#person`,
    name: identity.name,
    alternateName: identity.handle,
    url: identity.siteUrl,
    jobTitle: identity.jobTitle,
    description: agenticPortfolioPayload.localizationRegistry.en.profileNarrative.summary,
    address: { "@type": "PostalAddress", addressLocality: identity.location },
    sameAs: identity.contacts
      .map((contact) => contact.url)
      .filter((url): url is string => Boolean(url && url.startsWith("http"))),
    knowsAbout: agenticPortfolioPayload.localizationRegistry.en.profileNarrative.focusAreas,
  };

  const projects = caseStudies
    .filter((study) => study.repo)
    .map((study) => {
      const repo = dashboard.repositories.find((entry) => entry.name === study.repo);
      if (!repo) return null;
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: repo.name,
        description: repo.description || study.slug,
        codeRepository: repo.url,
        programmingLanguage: repo.language,
        dateModified: repo.pushedAt,
        creator: { "@id": `${identity.siteUrl}/#person` },
      };
    })
    .filter(Boolean);

  const page = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: identity.siteUrl,
    dateModified: dashboard.generatedAt,
    mainEntity: { "@id": `${identity.siteUrl}/#person` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([page, person, ...projects]),
      }}
    />
  );
}
