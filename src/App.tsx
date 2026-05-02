import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { FloatingBadge } from "./components/FloatingBadge";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import OrderSuccess from "./pages/OrderSuccess";
import OrderFailed from "./pages/OrderFailed";
import AdminOrders from "./pages/AdminOrders";
import AdminServices from "./pages/AdminServices";
import AdminDashboard from "./pages/AdminDashboard";
import { 
  AdminPayments, 
  AdminCustomers, 
  AdminNotifications, 
  AdminReports, 
  AdminSettings, 
  AdminRoles, 
  AdminLogs, 
  AdminContent, 
  AdminBackup 
} from "./pages/admin-index";

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/support" element={<Support />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/failed" element={<OrderFailed />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/backup" element={<AdminBackup />} />
          <Route path="/admin/growplex-orders" element={<AdminOrders />} />
        </Routes>
        <FloatingBadge />
      </BrowserRouter>
    </HelmetProvider>
  );
}
