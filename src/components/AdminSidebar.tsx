import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingCart, Package, CreditCard, 
  Users, Bell, BarChart2, Settings, ShieldCheck, 
  FileText, LayoutTemplate, Database, LogOut
} from "lucide-react";

interface AdminSidebarProps {
  onNavItemClick?: () => void;
  isMobile?: boolean;
}

export function AdminSidebar({ onNavItemClick, isMobile }: AdminSidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Services", path: "/admin/services", icon: Package },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Customers", path: "/admin/customers", icon: Users },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    { name: "Reports", path: "/admin/reports", icon: BarChart2 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
    { name: "Roles", path: "/admin/roles", icon: ShieldCheck },
    { name: "Logs", path: "/admin/logs", icon: FileText },
    { name: "Content", path: "/admin/content", icon: LayoutTemplate },
    { name: "Backup", path: "/admin/backup", icon: Database },
  ];

  return (
    <div className={`w-64 bg-brand-surface border-r border-brand-border h-screen flex flex-col ${isMobile ? '' : 'fixed left-0 top-0'}`}>
      {!isMobile && (
        <div className="h-16 flex items-center px-6 border-b border-brand-border shrink-0">
          <span className="font-heading font-bold text-xl text-text-main flex items-center gap-2">
            <span className="text-brand-accent">Grow</span>plex Admin
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavItemClick}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? "text-brand-accent bg-brand-accent/10 border-r-2 border-brand-accent" 
                  : "text-text-muted hover:text-text-main hover:bg-brand-primary/50"
              }`}
            >
              <Icon size={18} className="mr-3" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-brand-border shrink-0">
        <Link
          to="/"
          className="flex items-center px-4 py-2 text-sm font-medium text-text-muted hover:text-red-500 transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          Exit Admin
        </Link>
      </div>
    </div>
  );
}
