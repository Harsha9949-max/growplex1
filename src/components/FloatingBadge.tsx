import { useState } from "react";
import { Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FloatingBadge() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-brand-accent to-[#d4a03a] text-brand-primary px-5 py-3 rounded-full shadow-2xl shadow-brand-accent/20 flex items-center gap-2.5 font-bold text-sm"
        >
          <Lock size={16} />
          <span>No login. No password. 100% safe.</span>
          <button
            onClick={() => setVisible(false)}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close badge"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
