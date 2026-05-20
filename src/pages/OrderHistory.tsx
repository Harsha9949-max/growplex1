import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { formatTimeAgo, formatINR } from "../lib/utils";
import { Copy, CheckCircle, Package, Clock, XCircle, ExternalLink, Loader2, ChevronRight, Search, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const { currentUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMode, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['All', 'Paid', 'Processing', 'Completed', 'Failed', 'Canceled'];

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login', { state: { returnTo: '/orders' } });
      return;
    }
    fetchOrders(true);
  }, [currentUser, authLoading, navigate, activeFilter]);

  const fetchOrders = async (reset = false) => {
    if (!currentUser) return;
    try {
      if (reset) {
        setLoading(true);
        setOrders([]);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      let qConstraints: any[] = [
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(20)
      ];

      if (activeFilter !== 'All') {
        const filterStatus = activeFilter.toLowerCase();
        // Assume mapping: Paid -> paymentStatus=paid, Processing -> orderStatus=processing, Completed -> orderStatus=completed
        if (filterStatus === 'paid' || filterStatus === 'failed') {
          qConstraints.push(where("paymentStatus", "==", filterStatus));
        } else {
           // We might need an index for this if we query by multiple fields,
           // but we'll filter on client to avoid complex index requirements or we use simple status field.
           qConstraints.push(where("orderStatus", "==", filterStatus));
        }
      }

      if (!reset && lastDoc) {
        qConstraints.push(startAfter(lastDoc));
      }

      let ordersQuery = query(collection(db, "orders"), ...qConstraints);
      
      // If there's a strict search query, it overrides pagination and filters.
      if (searchQuery.trim().length > 0) {
        ordersQuery = query(collection(db, "orders"), where("orderId", "==", searchQuery.trim()));
      }

      const snapshot = await getDocs(ordersQuery);
      
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (searchQuery.trim().length > 0) {
        setOrders(newOrders);
        setHasMore(false);
      } else {
        if (reset) {
          setOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
        }
        
        if (snapshot.docs.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
      }

    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(true);
  };

  const ProgressTimeline = ({ paymentStatus, orderStatus }: any) => {
     const isPaid = paymentStatus === 'paid';
     const isQueued = orderStatus === 'queued' || orderStatus === 'processing' || orderStatus === 'completed';
     const isProcessing = orderStatus === 'processing' || orderStatus === 'completed';
     const isCompleted = orderStatus === 'completed';
     
     return (
       <div className="flex items-center gap-1 mt-4 text-xs font-medium">
         <div className={`flex-1 h-1 rounded-full ${isPaid ? 'bg-green-500' : 'bg-gray-800'}`}></div>
         <div className={`flex-1 h-1 rounded-full ${isQueued ? 'bg-yellow-500' : 'bg-gray-800'}`}></div>
         <div className={`flex-1 h-1 rounded-full ${isProcessing ? 'bg-brand-accent' : 'bg-gray-800'}`}></div>
         <div className={`flex-1 h-1 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-800'}`}></div>
       </div>
     );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200 flex flex-col font-sans selection:bg-brand-accent selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-black text-brand-accent uppercase tracking-wider">Order History</h1>
            <p className="text-gray-400 mt-2">Manage and track your Growplex services.</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex max-w-sm w-full md:w-auto relative">
            <input 
              type="text" 
              placeholder="Search by exact Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-brand-accent/20 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-accent text-white"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-accent hover:text-white transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>
        
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide">
           {filters.map(f => (
             <button
               key={f}
               onClick={() => { setActiveFilter(f); setSearchQuery(''); }}
               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeFilter === f ? 'bg-brand-accent text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-[#111111] text-gray-400 hover:text-brand-accent border border-gray-800'}`}
             >
               {f}
             </button>
           ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-accent" size={40} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0a] border border-brand-accent/10 rounded-2xl">
            <Package size={48} className="mx-auto text-brand-accent/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You don't have any matching orders.</p>
            <Link to="/services" className="bg-brand-accent text-black px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all inline-block uppercase tracking-wider text-sm">
              Deploy Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#0a0a0a] border border-brand-accent/20 rounded-xl p-5 hover:border-brand-accent/50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-2 relative">
                    <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                      <span>{order.orderId}</span>
                      <span>{formatTimeAgo(order.createdAt)}</span>
                    </div>
                    <h3 className="font-bold text-xl text-white">{order.serviceName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Package size={14} className="text-brand-accent"/> Qty: {order.packageQuantity}</span>
                      <span className="font-mono text-brand-accent font-medium">{formatINR(order.price)}</span>
                    </div>
                    <ProgressTimeline paymentStatus={order.paymentStatus} orderStatus={order.orderStatus} />
                    <div className="flex justify-between mt-1 text-[10px] text-gray-500 px-1 uppercase tracking-wider">
                       <span>Paid</span>
                       <span>Queued</span>
                       <span>Processing</span>
                       <span>Completed</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t border-gray-800 pt-4 md:pt-0 md:border-0 md:pl-6 shrink-0 w-full md:w-auto">
                    <div className="flex flex-col gap-2 w-full">
                       <div className="flex justify-between md:justify-end gap-2 text-xs">
                          <span className="text-gray-500">Pay:</span>
                          <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-500' : order.paymentStatus === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {order.paymentStatus?.toUpperCase()}
                          </span>
                       </div>
                       <div className="flex justify-between md:justify-end gap-2 text-xs">
                          <span className="text-gray-500">API:</span>
                          <span className={`font-bold ${order.orderStatus === 'completed' ? 'text-green-500' : 'text-brand-accent'}`}>
                            {order.orderStatus?.toUpperCase() || 'NEW'}
                          </span>
                       </div>
                    </div>
                    <Link 
                      to={`/receipt/${order.orderId}`}
                      className="mt-4 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-brand-accent hover:text-black border border-brand-accent/30 rounded-lg text-sm font-bold text-brand-accent transition-all uppercase tracking-wider"
                    >
                      Receipt <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && !searchQuery && (
              <div className="pt-6 flex justify-center">
                 <button 
                   onClick={() => fetchOrders(false)}
                   disabled={loadingMode}
                   className="px-6 py-2.5 rounded-full border border-gray-700 text-sm font-bold text-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                   {loadingMode ? <Loader2 size={16} className="animate-spin" /> : 'Load More Orders'}
                 </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
