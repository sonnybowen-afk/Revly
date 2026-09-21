import { RATING, SALON } from "@/lib/annie-salon";
import { METHODS } from "@/lib/annie-methods";
import { REVIEWS_VERIFIED } from "@/lib/annie-reviews";

/**
 * Structured data for the salon.
 *
 * A HairSalon node with the real NAP, opening hours and services, which is
 * what a local business needs for Google's map pack.
 *
 * The aggregateRating is included only because the figure is real and
 * carries its source. Individual review nodes are gated behind
 * REVIEWS_VERIFIED: emitting markup for placeholder reviews would be
 * feeding Google fake testimonials, which is both dishonest and a manual
 * penalty waiting to happen.
 */
export function SalonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${SALON.website}/#salon`,
    name: SALON.name,
    alternateName: SALON.alternateName,
    legalName: SALON.legalName,
    description:
      "Boutique hair extension studio in Manchester Arndale Market. LA weave, nano rings, micro rings, tape-in wefts and sew-in weaves, matched and fitted by Annie.",
    url: SALON.website,
    telephone: SALON.phoneE164,
    priceRange: "££",
    currenciesAccepted: "GBP",
    address: {
      "@type": "PostalAddress",
      streetAddress: SALON.address.unit,
      addressLocality: SALON.address.city,
      postalCode: SALON.address.postcode,
      addressCountry: "GB",
    },
    areaServed: { "@type": "City", name: "Manchester" },
    sameAs: [
      SALON.social.instagram,
      SALON.social.facebook,
      SALON.social.treatwell,
      SALON.social.fresha,
    ],
    openingHoursSpecification: SALON.hours
      .filter((day) => day.opens !== null)
      .map((day) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${day.day}`,
        opens: day.opens,
        closes: day.closes,
      })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: RATING.value,
      reviewCount: RATING.count,
      bestRating: 5,
      worstRating: 1,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Hair extension services",
      itemListElement: METHODS.map((method) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: method.name,
          description: method.summary,
          serviceType: "Hair extensions",
        },
      })),
    },
    // `review` nodes are deliberately absent: they are only emitted once
    // REVIEWS_VERIFIED says the wall holds imported reviews rather than
    // placeholders. Never mark up a placeholder as a customer review.
    ...(REVIEWS_VERIFIED ? { review: [] } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // The object is built from local constants, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Breadcrumbs, so search results show the path rather than a bare URL. */
export function BreadcrumbJsonLd({
  trail,
}: {
  trail: readonly { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SALON.website}${crumb.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
