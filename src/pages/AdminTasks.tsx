import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, addDoc, serverTimestamp, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/SEO';
import { AdminLayout } from "../components/AdminLayout";
import { ClipboardList, CheckCircle, XCircle, Clock, Plus, Users, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminTasks() {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    selectedUsers: [] as string[],
    expiresAt: ''
  });

  useEffect(() => {
    // Fetch team members
    const fetchTeamMembers = async () => {
      const q = query(collection(db, "users"), where("role", "in", ["team_member", "influencer"]));
      const snapshot = await getDocs(q);
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);
    };
    fetchTeamMembers();

    // Fetch tasks
    const qTasks = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(qTasks, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Purge proofs > 24h
      tasksData.forEach(task => {
        if (task.proofSubmittedAt) {
          const submittedTime = task.proofSubmittedAt.toMillis ? task.proofSubmittedAt.toMillis() : Date.now();
          const hrsPassed = (Date.now() - submittedTime) / (1000 * 60 * 60);
          if (hrsPassed > 24 && (task.proof?.text || task.proof?.link || task.proof?.imageUrl)) {
              updateDoc(doc(db, "tasks", task.id), {
                proof: null,
                proofPurged: true
              }).catch(console.error);
          }
        }
      });
      
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || newTask.selectedUsers.length === 0) {
      toast.error("Please fill title and select at least one team member");
      return;
    }
    
    setIsCreating(true);
    const batchId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2);

    try {
      const promises = newTask.selectedUsers.map(userId => {
        const user = teamMembers.find(m => m.uid === userId || m.id === userId);
        
        let expirationDate = new Date();
        expirationDate.setHours(23, 59, 59, 999); // default to end of today
        if (newTask.expiresAt) {
          expirationDate = new Date(newTask.expiresAt);
        }

        return addDoc(collection(db, "tasks"), {
          batchId,
          title: newTask.title,
          description: newTask.description,
          assignedToId: userId,
          assignedToName: user?.fullName || user?.username || "Unknown",
          assignedById: userProfile?.uid,
          assignedByName: userProfile?.fullName || "Admin",
          assignedByRole: userProfile?.role || "admin",
          status: "pending",
          seen: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiresAt: expirationDate.toISOString()
        });
      });
      await Promise.all(promises);
      toast.success("Tasks assigned successfully");
      setNewTask({ title: '', description: '', selectedUsers: [], expiresAt: '' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign tasks");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setNewTask(prev => {
      if (prev.selectedUsers.includes(userId)) {
        return { ...prev, selectedUsers: prev.selectedUsers.filter(id => id !== userId) };
      } else {
        return { ...prev, selectedUsers: [...prev.selectedUsers, userId] };
      }
    });
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status,
        updatedAt: serverTimestamp()
      });
      toast.success(`Task marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <SEO title="Task Management | Admin" description="Manage team member tasks" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight">Task Management</h1>
            <p className="text-slate-400 text-sm mt-1">Assign tasks and verify proofs submitted by team members.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assign Task Form */}
          <div className="lg:col-span-1 bg-brand-surface border border-brand-border rounded-xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-brand-accent" /> Assign New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 cursor-pointer">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g. Promote the new campaign link..."
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 cursor-pointer">Task Details (Optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Details of the task..."
                  rows={3}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 cursor-pointer">Expiration Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={newTask.expiresAt}
                  onChange={e => setNewTask({...newTask, expiresAt: e.target.value})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">If left blank, defaults to 11:59 PM today.</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Assign To</label>
                  <button type="button" onClick={() => setNewTask(p => ({...p, selectedUsers: teamMembers.map(m => m.uid || m.id)}))} className="text-[10px] text-brand-accent hover:underline">Select All</button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 bg-brand-primary p-2 rounded-lg border border-brand-border/50">
                  {teamMembers.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-2">No team members found.</p>
                  ) : (
                    teamMembers.map(member => (
                      <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-white/[0.02] rounded cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newTask.selectedUsers.includes(member.uid || member.id)}
                          onChange={() => toggleUserSelection(member.uid || member.id)}
                          className="rounded border-brand-border bg-brand-surface text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-primary"
                        />
                        <span className="text-sm text-slate-300">{member.fullName || member.username}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-primary py-3 rounded-lg font-bold hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Assigning...' : 'Assign Task'}
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-brand-accent" /> All Tasks & Proofs
            </h2>
            
            {loading ? (
               <div className="p-12 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Loading tasks...</p>
               </div>
            ) : tasks.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border border-dashed rounded-xl p-12 text-center">
                 <ClipboardList size={40} className="mx-auto text-slate-600 mb-4" />
                 <p className="text-slate-400 font-medium">No tasks assigned yet.</p>
              </div>
            ) : (
              Object.values(tasks.reduce((acc: any, task: any) => {
                const key = task.batchId || task.id;
                if (!acc[key]) acc[key] = [];
                acc[key].push(task);
                return acc;
              }, {})).map((group: any) => {
                const primary = group[0];
                const total = group.length;
                const seenCount = group.filter((t: any) => t.seen || t.status !== 'pending').length;
                const completedCount = group.filter((t: any) => t.status !== 'pending').length;
                const isExpired = primary.expiresAt && primary.status === 'pending' && Date.now() > new Date(primary.expiresAt).getTime();
                
                return (
                  <div key={primary.batchId || primary.id} className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">{primary.title}</h3>
                        {primary.description && <p className="text-sm text-slate-400 mt-1">{primary.description}</p>}
                        <div className="flex items-center gap-4 mt-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Users size={14} /> Assigned to {total} member{total > 1 ? 's' : ''}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Clock size={14} /> 
                            {primary.createdAt?.toDate ? primary.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                           isExpired ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                           completedCount === total ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                           'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                        }`}>
                          {isExpired ? 'expired' : completedCount === total ? 'all completed' : 'in progress'}
                        </span>
                        <div className="flex gap-4 items-center">
                          <button 
                            onClick={() => setNewTask({ title: primary.title, description: primary.description || '', selectedUsers: [], expiresAt: '' })}
                            className="text-[10px] text-brand-accent hover:underline uppercase tracking-widest mt-1 opacity-70 hover:opacity-100"
                          >
                            Clone Task
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this assigned task stream?")) return;
                              try {
                                const { deleteDoc, doc } = await import('firebase/firestore');
                                await Promise.all(group.map((t: any) => deleteDoc(doc(db, "tasks", t.id))));
                                toast.success("Task deleted");
                              } catch (e) {
                                toast.error("Failed to delete task");
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-400 hover:underline uppercase tracking-widest mt-1 opacity-70 hover:opacity-100 flex items-center gap-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 bg-brand-primary/50 p-3 rounded-lg border border-brand-border/30">
                      <span>👁️ {seenCount}/{total} Seen</span>
                      <span>✅ {completedCount}/{total} Done</span>
                      {primary.assignedByName && <span className="ml-auto text-brand-accent/70 capitalize">Assigned by: {primary.assignedByName} ({primary.assignedByRole?.replace('_', ' ') || 'admin'})</span>}
                    </div>

                    <div className="space-y-4">
                      {group.map((task: any) => (
                        <div key={task.id} className="pl-4 border-l-2 border-brand-border/50 relative">
                           <div className="absolute top-1 -left-[9px] w-4 h-4 rounded-full bg-brand-surface border-2 border-brand-border"></div>
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-3">
                               <span className="font-bold text-white text-sm">{task.assignedToName}</span>
                               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  (task.expiresAt && task.status === 'pending' && Date.now() > new Date(task.expiresAt).getTime()) ? 'bg-slate-500/10 text-slate-400' :
                                  task.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                  task.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                  task.status === 'submitted' ? 'bg-blue-500/10 text-blue-400' :
                                  task.seen ? 'bg-brand-accent/10 text-brand-accent' :
                                  'bg-brand-gold/10 text-brand-gold'
                               }`}>
                                  {(task.expiresAt && task.status === 'pending' && Date.now() > new Date(task.expiresAt).getTime()) ? 'expired' : 
                                   task.status === 'pending' ? (task.seen ? 'seen' : 'not seen') : task.status}
                               </span>
                             </div>

                             {task.status === 'submitted' && (
                               <div className="flex gap-2">
                                 <button
                                   onClick={() => updateTaskStatus(task.id, 'approved')}
                                   className="text-[10px] font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                 >
                                   <CheckCircle size={12} /> Approve
                                 </button>
                                 <button
                                   onClick={() => updateTaskStatus(task.id, 'rejected')}
                                   className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                 >
                                   <XCircle size={12} /> Reject
                                 </button>
                               </div>
                             )}
                           </div>

                           {/* Proof Section */}
                           {task.proofPurged && (
                              <div className="mt-2 text-xs bg-slate-800/50 text-slate-400 p-2 rounded w-max">Proof permanently deleted (24h).</div>
                           )}

                           {task.status !== 'pending' && task.proof && (userProfile?.role === 'admin' || task.assignedById === userProfile?.uid) && (
                             <div className="mt-2 p-3 bg-brand-primary/50 rounded flex flex-col gap-2">
                               {task.proof.text && <p className="text-sm text-slate-300 whitespace-pre-wrap">{task.proof.text}</p>}
                               {task.proof.link && <a href={task.proof.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-accent hover:underline">{task.proof.link}</a>}
                               {task.proof.imageUrl && <img src={task.proof.imageUrl} alt="Proof" className="max-h-32 rounded object-cover border border-brand-border mt-1" />}
                             </div>
                           )}
                        </div>
                      ))}
                    </div>

                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
