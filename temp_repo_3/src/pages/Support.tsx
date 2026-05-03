import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";
import { ChevronDown, ChevronUp, Mail, MessageCircle, Send } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { FAQSchema } from "../components/SchemaMarkup";

const FAQS = [
  { question: "Do I need to login or give my password to use Growplex?", answer: "Absolutely not! Growplex is a no-login SMM panel. You never need to create an account, share your social media password, or provide any login credentials. We only need the public URL of your profile or post to deliver the service. Your account security is our top priority." },
  { question: "Why is Growplex the cheapest SMM panel?", answer: "We source our services from a global network of premium providers and pass the volume discounts directly to our customers. Our no-login model eliminates the overhead of managing user accounts, which means lower operational costs and lower prices for you. Our Instagram followers start from just ₹11 and Reel views from ₹10." },
  { question: "How quickly will my order start?", answer: "Most orders begin processing within seconds of payment confirmation. Services marked as 'Instant' typically show results within minutes. Larger orders and certain service types (like YouTube subscribers) may take 24-48 hours for complete delivery. You can track your order using the unique order ID provided after payment." },
  { question: "What if my followers drop? Do you have a refill warranty?", answer: "Yes! Every order on Growplex comes with a 30-day refill guarantee. If your followers, likes, views, or subscribers drop within 30 days of delivery, simply contact our support team with your order ID and we will refill the difference at no extra cost. No questions asked." },
  { question: "Is it safe to use Growplex? Will my account get banned?", answer: "Growplex uses industry-standard methods that comply with social media platform guidelines. Since we never ask for your password or access your account directly, there is zero risk of account compromise. Our services use gradual, drip-feed delivery to mimic organic growth patterns, keeping your account safe." },
  { question: "What payment methods do you accept?", answer: "We accept payments through Razorpay, which supports UPI, credit cards, debit cards, net banking, and popular wallets like Paytm and PhonePe. All payments are protected with SSL encryption for maximum security. We never store your payment details." },
  { question: "How can I track my order without an account?", answer: "After placing an order, you receive a unique order ID and a direct tracking link. Simply visit the link or enter your order ID on our website to check real-time status, delivery progress, and estimated completion time. No login needed — ever." },
  { question: "Do you offer services for all social media platforms?", answer: "Currently, Growplex offers premium services for Instagram (followers, likes, comments, Reel views, story views), YouTube (subscribers, views, likes, comments), and Telegram (premium, group members, channel subscribers, post views, reactions). We are constantly adding new platforms and services." },
  { question: "Can I get a refund if the service is not delivered?", answer: "Yes! If we fail to deliver the promised service within the agreed timeline, you are entitled to a full refund. Please contact our support team within 7 days of the order with your order ID and we will process your refund promptly. See our Refund Policy page for complete details." },
  { question: "Is Growplex available worldwide?", answer: "Yes! Growplex serves customers in over 50 countries including India, USA, UK, Brazil, Nigeria, UAE, Canada, Australia, and more. Our services work for accounts from any region. Prices are displayed in INR but we accept international payments through all major cards." }
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Contact Growplex – 24/7 Support for Cheap SMM Services</title>
        <meta name="description" content="Get 24/7 priority support from Growplex. Browse our FAQ for answers about our no-login SMM panel, delivery times, refill warranty, and safe social media growth services." />
        <link rel="canonical" href="https://growplex.sbs/support" />
        <meta property="og:title" content="Contact Growplex – 24/7 Support for Cheap SMM Services" />
        <meta property="og:description" content="24/7 human support for the cheapest SMM panel online. Get help with orders, refills, and more." />
        <meta property="og:url" content="https://growplex.sbs/support" />
      </Helmet>

      <FAQSchema faqs={FAQS} />
      
      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">How Can We <span className="text-brand-accent">Help You</span>?</h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Our support team is online 24/7 to ensure your experience is smooth and successful. No login needed to get help.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="bg-brand-surface border border-brand-border p-8 rounded-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mb-6">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">Live Chat</h3>
              <p className="text-text-muted mb-6">Get instant answers from our dedicated agents. Available 24/7.</p>
              <button className="text-brand-accent font-semibold hover:text-brand-accent-hover transition-colors min-h-[48px] px-4">Start Chat</button>
            </div>
            
            <div className="bg-brand-surface border border-brand-border p-8 rounded-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">Email Support</h3>
              <p className="text-text-muted mb-6">Send us an email and we'll reply within 12 hours guaranteed.</p>
              <a href="mailto:support@growplex.sbs" className="text-brand-accent font-semibold hover:text-brand-accent-hover transition-colors min-h-[48px] flex items-center">support@growplex.sbs</a>
            </div>

            <div className="bg-brand-surface border border-brand-border p-8 rounded-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mb-6">
                <Send size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">Telegram</h3>
              <p className="text-text-muted mb-6">Message us directly on Telegram for quick assistance.</p>
              <a href="https://t.me/growplexsbs" target="_blank" rel="noopener noreferrer" className="text-brand-accent font-semibold hover:text-brand-accent-hover transition-colors min-h-[48px] flex items-center">@growplexsbs</a>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-text-muted">Everything you need to know about Growplex's no-login SMM panel.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden transition-all duration-300">
                  <button 
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-brand-border/30 transition-colors focus:outline-none min-h-[48px]"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span className="font-heading font-medium text-[16px] pr-4">{faq.question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="text-brand-accent flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-text-muted flex-shrink-0" size={20} />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-text-muted leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
