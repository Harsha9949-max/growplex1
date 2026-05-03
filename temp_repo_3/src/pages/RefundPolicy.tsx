import { Helmet } from "react-helmet-async";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Helmet>
        <title>Refund & Refill Policy | Growplex by HVRS Innovations</title>
        <meta name="description" content="Growplex's refund and refill policy. 30-day refill guarantee on all services. Full refund for undelivered orders. No questions asked." />
        <link rel="canonical" href="https://growplex.sbs/refund-policy" />
      </Helmet>

      <Navbar />
      <Breadcrumbs />

      <section className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-4">Refund & Refill Policy</h1>
          <p className="text-text-muted mb-10">Last updated: May 2026 • Growplex by HVRS Innovations</p>

          <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
            <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-brand-accent mb-3">30-Day Refill Guarantee</h2>
              <p>Every eligible service purchased on Growplex comes with a <strong className="text-text-main">30-day refill guarantee</strong>. If your delivered followers, likes, views, or subscribers drop within 30 days of the delivery completion date, we will refill the difference at absolutely no additional cost.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">How to Request a Refill</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Note your order ID from the confirmation page</li>
                <li>Contact us at <a href="mailto:support@growplex.sbs" className="text-brand-accent hover:underline">support@growplex.sbs</a> with the order ID</li>
                <li>Our team will verify the drop and initiate the refill within 72 hours</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">Refund Eligibility</h2>
              <p>You are eligible for a <strong className="text-text-main">full refund</strong> if:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>The order was not delivered within the stated delivery timeframe</li>
                <li>The order was not started due to a technical issue on our end</li>
                <li>The delivered quantity is significantly less than what was purchased</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">Partial Refunds</h2>
              <p>A <strong className="text-text-main">partial refund</strong> will be issued for orders that were partially delivered. The refund amount will be calculated based on the undelivered portion of the order.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">Non-Refundable Scenarios</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Orders that have been fully delivered as promised</li>
                <li>Drops occurring after the 30-day refill period</li>
                <li>Changes in your account settings (private → public) that affect delivery</li>
                <li>Account suspension or deletion by the social media platform</li>
                <li>Incorrect URLs provided by the customer</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">Refund Processing</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Refund requests must be submitted within <strong className="text-text-main">7 days</strong> of the original order date</li>
                <li>Approved refunds are processed within <strong className="text-text-main">5-7 business days</strong></li>
                <li>Refunds are credited to the original payment method used for the purchase</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-main mb-3">Contact for Refunds</h2>
              <p>To request a refund or refill, contact us with your order ID at:</p>
              <p className="mt-2"><strong className="text-text-main">Email:</strong> <a href="mailto:support@growplex.sbs" className="text-brand-accent hover:underline">support@growplex.sbs</a></p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
