import { Menu } from "lucide-react";
import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary flex">
      <AdminSidebar mobileOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen relative overflow-hidden w-full">
        {/* Mobile top header with hamburger */}
        <div className="md:hidden sticky top-0 z-30 bg-brand-surface/80 backdrop-blur-md border-b border-brand-border px-4 h-14 flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-text-muted hover:text-text-main transition-colors rounded-lg hover:bg-brand-primary"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <span className="font-heading font-bold text-lg text-text-main">
            <span className="text-brand-accent">Grow</span>plex Admin
          </span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
