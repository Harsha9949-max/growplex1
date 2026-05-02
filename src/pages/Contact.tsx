import { Helmet } from "react-helmet-async";
import { Mail, MessageCircle, Send, Instagram, Facebook, Youtube } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function Contact() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Contact Growplex – 24/7 Support for Cheap SMM Services</title>
        <meta name="description" content="Contact Growplex by HVRS Innovations. Get 24/7 support via email, live chat, or Telegram. We're here to help with orders, refills, and any questions about our no-login SMM panel." />
        <link rel="canonical" href="https://growplex.sbs/contact" />
        <meta property="og:title" content="Contact Growplex – 24/7 Support" />
        <meta property="og:url" content="https://growplex.sbs/contact" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Contact <span className="text-brand-accent">Us</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Have a question, issue, or suggestion? Our team is available 24/7 to help you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-1">Email</h3>
                  <a href="mailto:support@growplex.sbs" className="text-brand-accent hover:underline">support@growplex.sbs</a>
                  <p className="text-text-muted text-sm mt-1">Reply within 12 hours</p>
                </div>
              </div>

              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent flex-shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-1">Live Chat</h3>
                  <p className="text-text-muted text-sm">Available 24/7 on our website</p>
                </div>
              </div>

              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/growplex.sbs" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-brand-primary border border-brand-border flex items-center justify-center text-text-muted hover:text-brand-accent hover:border-brand-accent/50 transition-all min-w-[48px] min-h-[48px]" aria-label="Instagram">
                    <Instagram size={20} />
                  </a>
                  <a href="https://www.facebook.com/share/1AaqiFb82m/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-brand-primary border border-brand-border flex items-center justify-center text-text-muted hover:text-brand-accent hover:border-brand-accent/50 transition-all min-w-[48px] min-h-[48px]" aria-label="Facebook">
                    <Facebook size={20} />
                  </a>
                  <a href="https://youtube.com/@growplexsbs" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-brand-primary border border-brand-border flex items-center justify-center text-text-muted hover:text-brand-accent hover:border-brand-accent/50 transition-all min-w-[48px] min-h-[48px]" aria-label="YouTube">
                    <Youtube size={20} />
                  </a>
                </div>
              </div>

              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-2">Business Information</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  <strong className="text-text-main">Growplex</strong> is a product of HVRS Innovations.<br />
                  Website: <a href="https://growplex.sbs" className="text-brand-accent hover:underline">growplex.sbs</a>
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">
              <h2 className="font-heading font-bold text-xl mb-6">Send Us a Message</h2>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will reply within 12 hours.'); }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Your Name</label>
                  <input type="text" required className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-accent/50 min-h-[48px]" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Email Address</label>
                  <input type="email" required className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-accent/50 min-h-[48px]" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Order ID (Optional)</label>
                  <input type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-accent/50 min-h-[48px]" placeholder="e.g. ORD-12345" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Message</label>
                  <textarea required rows={4} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-accent/50 resize-none" placeholder="How can we help?" />
                </div>
                <button type="submit" className="w-full bg-brand-accent text-brand-primary py-3 rounded-xl font-bold hover:bg-brand-accent-hover transition-colors min-h-[48px]">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
