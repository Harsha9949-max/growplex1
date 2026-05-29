import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../components/SEO';
import { TeamLayout } from "../components/TeamLayout";
import { Megaphone, Clock, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function TeamAnnouncements() {
  const { userProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Auto-purge announcements > 24 hours
      data.forEach(ann => {
        if (ann.createdAt) {
          const time = ann.createdAt.toMillis ? ann.createdAt.toMillis() : Date.now();
          const hrsPassed = (Date.now() - time) / (1000 * 60 * 60);
          if (hrsPassed > 24) {
            deleteDoc(doc(db, "announcements", ann.id)).catch(console.error);
          }
        }
      });
      
      // Filter out >24h locally to avoid flashing
      const filtered = data.filter(ann => {
        if (!ann.createdAt) return true;
        const time = ann.createdAt.toMillis ? ann.createdAt.toMillis() : Date.now();
        return (Date.now() - time) / (1000 * 60 * 60) <= 24;
      });

      setAnnouncements(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendTelegramAnnouncement = async (title: string, content: string) => {
    try {
      const { getDoc } = await import('firebase/firestore');
      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      const botToken = settings?.telegramBotToken;
      const chatId = settings?.telegramChatId;

      if (!botToken || !chatId) return;

      const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);
      
      const message = [
        `📢 *New Announcement from ${userProfile?.fullName || 'Team'}*`,
        ``,
        `🔔 *${title}*`,
        ``,
        `${content}`
      ].filter(Boolean).join('\n');

      for (const id of chatIds) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: id, text: message, parse_mode: 'Markdown' }),
        }).catch(e => console.error("Telegram send warning:", e));
      }
    } catch (error) {
      console.error("Failed to send telegram notification:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill title and content");
      return;
    }
    
    setIsCreating(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        authorId: userProfile?.uid,
        authorName: userProfile?.fullName || userProfile?.name || 'Authorized Member',
        createdAt: serverTimestamp(),
      });
      
      sendTelegramAnnouncement(newAnnouncement.title, newAnnouncement.content);

      toast.success("Announcement published successfully");
      setNewAnnouncement({ title: '', content: '' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish announcement");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, authorId?: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    if (authorId && authorId !== userProfile?.uid && userProfile?.role !== 'admin') {
       toast.error("You can only delete your own announcements");
       return;
    }
    try {
      await deleteDoc(doc(db, "announcements", id));
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <TeamLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <SEO title="Announcements | Team" description="View team announcements" />
        
        <div className="mb-8">
          <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
              <Megaphone className="text-brand-accent" size={20} />
            </div>
            Announcements & News
          </h1>
          <p className="text-slate-400 text-sm mt-2">Latest updates and news. Announcements expire after 24 hours.</p>
        </div>

        {userProfile?.canAssignTasks && (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-brand-accent" /> New Announcement
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="Announcement Title"
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>
              <div>
                <textarea
                  value={newAnnouncement.content}
                  onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  placeholder="Details of the announcement..."
                  rows={3}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="flex items-center justify-center gap-2 bg-brand-accent text-brand-primary px-6 py-2 rounded-lg font-bold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 text-sm"
              >
                {isCreating ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
             <div className="p-12 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading announcements...</p>
             </div>
          ) : announcements.length === 0 ? (
            <div className="bg-brand-surface border border-brand-border border-dashed rounded-xl p-12 text-center">
               <Megaphone size={40} className="mx-auto text-slate-600 mb-4" />
               <p className="text-slate-400 font-medium">No active announcements within the last 24 hours.</p>
            </div>
          ) : (
            announcements.map(announcement => (
              <div key={announcement.id} className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent/50 group-hover:bg-brand-accent transition-colors" />
                
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-white text-xl">{announcement.title}</h3>
                  {userProfile?.canAssignTasks && announcement.authorId === userProfile?.uid && (
                    <button onClick={() => handleDelete(announcement.id, announcement.authorId)} className="text-slate-500 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-brand-primary px-2.5 py-1 rounded">
                    <Clock size={14} /> 
                    {announcement.createdAt?.toDate ? announcement.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                  {announcement.authorName && (
                    <span className="text-xs text-brand-accent font-medium">By {announcement.authorName}</span>
                  )}
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TeamLayout>
  );
}
