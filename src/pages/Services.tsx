import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import {
  ChevronDown,
  Clock,
  Facebook,
  Instagram,
  Search,
  Send,
  Sparkles,
  X,
  Youtube,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo, useState } from "react";
import { SEO } from "../components/SEO";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { OfferBanners } from "../components/OfferBanners";
import { OrderModal } from "../components/OrderModal";
import { useServices } from "../hooks/useServices";
import { db } from "../lib/firebase";
import { Package, Service } from "../types";

export const BASE_SERVICES: Service[] = [
  {
    id: "s1", category: "Instagram Followers", name: "Instagram Followers", deliveryTime: "1-24 hours",
    description: "Grow your Instagram followers quickly with high-quality, stable accounts.",
    packages: [
      { id: "pkg_1_1", quantity: "50", price: 8, basePrice: 8 },
      { id: "pkg_1_2", quantity: "100", price: 13, basePrice: 13 },
      { id: "pkg_1_3", quantity: "1000", price: 49, basePrice: 49 },
      { id: "pkg_1_4", quantity: "2000", price: 79, basePrice: 79 },
      { id: "pkg_1_5", quantity: "5000", price: 99, basePrice: 99 },
      { id: "pkg_1_6", quantity: "10000", price: 150, basePrice: 150 },
      { id: "pkg_1_7", quantity: "15000", price: 199, basePrice: 199 },
      { id: "pkg_1_8", quantity: "25000", price: 299, basePrice: 299 },
      { id: "pkg_1_9", quantity: "50000", price: 449, basePrice: 449 },
      { id: "pkg_1_10", quantity: "100K", price: 649, basePrice: 649 },
      { id: "pkg_1_11", quantity: "1M", price: 499, basePrice: 499 }
    ]
  },
  {
    id: "s2", category: "Instagram Likes", name: "Instagram Likes", deliveryTime: "Instant",
    description: "Instant likes on your latest Instagram post to boost engagement.",
    packages: [
      { id: "pkg_2_1", quantity: "1000", price: 30, basePrice: 30 },
      { id: "pkg_2_2", quantity: "2000", price: 48, basePrice: 48 },
      { id: "pkg_2_3", quantity: "5000", price: 69, basePrice: 69 },
      { id: "pkg_2_4", quantity: "10000", price: 99, basePrice: 99 },
      { id: "pkg_2_5", quantity: "20000", price: 149, basePrice: 149 }
    ]
  },
  {
    id: "s3", category: "Instagram Comments", name: "Instagram Comments", deliveryTime: "1-6 hours",
    description: "Customizable comments to spark conversation on your posts.",
    packages: [
      { id: "pkg_3_1", quantity: "100", price: 35, basePrice: 35 },
      { id: "pkg_3_2", quantity: "200", price: 65, basePrice: 65 },
      { id: "pkg_3_3", quantity: "500", price: 150, basePrice: 150 },
      { id: "pkg_3_4", quantity: "1000", price: 280, basePrice: 280 }
    ]
  },
  {
    id: "s4", category: "Instagram Reel Views", name: "Instagram Reel Views", deliveryTime: "Instant",
    description: "High retention Instagram Reel views to help your video rank higher in algorithms.",
    packages: [
      { id: "pkg_4_1", quantity: "5000", price: 7, basePrice: 7 },
      { id: "pkg_4_2", quantity: "10000", price: 12, basePrice: 12 },
      { id: "pkg_4_3", quantity: "25000", price: 25, basePrice: 25 },
      { id: "pkg_4_4", quantity: "50000", price: 45, basePrice: 45 },
      { id: "pkg_4_5", quantity: "100000", price: 75, basePrice: 75 },
      { id: "pkg_4_6", quantity: "200000", price: 90, basePrice: 90 },
      { id: "pkg_4_7", quantity: "300000", price: 109, basePrice: 109 },
      { id: "pkg_4_8", quantity: "500000", price: 125, basePrice: 125 },
      { id: "pkg_4_9", quantity: "1000000", price: 219, basePrice: 219 }
    ]
  },
  {
    id: "s5", category: "Instagram Story Views", name: "Instagram Story Views", deliveryTime: "Instant",
    description: "Increase story views quickly.",
    packages: [
      { id: "pkg_5_1", quantity: "1000", price: 24, basePrice: 24 },
      { id: "pkg_5_2", quantity: "2000", price: 35, basePrice: 35 },
      { id: "pkg_5_3", quantity: "5000", price: 45, basePrice: 45 },
      { id: "pkg_5_4", quantity: "10000", price: 85, basePrice: 85 }
    ]
  },
  {
    id: "s6", category: "YouTube Subscribers", name: "YouTube Subscribers", deliveryTime: "24-48 hours",
    description: "Real and active subscribers for your YouTube channel.",
    packages: [
      { id: "pkg_6_1", quantity: "1000 Subscribers", price: 59, basePrice: 59 },
      { id: "pkg_6_2", quantity: "2000 Subscribers", price: 79, basePrice: 79 },
      { id: "pkg_6_3", quantity: "5000 Subscribers", price: 119, basePrice: 119 },
      { id: "pkg_6_4", quantity: "10000 Subscribers", price: 199, basePrice: 199 },
      { id: "pkg_6_5", quantity: "25000 Subscribers", price: 249, basePrice: 249 },
      { id: "pkg_6_6", quantity: "50000 Subscribers", price: 399, basePrice: 399 },
      { id: "pkg_6_7", quantity: "100K Subscribers (Special Offer)", price: 299, basePrice: 299 },
      { id: "pkg_6_8", quantity: "4K Watchtime + 2K Subscribers", price: 499, basePrice: 499 }
    ]
  },
  {
    id: "s7", category: "YouTube Views", name: "YouTube Views", deliveryTime: "24-48 hours",
    description: "High retention YouTube views to help your video rank higher in search.",
    packages: [
      { id: "pkg_7_1", quantity: "1000 Views", price: 24, basePrice: 24 },
      { id: "pkg_7_2", quantity: "2000 Views", price: 39, basePrice: 39 },
      { id: "pkg_7_3", quantity: "5000 Views", price: 60, basePrice: 60 },
      { id: "pkg_7_4", quantity: "10000 Views", price: 99, basePrice: 99 },
      { id: "pkg_7_5", quantity: "50000 Views", price: 199, basePrice: 199 },
      { id: "pkg_7_6", quantity: "100000 Views", price: 239, basePrice: 239 },
      { id: "pkg_7_7", quantity: "10 Million Views", price: 499, basePrice: 499 }
    ]
  },
  {
    id: "s8", category: "YouTube Likes", name: "YouTube Likes", deliveryTime: "12-24 hours",
    description: "Real YouTube likes to boost your video engagement and credibility.",
    packages: [
      { id: "pkg_8_1", quantity: "1000 Likes", price: 24, basePrice: 24 },
      { id: "pkg_8_2", quantity: "2000 Likes", price: 35, basePrice: 35 },
      { id: "pkg_8_3", quantity: "5000 Likes", price: 49, basePrice: 49 },
      { id: "pkg_8_4", quantity: "10000 Likes", price: 89, basePrice: 89 }
    ]
  },
  {
    id: "s9", category: "YouTube Comments", name: "YouTube Comments", deliveryTime: "24-48 hours",
    description: "Custom, relevant comments on your YouTube videos.",
    packages: [
      { id: "pkg_9_1", quantity: "100 Comments", price: 35, basePrice: 35 },
      { id: "pkg_9_2", quantity: "200 Comments", price: 65, basePrice: 65 },
      { id: "pkg_9_3", quantity: "500 Comments", price: 150, basePrice: 150 },
      { id: "pkg_9_4", quantity: "1000 Comments", price: 280, basePrice: 280 }
    ]
  },
  {
    id: "s10", category: "Telegram Premium", name: "Telegram Premium", deliveryTime: "1-24 hours",
    description: "Premium Telegram subscription for your account.",
    packages: [
      { id: "pkg_10_1", quantity: "1 Month", price: 199, basePrice: 199 },
      { id: "pkg_10_2", quantity: "3 Months", price: 249, basePrice: 249 },
      { id: "pkg_10_3", quantity: "6 Months", price: 449, basePrice: 449 },
      { id: "pkg_10_4", quantity: "12 Months", price: 799, basePrice: 799 }
    ]
  },
  {
    id: "s11", category: "Telegram Group Members", name: "Telegram Group Members", deliveryTime: "24-48 hours",
    description: "Real and active members for your Telegram group.",
    packages: [
      { id: "pkg_11_1", quantity: "500 Members", price: 49, basePrice: 49 },
      { id: "pkg_11_2", quantity: "1000 Members", price: 79, basePrice: 79 },
      { id: "pkg_11_3", quantity: "2000 Members", price: 139, basePrice: 139 },
      { id: "pkg_11_4", quantity: "5000 Members", price: 299, basePrice: 299 },
      { id: "pkg_11_5", quantity: "10000 Members", price: 549, basePrice: 549 }
    ]
  },
  {
    id: "s12", category: "Telegram Channel Subscribers", name: "Telegram Channel Subscribers", deliveryTime: "24-48 hours",
    description: "Real subscribers for your Telegram channel.",
    packages: [
      { id: "pkg_12_1", quantity: "500 Subscribers", price: 45, basePrice: 45 },
      { id: "pkg_12_2", quantity: "1000 Subscribers", price: 79, basePrice: 79 },
      { id: "pkg_12_3", quantity: "2000 Subscribers", price: 139, basePrice: 139 },
      { id: "pkg_12_4", quantity: "5000 Subscribers", price: 289, basePrice: 289 },
      { id: "pkg_12_5", quantity: "10000 Subscribers", price: 529, basePrice: 529 }
    ]
  },
  {
    id: "s13", category: "Telegram Post Views", name: "Telegram Post Views", deliveryTime: "Instant",
    description: "Views for your Telegram channel posts.",
    packages: [
      { id: "pkg_13_1", quantity: "1000 Views", price: 19, basePrice: 19 },
      { id: "pkg_13_2", quantity: "5000 Views", price: 49, basePrice: 49 },
      { id: "pkg_13_3", quantity: "10000 Views", price: 89, basePrice: 89 },
      { id: "pkg_13_4", quantity: "50000 Views", price: 199, basePrice: 199 },
      { id: "pkg_13_5", quantity: "100000 Views", price: 349, basePrice: 349 },
      { id: "pkg_13_6", quantity: "500000 Views", price: 999, basePrice: 999 },
      { id: "pkg_13_7", quantity: "1000000 Views", price: 1799, basePrice: 1799 }
    ]
  },
  {
    id: "s14", category: "Telegram Reactions", name: "Telegram Reactions", deliveryTime: "Instant",
    description: "Positive reactions for your Telegram posts.",
    packages: [
      { id: "pkg_14_1", quantity: "100 Reactions", price: 19, basePrice: 19 },
      { id: "pkg_14_2", quantity: "500 Reactions", price: 59, basePrice: 59 },
      { id: "pkg_14_3", quantity: "1000 Reactions", price: 89, basePrice: 89 }
    ]
  }
];

const CATEGORIES = ["All", "Instagram", "YouTube", "Telegram", "Facebook"];
const SORT_OPTIONS = [
  { id: "default", label: "Default Order" },
  { id: "price-asc", label: "Starting Price: Low to High" },
  { id: "price-desc", label: "Starting Price: High to Low" },
  { id: "qty-asc", label: "Package Sizes: Low to High" },
  { id: "qty-desc", label: "Package Sizes: High to Low" },
];

// Helper: apply margin to base services safely, preventing NaN or calculation errors
function applyMargin(services: Service[], marginPercent: number): Service[] {
  return services.map(s => ({
    ...s,
    packages: s.packages.map(pkg => {
      // 1. Get the best base value
      let base: any = pkg.basePrice !== undefined && pkg.basePrice !== null ? pkg.basePrice : pkg.price;
      
      // 2. Strip any non-numeric characters if it's stored as a string like "₹8" or "8"
      if (typeof base === "string") {
        base = parseFloat(base.replace(/[^0-9.-]/g, "")) || 0;
      }
      
      // 3. Fallback to 0 if still invalid
      base = Number(base) || 0;

      // 4. Ensure margin is a valid number
      const margin = typeof marginPercent === "number" ? marginPercent : Number(marginPercent) || 40;

      return {
        ...pkg,
        basePrice: base,
        price: Math.max(0, Math.ceil(base * (1 + margin / 100)))
      };
    })
  }));
}

export default function Services() {
  const { services: servicesWithMargin, loading } = useServices();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  const [selectedOrder, setSelectedOrder] = useState<{service: Service, pkg: Package} | null>(null);

  const filteredServices = useMemo(() => {
    let result = [...servicesWithMargin];

    if (selectedCategory !== "All") {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter(s => {
        const nameLower = (s.name || "").toLowerCase();
        const categoryLower = (s.category || "").toLowerCase();
        return nameLower.includes(catLower) || categoryLower.includes(catLower);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Sort by checking the special status first, then the selected sub-sort parameter
    result = result.sort((a, b) => {
      const aIsSpecial = a.type === "special";
      const bIsSpecial = b.type === "special";

      if (aIsSpecial && !bIsSpecial) return -1;
      if (!aIsSpecial && bIsSpecial) return 1;

      const aPkgs = a.packages || [];
      const bPkgs = b.packages || [];
      const aMinPrice = aPkgs.length > 0 ? Math.min(...aPkgs.map(p => p.price || 0)) : 0;
      const bMinPrice = bPkgs.length > 0 ? Math.min(...bPkgs.map(p => p.price || 0)) : 0;
      
      const parseQty = (q: string) => {
         if (!q) return 0;
         let num = parseFloat(q.replace(/[^0-9.]/g, '')) || 0;
         if (q.toLowerCase().includes('k')) num *= 1000;
         if (q.toLowerCase().includes('m')) num *= 1000000;
         return num;
      };
      
      const aMaxQty = aPkgs.length > 0 ? Math.max(...aPkgs.map(p => parseQty(p.quantity))) : 0;
      const bMaxQty = bPkgs.length > 0 ? Math.max(...bPkgs.map(p => parseQty(p.quantity))) : 0;
      
      if (sortBy === "price-asc") return aMinPrice - bMinPrice;
      if (sortBy === "price-desc") return bMinPrice - aMinPrice;
      if (sortBy === "qty-asc") return aMaxQty - bMaxQty;
      if (sortBy === "qty-desc") return bMaxQty - aMaxQty;
      return 0; // default order
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy, servicesWithMargin]);

  const getCategoryIcon = (category: string) => {
    const catLower = (category || "").toLowerCase();
    if (catLower.includes("youtube")) {
      return <Youtube size={14} className="mr-1.5" />;
    }
    if (catLower.includes("telegram")) {
      return <Send size={14} className="mr-1.5" />;
    }
    if (catLower.includes("facebook")) {
      return <Facebook size={14} className="mr-1.5" />;
    }
    return <Instagram size={14} className="mr-1.5" />;
  };

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary">
      <SEO 
        title="Buy Social Media Services – Instant & No Password Needed"
        description="Browse Growplex's complete catalog of cheap SMM services. Buy Instagram followers, YouTube subscribers, Telegram members & more. No login required. Instant delivery guaranteed."
        url="https://growplex.sbs/services"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": filteredServices.slice(0, 5).map((service, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Service",
              "name": service.name,
              "provider": {
                "@type": "Organization",
                "name": "Growplex"
              },
              "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": service.packages[0]?.price || 0,
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        })}
      />

      <Navbar />
      <Breadcrumbs />
      <OfferBanners />

      {/* Header */}
      <header className="py-12 sm:py-20 md:py-28 px-4 text-center border-b border-brand-border bg-brand-surface/30 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6 tracking-tight"
          >
            Buy Social Media <span className="text-brand-accent">Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-lg md:text-xl text-text-muted px-2"
          >
            The cheapest SMM services online. No login required — just paste your link, pay, and grow instantly.
          </motion.p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
          
          {/* Categories — horizontal scroll on mobile */}
          <div className="flex overflow-x-auto pb-1 w-full scrollbar-hide gap-1.5 sm:gap-2 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat 
                    ? "bg-brand-accent text-brand-primary shadow-[0_0_15px_rgba(232,184,75,0.3)]" 
                    : "bg-brand-surface border border-brand-border text-text-muted hover:text-text-main hover:border-text-muted/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-accent/50 transition-all font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-medium text-xs sm:text-sm text-text-muted focus:outline-none focus:border-brand-accent/50 appearance-none w-full sm:w-48 cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `16px` }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-text-muted">Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
            <AnimatePresence>
              {filteredServices.map((service) => (
                <ExpandableServiceCard 
                  key={service.id} 
                  service={service} 
                  onBuy={(pkg) => setSelectedOrder({service, pkg})} 
                  getCategoryIcon={getCategoryIcon} 
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-brand-border rounded-2xl bg-brand-surface/20"
          >
            <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center text-text-muted mb-6">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">No services found</h3>
            <p className="text-text-muted max-w-md">
              We couldn't find any services matching "{searchQuery}". Try using different keywords or checking a different category.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-6 text-brand-accent hover:text-brand-accent-hover font-medium underline underline-offset-4"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

      </main>

      <Footer />

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal 
            service={selectedOrder.service} 
            selectedPackage={selectedOrder.pkg}
            onClose={() => setSelectedOrder(null)} 
            getCategoryIcon={getCategoryIcon} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function ExpandableServiceCard({ service, onBuy, getCategoryIcon }: { service: Service, onBuy: (pkg: Package) => void, getCategoryIcon: (cat: string) => React.ReactNode, key?: React.Key }) {
  const isSynced = service.type === "synced" && service.baseRateUsd !== undefined;
  const isSpecial = service.type === "special";
  
  // Normal state
  const [selectedPkgId, setSelectedPkgId] = useState<string>(service.packages?.length > 0 ? service.packages[0].id : '');
  
  // Real-time synchronization guard: ensure selected package ID is valid when the service is updated in real-time
  useEffect(() => {
    if (service.packages && service.packages.length > 0) {
      const exists = service.packages.some(p => p.id === selectedPkgId);
      if (!exists) {
        setSelectedPkgId(service.packages[0].id);
      }
    } else {
      setSelectedPkgId('');
    }
  }, [service.packages, selectedPkgId]);

  const defaultPkg = service.packages?.[0] || {} as Package;
  const minQty = defaultPkg.min || 100;
  const maxQty = defaultPkg.max || 10000;
  
  const [dynamicQtyStr, setDynamicQtyStr] = useState<string>(String(minQty));
  const dynamicQty = parseInt(dynamicQtyStr) || 0;
  
  const selectedPkg = service.packages?.find(p => p.id === selectedPkgId) || defaultPkg;

  let currentPkg: Package;
  if (isSynced) {
     const retailRatePer1000 = (service.baseRateUsd || 0) * (1 + (service.marginPercentage || 0) / 100);
     const price = Math.max(1, Math.round(retailRatePer1000 * (dynamicQty / 1000)));
     currentPkg = {
        id: `dynamic_${dynamicQty}`,
        quantity: String(dynamicQty),
        price: price,
        basePrice: defaultPkg.basePrice || price
     };
  } else {
     currentPkg = selectedPkg;
  }

  // Specific popularity rule from requirements
  const isMostPopular = 
    (service.category === "Instagram Followers" && (currentPkg.quantity === "1000" || currentPkg.quantity === "5000")) ||
    (service.category === "YouTube Subscribers" && (currentPkg.quantity === "1000 Subscribers" || currentPkg.quantity === "5000 Subscribers")) ||
    (service.category === "YouTube Views" && currentPkg.quantity === "10000 Views") ||
    (service.category === "Telegram Group Members" && (currentPkg.quantity === "1000 Members" || currentPkg.quantity === "5000 Members")) ||
    (service.category === "Telegram Post Views" && currentPkg.quantity === "10000 Views");

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`p-5 sm:p-6 rounded-2xl flex flex-col transition-all duration-500 relative overflow-hidden group ${
        isSpecial 
          ? "bg-[#0c051e] shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_40px_rgba(255,0,127,0.25)] hover:shadow-[0_30px_60px_rgba(0,240,255,0.4),_0_0_50px_rgba(236,72,153,0.4)] hover:-translate-y-2 cursor-pointer"
          : "bg-brand-surface border border-brand-border shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-brand-accent/50 hover:-translate-y-1"
      }`}
    >
      {isSpecial && (
         <>
            {/* 3D Multicolour mesh gradient background (shines through glass) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff007f] via-[#7928ca] to-[#00f0ff] opacity-45 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none z-0" />
            
            {/* Colourful Multicolour 3D Background Blobs (pulsing/moving mesh lights) */}
            <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[80%] bg-gradient-to-tr from-[#ff1493]/35 to-[#ff7700]/30 rounded-full blur-[60px] pointer-events-none mix-blend-screen animate-pulse z-0" style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-[-10%] right-[-15%] w-[80%] h-[80%] bg-gradient-to-bl from-[#00f0ff]/30 to-[#7928ca]/35 rounded-full blur-[60px] pointer-events-none mix-blend-screen animate-pulse z-0" style={{ animationDuration: '7s' }} />
            <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-[55px] pointer-events-none mix-blend-screen animate-pulse z-0" style={{ animationDuration: '9s' }} />
            
            {/* Premium Translucent Deep Glass overlay (gives stunning 3D glassmorphism depth) */}
            <div className="absolute inset-[1.5px] bg-[#0c051a]/70 backdrop-blur-2xl rounded-[15px] z-0 pointer-events-none" />
            
            {/* Glowing 3D Multicolor neon outer border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff007f] via-[#7928ca] to-[#00f0ff] opacity-70 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none p-[1.5px] z-0">
               <div className="w-full h-full bg-transparent rounded-[15px]" />
            </div>
            
            {/* Inner neon ambient glow */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(236,72,153,0.25)] rounded-2xl pointer-events-none z-0" />
            
            {/* Dynamic Glass Sweep Light effect */}
            <div className="absolute top-0 left-[-150%] w-[400%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover:left-[100%] pointer-events-none z-0" />
         </>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors ${
          isSpecial
            ? "bg-purple-950/60 border border-purple-700/50 text-purple-300"
            : "bg-brand-primary border border-brand-border text-text-muted group-hover:border-brand-accent/30"
        }`}>
          {getCategoryIcon(service.category)}
          {service.category.replace(/Instagram |YouTube |Telegram /g, "")}
        </div>
        
        {/* Popular / Special Badge */}
        <AnimatePresence>
          {isSpecial ? (
             <motion.span 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-white/20 animate-pulse"
             >
               <Sparkles size={10} className="fill-white" /> Special Pack
             </motion.span>
          ) : isMostPopular && (
             <motion.span 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="flex items-center text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-accent px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(232,184,75,0.4)]"
             >
               Most Popular
             </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      <h3 className={`font-heading font-extrabold text-lg sm:text-xl xl:text-2xl mb-3 sm:mb-4 tracking-tight transition-colors relative z-10 ${
        isSpecial
          ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 via-indigo-300 to-cyan-300 group-hover:from-white group-hover:via-pink-100 group-hover:to-cyan-200"
          : "text-text-main group-hover:text-brand-accent"
      }`}>
        {service.name}
      </h3>
      
      {/* Package Selector */}
      <div className="mb-4 sm:mb-6 flex-grow flex flex-col relative z-10">
        <label className={`text-[11px] sm:text-xs mb-1.5 sm:mb-2 font-medium ${isSpecial ? 'text-purple-300' : 'text-text-muted'}`}>
          {isSynced ? "Quantity" : "Select Package"}
        </label>
        
        {isSynced ? (
            <div>
               <input 
                  type="number" 
                  min={minQty}
                  max={maxQty}
                  value={dynamicQtyStr}
                  onChange={(e) => setDynamicQtyStr(e.target.value)}
                  onBlur={() => {
                     let val = parseInt(dynamicQtyStr) || minQty;
                     if (val < minQty) val = minQty;
                     if (val > maxQty) val = maxQty;
                     setDynamicQtyStr(String(val));
                  }}
                  className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-3 text-text-main font-semibold focus:outline-none focus:border-brand-accent/50 text-sm"
               />
               <p className="text-[10px] text-text-muted mt-1.5">Min: {minQty} • Max: {maxQty}</p>
            </div>
        ) : (
          <div className="relative">
            <select 
              value={selectedPkgId}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className={`w-full appearance-none rounded-xl pl-4 pr-10 py-3 font-semibold cursor-pointer text-sm focus:outline-none transition-colors duration-200 ${
                isSpecial
                  ? "bg-[#110926] border border-purple-500/40 text-purple-100 focus:border-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                  : "bg-brand-primary border border-brand-border text-text-main focus:border-brand-accent/50"
              }`}
            >
              {service.packages?.map((pkg) => {
                const label = pkg.quantity.match(/[A-Za-z]/) && !pkg.quantity.endsWith('K') && !pkg.quantity.endsWith('M')
                  ? pkg.quantity
                  : `${pkg.quantity} ${service.name.replace(/Instagram |YouTube |Telegram /g, '')}`;
                return (
                  <option key={pkg.id} value={pkg.id}>
                    {label}
                  </option>
                );
              })}
            </select>
            <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none ${isSpecial ? 'text-purple-400' : 'text-text-muted'}`}>
              <ChevronDown size={16} />
            </div>
          </div>
        )}
      </div>
      
      <div className={`flex items-center justify-between mb-4 sm:mb-6 pt-3 sm:pt-4 border-t w-full overflow-hidden relative z-10 ${
         isSpecial ? "border-purple-500/20" : "border-brand-border/50"
      }`}>
        <div className="pr-2">
          <p className="text-[11px] sm:text-xs text-text-muted mb-0.5 sm:mb-1">Total Price</p>
          <p className={`text-xl sm:text-2xl font-extrabold transition-all duration-300 flex items-end gap-2 ${
            isSpecial
              ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 group-hover:from-pink-350 group-hover:to-cyan-350 drop-shadow-[0_2px_8px_rgba(236,72,153,0.3)]"
              : "text-text-main group-hover:text-brand-accent"
          }`}>
            ₹{currentPkg.price}
            {isSynced && (
              <span className="text-[10px] text-text-muted font-normal uppercase tracking-wider mb-1">
                (₹{(((service.baseRateUsd || 0)) * (1 + (service.marginPercentage || 0) / 100)).toFixed(2)} per 1000)
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted mb-1 flex items-center gap-1 justify-end"><Clock size={12}/> Delivery</p>
          <p className={`text-sm font-semibold ${isSpecial ? "text-purple-200" : ""}`}>{service.deliveryTime}</p>
        </div>
      </div>
      
      <button 
        onClick={() => onBuy(currentPkg)}
        className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 min-h-[44px] relative z-10 ${
          isSpecial
            ? "bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white font-black uppercase tracking-wider shadow-[0_4px_25px_rgba(236,72,153,0.45)] hover:shadow-[0_4px_35px_rgba(6,182,212,0.6)] hover:scale-[1.03] active:scale-[0.98] border-none"
            : "bg-brand-primary border border-brand-border text-text-main group-hover:bg-brand-accent group-hover:text-brand-primary group-hover:border-brand-accent"
        }`}
      >
        <span className="flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider">
          {isSpecial && <Zap size={14} className="fill-white animate-pulse" />}
          Buy Now
        </span>
      </button>
    </motion.div>
  );
}
