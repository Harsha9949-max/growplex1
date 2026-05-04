import { PenTool, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { UserProfile } from '../../types';

interface VentureHeaderProps {
  userProfile: UserProfile | null;
}

const ventureConfig = {
  BuyRix: { icon: Zap, color: 'text-brand-gold', bg: 'bg-brand-gold/10', border: 'border-brand-gold/20', gradient: 'from-brand-gold/20' },
  Vyuma: { icon: PenTool, color: 'text-brand-teal', bg: 'bg-brand-teal/10', border: 'border-brand-teal/20', gradient: 'from-brand-teal/20' },
  TrendyVerse: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', gradient: 'from-purple-400/20' },
  Growplex: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', gradient: 'from-blue-400/20' },
};

const VentureHeader: React.FC<VentureHeaderProps> = ({ userProfile }) => {
  const venture = userProfile?.venture || 'Growplex';
  const config = ventureConfig[venture as keyof typeof ventureConfig] || ventureConfig.Growplex;
  const Icon = config.icon;

  // Determine profile completion
  let completionItems = 0;
  if(userProfile?.fullName) completionItems++;
  if(userProfile?.venture) completionItems++;
  if(userProfile?.photoURL) completionItems++;
  if(userProfile?.kyc?.aadhaar) completionItems++;
  if(userProfile?.paymentInfo?.upiId) completionItems++;
  if(userProfile?.isDigitalAgreementSigned) completionItems++;
  const completionPercent = Math.round((completionItems / 6) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-brand-card border border-white/5 p-8 md:p-10 shadow-2xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} to-transparent mix-blend-overlay`} />
      <div className={`absolute -right-20 -top-20 w-64 h-64 ${config.bg} blur-[80px] rounded-full`} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1 ${config.bg} border ${config.border} rounded-full ${config.color} text-[10px] font-black uppercase tracking-widest mb-4`}>
            <Icon size={12} /> WorkPlex {venture}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic mb-3">
            Hustle Hard, <br className="hidden md:block" />
            <span className={config.color + " uppercase"}>{userProfile?.fullName?.split(' ')[0] || userProfile?.username || 'Contractor'}</span>.
          </h1>
          <p className="text-sm text-slate-400 font-medium">Ready to conquer your daily tasks and earn rewards within the {venture} ecosystem?</p>
        </div>
        
        {/* Profile Ring */}
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle 
                cx="64" cy="64" r="58" fill="none" 
                stroke="url(#progressGradient)" strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - completionPercent / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E8B84B" />
                  <stop offset="100%" stopColor="#00C9A7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <span className="block text-2xl font-black text-brand-gold">{completionPercent}%</span>
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest leading-tight">Profile<br/>Status</span>
            </div>
            {completionPercent === 100 && (
              <div className="absolute -top-1 -right-1 bg-brand-teal text-[#0A0A0A] p-1.5 rounded-full shadow-lg border-4 border-[#121212]">
                <ShieldCheck size={14} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VentureHeader;
