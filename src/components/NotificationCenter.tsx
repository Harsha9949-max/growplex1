import React from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Clock, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatTimeAgo } from '../lib/utils';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal"><CheckCircle2 size={18} /></div>;
      case 'warning': return <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold"><AlertCircle size={18} /></div>;
      case 'error': return <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><X size={18} /></div>;
      default: return <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400"><Info size={18} /></div>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-4 w-full md:w-[420px] glass-card bg-[#0A0A0A]/95 border border-white/10 rounded-[2.5rem] shadow-3xl z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-gold/10 rounded-lg">
                    <Bell size={20} className="text-brand-gold" />
                  </div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Activity <span className="text-brand-gold">Vault</span></h3>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black text-brand-teal uppercase tracking-widest italic hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-1">You have {unreadCount} new alerts.</p>
            </div>

            {/* List */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => markAsRead(notif.id)}
                      className={cn(
                        "p-6 flex gap-5 hover:bg-white/[0.02] transition-colors group cursor-pointer relative overflow-hidden",
                        !notif.isRead && "bg-brand-gold/[0.02]"
                      )}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold" />
                      )}
                      
                      <div className="shrink-0 pt-1">
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-black text-white italic uppercase tracking-tight group-hover:text-brand-gold transition-colors">{notif.title}</h4>
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest shrink-0">
                            {formatTimeAgo(notif.createdAt.toDate())}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic mb-3">
                          {notif.message}
                        </p>
                        
                        {notif.link && (
                          <Link 
                            to={notif.link}
                            className="inline-flex items-center gap-2 text-[10px] font-black text-brand-teal uppercase tracking-widest italic hover:gap-3 transition-all"
                          >
                            View Details <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} className="text-slate-800" />
                  </div>
                  <h4 className="text-lg font-black text-white italic mb-1 uppercase tracking-tighter">Vault Empty</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Awaiting high-priority updates.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
               <div className="flex items-center gap-4 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Secure</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="flex items-center gap-1.5">
                    <Zap size={10} className="text-brand-gold" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Real-time Sync</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
