import React, { useEffect, useState } from "react";
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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
        const user = JSON.parse(authData);
        setRole(user.role);
      }
    } catch(e) {}
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Sub-Admin"] },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart, roles: ["Super Admin", "Sub-Admin", "Support"] },
    { name: "Services", path: "/admin/services", icon: Package, roles: ["Super Admin", "Sub-Admin", "Support"] },
    { name: "Payments", path: "/admin/payments", icon: CreditCard, roles: ["Super Admin", "Sub-Admin", "Support"] },
    { name: "Customers", path: "/admin/customers", icon: Users, roles: ["Super Admin", "Sub-Admin"] },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, roles: ["Super Admin", "Sub-Admin"] },
    { name: "Reports", path: "/admin/reports", icon: BarChart2, roles: ["Super Admin"] },
    { name: "Settings", path: "/admin/settings", icon: Settings, roles: ["Super Admin"] },
    { name: "Roles", path: "/admin/roles", icon: ShieldCheck, roles: ["Super Admin"] },
    { name: "Logs", path: "/admin/logs", icon: FileText, roles: ["Super Admin"] },
    { name: "Content", path: "/admin/content", icon: LayoutTemplate, roles: ["Super Admin", "Sub-Admin"] },
    { name: "Backup", path: "/admin/backup", icon: Database, roles: ["Super Admin"] },
  ];

  const visibleMenuItems = menuItems.filter(item => !role || item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
  };

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
        {visibleMenuItems.map((item) => {
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
          to="/admin/login"
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-text-muted hover:text-red-500 transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          Logout Admin
        </Link>
      </div>
    </div>
  );
}
