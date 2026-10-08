import type { Metadata } from "next";
import { SCHOOL } from "@/lib/school";

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:8080";
  return raw.replace(/\/$/, "");
}

const OG_IMAGE = "/kids-hero.jpg";

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: "fa_IR",
      type: "website",
      siteName: SCHOOL.name,
      images: [{ url: OG_IMAGE, alt: SCHOOL.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export const privateMeta: Metadata = {
  robots: { index: false, follow: false },
};

export function schoolJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "School"],
    name: SCHOOL.name,
    alternateName: ["Golestan Shadi", "دبستان گلستان شادی", "پیش‌دبستان گلستان شادی"],
    description: "پیش‌دبستان مختلط، دبستان دخترانه و زبانکده انگلیسی گلستان شادی در شهر جدید سهند.",
    url,
    logo: `${url}/logo.png`,
    image: `${url}/kids-hero.jpg`,
    telephone: ["+984133406631", "+989144169159"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "شهر جدید سهند",
      addressRegion: "آذربایجان شرقی",
      addressCountry: "IR",
    },
    areaServed: "شهر جدید سهند",
    sameAs: [SCHOOL.instagram],
    hasMap: SCHOOL.mapsUrl,
  };
}
