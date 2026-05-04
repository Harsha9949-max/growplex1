import {
  BarChart2,
  Bell,
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Package,
  Settings, ShieldCheck,
  ShoppingCart,
  Users,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";

const MENU_ITEMS = [
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

interface AdminSidebarProps {
  mobileOpen: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ mobileOpen, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center px-6 border-b border-brand-border shrink-0 justify-between">
        <span className="font-heading font-bold text-xl text-text-main flex items-center gap-2">
          <span className="text-brand-accent">Grow</span>plex Admin
        </span>
        {/* Close button — mobile only */}
        <button 
          className="md:hidden p-2 text-text-muted hover:text-text-main transition-colors"
          onClick={onToggle}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if (mobileOpen) onToggle(); }}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? "text-brand-accent bg-brand-accent/10 border-r-2 border-brand-accent" 
                  : "text-text-muted hover:text-text-main hover:bg-brand-primary/50"
              }`}
            >
              <Icon size={18} className="mr-3 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-brand-border shrink-0">
        <Link
          to="/"
          onClick={() => { if (mobileOpen) onToggle(); }}
          className="flex items-center px-4 py-2 text-sm font-medium text-text-muted hover:text-red-500 transition-colors"
        >
          <LogOut size={18} className="mr-3 shrink-0" />
          Exit Admin
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar — always visible on md+ */}
      <div className="hidden md:flex w-64 bg-brand-surface border-r border-brand-border h-screen flex-col fixed left-0 top-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar — slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-brand-surface border-r border-brand-border flex flex-col z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
