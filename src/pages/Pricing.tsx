import { ArrowRight, Check, Instagram, Lock, Send, Youtube } from "lucide-react";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useServices } from "../hooks/useServices";
import { useMemo } from "react";

const FALLBACK_FEATURED = [
  { id: 1, name: "Instagram Followers", qty: "1000 Followers", price: "₹69", time: "1–24 hours", icon: Instagram, popular: true },
  { id: 2, name: "YouTube Subscribers", qty: "1000 Subscribers", price: "₹83", time: "24–48 hours", icon: Youtube, popular: false },
  { id: 3, name: "Telegram Members", qty: "1000 Members", price: "₹111", time: "1–24 hours", icon: Send, popular: false },
  { id: 4, name: "Instagram Likes", qty: "1000 Likes", price: "₹42", time: "Instant", icon: Instagram, popular: true },
  { id: 5, name: "Instagram Reel Views", qty: "5000 Views", price: "₹10", time: "Instant", icon: Instagram, popular: false },
  { id: 6, name: "YouTube Views", qty: "1000 Views", price: "₹34", time: "24–48 hours", icon: Youtube, popular: false },
];

const COMPARISON = [
  { feature: "Login Required", growplex: "❌ No", others: "✅ Yes" },
  { feature: "Password Needed", growplex: "❌ Never", others: "✅ Often" },
  { feature: "Starting Price", growplex: "₹10", others: "₹50+" },
  { feature: "Delivery Speed", growplex: "Instant", others: "1-48 hrs" },
  { feature: "Refill Guarantee", growplex: "✅ 30 Days", others: "❌ Rarely" },
  { feature: "24/7 Human Support", growplex: "✅ Yes", others: "❌ Bot Only" },
  { feature: "SSL Encrypted", growplex: "✅ Yes", others: "✅ Yes" },
];

export default function Pricing() {
  const { services, loading } = useServices();

  const featuredServices = useMemo(() => {
    if (loading || services.length === 0) return FALLBACK_FEATURED;
    
    const getServicePkg = (cat: string, qtyCheck: string) => {
       const s = services.find(x => x.category?.includes(cat) || x.name?.includes(cat));
       if (!s) return null;
       const p = s.packages.find(x => String(x.quantity).includes(qtyCheck)) || s.packages[0];
       if (!p) return null;
       return { s, p };
    };

    const buildCard = (def: any, term: string, qtyCheck: string, qtyLabel: string, icon: any) => {
        const sp = getServicePkg(term, qtyCheck);
        if (sp) {
           return { ...def, name: sp.s.name, qty: qtyLabel, price: `₹${sp.p.price}`, time: sp.s.deliveryTime || def.time, icon };
        }
        return def;
    };

    return [
       buildCard(FALLBACK_FEATURED[0], "Instagram Followers", "1000", "1000 Followers", Instagram),
       buildCard(FALLBACK_FEATURED[1], "YouTube Subscribers", "1000", "1000 Subscribers", Youtube),
       buildCard(FALLBACK_FEATURED[2], "Telegram Members", "1000", "1000 Members", Send),
       buildCard(FALLBACK_FEATURED[3], "Instagram Likes", "1000", "1000 Likes", Instagram),
       buildCard(FALLBACK_FEATURED[4], "Instagram Reel", "5000", "5000 Views", Instagram),
       buildCard(FALLBACK_FEATURED[5], "YouTube Views", "1000", "1000 Views", Youtube),
    ];
  }, [services, loading]);

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Cheapest SMM Panel Pricing – No Login Required | Growplex</title>
        <meta name="description" content="View Growplex's unbeatable pricing for Instagram, YouTube, Telegram & more. Starting from ₹10. No login, no password, instant delivery. Cheapest price guarantee!" />
        <link rel="canonical" href="https://growplex.sbs/pricing" />
        <meta property="og:title" content="Cheapest SMM Panel Pricing – No Login Required | Growplex" />
        <meta property="og:description" content="Starting from ₹10. The cheapest SMM services online with no login required." />
        <meta property="og:url" content="https://growplex.sbs/pricing" />
      </Helmet>
      
      <Navbar />
      <Breadcrumbs />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 bg-brand-surface/20 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Lock size={12} /> CHEAPEST PRICE GUARANTEE
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Cheapest SMM Panel <span className="text-brand-accent">Pricing</span>
            </h1>
            <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
              Transparent, affordable, and the <strong className="text-text-main">lowest prices in the market</strong>. Every service comes with instant delivery, a 30-day refill guarantee, and absolutely <strong className="text-text-main">no login required</strong>. We challenge you to find a cheaper, safer panel anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service, idx) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-brand-surface border p-8 rounded-2xl shadow-xl flex flex-col transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden ${service.popular ? 'border-brand-accent/50' : 'border-brand-border hover:border-brand-accent/50'}`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-brand-accent text-brand-primary text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <service.icon size={24} className="text-brand-accent" />
                  <span className="text-sm font-medium text-text-muted">{service.name.split(' ')[0]}</span>
                </div>
                <h3 className="font-heading font-bold text-2xl mb-4">{service.name}</h3>
                <div className="text-4xl font-bold text-brand-accent mb-2">{service.price}</div>
                <p className="text-text-muted text-sm mb-4 pb-4 border-b border-brand-border">
                  Package: <span className="text-text-main font-medium">{service.qty}</span>
                </p>
                <ul className="space-y-2 mb-6 flex-grow text-sm text-text-muted">
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-success flex-shrink-0" /> No login required</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-success flex-shrink-0" /> {service.time} delivery</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-success flex-shrink-0" /> 30-day refill guarantee</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-success flex-shrink-0" /> 24/7 support</li>
                </ul>
                <Link
                  to="/services"
                  className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-300 block min-h-[48px] ${service.popular ? 'bg-brand-accent text-brand-primary hover:bg-brand-accent-hover' : 'bg-brand-primary border border-brand-accent/50 text-brand-accent hover:bg-brand-accent hover:text-brand-primary'}`}
                >
                  Order Now
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
             <Link to="/services" className="text-brand-accent hover:text-brand-accent-hover font-semibold text-lg flex items-center justify-center gap-2">
               View Full Custom Services Catalog <ArrowRight size={18} />
             </Link>
          </div>
        </div>
      </section>

      {/* Why Cheapest */}
      <section className="py-20 px-4 bg-brand-surface/30 border-y border-brand-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 text-center">Why Choose Growplex for SMM Services?</h2>
          <div className="prose prose-invert max-w-none text-text-muted leading-relaxed space-y-4">
            <p>
              Growplex is built from the ground up to be the <strong className="text-text-main">cheapest and safest SMM panel</strong> on the internet. Unlike traditional SMM panels that require you to create an account, share your social media password, and navigate complex dashboards, Growplex lets you order any service in under 60 seconds — <strong className="text-text-main">without logging in</strong>.
            </p>
            <p>
              Our pricing starts as low as <strong className="text-brand-accent">₹10</strong> for Instagram Reel views and <strong className="text-brand-accent">₹11</strong> for Instagram followers. We source our services from the most reliable providers worldwide and pass the savings directly to you. There are no hidden fees, no subscription charges, and no minimum deposits.
            </p>
            <p>
              Every order comes with our <strong className="text-text-main">30-day refill guarantee</strong>: if your followers, likes, or subscribers drop within 30 days of delivery, we will refill them at no extra cost. Combined with our <strong className="text-text-main">SSL-encrypted payment gateway</strong> and <strong className="text-text-main">24/7 human support team</strong>, Growplex offers the complete package for creators, businesses, and agencies who want fast, affordable, and safe social media growth.
            </p>
            <p>
              The No-Login advantage means your account credentials are <strong className="text-text-main">never at risk</strong>. We only need a public link to your profile or post. Compare that to panels that ask for your Instagram password — with Growplex, there is zero risk of account compromise.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-center">Cheapest Price Guarantee</h2>
          <p className="text-text-muted text-center mb-12">See how Growplex stacks up against every other SMM panel on the market.</p>
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-primary/50">
                    <th className="text-left px-6 py-4 font-heading font-bold text-text-muted">Feature</th>
                    <th className="text-center px-6 py-4 font-heading font-bold text-brand-accent">Growplex</th>
                    <th className="text-center px-6 py-4 font-heading font-bold text-text-muted">Other Panels</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, idx) => (
                    <tr key={idx} className="border-b border-brand-border/50 hover:bg-brand-primary/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-main">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-brand-accent font-medium">{row.growplex}</td>
                      <td className="px-6 py-4 text-center text-text-muted">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
