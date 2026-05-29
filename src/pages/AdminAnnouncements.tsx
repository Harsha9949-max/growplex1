import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../components/SEO';
import { AdminLayout } from "../components/AdminLayout";
import { Megaphone, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

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
      const { getDoc, doc } = await import('firebase/firestore');
      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      const botToken = settings?.telegramBotToken;
      const chatId = settings?.telegramChatId;

      if (!botToken || !chatId) return;

      const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);
      
      const message = [
        `📢 *New Announcement*`,
        ``,
        `🔔 *${title}*`,
        ``,
        `${content}`
      ].filter(Boolean).join('\n');

      for (const id of chatIds) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: id,
            text: message,
            parse_mode: 'Markdown',
          }),
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
        createdAt: serverTimestamp(),
      });
      
      // Sending Telegram notification in the background
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <SEO title="Announcements | Admin" description="Manage team announcements" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
              <Megaphone className="text-brand-accent" /> Announcements
            </h1>
            <p className="text-slate-400 text-sm mt-1">Publish announcements to Team Members and Influencers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-1 bg-brand-surface border border-brand-border rounded-xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-brand-accent" /> New Announcement
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 cursor-pointer">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="e.g. New Policy Update..."
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 cursor-pointer">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  placeholder="Details of the announcement..."
                  rows={5}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-primary py-3 rounded-lg font-bold hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Publishing...' : 'Publish Announcement'}
                <Megaphone size={16} />
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-brand-accent" /> Published Announcements
            </h2>
            
            {loading ? (
               <div className="p-12 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Loading...</p>
               </div>
            ) : announcements.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border border-dashed rounded-xl p-12 text-center">
                 <Megaphone size={40} className="mx-auto text-slate-600 mb-4" />
                 <p className="text-slate-400 font-medium">No announcements published yet.</p>
              </div>
            ) : (
              announcements.map(announcement => (
                <div key={announcement.id} className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm group">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-lg">{announcement.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock size={14} /> 
                          {announcement.createdAt?.toDate ? announcement.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-brand-border/50">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
