import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { XCircle, RefreshCcw } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function OrderFailed() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-brand-surface border border-brand-border rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 text-red-500">
            <XCircle size={40} />
          </div>
          
          <h2 className="text-3xl font-bold font-heading mb-4 text-text-main relative z-10">Payment Failed</h2>
          
          <p className="text-text-muted mb-8 relative z-10 leading-relaxed text-sm">
            We couldn't process your payment. Please try again. Your account has not been charged.
          </p>
          
          <div className="flex flex-col gap-4 relative z-10">
            <Link 
              to="/services" 
              className="block w-full bg-brand-accent text-brand-primary px-6 py-4 rounded-xl font-bold hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} /> Retry Payment
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-brand-surface border border-brand-border text-text-muted hover:text-text-main px-6 py-4 rounded-xl font-medium transition-all duration-300"
            >
              Return to Home
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
