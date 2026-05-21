import { ArrowRight, CheckCircle2, TrendingUp, Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { SEO } from "../components/SEO";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Zero Investment Setup",
    desc: "Start your own SMM business without any inventory or upfront costs. We handle the delivery; you keep the profit."
  },
  {
    icon: TrendingUp,
    title: "20-40% Retail Markup",
    desc: "Our wholesale rates leave massive room for you to price services competitively while maintaining high margins."
  },
  {
    icon: CheckCircle2,
    title: "White-Label Delivery",
    desc: "Orders are processed seamlessly without any Growplex branding. Your clients only see your business."
  },
  {
    icon: Users,
    title: "No Login Overhead",
    desc: "Since we only require public URLs to process orders, you never have to ask your clients for sensitive passwords."
  }
];

export default function ResellerGuide() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <SEO 
        title="Reseller Guide: Start Your SMM Business"
        description="Learn how to resell SMM services with Growplex. High margins, zero setup cost, white-label delivery, and no login required. Ultimate guide for Indian marketers."
        keywords="resell SMM services, start SMM business, SMM reseller panel India, SMM white label"
        url="https://growplex.sbs/reseller-guide"
      />

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-16 px-4 border-b border-brand-border bg-brand-surface/20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            The Ultimate Guide to <span className="text-brand-accent">Reselling SMM Services</span>
          </h1>
          <p className="text-xl text-text-muted leading-relaxed max-w-3xl mx-auto">
            Turn your social network into a money-making engine. Discover how to start an SMM retail business with <strong className="text-text-main">zero inventory</strong> using India's cheapest NO LOGIN panel.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="prose prose-invert max-w-none text-text-muted space-y-6 mb-16">
            <h2 className="font-heading text-3xl font-bold text-text-main">Why Resell With Growplex?</h2>
            <p>
              Thousands of digital agencies, freelancers, and entrepreneurs in India are silently running profitable SMM businesses using reseller panels. By leveraging Growplex, you get access to wholesale prices (e.g., Instagram followers for just ₹8) that you can retail to your local clients at ₹20, keeping the 150%+ profit margin.
            </p>
            <p>
              Unlike legacy panels, our <strong className="text-text-main">No-Login Guarantee</strong> is a massive selling point for your clients. You can promise them complete safety because you will never ask for their social media passwords.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {BENEFITS.map((benefit, idx) => (
              <div key={idx} className="bg-brand-surface border border-brand-border p-6 rounded-2xl flex gap-4">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                    <benefit.icon size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl mb-2 text-text-main">{benefit.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Step by step guide */}
          <div className="space-y-12">
            <div className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8">
              <h3 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm font-bold">1</span>
                Find Your Clients
              </h3>
              <p className="text-text-muted">
                Start locally. Reach out to local businesses (cafes, gyms, real estate agents) or micro-influencers who are struggling with engagement. Pitch them a "Social Media Growth Package." Ensure they know you only need their public handle — building immense trust instantly.
              </p>
            </div>

            <div className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8">
              <h3 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm font-bold">2</span>
                Set Your Pricing (The 20-40% Rule)
              </h3>
              <p className="text-text-muted">
                If Growplex charges ₹50 for a service, do not sell it for ₹52. Resellers typically build packages (e.g., "The Viral Package: 1,000 Followers + 5,000 Views") and sell it for a flat fee. Aim for at least a 40% margin early on to cover your acquisition time.
              </p>
            </div>

            <div className="bg-brand-surface/50 border border-brand-border rounded-3xl p-8">
              <h3 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm font-bold">3</span>
                White Label Execution
              </h3>
              <p className="text-text-muted">
                Once the client pays you via your preferred local method, go to Growplex, select the desired package, paste their public URL, and pay using UPI or cards. We execute the order instantly in the background. The client sees the growth; you look like a tech wizard.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="font-heading text-2xl font-bold mb-6">Ready to scale your agency?</h3>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-accent-hover transition-colors"
            >
              Browse Wholesale Services <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
