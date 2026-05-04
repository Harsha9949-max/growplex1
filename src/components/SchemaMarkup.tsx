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
    "description": "India's cheapest SMM panel with no login required. Buy instant Instagram followers, YouTube subscribers, Telegram members at the lowest prices. Instant delivery guaranteed.",
    "brand": { "@type": "Brand", "name": "Growplex" },
    "url": "https://growplex.sbs",
    "image": "https://growplex.sbs/og-image.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "bestRating": bestRating,
      "worstRating": 1,
      "reviewCount": reviewCount
    },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Rahul S." },
        "datePublished": "2026-04-15",
        "reviewBody": "Excellent service and fast delivery. Got 5K Instagram followers in under 12 hours. No login asked — very safe!",
        "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5 }
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Sarah J." },
        "datePublished": "2026-04-20",
        "reviewBody": "I was skeptical about no-login panels, but Growplex delivered exactly as promised. Cheapest prices I've found anywhere.",
        "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5 }
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Carlos R." },
        "datePublished": "2026-04-25",
        "reviewBody": "Best SMM panel I've used. No password required and the prices are unbeatable. Already ordered 3 times!",
        "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5 }
      }
    ]
  };
  return <JsonLd data={data} />;
}

// HowTo schema - for the "How It Works" page
export function HowToSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Buy Instagram Followers Without Login on Growplex",
    "description": "A step-by-step guide to ordering social media growth services on Growplex — the cheapest SMM panel with no login required.",
    "totalTime": "PT1M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "8"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Paste Your Link",
        "text": "Copy your Instagram profile URL or post link and paste it into the Growplex order form. No password or login credentials are needed — only the public link.",
        "url": "https://growplex.sbs/services"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Pay Securely",
        "text": "Choose your service package and complete payment through encrypted gateway. Supports UPI, credit/debit cards, net banking, and wallets.",
        "url": "https://growplex.sbs/services"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Watch It Grow",
        "text": "Your order starts processing instantly. Track progress with your unique order ID — no login needed. Most orders complete within minutes.",
        "url": "https://growplex.sbs/services"
      }
    ]
  };
  return <JsonLd data={data} />;
}

// Offer Catalog schema - for Services page
export function OfferCatalogSchema({ services }: { services: { name: string; price: string; description: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "Growplex SMM Services",
    "description": "Complete catalog of social media marketing services available on Growplex — the cheapest SMM panel without login.",
    "url": "https://growplex.sbs/services",
    "itemListElement": services.map((service, idx) => ({
      "@type": "Offer",
      "position": idx + 1,
      "name": service.name,
      "description": service.description,
      "price": service.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Growplex",
        "url": "https://growplex.sbs"
      }
    }))
  };
  return <JsonLd data={data} />;
}

// Article schema - for blog posts
export function ArticleSchema({ title, description, datePublished, dateModified, slug }: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "url": `https://growplex.sbs/blog/${slug}`,
    "image": "https://growplex.sbs/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "Growplex",
      "url": "https://growplex.sbs"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Growplex",
      "url": "https://growplex.sbs",
      "logo": {
        "@type": "ImageObject",
        "url": "https://growplex.sbs/favicon.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://growplex.sbs/blog/${slug}`
    }
  };
  return <JsonLd data={data} />;
}
