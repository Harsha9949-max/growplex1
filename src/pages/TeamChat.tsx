import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/SEO';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TeamChat() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // In case accessed from Admin panel without standard useAuth login (via adminAuth)
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    if (!userProfile) {
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
         setAdminUser(JSON.parse(authData));
      }
    }
  }, [userProfile]);
  
  const currentUserObj = userProfile || adminUser;

  useEffect(() => {
    // Standard basic query - might order by createdAt desc, then reverse array.
    const q = query(collection(db, "team_chat"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserObj) return;
    
    const msg = newMessage.trim();
    setNewMessage('');
    
    try {
      const senderName = currentUserObj.fullName || currentUserObj.name || currentUserObj.email?.split('@')[0] || "Unknown";
      const senderRole = currentUserObj.role || "admin";

      await addDoc(collection(db, "team_chat"), {
        text: msg,
        senderId: currentUserObj.uid || currentUserObj.id || currentUserObj.email,
        senderName,
        senderRole,
        createdAt: serverTimestamp()
      });

      // Fire-and-forget relay to backend Google Chat proxy
      fetch('/api/google-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg,
          senderName,
          senderRole
        })
      }).catch(err => console.error("Could not relay to Google Chat:", err));

      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };
  
  const isMe = (senderId: string) => {
    if (!currentUserObj) return false;
    return senderId === currentUserObj.uid || senderId === currentUserObj.id || senderId === currentUserObj.email;
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] flex flex-col bg-brand-surface border border-brand-border rounded-xl overflow-hidden animate-in fade-in duration-500 shadow-xl max-w-5xl mx-auto w-full">
      <SEO title="Team Group Chat" description="Communicate with the admin and team members" />
      
      {/* Header */}
      <div className="p-4 border-b border-brand-border bg-brand-primary/80 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-brand-accent/20 text-brand-accent rounded-lg">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg leading-tight">Team Chat</h2>
          <p className="text-xs text-slate-400">Admins & Team Members Room</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-primary/10" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center flex-col items-center h-full text-slate-500">
             <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin mb-4" />
             Loading chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-slate-500 text-sm">
             No messages yet. Say hello to the team!
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe(msg.senderId) ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 capitalize">{msg.senderName}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-border text-slate-500 capitalize">{msg.senderRole?.replace('_',' ')}</span>
                {msg.createdAt?.toDate && (
                  <span className="text-[10px] text-slate-500">{msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                )}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                 isMe(msg.senderId) 
                   ? 'bg-brand-accent text-brand-primary rounded-tr-sm' 
                   : 'bg-brand-primary border border-brand-border text-white rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-brand-border bg-brand-primary/80 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message to the team..."
            className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-accent/50 pr-12 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="absolute right-2 p-2 bg-brand-accent text-brand-primary rounded-lg disabled:opacity-50 hover:bg-brand-accent-hover transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
