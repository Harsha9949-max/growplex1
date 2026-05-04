import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Terms of Service | Growplex by HVRS Innovations</title>
        <meta name="description" content="Read Growplex's terms of service. Understand our acceptable use policy, delivery guarantees, refund and refill policies, and liability terms." />
        <link rel="canonical" href="https://growplex.sbs/terms-of-service" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-text-muted mb-10">Last updated: May 2026 • Growplex by HVRS Innovations</p>

          <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Growplex (growplex.sbs), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. Growplex is a product of HVRS Innovations.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">2. Service Description</h2>
              <p>Growplex provides social media marketing (SMM) services including but not limited to followers, likes, views, subscribers, and members for various social media platforms. All services are delivered digitally and do not require login credentials or passwords from users.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">3. Acceptable Use</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must provide accurate and valid public URLs for service delivery</li>
                <li>You must not use our services for illegal, fraudulent, or malicious purposes</li>
                <li>You are responsible for ensuring your use of our services complies with the target platform's terms of service</li>
                <li>We reserve the right to refuse service at our discretion</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">4. Order Delivery</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Delivery times vary by service type and are indicated on each service page</li>
                <li>Most orders begin processing within minutes of payment confirmation</li>
                <li>Delivery times are estimates and may vary due to factors beyond our control</li>
                <li>Orders are tracked via unique order IDs — no login required</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">5. Refill Policy</h2>
              <p>All eligible services include a <strong className="text-text-main">30-day refill guarantee</strong>. If the delivered count drops within 30 days of completion, contact our support team with your order ID and we will refill the difference at no extra cost. Refills are subject to availability and may take up to 72 hours to process.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">6. Refund Policy</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Full refund if service is not delivered within the stated timeframe</li>
                <li>Partial refund for partially delivered orders</li>
                <li>Refund requests must be submitted within 7 days of the order date</li>
                <li>Refunds are processed within 5-7 business days to the original payment method</li>
                <li>No refunds for completed orders that have been fully delivered</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">7. Cancellation</h2>
              <p>Orders can be cancelled before processing begins. Once an order has started processing, it cannot be cancelled. Contact support immediately if you need to cancel an order.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">8. Limitation of Liability</h2>
              <p>Growplex and HVRS Innovations shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for the specific order in question. We are not responsible for changes in social media platform policies that may affect service delivery.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">9. Modifications</h2>
              <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our services after changes constitutes acceptance of the new terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">10. Contact</h2>
              <p>For questions about these terms: <a href="mailto:support@growplex.sbs" className="text-brand-accent hover:underline">support@growplex.sbs</a></p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
