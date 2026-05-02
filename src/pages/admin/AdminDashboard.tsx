import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Database, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, UserProfile } from '../../types';
import { formatINR, OperationType, cn, handleFirestoreError } from '../../lib/utils';
import { getProviderBalance } from '../../lib/growwsmm';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    providerBalance: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        
        const totalUsers = usersSnap.size;
        const totalOrders = ordersSnap.size;
        
        let totalRevenue = 0;
        ordersSnap.forEach(doc => {
          const data = doc.data() as Order;
          if (data.status !== 'cancelled') {
            totalRevenue += data.chargeINR;
          }
        });

        const balanceRes = await getProviderBalance();
        const providerBalance = parseFloat(balanceRes.balance) || 0;

        setStats({ totalRevenue, totalOrders, totalUsers, providerBalance });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Real-time listener for recent orders
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      const balanceRes = await getProviderBalance();
      setStats(prev => ({ ...prev, providerBalance: parseFloat(balanceRes.balance) || 0 }));
    } catch (error) {
      console.error("Error refreshing provider balance:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-500"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn("p-3 rounded-xl border border-white/5", color)}>
          <Icon size={24} />
        </div>
        {subValue && (
          <div className="flex items-center gap-1 text-brand-teal text-[10px] font-black uppercase tracking-widest italic">
            <ArrowUpRight size={14} />
            {subValue}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.2em] italic">{label}</p>
        <h3 className="text-2xl font-black text-white mt-1 tracking-tighter italic uppercase">{value}</h3>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic uppercase">Admin Control Center</h2>
          <p className="text-sm text-slate-600 font-black uppercase tracking-widest mt-1 italic">Intelligence & Systems Health Monitoring.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/admin/services')}
            className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-[#0A0A0A] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest italic transition-all shadow-xl shadow-brand-gold/20 w-full sm:w-auto"
          >
            <Database size={18} />
            Sync Services
          </button>
          <button 
            onClick={handleRefreshBalance}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest italic transition-all border border-white/10 w-full sm:w-auto"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Re-Audit
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Gross Revenue" 
          value={formatINR(stats.totalRevenue)} 
          subValue="+12%"
          color="bg-brand-teal/10 text-brand-teal" 
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Total Pipeline" 
          value={stats.totalOrders} 
          subValue="+5%"
          color="bg-brand-gold/10 text-brand-gold" 
        />
        <StatCard 
          icon={Users} 
          label="Global Nodes" 
          value={stats.totalUsers} 
          subValue="+8%"
          color="bg-brand-gold text-black border-none" 
        />
        <StatCard 
          icon={Database} 
          label="SMM Liquidity" 
          value={`$${stats.providerBalance.toFixed(2)}`} 
          color="bg-amber-600/10 text-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-black/50">
            <h3 className="text-sm font-black text-white italic uppercase tracking-widest">Global Service Stream</h3>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-slate-600 text-[9px] uppercase font-black tracking-[0.2em] italic">
                  <th className="px-6 py-4">Node ID</th>
                  <th className="px-6 py-4">Service Protocol</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Asset Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-brand-gold italic">#{order.growwOrderId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-white max-w-[200px] truncate italic uppercase">{order.serviceName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest italic",
                          order.status === 'completed' ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/20" :
                          order.status === 'pending' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          order.status === 'processing' ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-brand-teal italic">{formatINR(order.chargeINR)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-white/5">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">#{order.growwOrderId}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      order.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                      order.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                      order.status === 'processing' ? "bg-indigo-500/10 text-indigo-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white line-clamp-2">{order.serviceName}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">Charge</span>
                    <span className="text-sm font-bold text-white">{formatINR(order.chargeINR)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-slate-600 font-black uppercase italic tracking-widest text-xs">
                Static Stream Detected.
              </div>
            )}
          </div>
        </div>

        {/* System Health / Alerts */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <Database size={60} />
            </div>
            <h3 className="text-sm font-black text-white mb-6 uppercase italic tracking-[0.2em] relative z-10">System Integrity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 transition-all hover:bg-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-white transition-colors">GrowwSMM Nexus</span>
                </div>
                <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest italic">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 transition-all hover:bg-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-white transition-colors">Financial Hub</span>
                </div>
                <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest italic">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 transition-all hover:bg-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-white transition-colors">Neural Support</span>
                </div>
                <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest italic">Optimizing</span>
              </div>
            </div>
          </div>

          {stats.providerBalance < 20 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex gap-4 items-start shadow-xl italic relative overflow-hidden">
               <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
              <AlertCircle className="text-red-400 shrink-0 relative z-10" size={24} />
              <div className="space-y-1 relative z-10">
                <h4 className="text-[11px] font-black text-red-400 uppercase tracking-widest">Critical Liquidity Warning</h4>
                <p className="text-[11px] text-red-200/50 leading-relaxed font-bold">
                  Nexus Liquidity is below threshold ($20.00). System failure imminent without immediate asset infusion.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
