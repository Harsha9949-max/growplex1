import {
  ChevronRight,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const { isAdmin, logout, userProfile } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/new-order', icon: PlusCircle, label: 'New Order' },
    { to: '/services', icon: Package, label: 'Services' },
    { to: '/orders', icon: ListOrdered, label: 'My Orders' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/support', icon: MessageSquare, label: 'Support' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/verify', icon: ShieldCheck, label: 'Verify Missions' },
    { to: '/admin/services', icon: Settings, label: 'Manage Services' },
    { to: '/admin/orders', icon: ListOrdered, label: 'All Orders' },
    { to: '/admin/users', icon: Users, label: 'All Users' },
  ];

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isActive 
          ? "bg-brand-accent text-[#0A0A0A] shadow-xl shadow-brand-accent/20" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110 relative z-10", isActive ? "text-[#0A0A0A]" : "text-brand-accent/60 group-hover:text-brand-accent")} />
          <span className="font-bold text-sm tracking-tight relative z-10">{label}</span>
          {isActive && (
            <motion.div
              layoutId="active-nav-glow"
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            />
          )}
          <ChevronRight size={14} className={cn("ml-auto transition-transform duration-300 relative z-10", isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0")} />
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[70] p-3 rounded-2xl bg-brand-accent text-white md:hidden shadow-xl shadow-brand-accent/20 active:scale-90 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-brand-card border-r border-brand-border z-[65] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <ShieldCheck className="text-[#0A0A0A]" size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-display font-black tracking-tighter text-white italic uppercase">
              WORK<span className="text-brand-accent">PLEX</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Performance & Growth</p>
        </div>

        <div className="px-6 py-2 space-y-8 overflow-y-auto h-[calc(100%-180px)] custom-scrollbar">
          <div>
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Main Terminal</p>
            <div className="space-y-1.5">
              {userLinks.map(link => <NavItem key={link.to} {...link} />)}
            </div>
          </div>

          {isAdmin && (
            <div className="pt-8 border-t border-white/5">
              <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Admin Core</p>
              <div className="space-y-1.5">
                {adminLinks.map(link => <NavItem key={link.to} {...link} />)}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5 bg-brand-card/50 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-brand-teal flex items-center justify-center text-[#0A0A0A] font-black shadow-lg shadow-brand-accent/10">
              {userProfile?.username?.[0]?.toUpperCase() || 'W'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userProfile?.username || 'WORKPLEX User'}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-mono font-bold">{userProfile?.role || 'Premium Member'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Logout System</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

