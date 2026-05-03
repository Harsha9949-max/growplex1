import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Reusable JSON-LD injector
export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

// BreadcrumbList schema
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  return <JsonLd data={data} />;
}

// Service schema
export function ServiceSchema({ name, description, price, currency = "INR", areaServed = "Worldwide" }: {
  name: string;
  description: string;
  price: string;
  currency?: string;
  areaServed?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": name,
    "provider": {
      "@type": "Organization",
      "name": "Growplex",
      "url": "https://growplex.sbs"
    },
    "areaServed": areaServed,
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock"
    },
    "termsOfService": "https://growplex.sbs/terms-of-service"
  };
  return <JsonLd data={data} />;
}

// FAQ schema
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  return <JsonLd data={data} />;
}

// AggregateRating schema
export function AggregateRatingSchema({ ratingValue, reviewCount, bestRating = 5 }: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Growplex SMM Panel",
    "description": "The cheapest SMM panel with no login required. Instant delivery of social media services.",
    "brand": { "@type": "Brand", "name": "Growplex" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "bestRating": bestRating,
      "reviewCount": reviewCount
    }
  };
  return <JsonLd data={data} />;
}
