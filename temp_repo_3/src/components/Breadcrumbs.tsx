import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbSchema } from "./SchemaMarkup";

const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  "services": "Services",
  "pricing": "Pricing",
  "support": "Support",
  "faq": "FAQ",
  "how-it-works": "How It Works",
  "blog": "Blog",
  "about": "About",
  "contact": "Contact",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  "refund-policy": "Refund Policy"
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) return null; // Don't show on home

  const crumbs = [
    { name: "Home", url: "https://growplex.sbs/" },
    ...pathSegments.map((seg, idx) => ({
      name: ROUTE_LABELS[seg] || seg.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      url: `https://growplex.sbs/${pathSegments.slice(0, idx + 1).join("/")}`
    }))
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-1.5 text-sm text-text-muted flex-wrap">
          {crumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight size={14} className="opacity-40" />}
              {idx === crumbs.length - 1 ? (
                <span className="text-text-main font-medium">{crumb.name}</span>
              ) : (
                <Link
                  to={idx === 0 ? "/" : `/${pathSegments.slice(0, idx).join("/")}`}
                  className="hover:text-brand-accent transition-colors flex items-center gap-1"
                >
                  {idx === 0 && <Home size={14} />}
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
