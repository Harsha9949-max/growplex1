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
    selectedUsers: [] as string[]
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
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    try {
      const promises = newTask.selectedUsers.map(userId => {
        const user = teamMembers.find(m => m.uid === userId || m.id === userId);
        return addDoc(collection(db, "tasks"), {
          title: newTask.title,
          description: newTask.description,
          assignedToId: userId,
          assignedToName: user?.fullName || user?.username || "Unknown",
          assignedById: userProfile?.uid,
          assignedByName: userProfile?.fullName || "Admin",
          status: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      await Promise.all(promises);
      toast.success("Tasks assigned successfully");
      setNewTask({ title: '', description: '', selectedUsers: [] });
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
              tasks.map(task => (
                <div key={task.id} className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-lg">{task.title}</h3>
                      {task.description && <p className="text-sm text-slate-400 mt-1">{task.description}</p>}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Users size={14} /> Assigned to: <span className="text-white">{task.assignedToName}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock size={14} /> 
                          {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        task.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        task.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        task.status === 'submitted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                      }`}>
                        {task.status}
                      </span>
                      <button 
                        onClick={() => setNewTask({ title: task.title, description: task.description || '', selectedUsers: [] })}
                        className="text-[10px] text-brand-accent hover:underline uppercase tracking-widest mt-1 opacity-70 hover:opacity-100"
                      >
                        Clone Task
                      </button>
                    </div>
                  </div>

                  {/* Proof Section */}
                  {task.status !== 'pending' && task.proof && (
                    <div className="mt-4 pt-4 border-t border-brand-border/50 bg-brand-primary/30 -mx-5 px-5 pb-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Submitted Proof</h4>
                      
                      {task.proof.text && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-1">Response:</p>
                          <p className="text-sm text-slate-300 bg-brand-primary p-3 rounded-lg border border-brand-border whitespace-pre-wrap">{task.proof.text}</p>
                        </div>
                      )}
                      
                      {task.proof.link && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-1">Link:</p>
                          <a href={task.proof.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-accent hover:underline break-all">
                            {task.proof.link}
                          </a>
                        </div>
                      )}
                      
                      {task.proof.imageUrl && (
                        <div className="mb-4">
                          <p className="text-xs text-slate-500 mb-1">Image Proof:</p>
                          <div className="bg-brand-primary p-2 rounded-lg border border-brand-border max-w-xs">
                            <img src={task.proof.imageUrl} alt="Proof" className="w-full h-auto rounded" />
                          </div>
                        </div>
                      )}

                      {task.status === 'submitted' && (
                        <div className="flex items-center gap-2 mt-4">
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'approved')}
                            className="flex items-center gap-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'rejected')}
                            className="flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
