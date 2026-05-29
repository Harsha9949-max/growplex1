import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function TeamTaskAssigner() {
  const { userProfile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    selectedUsers: [] as string[],
    expiresAt: ''
  });

  // ... tasks assigned by user
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const fetchTeamMembers = async () => {
      const q = query(collection(db, "users"), where("role", "in", ["team_member", "influencer"]));
      const snapshot = await getDocs(q);
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);
    };
    fetchTeamMembers();

    // Fetch tasks assigned by this user
    import('firebase/firestore').then(({ onSnapshot }) => {
      const qTasks = query(collection(db, "tasks"), where("assignedById", "==", userProfile.uid));
      const unsubscribe = onSnapshot(qTasks, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        // Auto-purge proof if > 24 hours
        import('firebase/firestore').then(({ updateDoc, doc }) => {
          tasksData.forEach(task => {
            if (task.proofSubmittedAt) {
              const submittedTime = task.proofSubmittedAt.toMillis ? task.proofSubmittedAt.toMillis() : Date.now();
              const hrsPassed = (Date.now() - submittedTime) / (1000 * 60 * 60);
              if (hrsPassed > 24 && (task.proof?.text || task.proof?.link || task.proof?.imageUrl)) {
                 updateDoc(doc(db, "tasks", task.id), {
                   proof: null, // Purge proof
                   proofPurged: true
                 }).catch(console.error);
              }
            }
          });
        });

        tasksData.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });
        setAssignedTasks(tasksData);
      });
      return unsubscribe;
    });

  }, [userProfile?.uid]);

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
        expirationDate.setHours(23, 59, 59, 999);
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
          assignedByName: userProfile?.fullName || userProfile?.name || "Team Member",
          assignedByRole: userProfile?.role || 'team_member',
          status: "pending",
          seen: false, // mark unseen initially
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

  if (!userProfile?.canAssignTasks) {
    return null;
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-6 mb-8 max-w-2xl">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Plus size={18} className="text-brand-accent" /> Assign Task to Others
      </h2>
      <form onSubmit={handleCreateTask} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 cursor-pointer">Task Title</label>
          <input
            type="text"
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
            placeholder="e.g. Test out the new module"
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
                  <span className="text-sm text-slate-300 flex-1">{member.fullName || member.name || member.email}</span>
                  <span className="text-xs text-slate-500 capitalize">{member.role?.replace('_', ' ')}</span>
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
          {isCreating ? 'Assigning...' : 'Assign Tasks'}
        </button>
      </form>
      
      <div className="mt-12">
        <h3 className="text-lg font-bold text-white mb-4">Tasks Assigned By You</h3>
        <div className="space-y-4">
           {assignedTasks.length === 0 ? (
             <p className="text-slate-400 text-sm">You haven't assigned any tasks yet.</p>
           ) : (
             Object.values(assignedTasks.reduce((acc: any, task: any) => {
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
                 <div key={primary.batchId || primary.id} className="bg-brand-primary p-4 rounded-xl border border-brand-border">
                   <div className="flex justify-between items-start gap-4 mb-3">
                     <div>
                       <h4 className="font-bold text-white text-lg">{primary.title}</h4>
                       <p className="text-xs text-slate-400 mt-1">Assigned to {total} member{total > 1 ? 's' : ''}</p>
                     </div>
                     <span className={`shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        isExpired ? 'bg-slate-500/10 text-slate-400' :
                        completedCount === total ? 'bg-green-500/10 text-green-400' :
                        'bg-brand-gold/10 text-brand-gold'
                     }`}>
                       {isExpired ? 'expired' : completedCount === total ? 'all completed' : 'in progress'}
                     </span>
                   </div>

                   <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 bg-brand-surface p-2 rounded">
                     <span>👁️ {seenCount}/{total} Seen</span>
                     <span>✅ {completedCount}/{total} Done</span>
                     <button 
                       onClick={async () => {
                         if (!window.confirm("Delete this assigned task stream?")) return;
                         try {
                           const { deleteDoc, doc } = await import('firebase/firestore');
                           await Promise.all(group.map((t: any) => deleteDoc(doc(db, "tasks", t.id))));
                           import('react-hot-toast').then(m => m.toast.success("Task deleted"));
                         } catch (e) {
                           import('react-hot-toast').then(m => m.toast.error("Failed to delete"));
                         }
                       }}
                       className="ml-auto text-red-500 hover:text-red-400 hover:underline flex items-center gap-1"
                     >
                       <Trash2 size={14} /> Delete Task
                     </button>
                   </div>

                   <div className="space-y-3">
                     {group.map((task: any) => (
                       <div key={task.id} className="pl-3 border-l-2 border-brand-border/50">
                         <div className="flex items-center justify-between mb-1">
                           <span className="text-sm font-medium text-slate-300">{task.assignedToName}</span>
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              (task.expiresAt && task.status === 'pending' && Date.now() > new Date(task.expiresAt).getTime()) ? 'text-slate-500' :
                              task.status === 'approved' ? 'text-green-500' :
                              task.status === 'rejected' ? 'text-red-500' :
                              task.status === 'submitted' ? 'text-blue-500' :
                              task.seen ? 'text-brand-accent' :
                              'text-brand-gold'
                           }`}>
                              {(task.expiresAt && task.status === 'pending' && Date.now() > new Date(task.expiresAt).getTime()) ? 'expired' : 
                               task.status === 'pending' ? (task.seen ? 'seen' : 'not seen') : task.status}
                           </span>
                         </div>
                         {task.proofPurged && (
                           <div className="text-xs text-slate-500 mt-1">Proof deleted after 24 hours.</div>
                         )}
                         {task.proof && (
                           <div className="mt-2 p-3 bg-brand-surface rounded-lg border border-brand-border/50">
                             {task.proof.text && <p className="text-sm text-white mb-2">{task.proof.text}</p>}
                             {task.proof.link && <a href={task.proof.link} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline block mb-2">{task.proof.link}</a>}
                             {task.proof.imageUrl && <img src={task.proof.imageUrl} alt="Proof" className="max-h-32 rounded object-cover border border-brand-border" />}
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
  );
}
