import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Send, 
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Award,
  Lock,
  Loader2,
  FileText
} from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Task, Submission } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatINR, OperationType, handleFirestoreError } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot field
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      try {
        const docRef = doc(db, 'tasks', taskId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTask({ id: docSnap.id, ...docSnap.data() } as Task);
        } else {
          toast.error('Task not found');
          navigate('/services');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('File size must be less than 5MB');
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !task) return;

    if (task.proofType === 'image' && !proofFile) {
      return toast.error('Screenshot proof is required');
    }
    if ((task.proofType === 'text' || task.proofType === 'link') && !proofText.trim()) {
      return toast.error('Proof description/link is required');
    }

    // 1. Bot Check
    if (honeypot) return toast.error('Bot activity detected');

    // 2. Throttle Check
    const now = Date.now();
    if (now - lastSubmissionTime < 30000) {
      return toast.error(`Please wait ${Math.ceil((30000 - (now - lastSubmissionTime)) / 1000)}s before next submission`);
    }

    setSubmitting(true);
    try {
      let proofUrl = '';
      if (proofFile) {
        const storageRef = ref(storage, `submissions/${userProfile.uid}/${taskId}_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, proofFile);
        proofUrl = await getDownloadURL(uploadResult.ref);
      }

      const submissionId = doc(collection(db, 'submissions')).id;
      const submission: Partial<Submission> = {
        id: submissionId,
        taskId: task.id,
        userId: userProfile.uid,
        userName: userProfile.fullName || userProfile.username,
        taskTitle: task.title,
        venture: task.venture,
        amount: task.amount,
        proofType: task.proofType,
        proofText: proofText,
        proofUrl: proofUrl,
        status: 'pending',
        submittedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'submissions', submissionId), submission);
      setLastSubmissionTime(Date.now());
      
      toast.success('Task submitted successfully! Awaiting verification.');
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!task) return null;

  const getVentureStyle = (venture: string) => {
    switch (venture) {
      case 'BuyRix': return { color: 'text-brand-gold', bg: 'bg-brand-gold/10', border: 'border-brand-gold/20' };
      case 'Vyuma': return { color: 'text-brand-teal', bg: 'bg-brand-teal/10', border: 'border-brand-teal/20' };
      case 'TrendyVerse': return { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
      case 'Growplex': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
      default: return { color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10' };
    }
  };

  const style = getVentureStyle(task.venture);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0 font-sans">
      {/* 1. Navigation & Quick Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <button 
          onClick={() => navigate('/services')}
          className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Marketplace</span>
        </button>

        <div className="flex items-center gap-4">
           <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-3", style.bg, style.border)}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", style.color.replace('text', 'bg'))} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest italic", style.color)}>{task.venture} Campaign</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 2. Left Column: Instructions */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-brand-card/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <FileText size={120} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                    <Award size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{task.title}</h1>
                    <p className="text-[10px] text-brand-teal font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                       <Zap size={10} className="fill-brand-teal" /> Guaranteed Reward: {formatINR(task.amount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                        Mission Objective <Info size={14} className="text-slate-600" />
                      </h3>
                      <p className="text-slate-400 text-base font-medium leading-relaxed italic">
                        {task.description}
                      </p>
                   </div>

                   <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Requirements</h3>
                      <ul className="space-y-3">
                         {task.instructions?.map((step, i) => (
                           <li key={i} className="flex gap-4 items-start group">
                              <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-brand-gold group-hover:text-[#0A0A0A] transition-colors shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <span className="text-sm text-slate-300 font-medium italic">{step}</span>
                           </li>
                         ))}
                      </ul>
                   </div>

                   {task.link && (
                     <a 
                       href={task.link} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center justify-between p-5 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 text-brand-teal hover:bg-brand-teal/10 transition-all group"
                     >
                        <span className="text-xs font-black uppercase tracking-widest italic">Open Target Link</span>
                        <ExternalLink size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     </a>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* 3. Right Column: Proof Submission */}
        <div className="lg:col-span-5 space-y-8">
           <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[3rem] border border-white/5 bg-brand-card shadow-3xl sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck size={20} className="text-brand-gold" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Proof of Completion</h3>
              </div>

              <div className="space-y-8">
                 {/* Image Upload */}
                 {(task.proofType === 'image') && (
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">Screenshot Proof (Max 5MB)</label>
                       <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="proof-upload"
                          />
                          <label 
                            htmlFor="proof-upload"
                            className={cn(
                              "w-full h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden",
                              previewUrl ? "border-brand-teal/50" : "border-white/5 hover:border-brand-gold/30 hover:bg-white/[0.02]"
                            )}
                          >
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <Camera size={32} className="text-slate-800 group-hover:text-brand-gold transition-colors mb-3" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Click to upload image</span>
                              </>
                            )}
                          </label>
                       </div>
                    </div>
                 )}

                 {/* Text / Link Input */}
                 {(task.proofType === 'text' || task.proofType === 'link') && (
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">
                         {task.proofType === 'link' ? 'Submission Link (URL)' : 'Completion Details'}
                       </label>
                       <textarea
                         value={proofText}
                         onChange={(e) => setProofText(e.target.value)}
                         placeholder={task.proofType === 'link' ? 'Paste your profile/post link here...' : 'Describe what you did...'}
                         rows={4}
                         className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-800 focus:ring-1 focus:ring-brand-gold/50 transition-all font-medium italic"
                       />
                    </div>
                 )}

                 <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-4">
                    <AlertCircle size={18} className="text-orange-500 shrink-0" />
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      False submissions will result in an immediate account ban and forfeiture of all bonuses.
                    </p>
                 </div>

                 {/* Honeypot Field */}
                 <div className="hidden absolute opacity-0 pointer-events-none" aria-hidden="true">
                   <input 
                     type="text" 
                     value={honeypot} 
                     onChange={(e) => setHoneypot(e.target.value)} 
                     tabIndex={-1} 
                     autoComplete="off" 
                   />
                 </div>

                 <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-gold text-[#0A0A0A] font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 hover:shadow-[0_20px_40px_-10px_rgba(232,184,75,0.3)] transform hover:-translate-y-1 active:scale-95 text-xs italic uppercase tracking-widest disabled:opacity-50"
                 >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        Finalize Submission <Send size={16} />
                      </>
                    )}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
