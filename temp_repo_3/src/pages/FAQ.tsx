import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { FAQSchema } from "../components/SchemaMarkup";

const FAQ_CATEGORIES = [
  {
    title: "Getting Started",
    faqs: [
      { question: "What is Growplex?", answer: "Growplex is the world's cheapest SMM (Social Media Marketing) panel. We provide instant social media growth services — including Instagram followers, YouTube subscribers, Telegram members, and more — without requiring you to log in, create an account, or share your password. A product of HVRS Innovations." },
      { question: "Do I need to login or create an account?", answer: "No! Growplex is a completely no-login platform. You don't need to create an account, provide a username/password, or share your social media credentials. Just paste your public URL, pay, and we'll deliver your order." },
      { question: "How do I place an order?", answer: "It's simple: 1) Go to our Services page, 2) Choose the service you want, 3) Paste the public URL of your profile or post, 4) Select a package, 5) Pay via UPI/card/wallet, and 6) Your order starts instantly. The whole process takes under 60 seconds." }
    ]
  },
  {
    title: "Safety & Security",
    faqs: [
      { question: "Is Growplex safe to use? Will my account get banned?", answer: "Yes, Growplex is completely safe. Since we never ask for your password or access your account directly, there is zero risk of account compromise. Our services use gradual delivery that mimics organic growth patterns, keeping your account safe from platform flags." },
      { question: "Why is no-login safer than traditional SMM panels?", answer: "Traditional SMM panels ask you to create an account and sometimes share your Instagram/YouTube password. This puts your social media accounts at risk of theft, unauthorized access, and data breaches. Growplex eliminates this entirely — we only need your public profile URL. Your credentials are never shared with anyone." },
      { question: "Are my payments secure?", answer: "Absolutely. All payments are processed through Razorpay, which is PCI-DSS Level 1 certified — the highest level of payment security. We support UPI, credit/debit cards, net banking, and wallets. We never store your payment information on our servers." }
    ]
  },
  {
    title: "Orders & Delivery",
    faqs: [
      { question: "How fast is the delivery?", answer: "Most services begin within seconds of payment. Services marked 'Instant' typically show results within minutes. Larger orders (e.g., 10K+ followers) may take 24-48 hours for complete delivery to ensure natural-looking growth." },
      { question: "How do I track my order without an account?", answer: "After payment, you'll receive a unique order ID and tracking link. Visit the link or enter your order ID on our website to see real-time status, delivery progress, and estimated completion time — no login needed." },
      { question: "What happens if my order fails to deliver?", answer: "If your order is not delivered within the promised timeframe, you're entitled to a full refund. Contact support@growplex.sbs with your order ID and we'll resolve it within 24 hours." }
    ]
  },
  {
    title: "Pricing & Refills",
    faqs: [
      { question: "Why is Growplex so cheap?", answer: "We source services from a global network of premium providers at volume discounts. Our no-login model eliminates the overhead of managing user accounts, databases, and login systems — savings we pass directly to you. Instagram followers start from just ₹11 and Reel views from ₹10." },
      { question: "Do you offer a refill guarantee?", answer: "Yes! Every eligible service comes with a 30-day refill guarantee. If your followers, likes, or subscribers drop within 30 days of delivery, contact us with your order ID and we'll refill the difference at no cost." },
      { question: "Can I get a refund?", answer: "Yes. Full refund for undelivered orders, partial refund for partially delivered orders. Refund requests must be submitted within 7 days. See our full Refund Policy for details." }
    ]
  }
];

const ALL_FAQS = FAQ_CATEGORIES.flatMap(cat => cat.faqs);

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>SMM Panel FAQ – No-Login Answers | Growplex</title>
        <meta name="description" content="Find answers to all your questions about Growplex, the cheapest no-login SMM panel. Learn about safety, delivery, refills, pricing, and more." />
        <link rel="canonical" href="https://growplex.sbs/faq" />
        <meta property="og:title" content="SMM Panel FAQ – No-Login Answers | Growplex" />
        <meta property="og:url" content="https://growplex.sbs/faq" />
      </Helmet>

      <FAQSchema faqs={ALL_FAQS} />

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-brand-accent">Questions</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Everything you need to know about using the world's cheapest and safest no-login SMM panel.
            </p>
          </div>

          <div className="space-y-12">
            {FAQ_CATEGORIES.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="font-heading font-bold text-2xl mb-6 text-brand-accent">{category.title}</h2>
                <div className="space-y-3">
                  {category.faqs.map((faq, faqIdx) => {
                    const key = `${catIdx}-${faqIdx}`;
                    return (
                      <div key={key} className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
                        <button
                          className="w-full text-left p-6 flex justify-between items-center hover:bg-brand-border/30 transition-colors focus:outline-none min-h-[48px]"
                          onClick={() => toggleFaq(key)}
                          aria-expanded={openFaq === key}
                        >
                          <span className="font-heading font-medium pr-4">{faq.question}</span>
                          {openFaq === key ? (
                            <ChevronUp className="text-brand-accent flex-shrink-0" size={20} />
                          ) : (
                            <ChevronDown className="text-text-muted flex-shrink-0" size={20} />
                          )}
                        </button>
                        <AnimatePresence>
                          {openFaq === key && (
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-text-muted mb-4">Still have questions?</p>
            <Link to="/support" className="text-brand-accent hover:text-brand-accent-hover font-semibold flex items-center justify-center gap-2">
              Contact Our Support Team <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
