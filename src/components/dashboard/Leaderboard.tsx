import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  User, 
  Zap, 
  Star,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { formatINR, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      orderBy('wallets.earned', 'desc'), 
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      setTopUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Earnings <span className="text-brand-gold">Elite</span></h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Top performers this week</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-gold/10 px-3 py-1.5 rounded-full border border-brand-gold/20">
          <Flame size={12} className="text-brand-gold animate-pulse" />
          <span className="text-[9px] font-black text-brand-gold uppercase italic">High Volatility</span>
        </div>
      </div>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-3 gap-4 items-end px-2 pt-10 pb-6 relative">
          <div className="absolute inset-x-0 bottom-4 h-px bg-white/5" />
          
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3 relative"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center relative z-10 overflow-hidden">
                 {topUsers[1]?.photoURL ? (
                   <img src={topUsers[1].photoURL} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <User size={24} className="text-slate-700" />
                 )}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-400 rounded-lg flex items-center justify-center z-20 shadow-lg border border-white/20">
                 <Medal size={12} className="text-[#0A0A0A]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-white truncate w-20 italic">{topUsers[1]?.username || '---'}</p>
              <p className="text-[10px] font-bold text-brand-teal italic">{formatINR(topUsers[1]?.wallets.earned || 0)}</p>
            </div>
            <div className="h-16 w-full bg-white/5 rounded-t-xl border-x border-t border-white/5" />
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 relative -top-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-brand-card border-2 border-brand-gold flex items-center justify-center relative z-10 overflow-hidden shadow-[0_0_30px_rgba(232,184,75,0.2)]">
                 {topUsers[0]?.photoURL ? (
                   <img src={topUsers[0].photoURL} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <User size={32} className="text-slate-700" />
                 )}
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                 <Crown size={28} className="text-brand-gold drop-shadow-[0_0_10px_rgba(232,184,75,0.5)] fill-brand-gold" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white truncate w-24 italic uppercase tracking-tight">{topUsers[0]?.username || '---'}</p>
              <p className="text-xs font-black text-brand-gold italic">{formatINR(topUsers[0]?.wallets.earned || 0)}</p>
            </div>
            <div className="h-24 w-full bg-brand-gold/5 rounded-t-2xl border-x border-t border-brand-gold/20" />
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-3 relative"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center relative z-10 overflow-hidden">
                 {topUsers[2]?.photoURL ? (
                   <img src={topUsers[2].photoURL} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <User size={24} className="text-slate-700" />
                 )}
              </div>
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center z-20 shadow-lg border border-white/20">
                 <Medal size={12} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-white truncate w-20 italic">{topUsers[2]?.username || '---'}</p>
              <p className="text-[10px] font-bold text-brand-teal italic">{formatINR(topUsers[2]?.wallets.earned || 0)}</p>
            </div>
            <div className="h-12 w-full bg-white/5 rounded-t-xl border-x border-t border-white/5" />
          </motion.div>
      </div>

      {/* List for 4-10 */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {topUsers.slice(3).map((user, i) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-700 w-4">#{i + 4}</span>
              <div className="w-10 h-10 rounded-xl bg-brand-card border border-white/5 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                   <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <User size={18} className="text-slate-700" />
                 )}
              </div>
              <div>
                <p className="text-xs font-black text-white italic group-hover:text-brand-gold transition-colors">{user.username}</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user.venture || 'Freelancer'}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-brand-teal italic tracking-tighter">{formatINR(user.wallets.earned)}</p>
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp size={10} className="text-brand-teal" />
                <span className="text-[8px] font-black text-slate-600 uppercase">Steady</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest italic hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
         View Global Ranking <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default Leaderboard;
