import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { TeamLayout } from "./components/TeamLayout";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { FloatingBadge } from "./components/FloatingBadge";

import {
  AdminAnnouncements,
  AdminBackup,
  AdminContent,
  AdminCustomers,
  AdminLogs,
  AdminNotifications,
  AdminOffers,
  AdminPayments,
  AdminReports,
  AdminRoles,
  AdminSettings
} from "./pages/admin-index";

// Lazy Loaded Pages
const Home = React.lazy(() => import("./pages/Home"));
const Services = React.lazy(() => import("./pages/Services"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const Support = React.lazy(() => import("./pages/Support"));
const HowItWorks = React.lazy(() => import("./pages/HowItWorks"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const ResellerGuide = React.lazy(() => import("./pages/ResellerGuide"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const OrderFailed = React.lazy(() => import("./pages/OrderFailed"));
const ReceiptViewer = React.lazy(() => import("./pages/ReceiptViewer"));

const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Settings = React.lazy(() => import("./pages/Settings"));
const TeamDashboard = React.lazy(() => import("./pages/TeamDashboard"));
const UserOrders = React.lazy(() => import("./pages/UserOrders"));

const AdminTasks = React.lazy(() => import("./pages/AdminTasks"));
const TeamTasks = React.lazy(() => import("./pages/TeamTasks"));
const TeamAnnouncements = React.lazy(() => import("./pages/TeamAnnouncements"));
const TeamChat = React.lazy(() => import("./pages/TeamChat"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminOrders = React.lazy(() => import("./pages/AdminOrders"));
const AdminServices = React.lazy(() => import("./pages/AdminServices"));

const FallbackLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-primary">
    <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/support" element={<Support />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/reseller-guide" element={<ResellerGuide />} />
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
            
            {/* User Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/team/dashboard" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><TeamLayout><TeamDashboard /></TeamLayout></ProtectedRoute>} />
            <Route path="/team/tasks" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><TeamLayout><TeamTasks /></TeamLayout></ProtectedRoute>} />
            <Route path="/team/announcements" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><TeamAnnouncements /></ProtectedRoute>} />
            <Route path="/team/chat" element={<ProtectedRoute allowedRoles={['team_member', 'influencer', 'admin', 'user']}><TeamLayout><TeamChat /></TeamLayout></ProtectedRoute>} />
            
            {/* Team Cloned Pages */}
            <Route path="/team/orders" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><AdminOrders /></ProtectedRoute>} />
            <Route path="/team/services" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><AdminServices /></ProtectedRoute>} />
            <Route path="/team/payments" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><AdminPayments /></ProtectedRoute>} />
            <Route path="/team/customers" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><AdminCustomers /></ProtectedRoute>} />
            <Route path="/team/offers" element={<ProtectedRoute allowedRoles={['team_member', 'influencer']}><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/chat" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminLayout><TeamChat /></AdminLayout></AdminProtectedRoute>} />

            {/* Admin Auth Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes (Using eager imports for the sub-index to avoid complexity, or just letting AdminDashboard be lazy) */}
            <Route path="/admin" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/orders" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminOrders /></AdminProtectedRoute>} />
            <Route path="/admin/services" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminServices /></AdminProtectedRoute>} />
            <Route path="/admin/payments" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminPayments /></AdminProtectedRoute>} />
            <Route path="/admin/customers" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminCustomers /></AdminProtectedRoute>} />
            <Route path="/admin/offers" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminOffers /></AdminProtectedRoute>} />
            <Route path="/admin/notifications" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminNotifications /></AdminProtectedRoute>} />
            <Route path="/admin/reports" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminReports /></AdminProtectedRoute>} />
            <Route path="/admin/settings" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminSettings /></AdminProtectedRoute>} />
            <Route path="/admin/roles" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminRoles /></AdminProtectedRoute>} />
            <Route path="/admin/announcements" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminAnnouncements /></AdminProtectedRoute>} />
            <Route path="/admin/tasks" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminTasks /></AdminProtectedRoute>} />
            <Route path="/admin/logs" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminLogs /></AdminProtectedRoute>} />
            <Route path="/admin/content" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminContent /></AdminProtectedRoute>} />
            <Route path="/admin/backup" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminBackup /></AdminProtectedRoute>} />
            <Route path="/admin/growplex-orders" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminOrders /></AdminProtectedRoute>} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
        <FloatingBadge />
      </BrowserRouter>
    </HelmetProvider>
  );
}
