import { Helmet } from "react-helmet-async";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Privacy Policy | Growplex by HVRS Innovations</title>
        <meta name="description" content="Read Growplex's privacy policy. We never collect passwords. Learn what minimal data we collect and how we protect your privacy. GDPR & CCPA compliant." />
        <link rel="canonical" href="https://growplex.sbs/privacy-policy" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-text-muted mb-10">Last updated: May 2026 • Growplex by HVRS Innovations</p>

          <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">1. Information We Collect</h2>
              <p>Growplex is a <strong className="text-text-main">no-login platform</strong>. We collect the absolute minimum data necessary to process your order:</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li><strong className="text-text-main">Email address</strong> — Only if you choose to provide it for order confirmation notifications.</li>
                <li><strong className="text-text-main">Public social media URL</strong> — The profile or post link you provide for service delivery.</li>
                <li><strong className="text-text-main">IP address</strong> — Collected automatically for analytics and fraud prevention.</li>
                <li><strong className="text-text-main">Payment information</strong> — Processed securely by Razorpay; we never store your card or banking details.</li>
              </ul>
              <p className="mt-3 bg-brand-surface border border-brand-border rounded-xl p-4 text-sm"><strong className="text-brand-accent">We NEVER collect:</strong> Social media passwords, login credentials, personal identification documents, or any data beyond what is listed above.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To process and deliver your service orders</li>
                <li>To send order confirmation and delivery updates (if email provided)</li>
                <li>To improve our website and service quality through anonymized analytics</li>
                <li>To prevent fraudulent transactions</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">3. Data Sharing</h2>
              <p>We do not sell, trade, or share your personal data with third parties except:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Payment processors (Razorpay) for transaction processing</li>
                <li>Analytics services (Google Analytics) in anonymized form</li>
                <li>When required by law or legal process</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">4. Cookies</h2>
              <p>We use essential cookies for site functionality and analytics cookies to understand user behavior. You can disable cookies in your browser settings at any time.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">5. GDPR & CCPA Compliance</h2>
              <p>If you are a resident of the European Union or California, you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Request access to the data we hold about you</li>
                <li>Request deletion of your data</li>
                <li>Opt out of analytics tracking</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at <a href="mailto:support@growplex.sbs" className="text-brand-accent hover:underline">support@growplex.sbs</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">6. Data Security</h2>
              <p>All data transmission is encrypted using SSL/TLS. Payment processing is handled by PCI-DSS compliant providers. We implement industry-standard security measures to protect your information.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">7. Contact</h2>
              <p>For privacy-related inquiries: <a href="mailto:support@growplex.sbs" className="text-brand-accent hover:underline">support@growplex.sbs</a></p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
