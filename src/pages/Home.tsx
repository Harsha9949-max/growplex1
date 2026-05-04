import {
  ArrowRight,
  Check,
  Headphones,
  Instagram,
  Lock, RefreshCw,
  Send,
  Star,
  X as XIcon,
  Youtube,
  Zap
} from "lucide-react";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { AggregateRatingSchema } from "../components/SchemaMarkup";
import { SocialProofTicker } from "../components/SocialProofTicker";
import { useServices } from "../hooks/useServices";
import { useMemo } from "react";

const TRUST_BADGES = [
  { icon: Lock, title: "No Login Required", desc: "Order without creating an account or giving any password." },
  { icon: Zap, title: "Instant Delivery", desc: "Most orders start processing within seconds of payment." },
  { icon: RefreshCw, title: "30-Day Refill", desc: "Free refill guarantee if your count drops within 30 days." },
  { icon: Headphones, title: "24/7 Human Support", desc: "Real agents available around the clock via chat and email." }
];

const FALLBACK_TOP_SERVICES = [
  { icon: Instagram, platform: "Instagram", name: "Followers", price: "₹8", desc: "Real & stable followers for your Instagram profile. No password needed.", link: "/services" },
  { icon: Instagram, platform: "Instagram", name: "Likes", price: "₹30", desc: "Instant likes on your posts to boost engagement.", link: "/services" },
  { icon: Youtube, platform: "YouTube", name: "Subscribers", price: "₹59", desc: "Active subscribers for your YouTube channel growth.", link: "/services" },
  { icon: Youtube, platform: "YouTube", name: "Views", price: "₹24", desc: "High retention views for better search ranking.", link: "/services" },
  { icon: Send, platform: "Telegram", name: "Members", price: "₹49", desc: "Real members for your Telegram groups and channels.", link: "/services" },
  { icon: Instagram, platform: "Instagram", name: "Reel Views", price: "₹7", desc: "Boost your Reels with high-retention views.", link: "/services" }
];

const HOW_IT_WORKS = [
  { step: "01", title: "Paste Your Link", desc: "Copy your profile URL or post link and paste it into the order form. We never ask for your password — only the public link.", icon: "🔗" },
  { step: "02", title: "Pay Securely", desc: "Choose your package and complete payment through our encrypted gateway. Multiple payment options available.", icon: "💳" },
  { step: "03", title: "Watch It Grow", desc: "Your order starts processing instantly. Track progress with your unique order ID — no login needed.", icon: "🚀" }
];

const TESTIMONIALS = [
  { name: "Rahul S.", location: "India", text: "Excellent service and fast delivery. Got 5K Instagram followers in under 12 hours. No login asked — very safe!", rating: 5 },
  { name: "Sarah J.", location: "USA", text: "I was skeptical about no-login panels, but Growplex delivered exactly as promised. Cheapest prices I've found anywhere.", rating: 5 },
  { name: "Priya M.", location: "India", text: "Got 1K YouTube subscribers in just 2 days. The quality is top-notch and the refill guarantee gives me confidence.", rating: 5 },
  { name: "Carlos R.", location: "Brazil", text: "Best SMM panel I've used. No password required and the prices are unbeatable. Already ordered 3 times!", rating: 5 },
  { name: "Amit K.", location: "India", text: "Very reliable and responsive support. Telegram members were delivered instantly. Will keep ordering.", rating: 5 },
  { name: "Jessica L.", location: "UK", text: "The fact that I don't need to login or share my password makes Growplex my go-to SMM panel. Fast and affordable.", rating: 5 }
];

const COMPARISON = [
  { feature: "Login Required", growplex: false, others: true },
  { feature: "Password Needed", growplex: false, others: true },
  { feature: "Cheapest Prices", growplex: true, others: false },
  { feature: "Instant Delivery", growplex: true, others: false },
  { feature: "30-Day Refill Guarantee", growplex: true, others: false },
  { feature: "24/7 Human Support", growplex: true, others: false },
  { feature: "SSL Encrypted Payments", growplex: true, others: true },
];

export default function Home() {
  const { services, loading } = useServices();

  const topServices = useMemo(() => {
    if (loading || services.length === 0) return FALLBACK_TOP_SERVICES;
    
    const getStartingPrice = (cat: string) => {
       const matched = services.filter(x => x.category?.includes(cat) || x.name?.includes(cat));
       if (!matched || matched.length === 0) return null;
       let lowest = Infinity;
       matched.forEach(s => {
         s.packages.forEach(p => {
            if (p.price < lowest) lowest = p.price;
         });
       });
       if (lowest === Infinity) return null;
       return `₹${lowest}`;
    };

    const buildCard = (def: any, term: string) => {
        const lowestPrice = getStartingPrice(term);
        if (lowestPrice) {
           return { ...def, price: lowestPrice };
        }
        return def;
    };

    return [
       buildCard(FALLBACK_TOP_SERVICES[0], "Instagram Followers"),
       buildCard(FALLBACK_TOP_SERVICES[1], "Instagram Likes"),
       buildCard(FALLBACK_TOP_SERVICES[2], "YouTube Subscribers"),
       buildCard(FALLBACK_TOP_SERVICES[3], "YouTube Views"),
       buildCard(FALLBACK_TOP_SERVICES[4], "Telegram Members"),
       buildCard(FALLBACK_TOP_SERVICES[5], "Instagram Reel"),
    ];
  }, [services, loading]);
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary">
      <Helmet>
        <title>Growplex – Cheapest SMM Panel Without Login | Instant Social Media Growth</title>
        <meta name="description" content="Growplex is the cheapest SMM panel with NO LOGIN required. Get instant Instagram followers, likes, YouTube views & more. Start in seconds without password. Best prices guaranteed!" />
        <link rel="canonical" href="https://growplex.sbs/" />
        <meta property="og:title" content="Growplex – Cheapest SMM Panel Without Login | Instant Social Media Growth" />
        <meta property="og:description" content="No login. No password. The cheapest SMM panel for Instagram, YouTube, Telegram & more. Instant delivery guaranteed." />
        <meta property="og:url" content="https://growplex.sbs/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://growplex.sbs/og-image.png" />
      </Helmet>

      <AggregateRatingSchema ratingValue={4.9} reviewCount={2847} />

      <Navbar />

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* NO LOGIN Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-6 md:mb-8"
          >
            <Lock size={14} />
            NO LOGIN REQUIRED — 100% SAFE
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-tight"
          >
            No Login. Pure Growth.<br className="hidden sm:block"/>
            <span className="text-brand-accent">The Cheapest SMM Panel Ever.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-xl text-text-muted mb-8 md:mb-10 max-w-2xl mx-auto px-2"
          >
            Get instant Instagram followers, YouTube subscribers, Telegram members, and more — without giving your password or creating an account. Ever.
          </motion.p>

          {/* Sub-benefits — scrollable on small mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 md:mb-10 text-xs sm:text-sm font-medium text-text-muted px-2"
          >
            {["⚡ Instant Start", "🔒 No Password", "🛡️ Refill Guarantee", "💬 24/7 Support"].map(benefit => (
              <span key={benefit} className="bg-brand-surface border border-brand-border px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                {benefit}
              </span>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center px-2"
          >
            <Link 
              to="/services" 
              className="w-full sm:w-auto bg-brand-accent text-brand-primary px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-brand-accent-hover hover:shadow-[0_0_25px_rgba(232,184,75,0.4)] transition-all duration-300 min-h-[48px] flex items-center justify-center gap-2"
            >
              Start Growth Now <ArrowRight size={20} />
            </Link>
            <Link 
              to="/how-it-works" 
              className="w-full sm:w-auto bg-brand-surface text-text-main border border-brand-border px-8 py-3.5 sm:py-4 rounded-xl font-bold hover:bg-brand-border transition-colors duration-300 min-h-[48px] flex items-center justify-center"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TRUST BADGES ═══════ */}
      <section className="py-8 md:py-12 border-y border-brand-border bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {TRUST_BADGES.map((badge, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-start text-center sm:text-left">
                <div className="p-2.5 sm:p-3 rounded-lg bg-brand-accent/10 text-brand-accent flex-shrink-0">
                  <badge.icon size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1">{badge.title}</h3>
                  <p className="text-text-muted text-xs sm:text-sm leading-relaxed hidden sm:block">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TOP SERVICES ═══════ */}
      <section className="py-14 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Our Most Popular Services</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-base px-2">Top-rated social media growth services at the cheapest prices. No login, no password — just results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {topServices.map((service, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-brand-surface border border-brand-border p-5 sm:p-8 rounded-2xl flex flex-col group cursor-pointer transition-all hover:border-brand-accent/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-brand-primary flex items-center justify-center text-text-muted group-hover:text-brand-accent transition-colors">
                    <service.icon size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{service.platform}</span>
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl mb-2 group-hover:text-brand-accent transition-colors">{service.platform} {service.name}</h3>
                <p className="text-text-muted text-xs sm:text-sm mb-4 sm:mb-6 flex-grow">{service.desc}</p>
                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-brand-border/50">
                  <div>
                    <p className="text-xs text-text-muted">Starting from</p>
                    <p className="text-lg sm:text-xl font-bold text-brand-accent">{service.price}</p>
                  </div>
                  <Link to={service.link} className="text-sm font-bold text-brand-accent hover:underline flex items-center gap-1">
                    Order Now <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 md:mt-12 text-center">
            <Link to="/services" className="text-brand-accent hover:text-brand-accent-hover font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
              View All Services &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-14 md:py-24 px-4 bg-brand-surface/30 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">How It Works in 3 Steps</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-base px-2">Order any social media service in under 60 seconds. No account creation. No passwords. Just paste, pay, and grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {HOW_IT_WORKS.map((item, idx) => (
              <div key={idx} className="relative bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 text-center">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{item.icon}</div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center font-heading font-bold text-base sm:text-lg text-brand-accent">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-text-muted leading-relaxed text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="py-14 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Growplex vs Other SMM Panels</h2>
            <p className="text-text-muted text-sm md:text-base">See why thousands of creators choose Growplex over every other panel.</p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-primary/50">
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-heading font-bold text-text-muted text-xs sm:text-sm">Feature</th>
                    <th className="text-center px-4 sm:px-6 py-3 sm:py-4 font-heading font-bold text-brand-accent text-xs sm:text-sm">Growplex</th>
                    <th className="text-center px-4 sm:px-6 py-3 sm:py-4 font-heading font-bold text-text-muted text-xs sm:text-sm">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, idx) => (
                    <tr key={idx} className="border-b border-brand-border/50 hover:bg-brand-primary/30 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-text-main text-xs sm:text-sm">{row.feature}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        {row.growplex ? (
                          <Check size={18} className="text-brand-success mx-auto" />
                        ) : (
                          <XIcon size={18} className="text-brand-success mx-auto" />
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        {row.others ? (
                          <Check size={18} className="text-red-400 mx-auto" />
                        ) : (
                          <XIcon size={18} className="text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-14 md:py-24 px-4 bg-brand-surface/30 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Real Results from Real Customers</h2>
            <p className="text-text-muted text-sm md:text-base">Rated <span className="text-brand-accent font-bold">4.9/5</span> by 2,847+ verified buyers worldwide.</p>
          </div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-brand-surface p-5 sm:p-8 rounded-2xl border border-brand-border min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start shrink-0 md:shrink">
                <div className="flex text-brand-accent mb-3 sm:mb-4 gap-0.5">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-text-main leading-relaxed mb-4 sm:mb-6 italic text-sm sm:text-base">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary border border-brand-border flex items-center justify-center font-bold text-sm text-brand-accent">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold font-heading text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.location} • Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111111] via-[#151515] to-[#111111] border-y border-brand-border" />
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 py-6 md:py-12">
          <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 px-4 py-1.5 rounded-full text-xs font-bold mb-4 md:mb-6">
            <Lock size={12} /> NO LOGIN EVER
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Ready to Grow Your Social Media?</h2>
          <p className="text-base md:text-xl text-text-muted mb-8 md:mb-10 mx-auto max-w-2xl px-2">
            Join thousands of creators who have skyrocketed their reach with the cheapest, safest SMM panel on the planet.
          </p>
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:bg-brand-accent-hover hover:scale-105 hover:shadow-[0_0_30px_rgba(232,184,75,0.4)] transition-all duration-300"
          >
            Start Growth Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
      <SocialProofTicker />
    </div>
  );
}
