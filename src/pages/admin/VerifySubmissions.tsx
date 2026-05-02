import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  User as UserIcon,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  runTransaction,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Submission, UserProfile } from '../../types';
import { formatINR, cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const VerifySubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (submission: Submission, action: 'approve' | 'reject') => {
    setProcessingId(submission.id);
    try {
      await runTransaction(db, async (transaction) => {
        const submissionRef = doc(db, 'submissions', submission.id);
        const userRef = doc(db, 'users', submission.userId);
        
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");
        
        const userData = userDoc.data() as UserProfile;
        
        // 1. Update Submissions Status
        transaction.update(submissionRef, { 
          status: action === 'approve' ? 'approved' : 'rejected',
          processedAt: Timestamp.now()
        });

        if (action === 'approve') {
          // 2. Atomic Wallet Update
          const newEarned = (userData.wallets?.earned || 0) + submission.amount;
          transaction.update(userRef, {
            'wallets.earned': newEarned
          });

          // 3. Create Notification
          const notificationRef = doc(collection(db, 'notifications'));
          transaction.set(notificationRef, {
            userId: submission.userId,
            title: 'Mission Approved! 🚀',
            message: `Congratulations! Your proof for "${submission.taskTitle}" was verified. ₹${submission.amount} added to your earned wallet.`,
            type: 'success',
            link: '/submissions',
            isRead: false,
            createdAt: Timestamp.now()
          });
        } else {
          // Reject Notification
          const notificationRef = doc(collection(db, 'notifications'));
          transaction.set(notificationRef, {
            userId: submission.userId,
            title: 'Mission Rejected ⚠️',
            message: `Your proof for "${submission.taskTitle}" was rejected. Please ensure your screenshots match the requirements.`,
            type: 'warning',
            link: '/submissions',
            isRead: false,
            createdAt: Timestamp.now()
          });
        }
      });

      toast.success(action === 'approve' ? 'Submission approved and paid out!' : 'Submission rejected');
    } catch (error) {
      console.error(error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = submissions.filter(s => {
    const matchesSearch = s.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
                          s.userName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
            Mission <span className="text-brand-gold">Intelligence</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Verification Protocol v2.4 | System Secure</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 w-72 focus-within:border-brand-gold/30 transition-all">
              <Search size={18} className="text-slate-700" />
              <input 
                type="text" 
                placeholder="Search candidates or tasks..." 
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-800 w-full italic"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all",
                    filter === f ? "bg-brand-gold text-[#0A0A0A] shadow-lg shadow-brand-gold/20" : "text-slate-500 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
           <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Hydrating data stream...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "glass-card p-8 rounded-[2.5rem] border border-white/5 bg-brand-card/20 group hover:bg-white/[0.04] transition-all relative overflow-hidden",
                  s.status === 'pending' && "border-l-4 border-l-brand-gold"
                )}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* User & Mission */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <UserIcon size={20} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-white italic uppercase tracking-tight">{s.userName}</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{s.venture} Contributor</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">{s.taskTitle}</p>
                       <p className="text-brand-teal text-[10px] font-black mt-1 italic tracking-tight">Reward: {formatINR(s.amount)}</p>
                    </div>
                  </div>

                  {/* Proof Visualization */}
                  <div className="lg:col-span-6">
                     <div className="flex flex-col md:flex-row gap-6">
                        {s.proofUrl && (
                          <div className="relative group/img cursor-zoom-in w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                             <img src={s.proofUrl} alt="Proof" className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <a href={s.proofUrl} target="_blank" rel="noreferrer" className="p-2 bg-brand-gold text-[#0A0A0A] rounded-full shadow-xl">
                                  <Eye size={18} />
                                </a>
                             </div>
                          </div>
                        )}
                        <div className="flex-1 space-y-3">
                           <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-brand-teal" />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Attestation Analysis</span>
                           </div>
                           <p className="text-xs text-slate-400 font-medium italic leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 min-h-[80px]">
                              {s.proofText || "No text verification provided."}
                           </p>
                           {s.proofType === 'link' && s.proofText && (
                             <a href={s.proofText} target="_blank" rel="noreferrer" className="text-brand-teal text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                               Audit Target Link <ExternalLink size={12} />
                             </a>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="lg:col-span-3">
                     <div className="flex flex-col gap-3">
                        {s.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleAction(s, 'approve')}
                              disabled={!!processingId}
                              className="w-full py-4 rounded-2xl bg-brand-teal text-[#0A0A0A] font-black italic uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-brand-teal/10 disabled:opacity-50"
                            >
                              {processingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 
                              Verify & Pay
                            </button>
                            <button 
                              onClick={() => handleAction(s, 'reject')}
                              disabled={!!processingId}
                              className="w-full py-4 rounded-2xl bg-white/[0.03] text-slate-500 border border-white/5 font-black italic uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all disabled:opacity-50"
                            >
                              Reject Proof
                            </button>
                          </>
                        ) : (
                          <div className={cn(
                            "w-full py-6 rounded-2xl border flex flex-col items-center justify-center gap-2",
                            s.status === 'approved' ? "bg-brand-teal/5 border-brand-teal/20 text-brand-teal" : "bg-red-500/5 border-red-500/20 text-red-500"
                          )}>
                             {s.status === 'approved' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{s.status} Status Locked</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-700" />
                              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                                {formatDistanceToNow(s.submittedAt.toDate())} ago
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-32 text-center glass-card rounded-[3rem] border border-white/5">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap size={40} className="text-slate-800" />
               </div>
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Zero Pending Operations</h3>
               <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] italic">All system missions have been synchronized.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper for relative time (mocking date-fns formatDistanceToNow since user didn't have it in previous file but I can use standard)
function formatDistanceToNow(date: Date) {
  const diff = (new Date().getTime() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default VerifySubmissions;
