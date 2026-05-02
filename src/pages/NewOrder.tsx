import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Link as LinkIcon, 
  Layers, 
  Calculator, 
  Wallet, 
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Service, Order, Transaction } from '../types';
import { formatINR, OperationType, handleFirestoreError, cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { placeGrowwOrder } from '../lib/growwsmm';
import { analyzeLink } from '../lib/gemini';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const NewOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState(location.state?.serviceId || '');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('isActive', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });

    return () => unsubscribe();
  }, []);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const charge = selectedService ? (quantity / 1000) * selectedService.displayRate : 0;
  const isInsufficientFunds = (userProfile?.walletBalance || 0) < charge;

  const handleAnalyzeLink = async () => {
    if (!link || !selectedService) return;
    setAnalyzing(true);
    try {
      const result = await analyzeLink(link, selectedService.name);
      setAnalysisResult(result);
    } catch (error) {
      toast.error('Failed to analyze link');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !userProfile) return;

    if (quantity < selectedService.minQuantity || quantity > selectedService.maxQuantity) {
      return toast.error(`Quantity must be between ${selectedService.minQuantity} and ${selectedService.maxQuantity}`);
    }

    if (isInsufficientFunds) {
      return toast.error('Insufficient wallet balance. Please add funds.');
    }

    setLoading(true);
    try {
      // 1. Place order on GrowwSMM
      const growwRes = await placeGrowwOrder(selectedService.growwServiceId, link, quantity);
      
      if (growwRes.error) {
        throw new Error(growwRes.error);
      }

      const growwOrderId = growwRes.order;

      // 2. Create order in Firestore
      const orderId = doc(collection(db, 'orders')).id;
      const order: Order = {
        id: orderId,
        userId: userProfile.uid,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        growwOrderId,
        link,
        quantity,
        chargeINR: charge,
        chargeUSD: (quantity / 1000) * selectedService.providerRate,
        status: 'pending',
        startCount: 0,
        remains: quantity,
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, 'orders', orderId), order);

      // 3. Deduct from wallet
      await updateDoc(doc(db, 'users', userProfile.uid), {
        walletBalance: increment(-charge)
      });

      // 4. Create transaction doc
      const txId = doc(collection(db, 'transactions')).id;
      const transaction: Transaction = {
        id: txId,
        userId: userProfile.uid,
        amount: charge,
        type: 'order_debit',
        status: 'completed',
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, 'transactions', txId), transaction);

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Place New Order</h2>
        <p className="text-sm md:text-base text-slate-500 mt-2 font-medium">Get high-quality engagement for your social media accounts.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Order Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <form onSubmit={handleSubmit} className="glass-card bg-[#0A0A0A] p-5 md:p-8 space-y-6 md:space-y-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] transform group-hover:scale-110 transition-transform duration-500 text-brand-gold">
              <PlusCircle size={120} />
            </div>
            <div className="relative z-10 space-y-5 md:space-y-6">
              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 md:mb-3 flex items-center gap-2 italic">
                  <Layers size={14} className="text-brand-gold" />
                  Select Service
                </label>
                <div className="relative group/select">
                  <select
                    required
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base text-white focus:outline-none focus:border-brand-gold transition-all duration-300 appearance-none cursor-pointer hover:bg-white/[0.08] italic font-medium"
                  >
                    <option value="" disabled className="bg-[#0A0A0A]">Choose a service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#0A0A0A]">{s.name} - {formatINR(s.displayRate)}/1k</option>
                    ))}
                  </select>
                  <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/select:text-brand-gold transition-colors">
                    <PlusCircle size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 md:mb-3 flex items-center gap-2 italic">
                  <LinkIcon size={14} className="text-brand-gold" />
                  Target Link
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base text-white focus:outline-none focus:border-brand-gold transition-all duration-300 hover:bg-white/[0.08] italic font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeLink}
                    disabled={!link || !selectedService || analyzing}
                    className="px-4 md:px-6 py-3 md:py-4 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 rounded-xl md:rounded-2xl text-brand-gold font-black transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group text-sm md:text-base italic uppercase tracking-tight"
                    title="AI Link Analysis"
                  >
                    {analyzing ? (
                      <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles size={18} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                    )}
                    <span className="sm:hidden lg:inline">AI Analyze</span>
                    <span className="hidden sm:inline lg:hidden">Analyze</span>
                  </button>
                </div>
                <AnimatePresence>
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl md:rounded-2xl text-xs md:text-sm text-slate-300 flex gap-3 items-start backdrop-blur-sm italic"
                    >
                      <Info size={16} className="shrink-0 mt-0.5 text-brand-gold" />
                      <p className="leading-relaxed">{analysisResult}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 md:mb-3 flex items-center gap-2 italic">
                    <PlusCircle size={14} className="text-brand-gold" />
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={selectedService?.minQuantity || 1}
                    max={selectedService?.maxQuantity || 1000000}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder={`Min: ${selectedService?.minQuantity || 0}`}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base text-white focus:outline-none focus:border-brand-gold transition-all duration-300 hover:bg-white/[0.08] font-bold italic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 md:mb-3 flex items-center gap-2 italic">
                    <Calculator size={14} className="text-brand-gold" />
                    Total Charge
                  </label>
                  <div className="w-full bg-brand-teal/5 border border-brand-teal/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-5 text-brand-teal font-black text-base md:text-lg flex items-center h-[46px] md:h-[58px] italic">
                    {formatINR(charge)}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedService || isInsufficientFunds}
              className="w-full bg-brand-gold text-[#0A0A0A] font-black py-4 md:py-5 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-xl shadow-brand-gold/10 hover:-translate-y-1 active:scale-[0.98] disabled:active:scale-100 text-sm md:text-base italic uppercase tracking-tight"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={20} className="md:w-5 md:h-5" />
                  Place Order
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Order Summary / Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-card bg-[#0A0A0A] p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5 italic">
              <div className="p-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20">
                <Wallet size={18} className="text-brand-gold" />
              </div>
              Wallet Status
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">Balance</span>
                <span className="text-sm text-white font-black italic">{formatINR(userProfile?.walletBalance || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest italic">Order Cost</span>
                <span className="text-sm text-brand-gold font-black italic">-{formatINR(charge)}</span>
              </div>
              <div className="pt-5 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm font-black text-white italic uppercase tracking-widest">New Balance</span>
                <span className={cn(
                  "text-xl font-black tracking-tight italic",
                  isInsufficientFunds ? "text-red-400" : "text-brand-teal"
                )}>
                  {formatINR((userProfile?.walletBalance || 0) - charge)}
                </span>
              </div>
              {isInsufficientFunds && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3 items-start italic"
                >
                  <AlertTriangle className="text-red-500 shrink-0" size={18} />
                  <p className="text-xs text-red-300 leading-relaxed font-bold">
                    Insufficient funds. Please top up your wallet to place this order.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {selectedService && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-[#0A0A0A] p-6 border border-white/5"
            >
              <h3 className="text-lg font-bold text-white mb-6 italic uppercase tracking-widest">Service Profile</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em] italic">Category</span>
                  <span className="text-xs text-white font-black italic">{selectedService.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em] italic">Capacity</span>
                  <span className="text-xs text-white font-black italic">{selectedService.minQuantity.toLocaleString()} - {selectedService.maxQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em] italic">Support</span>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-1 rounded bg-white/5 border border-white/10 uppercase tracking-widest italic",
                    selectedService.refill ? "text-brand-teal" : "text-red-400"
                  )}>
                    {selectedService.refill ? 'Refill Policy' : 'No Refill'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewOrder;
