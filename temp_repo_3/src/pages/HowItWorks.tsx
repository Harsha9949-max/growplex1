import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Lock, ArrowRight, Link as LinkIcon, CreditCard, Rocket, ShieldCheck } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";

const STEPS = [
  {
    num: "01",
    icon: LinkIcon,
    title: "Paste Your Profile or Post Link",
    desc: "Go to the service you want (Instagram Followers, YouTube Views, etc.) and paste the public URL of your profile or post into the order form. We never ask for your login credentials, password, or any private information. Just the public link — that's it.",
    highlight: "No password. No login. Just a link."
  },
  {
    num: "02",
    icon: CreditCard,
    title: "Choose Package & Pay Securely",
    desc: "Select the quantity that fits your needs and proceed to checkout. Our payment gateway is SSL-encrypted and supports UPI, credit/debit cards, net banking, and wallets. Your payment information is never stored on our servers.",
    highlight: "SSL-encrypted. Multiple payment options."
  },
  {
    num: "03",
    icon: Rocket,
    title: "Instant Delivery — Track Without Login",
    desc: "Your order begins processing within seconds. You'll receive a unique order ID and tracking link via the confirmation page. Use it anytime to check progress — no account or login needed. Most services are delivered within minutes to 24 hours.",
    highlight: "Track with just your order ID."
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>How Growplex Works – Order SMM Services in 60 Seconds Without Login</title>
        <meta name="description" content="Learn how Growplex works in 3 simple steps. Paste your link, pay securely, and get instant delivery. No login, no password, no account needed. The easiest SMM panel ever." />
        <link rel="canonical" href="https://growplex.sbs/how-it-works" />
        <meta property="og:title" content="How Growplex Works – 3 Steps, No Login" />
        <meta property="og:url" content="https://growplex.sbs/how-it-works" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Lock size={12} /> ZERO ACCOUNT NEEDED
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              How It Works in <span className="text-brand-accent">3 Steps</span> (No Login)
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Order any social media growth service in under 60 seconds. No account creation. No passwords. Just paste, pay, and grow.
            </p>
          </div>

          <div className="space-y-12">
            {STEPS.map((step, idx) => (
              <div key={idx} className="bg-brand-surface border border-brand-border rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center">
                    <span className="font-heading font-bold text-2xl text-brand-accent">{step.num}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon size={20} className="text-brand-accent" />
                    <h2 className="font-heading font-bold text-2xl">{step.title}</h2>
                  </div>
                  <p className="text-text-muted leading-relaxed mb-4">{step.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent bg-brand-accent/5 px-3 py-1.5 rounded-lg">
                    <ShieldCheck size={14} /> {step.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="font-heading text-2xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-text-muted mb-8">It takes less than a minute. No signup. No password. No risk.</p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-accent-hover hover:shadow-[0_0_25px_rgba(232,184,75,0.4)] transition-all duration-300"
            >
              Browse Services Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
