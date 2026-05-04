import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function OrderSuccess() {
  const location = useLocation();
  const { width, height } = useWindowSize();
  const orderId = location.state?.orderId || "GRX-XXXXXXXX";

  return (
    <div className="min-h-screen flex flex-col bg-brand-primary text-text-main font-sans selection:bg-brand-accent selection:text-brand-primary">
      <Navbar />
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={400}
        colors={['#E8B84B', '#FFFFFF', '#D4A33B', '#111111']}
      />
      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-brand-surface border border-brand-border rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 text-brand-accent">
            <CheckCircle size={40} />
          </div>
          
          <h2 className="text-3xl font-bold font-heading mb-4 text-text-main relative z-10">Payment Successful</h2>
          
          <div className="bg-brand-primary border border-brand-border rounded-xl p-4 mb-6 relative z-10">
            <p className="text-sm text-text-muted mb-1">Order ID</p>
            <p className="font-mono font-bold tracking-wider text-brand-accent text-lg">{orderId}</p>
          </div>
          
          <p className="text-text-muted mb-8 relative z-10 leading-relaxed text-sm">
            Your order has been received and will be processed shortly. We've sent a confirmation to your email.
          </p>
          
          <Link 
            to="/" 
            className="block w-full bg-brand-accent text-brand-primary px-6 py-4 rounded-xl font-bold hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300 relative z-10"
          >
            Return to Home
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
