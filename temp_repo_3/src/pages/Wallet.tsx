import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet as WalletIcon, 
  PlusCircle, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  Clock,
  Award,
  ChevronRight,
  Lock
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../types';
import { formatINR, OperationType, handleFirestoreError } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Wallet: React.FC = () => {
  const { userProfile } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<string>('');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const txRef = collection(db, 'transactions');
    const q = query(
      txRef, 
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 10) {
      return toast.error('Minimum deposit amount is ₹10');
    }

    if (!window.Razorpay) {
      return toast.error('Payment gateway loading. Try again.');
    }

    setProcessing(true);
    setPaymentStep('Initializing Secure Gateway...');

    try {
      // In a real app, this would be an API call to your backend
      // For this demo, we'll simulate a successful payment update
      
      const options = {
        key: 'rzp_test_dummy', // Replace with real key in prod
        amount: numAmount * 100,
        currency: 'INR',
        name: 'WORKPLEX',
        description: 'Wallet Deposit',
        handler: async function(response: any) {
          setPaymentStep('Verifying Transaction...');
          const txId = doc(collection(db, 'transactions')).id;
          await setDoc(doc(db, 'transactions', txId), {
            id: txId,
            userId: userProfile!.uid,
            amount: numAmount,
            type: 'deposit',
            razorpayPaymentId: response.razorpay_payment_id,
            status: 'completed',
            createdAt: Timestamp.now()
          });

          await updateDoc(doc(db, 'users', userProfile!.uid), {
            'wallets.earned': increment(numAmount)
          });

          toast.success(`₹${numAmount} added successfully!`);
          setAmount('');
          setProcessing(false);
          setPaymentStep('');
        },
        prefill: {
          name: userProfile?.fullName || userProfile?.username,
          email: userProfile?.email,
        },
        theme: { color: '#E8B84B' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast.error('Payment failed');
      setProcessing(false);
      setPaymentStep('');
    }
  };

  const wallets = userProfile?.wallets || { earned: 0, pending: 0, bonus: 0, savings: 0 };

  const walletCards = [
    { 
      id: 'earned',
      label: 'Withdrawable', 
      value: wallets.earned, 
      icon: CheckCircle2, 
      color: 'text-brand-teal', 
      bg: 'bg-brand-teal/10',
      border: 'border-brand-teal/20',
      desc: 'Verified earnings ready for bank transfer.'
    },
    { 
      id: 'pending',
      label: 'Pending', 
      value: wallets.pending, 
      icon: Clock, 
      color: 'text-brand-gold', 
      bg: 'bg-brand-gold/10',
      border: 'border-brand-gold/20',
      desc: 'Awaiting task verification or clearance.'
    },
    { 
      id: 'bonus',
      label: 'Bonus', 
      value: wallets.bonus, 
      icon: Award, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
      desc: 'Joining and performance bonuses (Locked).'
    },
    { 
      id: 'savings',
      label: 'Savings', 
      value: wallets.savings, 
      icon: TrendingUp, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      desc: 'Auto-saved 5% for long-term benefits.'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-gold rounded-lg shadow-[0_0_15px_rgba(232,184,75,0.3)]">
              <WalletIcon size={20} className="text-[#0A0A0A]" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Financial <span className="text-brand-gold">Hub</span></h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">Securely manage your WorkPlex earnings and bonuses.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-2 rounded-2xl">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-brand-teal/20 border border-brand-teal/50 flex items-center justify-center">
              <ShieldCheck size={14} className="text-brand-teal" />
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">E2E Encrypted</span>
        </div>
      </div>

      {/* 2. Wallet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {walletCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 rounded-[2rem] border ${card.border} group relative overflow-hidden bg-brand-card/30`}
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${card.bg} blur-[30px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity`} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center ${card.color}`}>
                  <card.icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Verified <CheckCircle2 size={10} className="text-brand-teal" />
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">
                  <span className="text-lg mr-0.5 opacity-50">₹</span>{card.value.toLocaleString('en-IN')}
                </h4>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${card.color} italic`}>{card.label}</p>
              </div>
              
              <p className="text-[9px] text-slate-500 leading-relaxed font-medium mt-auto">
                {card.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 3. Transaction History */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Transaction Ledger</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time financial activity log</p>
            </div>
            <button className="text-brand-gold hover:text-white text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 transition-colors">
              Export PDF <ChevronRight size={14} />
            </button>
          </div>

          <div className="glass-card border border-white/5 rounded-[2.5rem] overflow-hidden bg-brand-card/10 shadow-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black border-b border-white/5">
                    <th className="px-8 py-6">Reference ID</th>
                    <th className="px-8 py-6">Transaction Type</th>
                    <th className="px-8 py-6">Amount</th>
                    <th className="px-8 py-6">Settlement</th>
                    <th className="px-8 py-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                        <Loader2 size={32} className="animate-spin mx-auto mb-4 text-brand-gold" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic">Syncing with blockchain ledger...</p>
                      </td>
                    </tr>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                      <motion.tr 
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/[0.01] transition-colors group cursor-default"
                      >
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest uppercase">
                            #{tx.id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                              tx.type === 'deposit' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              tx.type === 'refund' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                              "bg-red-500/10 border-red-500/20 text-red-500"
                            )}>
                              {tx.type === 'deposit' ? <PlusCircle size={18} /> : 
                               tx.type === 'refund' ? <Sparkles size={18} /> : 
                               <ArrowDownRight size={18} />}
                            </div>
                            <span className="text-xs font-black text-white uppercase italic tracking-widest">{tx.type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "text-lg font-black italic tracking-tighter",
                            tx.type === 'deposit' ? "text-emerald-400" : "text-white"
                          )}>
                            {tx.type === 'deposit' ? '+' : '-'}{formatINR(tx.amount)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", tx.status === 'completed' ? 'bg-brand-teal' : 'bg-amber-400')} />
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest italic",
                              tx.status === 'completed' ? "text-brand-teal" : "text-amber-400"
                            )}>
                              {tx.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[10px] font-bold text-slate-500 italic">
                            {tx.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {tx.createdAt.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                          <History size={32} className="text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">No History Yet</h3>
                        <p className="text-slate-500 mt-2 text-xs font-medium max-w-xs mx-auto italic">Start completing tasks or recharge your wallet to see your financial footprint here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Action Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Transfer/Withdraw Card */}
           <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-teal/20 to-brand-teal/5 border border-brand-teal/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform">
              <Zap size={100} className="text-brand-teal" />
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Request Payout</h4>
              <p className="text-slate-400 text-sm font-medium mb-8 max-w-sm leading-relaxed">
                Move your withdrawable balance to your bank account via UPI. Minimum payout: Rs.100.
              </p>
              <button 
                disabled={wallets.earned < 100}
                className="px-10 py-4 bg-brand-teal text-[#0A0A0A] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] italic hover:scale-105 transition-all disabled:opacity-30 flex items-center gap-3"
              >
                Release Funds <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Locked Bonus Card */}
          <motion.div 
             whileHover={{ y: -5 }}
             className="p-8 rounded-[2.5rem] bg-brand-card/40 border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform">
              <Lock size={100} className="text-slate-500" />
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-[#555] uppercase italic tracking-tighter mb-4">Locked Bonuses</h4>
              <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm leading-relaxed">
                Unlock your Rs.500 potential by completing your first 10 tasks and maintaining a 7-day streak.
              </p>
              <div className="flex items-center gap-6">
                 <div>
                    <span className="block text-xl font-black text-white italic">₹{wallets.bonus}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Bonus Locked</span>
                 </div>
                 <div className="h-8 w-px bg-white/10" />
                 <Link to="/services" className="text-[10px] font-black text-brand-gold uppercase tracking-widest italic hover:underline">View Missions</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
