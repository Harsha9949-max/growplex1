import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, getDoc, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/SEO';
import { ClipboardList, Upload, Send, Image as ImageIcon, Link as LinkIcon, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TeamTasks() {
  const { currentUser, userProfile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Proof state per task
  const [proofs, setProofs] = useState<Record<string, { text: string; link: string; imageBase64: string }>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!currentUser?.uid) return;

    const qTasks = query(
      collection(db, "tasks"), 
      where("assignedToId", "==", currentUser.uid)
    );
    
    // sorting might need index, so we do it in client side if index fails. or we remove orderBy if not indexed, or create simple index.
    // For now we will fetch and sort in memory if the query with both where and orderBy needs a composite index.
    
    const unsubscribe = onSnapshot(qTasks, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      // Sort manually to avoid needing a composite index immediately
      tasksData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleProofChange = (taskId: string, field: string, value: string) => {
    setProofs(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { text: '', link: '', imageBase64: '' }),
        [field]: value
      }
    }));
  };

  const handleImageUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleProofChange(taskId, 'imageBase64', base64String);
    };
    reader.readAsDataURL(file);
  };

  const submitProof = async (taskId: string, taskTitle: string) => {
    const proof = proofs[taskId];
    if (!proof?.text && !proof?.link && !proof?.imageBase64) {
      toast.error("Please provide at least some text, a link, or an image as proof.");
      return;
    }

    setSubmittingId(taskId);
    try {
      let imageUrl = "";

      // 1. Upload image to Storage if exists
      if (proof.imageBase64) {
        const imageRef = ref(storage, `task_proofs/${taskId}_${Date.now()}`);
        await uploadString(imageRef, proof.imageBase64, 'data_url');
        imageUrl = await getDownloadURL(imageRef);
      }

      const proofData = {
        text: proof.text || "",
        link: proof.link || "",
        imageUrl: imageUrl,
        submittedAt: serverTimestamp()
      };

      // 2. Update task in Firestore
      await updateDoc(doc(db, "tasks", taskId), {
        status: "submitted",
        proof: proofData,
        updatedAt: serverTimestamp()
      });

      // 3. Send to Telegram
      await sendTelegramNotification(taskTitle, proofData, userProfile?.fullName || userProfile?.username || "Unknown Team Member");

      toast.success("Proof submitted successfully!");
      // Clear local state
      setProofs(prev => {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      });

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to submit proof.");
    } finally {
      setSubmittingId(null);
    }
  };

  const sendTelegramNotification = async (taskTitle: string, proof: any, memberName: string) => {
    try {
      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      const botToken = settings?.telegramBotToken;
      const chatId = settings?.telegramChatId;

      if (!botToken || !chatId) return;

      const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);
      
      const message = [
        `📝 *Task Proof Submitted*`,
        ``,
        `👤 *Member:* ${memberName}`,
        `📋 *Task Title:* ${taskTitle}`,
        ``,
        proof.text ? `💬 *Response:* ${proof.text}` : '',
        proof.link ? `🔗 *Link:* ${proof.link}` : '',
      ].filter(Boolean).join('\n');

      for (const id of chatIds) {
        if (proof.imageUrl) {
          // Send photo with caption
          await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: id,
              photo: proof.imageUrl,
              caption: message,
              parse_mode: 'Markdown'
            })
          });
        } else {
          // Send text only
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: id,
              text: message,
              parse_mode: 'Markdown'
            })
          });
        }
      }
    } catch (e) {
      console.error("Telegram notification failed", e);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SEO title="My Tasks | Growplex" description="View and submit your assigned tasks." />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white tracking-tight">My Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">Complete your assigned tasks and submit proofs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full p-12 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading tasks...</p>
           </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full bg-brand-surface border border-brand-border border-dashed rounded-[2rem] p-16 text-center shadow-lg">
             <ClipboardList size={48} className="mx-auto text-slate-600 mb-6" />
             <h3 className="text-xl font-bold text-white mb-2">No Tasks Assigned</h3>
             <p className="text-slate-400 font-medium">You're all caught up! Admin hasn't assigned any new tasks.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-brand-surface border border-brand-border rounded-xl flex flex-col shadow-sm overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-bold text-white text-lg">{task.title}</h3>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    task.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    task.status === 'submitted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                  }`}>
                    {task.status}
                  </span>
                </div>
                {task.description && <p className="text-sm text-slate-400 line-clamp-3 mb-4">{task.description}</p>}
                
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-auto">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> Assigned: {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-brand-primary/30 flex-1 flex flex-col">
                {(task.status === 'pending' || task.status === 'rejected') ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {task.status === 'rejected' && (
                       <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-200 mb-2">
                         Your previous proof was rejected. Please submit again.
                       </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Response / Notes</label>
                      <textarea
                        value={proofs[task.id]?.text || ''}
                        onChange={e => handleProofChange(task.id, 'text', e.target.value)}
                        placeholder="Add some text..."
                        rows={2}
                        className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><LinkIcon size={12}/> Link</label>
                      <input
                        type="url"
                        value={proofs[task.id]?.link || ''}
                        onChange={e => handleProofChange(task.id, 'link', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><ImageIcon size={12}/> Image Proof</label>
                      
                      {proofs[task.id]?.imageBase64 ? (
                        <div className="relative rounded-lg overflow-hidden border border-brand-border group">
                          <img src={proofs[task.id].imageBase64} alt="Preview" className="w-full h-32 object-cover" />
                          <button 
                            onClick={() => handleProofChange(task.id, 'imageBase64', '')}
                            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRefs.current[task.id]?.click()}
                          className="w-full border-2 border-dashed border-brand-border hover:border-brand-accent/50 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-brand-surface text-slate-400 hover:text-brand-accent"
                        >
                          <Upload size={20} />
                          <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={el => { fileInputRefs.current[task.id] = el; }}
                            onChange={(e) => handleImageUpload(task.id, e)}
                          />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => submitProof(task.id, task.title)}
                      disabled={submittingId === task.id}
                      className="w-full mt-auto flex items-center justify-center gap-2 bg-brand-accent text-brand-primary py-2.5 rounded-lg font-bold text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                    >
                      {submittingId === task.id ? 'Submitting...' : 'Submit Proof'}
                      <Send size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-6">
                    {task.status === 'approved' ? (
                       <CheckCircle2 size={48} className="text-green-500" />
                    ) : (
                       <Clock size={48} className="text-blue-500" />
                    )}
                    <div>
                      <p className="font-bold text-white mb-1">
                        {task.status === 'approved' ? 'Proof Approved!' : 'Proof Submitted'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {task.status === 'approved' ? 'Great job on completing this task.' : 'Waiting for admin to review your proof.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
