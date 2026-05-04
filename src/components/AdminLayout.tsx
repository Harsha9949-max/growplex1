import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary flex">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 z-40">
        <span className="font-heading font-bold text-xl text-text-main flex items-center gap-2">
          <span className="text-brand-accent">Grow</span>plex Admin
        </span>
        <button 
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-text-muted hover:text-text-main focus:outline-none"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-brand-surface z-50 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-brand-border shrink-0">
                <span className="font-heading font-bold text-xl text-text-main flex items-center gap-2">
                  <span className="text-brand-accent">Grow</span>plex
                </span>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-text-muted hover:text-text-main focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AdminSidebar onNavItemClick={() => setMobileSidebarOpen(false)} isMobile={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden lg:ml-64 pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
