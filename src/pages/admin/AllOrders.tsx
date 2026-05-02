import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  User as UserIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDocs, 
  where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatINR, OperationType } from '../../lib/utils';
import { handleFirestoreError } from '../../lib/utils';
import { getOrderStatus, getMultipleOrderStatuses } from '../../lib/growwsmm';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AllOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSyncAll = async () => {
    const pendingOrders = orders.filter(o => ['pending', 'processing'].includes(o.status));
    if (pendingOrders.length === 0) return toast('No pending orders to sync');

    setSyncing(true);
    try {
      const orderIds = pendingOrders.map(o => o.growwOrderId);
      const statusRes = await getMultipleOrderStatuses(orderIds);
      
      let updatedCount = 0;
      for (const order of pendingOrders) {
        const statusData = statusRes[order.growwOrderId];
        if (statusData && statusData.status) {
          const newStatus = statusData.status.toLowerCase();
          if (newStatus !== order.status) {
            await updateDoc(doc(db, 'orders', order.id), {
              status: newStatus,
              startCount: parseInt(statusData.start_count) || 0,
              remains: parseInt(statusData.remains) || 0
            });
            updatedCount++;
          }
        }
      }
      toast.success(`Synced ${pendingOrders.length} orders. Updated ${updatedCount} statuses.`);
    } catch (error) {
      toast.error('Failed to sync order statuses');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus.toLowerCase()
      });
      toast.success(`Order #${order.growwOrderId} status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.serviceName.toLowerCase().includes(search.toLowerCase()) || 
                          o.link.toLowerCase().includes(search.toLowerCase()) ||
                          o.growwOrderId.toString().includes(search) ||
                          o.userId.includes(search);
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statuses = ['All', 'Pending', 'Processing', 'Completed', 'Partial', 'Cancelled'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit"><CheckCircle2 size={10} /> {status}</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit"><Clock size={10} /> {status}</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 w-fit"><Loader2 size={10} className="animate-spin" /> {status}</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit"><AlertCircle size={10} /> {status}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">All Platform Orders</h2>
          <p className="text-slate-400 mt-1">Manage every order placed on GROWPLEX.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, users, IDs..."
              className="w-full bg-[#1A193D] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Sync Statuses
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
              statusFilter === s 
                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20" 
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border-white/10"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-[#1A193D] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500">
          <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
          <p>Loading platform orders...</p>
        </div>
      ) : (
        <div className="bg-[#1A193D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Order Details</th>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Link</th>
                  <th className="px-6 py-4 font-bold">Charge</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Groww ID</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white max-w-[200px] truncate">{order.serviceName}</span>
                            <span className="text-[10px] text-slate-500">{order.quantity.toLocaleString()} units</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                              <UserIcon size={12} />
                            </div>
                            <span className="text-xs text-slate-300 font-mono">{order.userId.substring(0, 8)}...</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a 
                            href={order.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 max-w-[150px] truncate"
                          >
                            {order.link}
                            <ExternalLink size={10} className="shrink-0" />
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-emerald-400">{formatINR(order.chargeINR)}</span>
                            <span className="text-[10px] text-slate-500">Cost: ${order.chargeUSD.toFixed(4)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-slate-500">#{order.growwOrderId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order, e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                          >
                            {statuses.filter(s => s !== 'All').map(s => (
                              <option key={s} value={s.toLowerCase()}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
            <p className="text-xs text-slate-500">Total Platform Orders: {orders.length}</p>
            <div className="flex items-center gap-2">
              <button disabled className="p-1.5 rounded-lg bg-white/5 text-slate-600 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button disabled className="p-1.5 rounded-lg bg-white/5 text-slate-600 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default AllOrders;
