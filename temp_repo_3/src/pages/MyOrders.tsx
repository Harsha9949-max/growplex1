import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  ExternalLink,
  RotateCcw,
  Eye,
  Zap,
  Award
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Submission } from '../types';
import { formatINR, OperationType, handleFirestoreError, cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

const MySubmissions: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const subRef = collection(db, 'submissions');
    const q = query(
      subRef, 
      where('userId', '==', userProfile.uid),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(subData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
                          s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Rework'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-teal/10 text-brand-teal border border-brand-teal/20 flex items-center gap-1 w-fit italic"><CheckCircle2 size={10} /> {status}</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit italic"><Clock size={10} /> {status}</span>;
      case 'rework':
        return <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-gold/10 text-brand-gold border border-brand-gold/20 flex items-center gap-1 w-fit italic"><RotateCcw size={10} /> {status}</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit italic"><AlertCircle size={10} /> {status}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1 w-fit italic">{status}</span>;
    }
  };

  const getVentureIcon = (venture: string) => {
    switch (venture) {
      case 'BuyRix': return <Zap size={14} className="text-brand-gold" />;
      case 'Vyuma': return <Award size={14} className="text-brand-teal" />;
      default: return <Briefcase size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0 font-sans">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-teal rounded-lg shadow-[0_0_15px_rgba(0,201,167,0.3)]">
              <CheckCircle2 size={20} className="text-[#0A0A0A]" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Mission <span className="text-brand-teal">Terminal</span></h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">Track your active assignments and verification status.</p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-brand-gold transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Task ID..."
              className="w-full bg-brand-card/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-white focus:outline-none focus:border-brand-gold transition-all duration-300 italic font-medium"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-5 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 border whitespace-nowrap italic",
                  statusFilter === s 
                    ? "bg-brand-gold text-[#0A0A0A] border-brand-gold shadow-lg shadow-brand-gold/10" 
                    : "bg-white/[0.03] text-slate-500 hover:bg-white/10 hover:text-white border-white/10"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card bg-[#0A0A0A] p-24 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-[3rem]">
          <Loader2 size={32} className="animate-spin mb-6 text-brand-gold" />
          <p className="text-sm font-black italic uppercase tracking-widest text-slate-700">Accessing Submission Vault...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card bg-brand-card/10 overflow-hidden rounded-[3rem] border border-white/5 shadow-3xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-slate-600 text-[10px] uppercase font-black tracking-[0.3em] italic">
                  <th className="px-10 py-7">Assignment ID / Campaign</th>
                  <th className="px-10 py-7 text-center">Ecosystem</th>
                  <th className="px-10 py-7">Payout</th>
                  <th className="px-10 py-7">Status</th>
                  <th className="px-10 py-7">Submission Timeline</th>
                  <th className="px-10 py-7 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub, index) => (
                      <motion.tr
                        key={sub.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.01] transition-colors group cursor-default"
                      >
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-slate-600 italic">#{sub.id.substring(0, 8).toUpperCase()}</span>
                            <span className="text-base font-black text-white group-hover:text-brand-gold transition-colors italic uppercase leading-tight tracking-tight">{sub.taskTitle}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                           <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                              {getVentureIcon(sub.venture)}
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{sub.venture}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-lg font-black text-brand-teal italic tracking-tighter">{formatINR(sub.amount)}</span>
                        </td>
                        <td className="px-10 py-8">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-0.5 italic">
                            <span className="text-[11px] text-white font-black group-hover:text-brand-gold transition-colors">
                              {sub.submittedAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                               At {sub.submittedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button
                            onClick={() => {}}
                            className="p-3 rounded-xl bg-white/5 hover:bg-brand-gold hover:text-[#0A0A0A] text-slate-500 transition-all border border-white/10 group/btn"
                            title="View Details"
                          >
                            <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-2 border border-white/5">
                            <Briefcase size={40} className="text-slate-800" />
                          </div>
                          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">No Active Submissions</h3>
                          <p className="text-slate-500 font-medium max-w-sm mx-auto italic leading-relaxed px-10">You haven't submitted any tasks yet. Head to the Marketplace to start earning.</p>
                          <button 
                            onClick={() => navigate('/services')}
                            className="px-8 py-4 bg-brand-gold text-[#0A0A0A] font-black rounded-2xl text-[10px] uppercase tracking-widest italic hover:scale-105 transition-all shadow-xl shadow-brand-gold/10"
                          >
                             Browse Campaigns <ChevronRight size={14} className="inline ml-2" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="px-10 py-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] italic">Network Query Results: {filteredSubmissions.length} Documents</p>
            <div className="flex items-center gap-4">
              <button disabled className="p-3 rounded-xl bg-white/5 text-slate-700 border border-white/10 disabled:opacity-30 transition-all hover:bg-white/10">
                <ChevronLeft size={18} />
              </button>
              <button disabled className="p-3 rounded-xl bg-white/5 text-slate-700 border border-white/10 disabled:opacity-30 transition-all hover:bg-white/10">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MySubmissions;
