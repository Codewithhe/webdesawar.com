import { HOME_FAQ_ITEMS } from "./content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [
      "Mini Desawar Result",
      "Mini Desawar Fast Result",
      "Mini Desawar Today Result",
      "Desawar Result",
    ],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon"),
    description: SITE_DESCRIPTION,
  };
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createHomeStructuredData() {
  return [createBreadcrumbSchema([{ name: "Home", path: "/" }]), createFaqSchema()];
}

export function createMonthChartStructuredData() {
  return [
    createBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Monthly Chart", path: "/month-chart" },
    ]),
  ];
}
