import { Heart, Lock, ShieldCheck, Target } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>About Growplex – HVRS Innovations | Safest No-Login SMM Panel</title>
        <meta name="description" content="Growplex is a product of HVRS Innovations. Learn about our mission to make social media growth affordable, instant, and safe — without ever requiring your password." />
        <link rel="canonical" href="https://growplex.sbs/about" />
        <meta property="og:title" content="About Growplex – HVRS Innovations" />
        <meta property="og:url" content="https://growplex.sbs/about" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-brand-accent">Growplex</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              A product of HVRS Innovations — building the cheapest, safest, and most user-friendly SMM panel in the world.
            </p>
          </div>

          <div className="space-y-8 text-text-muted leading-relaxed">
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">
              <h2 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <Target size={24} className="text-brand-accent" /> Our Mission
              </h2>
              <p>
                Growplex was born from a simple idea: social media growth should be <strong className="text-text-main">affordable, instant, and safe</strong>. We believe that every content creator, small business, and influencer deserves access to professional-grade social media marketing tools — without the high prices, complex dashboards, or dangerous password-sharing practices that plague the SMM industry.
              </p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">
              <h2 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <Lock size={24} className="text-brand-accent" /> Why No Login is Safer
              </h2>
              <p className="mb-4">
                Traditional SMM panels require you to create an account, log in, and sometimes even share your social media password. This creates serious security risks — your credentials can be stored, leaked, or misused.
              </p>
              <p>
                <strong className="text-text-main">Growplex eliminates this risk entirely.</strong> We designed a system where you never need to create an account or share any credentials. We only need the public URL of your profile or post. Your social media accounts remain 100% under your control at all times. This isn't just convenient — it's fundamentally safer.
              </p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">
              <h2 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <Heart size={24} className="text-brand-accent" /> HVRS Innovations
              </h2>
              <p>
                Growplex is proudly built and maintained by <strong className="text-text-main">HVRS Innovations</strong>, a technology-focused company dedicated to creating innovative digital solutions. Our team combines expertise in web development, digital marketing, and social media strategy to deliver the best possible experience for our users worldwide.
              </p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">
              <h2 className="font-heading font-bold text-2xl text-text-main mb-4 flex items-center gap-3">
                <ShieldCheck size={24} className="text-brand-accent" /> Our Promise
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><span className="text-brand-accent font-bold text-lg">•</span> We will never ask for your social media password</li>
                <li className="flex items-start gap-3"><span className="text-brand-accent font-bold text-lg">•</span> We offer the cheapest prices in the market — guaranteed</li>
                <li className="flex items-start gap-3"><span className="text-brand-accent font-bold text-lg">•</span> Every order includes a 30-day refill guarantee</li>
                <li className="flex items-start gap-3"><span className="text-brand-accent font-bold text-lg">•</span> 24/7 human support — no bots, no waiting</li>
                <li className="flex items-start gap-3"><span className="text-brand-accent font-bold text-lg">•</span> SSL-encrypted payments for maximum security</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/services" className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-accent-hover transition-all">
              Start Growing Now →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
