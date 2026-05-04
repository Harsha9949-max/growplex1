import { Bot, MessageSquare, Send, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { getChatResponse } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am WorkPlex AI Support. How can I assist with your growth strategy today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, 
        { role: 'user', text: input.trim() },
        { role: 'model', text: "AI Support is temporarily unavailable. Please contact us via email." }
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getChatResponse(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-48px)] sm:w-[400px] h-[550px] max-h-[calc(100vh-140px)] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(212,175,55,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-black border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 shadow-lg shadow-brand-gold/5">
                  <Bot size={22} className="text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white italic uppercase tracking-wider">WorkPlex AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]"></span>
                    <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest italic">Neural Network Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-2 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border",
                    msg.role === 'user' ? "bg-brand-gold border-brand-gold/20" : "bg-white/5 border-white/10"
                  )}>
                    {msg.role === 'user' ? <User size={16} className="text-black" /> : <Bot size={16} className="text-brand-gold" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-[13px] leading-relaxed italic font-medium",
                    msg.role === 'user' 
                      ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-tr-none" 
                      : "bg-white/5 text-slate-300 border border-white/5 rounded-tl-none shadow-xl"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bot size={16} className="text-brand-gold" />
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 border-t border-white/5 bg-black/50">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-brand-gold transition-all italic font-medium"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-brand-gold text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-brand-gold/10"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[2rem] bg-brand-gold text-black shadow-2xl shadow-brand-gold/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X size={28} className="relative z-10" /> : <MessageSquare size={28} className="relative z-10" />}
      </button>
    </div>
  );
};

export default AIChat;
