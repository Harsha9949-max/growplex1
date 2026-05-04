import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { FloatingBadge } from "./components/FloatingBadge";
import About from "./pages/About";
import {
  AdminBackup,
  AdminContent,
  AdminCustomers,
  AdminLogs,
  AdminNotifications,
  AdminPayments,
  AdminReports,
  AdminRoles,
  AdminSettings
} from "./pages/admin-index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/AdminOrders";
import AdminServices from "./pages/AdminServices";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import OrderFailed from "./pages/OrderFailed";
import OrderSuccess from "./pages/OrderSuccess";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReceiptViewer from "./pages/ReceiptViewer";
import RefundPolicy from "./pages/RefundPolicy";
import Services from "./pages/Services";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";

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
          <Route path="/receipt/:orderId" element={<ReceiptViewer />} />
          
          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/orders" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminOrders /></AdminProtectedRoute>} />
          <Route path="/admin/services" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminServices /></AdminProtectedRoute>} />
          <Route path="/admin/payments" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminPayments /></AdminProtectedRoute>} />
          <Route path="/admin/customers" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminCustomers /></AdminProtectedRoute>} />
          <Route path="/admin/notifications" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminNotifications /></AdminProtectedRoute>} />
          <Route path="/admin/reports" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminReports /></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminSettings /></AdminProtectedRoute>} />
          <Route path="/admin/roles" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminRoles /></AdminProtectedRoute>} />
          <Route path="/admin/logs" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminLogs /></AdminProtectedRoute>} />
          <Route path="/admin/content" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminContent /></AdminProtectedRoute>} />
          <Route path="/admin/backup" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminBackup /></AdminProtectedRoute>} />
          <Route path="/admin/growplex-orders" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminOrders /></AdminProtectedRoute>} />
        </Routes>
        <FloatingBadge />
      </BrowserRouter>
    </HelmetProvider>
  );
}
