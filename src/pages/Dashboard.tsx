import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  PlusCircle,
  Target,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn, formatINR } from '../lib/utils';

// New Modular Components
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Leaderboard from '../components/dashboard/Leaderboard';
import VentureHeader from '../components/dashboard/VentureHeader';
import VentureSpecificTasks from '../components/dashboard/VentureSpecificTasks';
import WalletOverview from '../components/dashboard/WalletOverview';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();

  // Mock data for weekly target
  const weeklyTarget = 5000;
  const currentEarnings = userProfile?.wallets?.earned || 0;
  const progressPercent = Math.min(100, Math.max(0, (currentEarnings / weeklyTarget) * 100));

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8 pb-16 font-sans relative"
      >
        {/* 1. Adaptive Header */}
        <VentureHeader userProfile={userProfile} />

        {/* 2. 4-Wallet Overview */}
        <WalletOverview userProfile={userProfile} />

        {/* 3. Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link to="/services" className="flex-1 min-w-[140px] group relative overflow-hidden bg-brand-card/30 rounded-2xl border border-white/5 hover:border-brand-gold/30 p-5 flex items-center justify-center gap-3 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-brand-gold flex items-center justify-center text-[#0A0A0A] shrink-0 shadow-[0_0_15px_rgba(232,184,75,0.3)] transform group-hover:scale-110 transition-transform">
              <PlusCircle size={22} />
            </div>
            <div className="flex-1 text-left">
              <span className="block font-black text-white text-[11px] uppercase tracking-widest italic">New Mission</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase">Browse Tasks</span>
            </div>
          </Link>

          <Link to="/wallet" className="flex-1 min-w-[140px] group relative overflow-hidden bg-brand-card/30 rounded-2xl border border-white/5 hover:border-brand-teal/30 p-5 flex items-center justify-center gap-3 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-brand-teal flex items-center justify-center text-[#0A0A0A] shrink-0 shadow-[0_0_15px_rgba(0,201,167,0.3)] transform group-hover:scale-110 transition-transform">
              <CreditCard size={22} />
            </div>
            <div className="flex-1 text-left">
              <span className="block font-black text-white text-[11px] uppercase tracking-widest italic">Withdraw</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase">Cash Out</span>
            </div>
          </Link>

          <Link to="/support" className="flex-1 min-w-[140px] group relative overflow-hidden bg-brand-card/30 rounded-2xl border border-white/5 hover:border-white/20 p-5 flex items-center justify-center gap-3 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white shrink-0 border border-white/10 transform group-hover:scale-110 transition-transform">
              <HelpCircle size={22} />
            </div>
            <div className="flex-1 text-left">
              <span className="block font-black text-white text-[11px] uppercase tracking-widest italic">Assistance</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase">Get Help</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. Global Activity Feed */}
            <div className="glass-card bg-brand-card/20 border border-white/5 rounded-[2.5rem] p-10 shadow-3xl">
              <ActivityFeed />
            </div>

            {/* 2. Earnings Momentum Chart (SVG) */}
            <div className="glass-card bg-brand-card/20 border border-white/5 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Earnings <span className="text-brand-gold">Momentum</span></h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">7-Day Financial Velocity</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(232,184,75,1)]" />
                        <span className="text-[9px] font-black text-white uppercase italic">Active</span>
                     </div>
                     <div className="flex items-center gap-1.5 opacity-30">
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className="text-[9px] font-black text-slate-600 uppercase italic">Projected</span>
                     </div>
                  </div>
               </div>

               <div className="h-48 w-full relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white" />)}
                  </div>
                  
                  {/* SVG Chart */}
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8B84B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E8B84B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0 160 Q 100 80, 200 120 T 400 40 T 600 90 T 800 20" 
                      fill="none" 
                      stroke="#E8B84B" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      className="drop-shadow-[0_0_10px_rgba(232,184,75,0.4)]"
                    />
                    <path 
                      d="M0 160 Q 100 80, 200 120 T 400 40 T 600 90 T 800 20 L 800 192 L 0 192 Z" 
                      fill="url(#momentumGradient)" 
                    />
                  </svg>
               </div>
               
               <div className="flex justify-between mt-6 px-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day} className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{day}</span>
                  ))}
               </div>
            </div>

            {/* 3. Personalized Recommendations */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tighter italic uppercase">Top Recommendations</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hand-picked for your skill level</p>
                </div>
                <Link to="/services" className="text-brand-gold hover:text-white text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 transition-all">
                  Marketplace <ChevronRight size={14} />
                </Link>
              </div>
              <VentureSpecificTasks venture={userProfile?.venture || 'Growplex'} />
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* 1. Leaderboard Widget */}
            <div className="glass-card bg-brand-card/20 border border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
              <Leaderboard />
            </div>

            {/* 2. Venture Mastery Track */}
            <div className="glass-card bg-brand-card/20 border border-white/5 rounded-[2.5rem] p-8 shadow-3xl space-y-8">
               <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-brand-teal" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Venture Mastery Score</h3>
               </div>
               
               <div className="space-y-6">
                  {[
                    { name: 'BuyRix', score: 85, color: 'bg-brand-gold' },
                    { name: 'Vyuma', score: 45, color: 'bg-brand-teal' },
                    { name: 'TrendyVerse', score: 20, color: 'bg-purple-500' },
                  ].map(v => (
                    <div key={v.name} className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest italic">
                          <span className="text-slate-500">{v.name}</span>
                          <span className="text-white">{v.score}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${v.score}%` }}
                            className={cn("h-full rounded-full transition-all", v.color)}
                          />
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-slate-600 font-bold leading-relaxed italic">
                    Reach <span className="text-white">Tier 2</span> in Vyuma to unlock higher commission rates across the platform.
                  </p>
               </div>
            </div>

            {/* 3. Earnings Goal Tracker */}
            <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform">
                <Target size={120} className="text-brand-gold" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="p-2 bg-brand-gold/10 rounded-lg">
                    <Trophy size={16} className="text-brand-gold" />
                  </div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Weekly KPI Progression</h3>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Earned</span>
                      <span className="text-3xl font-black text-white italic tracking-tighter">{formatINR(currentEarnings)}</span>
                    </div>
                    <div className="text-right">
                       <span className="block text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Target</span>
                       <span className="text-xs font-black text-slate-400 italic">/ {formatINR(weeklyTarget)}</span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-brand-gold to-brand-teal rounded-full shadow-[0_0_15px_rgba(232,184,75,0.4)] relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                    </motion.div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                   <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
                    Finalize <strong className="text-white font-black">{formatINR(weeklyTarget - currentEarnings)}</strong> more to unlock an instant <strong className="text-brand-teal font-black">₹150 Multiplier Bonus</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Social Proof Alert */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-brand-teal/20 to-transparent border border-brand-teal/20 flex items-center gap-4 group cursor-default">
               <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-[#0A0A0A] shrink-0 animate-bounce">
                  <TrendingUp size={18} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white uppercase italic tracking-tight">System Update</p>
                  <p className="text-[9px] text-brand-teal font-bold uppercase tracking-widest">Network speed: 1.2ms verification</p>
               </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;
