import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { FloatingBadge } from "./components/FloatingBadge";
import { doc, onSnapshot, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";

import {
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

const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminOrders = React.lazy(() => import("./pages/AdminOrders"));
const AdminServices = React.lazy(() => import("./pages/AdminServices"));

const FallbackLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-primary">
    <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// UI helper functions for config controls (Step 7)
function showMaintenancePage(message: string) {
  let overlay = document.getElementById('maintenance-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #0a0f1e; color: white; display: flex;
      flex-direction: column; align-items: center; justify-content: center;
      z-index: 99999; font-family: sans-serif;
    `;
    overlay.innerHTML = `
      <h1 style="color:#f59e0b;font-size:2rem;font-weight:bold;">🔧 Under Maintenance</h1>
      <p style="color:#9ca3af;margin-top:1rem;text-align:center;padding:0 20px;max-width:500px;line-height:1.5;">${message}</p>
    `;
    document.body.appendChild(overlay);
  } else {
    const p = overlay.querySelector('p');
    if (p) p.textContent = message;
  }
}

function hideMaintenancePage() {
  const overlay = document.getElementById('maintenance-overlay');
  if (overlay) overlay.remove();
}

function showAnnouncementBanner(message: string, color: string) {
  let banner = document.getElementById('announcement-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'announcement-banner';
    document.body.prepend(banner);
  }
  const bgColor = color === 'warning' ? '#f59e0b' : 
                  color === 'success' ? '#10b981' : '#00d4ff';
  banner.style.cssText = `
    width:100%; padding:12px; text-align:center;
    background:${bgColor}; color:#000;
    font-weight:600; font-size:14px; z-index:9999;
    position:relative; transition: all 0.3s ease;
  `;
  banner.textContent = message;
}

function hideAnnouncementBanner() {
  const banner = document.getElementById('announcement-banner');
  if (banner) banner.remove();
}

export default function App() {
  useEffect(() => {
    // Step 6: Referral Link Tracking
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      localStorage.setItem('growplex_ref', refCode);
      
      const logClick = async () => {
        try {
          await addDoc(collection(db, "growplex_link_clicks"), {
            influencer_code: refCode,
            clicked_at: serverTimestamp(),
            converted: false,
            order_id: null,
            page_url: window.location.href
          });
        } catch (err) {
          console.error("Failed to log ref click:", err);
        }
      };
      logClick();
    }

    // Step 8: Initialize Growplex Config (Run once on first load)
    const initConfig = async () => {
      try {
        const configRef = doc(db, "growplex_config", "config");
        await setDoc(configRef, {
          maintenance_mode: false,
          maintenance_message: "We are under maintenance. Back soon!",
          announcement_banner: "",
          announcement_active: false,
          banner_color: "info",
          referral_system_active: true,
          minimum_order_value: 10,
          new_user_discount_percent: 0,
          updated_at: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Failed to initialize growplex_config:", err);
      }
    };
    initConfig();

    // Step 7: Listen for config changes from MotherPanel in real-time
    const configRef = doc(db, "growplex_config", "config");
    const unsubscribeConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const config = docSnap.data();
        
        // Maintenance mode
        if (config.maintenance_mode === true) {
          showMaintenancePage(config.maintenance_message || "We are under maintenance. Back soon!");
        } else {
          hideMaintenancePage();
        }
        
        // Announcement banner
        if (config.announcement_active === true && config.announcement_banner) {
          showAnnouncementBanner(config.announcement_banner, config.banner_color);
        } else {
          hideAnnouncementBanner();
        }
      }
    }, (err) => {
       console.error("Config onSnapshot error:", err);
    });

    return () => {
      unsubscribeConfig();
    };
  }, []);

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
            <Route path="/admin/logs" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminLogs /></AdminProtectedRoute>} />
            <Route path="/admin/content" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin"]}><AdminContent /></AdminProtectedRoute>} />
            <Route path="/admin/backup" element={<AdminProtectedRoute allowedRoles={["Super Admin"]}><AdminBackup /></AdminProtectedRoute>} />
            <Route path="/admin/growplex-orders" element={<AdminProtectedRoute allowedRoles={["Super Admin", "Sub-Admin", "Support"]}><AdminOrders /></AdminProtectedRoute>} />
          </Routes>
        </Suspense>
        <FloatingBadge />
      </BrowserRouter>
    </HelmetProvider>
  );
}
