import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { formatINR } from '../../lib/utils';
import { Submission } from '../../types';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subRef = collection(db, 'submissions');
    const q = query(
      subRef, 
      where('status', '==', 'approved'),
      orderBy('submittedAt', 'desc'), 
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => doc.data() as Submission);
      setActivities(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Global <span className="text-brand-teal">Payouts</span></h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Verified network settlements</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal animate-pulse">
          <Zap size={20} className="fill-brand-teal" />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {activities.length > 0 ? activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-brand-teal/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck size={40} className="text-brand-teal" />
              </div>
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal shrink-0 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-white uppercase italic tracking-tight truncate max-w-[120px]">
                      {activity.userName.split(' ')[0]}...
                    </span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">• Just Now</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium italic truncate leading-tight mb-2">
                    Earned <span className="text-white font-black">{formatINR(activity.amount)}</span> from <span className="text-brand-gold uppercase font-black">{activity.venture}</span> mission.
                  </p>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-brand-teal" />
                        <span className="text-[9px] font-black text-brand-teal uppercase italic">Verified</span>
                     </div>
                     <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">{activity.id.substring(0, 6)}</span>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                   <ArrowUpRight size={14} className="text-slate-700 group-hover:text-brand-teal transition-colors" />
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-12 text-center">
               <Clock size={32} className="text-slate-800 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Awaiting network traffic...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 flex items-center gap-3">
         <Sparkles size={16} className="text-brand-teal" />
         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
           Total Network Earnings: <span className="text-white">₹1.4M+</span> this month.
         </p>
      </div>
    </div>
  );
};

export default ActivityFeed;
