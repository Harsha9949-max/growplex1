import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/SEO';
import { Package, Search, Calendar, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

interface OrderType {
  id: string;
  orderId: string;
  serviceName: string;
  price: number | string;
  orderStatus: string;
  createdAt: any;
}

const UserOrders: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("customerEmail", "==", currentUser.email)
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as OrderType[];
        
        // Sort manually because compounding query with orderBy might require a compound index
        fetchedOrders.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const filteredOrders = orders.filter(order => 
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'processing': return <Clock className="text-brand-gold animate-pulse" size={18} />;
      case 'failed': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-slate-400" size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const isCompleted = status.toLowerCase() === 'completed';
    const isProcessing = status.toLowerCase() === 'processing';
    const isFailed = status.toLowerCase() === 'failed';
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
        isCompleted ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
        isProcessing ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' :
        isFailed ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
      }`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans pb-20">
      <Navbar />
      <SEO title="My Orders | Growplex" description="Track and manage your Growplex orders." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center border border-brand-teal/20 text-brand-teal shadow-[0_0_20px_rgba(0,201,167,0.2)]">
                <Package size={28} />
             </div>
             <div>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-white italic tracking-tight">Order <span className="text-brand-teal">History</span></h1>
                <p className="text-sm text-slate-400 font-medium">Track your previous and active service requests.</p>
             </div>
          </div>
          
          <div className="w-full md:w-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by Order ID or Service..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full md:w-80 bg-brand-surface border border-brand-border rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-teal/50 focus:ring-1 focus:ring-brand-teal/50 transition-all"
             />
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-brand-surface border border-brand-border rounded-[2rem] overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white">All Orders ({filteredOrders.length})</h2>
           </div>
           
           <div className="divide-y divide-brand-border">
              {loading ? (
                 <div className="p-12 flex flex-col justify-center items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Matrix...</p>
                 </div>
              ) : filteredOrders.length === 0 ? (
                 <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-4">
                    <Package size={48} className="opacity-20" />
                    <p className="font-bold">No orders found.</p>
                 </div>
              ) : (
                 filteredOrders.map(order => (
                   <Link to={`/receipt/${order.orderId}`} key={order.id} className="block group hover:bg-white/[0.02] transition-colors p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-brand-primary rounded-xl border border-white/5 group-hover:border-brand-teal/30 transition-colors hidden sm:block">
                               <Package size={20} className="text-slate-400 group-hover:text-brand-teal transition-colors" />
                            </div>
                            <div className="space-y-1 w-full">
                               <div className="flex items-center justify-between sm:justify-start gap-4">
                                  <h3 className="font-bold text-white text-base truncate max-w-[200px] sm:max-w-md">{order.serviceName}</h3>
                                  <span className="text-[10px] sm:text-xs text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                    {order.orderId}
                                  </span>
                               </div>
                               <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                  <div className="flex items-center gap-1.5">
                                     <Calendar size={12} />
                                     {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                     }) : 'Just now'}
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0">
                            <div className="text-left md:text-right">
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Amount</p>
                               <p className="text-lg font-black text-white">{formatINR(Number(order.price) || 0)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                               {getStatusBadge(order.orderStatus || 'pending')}
                               <ChevronRight className="text-slate-600 group-hover:text-white transition-colors hidden sm:block" size={20} />
                            </div>
                         </div>
                      </div>
                   </Link>
                 ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default UserOrders;
