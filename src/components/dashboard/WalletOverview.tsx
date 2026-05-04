import { ArrowUpRight, Award, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { cn, formatINR } from '../../lib/utils';
import { UserProfile } from '../../types';

interface WalletOverviewProps {
  userProfile: UserProfile | null;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ userProfile }) => {
  const wallets = userProfile?.wallets || { earned: 0, pending: 0, bonus: 0, savings: 0 };

  const walletCards = [
    { 
      label: 'Earned Wallet', 
      value: wallets.earned, 
      icon: CheckCircle2, 
      color: 'bg-brand-teal/5 border-brand-teal/10', 
      iconColor: 'text-brand-teal',
      desc: 'Withdrawable balance' 
    },
    { 
      label: 'Pending Wallet', 
      value: wallets.pending, 
      icon: Clock, 
      color: 'bg-brand-gold/5 border-brand-gold/10', 
      iconColor: 'text-brand-gold',
      desc: 'Verification in progress'
    },
    { 
      label: 'Bonus Wallet', 
      value: wallets.bonus, 
      icon: Award, 
      color: 'bg-purple-500/5 border-purple-500/10', 
      iconColor: 'text-purple-400',
      desc: 'Locked joining rewards'
    },
    { 
      label: 'Savings Wallet', 
      value: wallets.savings, 
      icon: TrendingUp, 
      color: 'bg-blue-500/5 border-blue-500/10', 
      iconColor: 'text-blue-400',
      desc: 'Auto-saved for future'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {walletCards.map((card, i) => (
        <motion.div 
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card bg-[#121212] p-5 rounded-3xl group hover:border-brand-gold/30 transition-all duration-500 border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity ${card.iconColor.replace('text', 'bg')}`} />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110", card.color)}>
              <card.icon size={20} className={card.iconColor} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter italic mb-0.5">{formatINR(card.value)}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic mb-2">{card.label}</p>
              <div className="h-px w-full bg-white/[0.03] mb-2" />
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                {card.desc} <ArrowUpRight size={8} />
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WalletOverview;
