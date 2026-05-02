import React from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
