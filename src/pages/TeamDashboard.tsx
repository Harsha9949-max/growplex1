import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, DollarSign, Activity, Settings, LogOut, ArrowLeft, Send, Tag, Users, Percent } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { SEO } from "../components/SEO";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-hot-toast";

export default function TeamDashboard() {
  const { userProfile, currentUser, logout } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals'>('overview');
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [referralOrdersCount, setReferralOrdersCount] = useState(0);
  const [recentPromoOrders, setRecentPromoOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!userProfile) return;

    let q;
    const isInfluencer = userProfile.role === 'influencer';
    if (isInfluencer) {
      const myCode = (userProfile.influencerName || '').toLowerCase().trim();
      q = query(collection(db, "orders"), where("influencerName", "==", myCode));
    } else {
      q = query(collection(db, "orders"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let sales = 0;
      let count = 0;
      const recent: any[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const isPaid = data.paymentStatus === "completed" || data.orderStatus === "completed" || data.paymentStatus === "paid";
        
        if (isPaid) {
          sales += (Number(data.price) || 0);
        }
        count++;
        recent.push({ id: docSnap.id, ...data });
      });

      // Sort recent matches by createdAt descending
      recent.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      setTotalSales(sales);
      setReferralOrdersCount(count);
      setRecentPromoOrders(recent.slice(0, 5));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sales network:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser) return;
    const loadWithdrawals = async () => {
      const q = query(collection(db, "withdrawals"), where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setWithdrawalHistory(data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    };
    loadWithdrawals();
  }, [currentUser]);

  // Calculate dynamic stats
  const isInfluencer = userProfile?.role === "influencer";
  const apiCosts = totalSales * 0.20;
  const netRevenue = totalSales - apiCosts;
  const userCommissionRate = (userProfile?.commissionPercentage || 10) / 100;
  const commissionEarned = isInfluencer 
    ? totalSales * userCommissionRate 
    : netRevenue * userCommissionRate;
  
  const withdrawals = withdrawalHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const availableBalance = commissionEarned - withdrawals;

  const handleRequestPayout = async () => {
    if (availableBalance < 500) {
      toast.error("Minimum payout is ₹500");
      return;
    }
    
    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: currentUser?.uid,
        userName: userProfile?.fullName || userProfile?.username,
        amount: availableBalance,
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Payout request submitted successfully!");
      // reload history locally or re-fetch
      setWithdrawalHistory(prev => [{id: Date.now().toString(), amount: availableBalance, status: "pending", createdAt: { toMillis: () => Date.now(), toDate: () => new Date() }}, ...prev]);
    } catch (error) {
      toast.error("Failed to request payout");
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <SEO title="Team Dashboard | Growplex" description="Growplex Team Member Dashboard" />
      
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-brand-primary/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/team/dashboard" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Growplex" className="w-8 h-8" />
              <span className="font-display font-black text-xl italic tracking-tight hidden sm:block text-white">GROW<span className="text-brand-accent">PLEX</span></span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-full border border-brand-accent/20 hidden sm:inline-block">Team Portal</span>
          </div>
          
          <div className="flex flex-1 justify-center px-4">
             <div className="flex bg-brand-surface rounded-xl border border-brand-border p-1 gap-1">
               <button 
                 onClick={() => setActiveTab('overview')}
                 className={`px-4 flex items-center justify-center py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 Overview
               </button>
               <button 
                 onClick={() => setActiveTab('withdrawals')}
                 className={`px-4 py-1.5 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${activeTab === 'withdrawals' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 Withdrawals
               </button>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white">{userProfile?.fullName || userProfile?.username}</p>
              <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest">{userProfile?.commissionPercentage || 10}% Commission Tier</p>
            </div>
            <button onClick={logout} className="p-2 text-text-muted hover:text-red-500 bg-brand-surface rounded-xl border border-brand-border transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-surface to-brand-primary border border-brand-border rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[80px]" />
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white italic tracking-tight mb-2 relative z-10">
            Welcome back, <span className="text-brand-accent">{userProfile?.fullName || userProfile?.username || "Partner"}</span>
          </h1>
          <p className="text-slate-400 relative z-10 font-medium">Here's your performance overview directly from the Growplex network.</p>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Grid */}
            {isInfluencer ? (
              /* Influencer Specific Stats Grid: ABSOLUTELY HIDE any Growplex SMM profit/revenue margins */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><Tag size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Your Promo Name</p>
                     <h3 className="text-xl font-black text-white tracking-wider uppercase font-mono">
                       {userProfile?.influencerName || "N/A"}
                     </h3>
                  </div>
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400"><Users size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Referral Sales Count</p>
                     <h3 className="text-2xl font-black text-white">
                       {loading ? "..." : `${referralOrdersCount}`}
                     </h3>
                  </div>
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-green-500/10 rounded-xl text-green-400"><DollarSign size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Referral Sales Gross</p>
                     <h3 className="text-2xl font-black text-white">
                       {loading ? "..." : `₹${totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                     </h3>
                  </div>
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400"><Wallet size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Commission Earned ({userProfile?.commissionPercentage || 10}%)</p>
                     <h3 className="text-2xl font-black text-brand-accent">
                       {loading ? "..." : `₹${commissionEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                     </h3>
                  </div>
                </div>

                {/* Promotional Guidelines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                     <h3 className="text-lg font-bold text-white mb-4">Influencer Program Guidelines</h3>
                     <div className="space-y-4 text-sm text-slate-300">
                        <div className="flex items-start gap-3">
                           <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                           <p>Direct your audience to purchase services on Growplex and instruct them to use your unique promo code <strong className="text-brand-accent font-mono">{(userProfile?.influencerName || '').toUpperCase()}</strong> in the Promo Code field during checkout.</p>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                           <p>You will earn a flat <strong className="text-white">{userProfile?.commissionPercentage || 10}% commission</strong> on the total service value of all successfully paid orders that are tagged with your promo name.</p>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                           <p>Commissions are generated in real-time, instantly visible on your dashboard overview, and you can request payouts directly to your banking coordinates on the Withdrawals tab (minimum ₹500 payout).</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                     <div>
                        <h3 className="text-lg font-bold text-white mb-2">Available Balance</h3>
                        <p className="text-xs text-slate-400 mb-4">Earnings accrued minus any completed withdrawals.</p>
                        <h2 className="text-4xl font-display font-black text-white italic tracking-tight text-teal-400 mb-2">
                           ₹{availableBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h2>
                     </div>
                     <div className="pt-4 border-t border-brand-border/30">
                        <button 
                          onClick={() => setActiveTab('withdrawals')}
                          className="w-full flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-primary font-bold px-4 py-3 rounded-xl transition-all duration-300"
                        >
                          <Send size={16} />
                          Go to Payouts Control
                        </button>
                     </div>
                  </div>
                </div>

                {/* Recent Referral Conversions Tracker */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                   <h3 className="text-lg font-bold text-white mb-4">Recent Referrals Feed</h3>
                   <div className="overflow-x-auto border border-brand-border/30 rounded-xl bg-brand-primary/20 bg-clip-padding">
                      {recentPromoOrders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-sm">
                           No promo code conversions recorded yet for code <strong className="text-brand-accent font-mono">{(userProfile?.influencerName || '').toUpperCase()}</strong>. Keep promoting to get started!
                        </div>
                      ) : (
                        <table className="w-full text-left font-sans text-sm">
                          <thead className="bg-brand-primary/50 text-text-muted border-b border-brand-border">
                            <tr>
                              <th className="px-6 py-4">Service</th>
                              <th className="px-6 py-4">Quantity</th>
                              <th className="px-6 py-4">Total Amount</th>
                              <th className="px-6 py-4">Purchased On</th>
                              <th className="px-6 py-4 text-center">Commission Earned</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/30 text-slate-300">
                            {recentPromoOrders.map(order => {
                              const orderPrice = Number(order.price) || 0;
                              const earnedComm = orderPrice * userCommissionRate;
                              return (
                                <tr key={order.id} className="hover:bg-white/[0.01]">
                                  <td className="px-6 py-4 font-medium text-white">{order.serviceName}</td>
                                  <td className="px-6 py-4 text-slate-400">{order.packageQuantity}</td>
                                  <td className="px-6 py-4 text-white">₹{order.price}</td>
                                  <td className="px-6 py-4 text-xs text-slate-400">
                                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                  </td>
                                  <td className="px-6 py-4 text-center text-emerald-400 font-bold font-mono">
                                    +₹{earnedComm.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                   </div>
                </div>
              </>
            ) : (
              /* Classic Dashboard for standard Team Members */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Activity size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Network Sales (Gross)</p>
                     <h3 className="text-2xl font-black text-white">
                       {loading ? "..." : `₹${totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                     </h3>
                  </div>
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-brand-accent/10 rounded-xl text-brand-accent"><DollarSign size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Company Net Revenue</p>
                     <h3 className="text-2xl font-black text-white">
                       {loading ? "..." : `₹${netRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                     </h3>
                  </div>
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500"><Wallet size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Your Earnings ({userProfile?.commissionPercentage || 10}%)</p>
                     <h3 className="text-2xl font-black text-green-400">
                       {loading ? "..." : `₹${commissionEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                     </h3>
                  </div>
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500"><Activity size={20} /></div>
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Available to Withdraw</p>
                     <h3 className="text-2xl font-black text-white">
                       {loading ? "..." : `₹${availableBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                     </h3>
                  </div>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                   <h3 className="text-lg font-bold text-white mb-6">Ledger Sync Configuration</h3>
                   <div className="flex items-center justify-center p-12 lg:py-20 border border-brand-border/50 bg-brand-primary/50 rounded-xl border-dashed">
                      <div className="text-center">
                         <Activity className="mx-auto text-brand-accent/50 mb-3" size={32} />
                         <p className="text-white font-bold mb-1">Live Sync Active</p>
                         <p className="text-slate-400 text-sm max-w-md mx-auto">Your metrics are calculated instantly based on actual company revenue and API costs using the agreed commission structure ({userProfile?.commissionPercentage || 10}%).</p>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col">
                   <h3 className="text-lg font-bold text-white mb-6">Withdrawal History</h3>
                   <div className="flex-1 overflow-auto max-h-[400px] border border-brand-border/50 rounded-xl bg-brand-primary/50">
                      {withdrawalHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-12 text-center text-slate-500">
                          <Wallet className="mb-3 opacity-50" size={32}/>
                          <p>No withdrawals requested yet.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="bg-brand-primary sticky top-0 z-10 border-b border-brand-border">
                            <tr>
                              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/50">
                            {withdrawalHistory.map(w => (
                              <tr key={w.id} className="hover:bg-white/[0.02]">
                                <td className="p-4 text-sm font-medium text-slate-300">
                                  {w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </td>
                                <td className="p-4 text-sm font-bold text-white">₹{w.amount?.toLocaleString()}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                    w.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                    w.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                    'bg-brand-accent/10 text-brand-accent'
                                  }`}>
                                    {w.status || 'pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                   </div>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-sm">
                   <h3 className="text-lg font-bold text-white mb-6">New Request</h3>
                   <div className="bg-brand-primary/80 border border-brand-border rounded-xl p-5 space-y-4 mb-4">
                     <div className="flex justify-between items-center">
                       <span className="text-slate-400 text-sm font-medium">Available Balance</span>
                       <span className="text-white font-black text-lg">
                         {loading ? "..." : `₹${availableBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                       </span>
                     </div>
                     <div className="flex justify-between items-center pb-2 border-b border-brand-border/50">
                       <span className="text-slate-400 text-sm font-medium">Minimum Payout</span>
                       <span className="text-white font-bold text-sm">₹500</span>
                     </div>
                     <div className="pt-2 text-xs text-slate-500 leading-relaxed font-medium">
                       Your funds will be sent to the preferred payout method configured by the administrator for you.
                     </div>
                   </div>
                   <button 
                     onClick={handleRequestPayout}
                     disabled={availableBalance < 500} 
                     className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-gold text-brand-primary py-3.5 rounded-xl font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
                   >
                     {availableBalance < 500 ? 'Insufficient Balance' : 'Request Payout'}
                     {availableBalance >= 500 && <Send size={16} strokeWidth={3} />}
                   </button>
                   <p className="text-[10px] uppercase font-bold text-center text-slate-500 mt-4 tracking-widest">
                     Processed within 24-48 hours
                   </p>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
