import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart } from "lucide-react";

const ACTIVITIES = [
  { name: "Arjun from Mumbai", action: "ordered 5000 Instagram Followers", time: "2 min ago" },
  { name: "Sarah from New York", action: "ordered 10000 YouTube Views", time: "5 min ago" },
  { name: "Carlos from São Paulo", action: "ordered 2000 Telegram Members", time: "8 min ago" },
  { name: "Priya from Delhi", action: "ordered 1000 Instagram Likes", time: "12 min ago" },
  { name: "James from London", action: "ordered YouTube Subscribers", time: "15 min ago" },
  { name: "Fatima from Dubai", action: "ordered 50000 Reel Views", time: "18 min ago" },
  { name: "Chidi from Lagos", action: "ordered 500 Telegram Members", time: "22 min ago" },
  { name: "Emma from Berlin", action: "ordered 100K Instagram Views", time: "25 min ago" }
];

export function SocialProofTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const activity = ACTIVITIES[currentIdx];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-6 z-40 bg-brand-surface/95 backdrop-blur-md border border-brand-border rounded-2xl px-5 py-3.5 shadow-2xl max-w-sm hidden sm:flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={18} className="text-brand-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-text-main font-medium truncate">
            <span className="text-brand-accent">{activity.name}</span> {activity.action}
          </p>
          <p className="text-xs text-text-muted">{activity.time} • Sample activity</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-text-muted hover:text-text-main text-xs ml-2 flex-shrink-0"
          aria-label="Close"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
