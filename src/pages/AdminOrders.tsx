import { collection, deleteField, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import {
  Camera,
  CheckCircle,
  Eye,
  Filter,
  Search,
  ShieldCheck,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db, storage } from "../lib/firebase";

interface GrowplexOrder {
  id?: string;
  orderId: string;
  customerName: string;
  phone: string;
  serviceLink?: string;
  serviceName: string;
  packageQuantity: string;
  price: number;
  paymentId: string;
  paymentStatus: string;
  paymentScreenshotUrl?: string;
  paymentScreenshotPath?: string;
  orderStatus: string;
  createdAt: any;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<GrowplexOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Orders");
  const [sortBy, setSortBy] = useState("Date");
  const [selectedOrder, setSelectedOrder] = useState<GrowplexOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: GrowplexOrder[] = [];
      snapshot.forEach((docSnap) => {
        fetchedOrders.push({ id: docSnap.id, ...docSnap.data() } as any);
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
      
      // Find the Firestore document ID for this order
      const order = orders.find(o => o.orderId === orderId);
      if (order?.id) {
        await updateDoc(doc(db, "orders", order.id), { orderStatus: newStatus });
      }
      
      if (selectedOrder && selectedOrder.orderId === orderId) {
         setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  /**
   * Approve payment: 
   * 1. Delete screenshot from Firebase Storage
   * 2. Set paymentStatus to "paid"
   * 3. Remove screenshot fields from Firestore document
   */
  const handleApprovePayment = async (order: GrowplexOrder) => {
    if (!order.id) return;
    setApproving(true);

    try {
      // 1. Delete screenshot from Storage if path exists
      if (order.paymentScreenshotPath) {
        try {
          const screenshotRef = ref(storage, order.paymentScreenshotPath);
          await deleteObject(screenshotRef);
        } catch (storageErr) {
          console.warn("Screenshot deletion from storage failed (may already be deleted):", storageErr);
        }
      }

      // 2. Update Firestore: set paid, remove screenshot fields
      await updateDoc(doc(db, "orders", order.id), {
        paymentStatus: "paid",
        paymentScreenshotUrl: deleteField(),
        paymentScreenshotPath: deleteField(),
      });

      // 3. Update local state
      setOrders(prev => prev.map(o => 
        o.orderId === order.orderId 
          ? { ...o, paymentStatus: "paid", paymentScreenshotUrl: undefined, paymentScreenshotPath: undefined } 
          : o
      ));

      if (selectedOrder?.orderId === order.orderId) {
        setSelectedOrder(prev => prev ? { 
          ...prev, 
          paymentStatus: "paid", 
          paymentScreenshotUrl: undefined,
          paymentScreenshotPath: undefined
        } : null);
      }

      alert("Payment approved successfully! Screenshot has been removed.");
    } catch (err) {
      console.error("Failed to approve payment:", err);
      alert("Failed to approve payment. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Filter by Status
    if (statusFilter !== "All Orders") {
      const dbStatusMap: Record<string, string> = {
        "New Orders": "new",
        "Processing": "processing",
        "Completed": "completed",
        "Failed": "failed"
      };
      if (dbStatusMap[statusFilter]) {
        result = result.filter(o => o.orderStatus === dbStatusMap[statusFilter]);
      }
    }

    // Filter by Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "Date") {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      }
      if (sortBy === "Price") {
        return b.price - a.price;
      }
      if (sortBy === "Status") {
        return a.orderStatus.localeCompare(b.orderStatus);
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPaymentBadge = (status: string, hasScreenshot: boolean) => {
    if (status === "paid") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
        <CheckCircle size={12} /> PAID
      </span>;
    }
    if (status === "pending_verification") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
        {hasScreenshot && <Camera size={12} />} VERIFY
      </span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
      {status.toUpperCase()}
    </span>;
  };

  return (
    <AdminLayout>
      <main className="flex-grow max-w-7xl mx-auto w-full mb-8 sm:mb-12">
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">Orders</h1>
              <p className="text-text-muted mt-0.5 text-xs sm:text-sm">Manage and track orders</p>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search by ID, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-sm text-text-main focus:outline-none focus:border-brand-accent/50"
            />
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex overflow-x-auto pb-1 scrollbar-hide gap-1.5 sm:gap-2 -mx-1 px-1">
            {["All", "New", "Processing", "Completed", "Failed"].map((filter) => {
              const filterMap: Record<string, string> = { "All": "All Orders", "New": "New Orders", "Processing": "Processing", "Completed": "Completed", "Failed": "Failed" };
              const filterValue = filterMap[filter];
              return (
                <button
                  key={filter}
                  onClick={() => { setStatusFilter(filterValue); setCurrentPage(1); }}
                  className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    statusFilter === filterValue
                      ? "bg-brand-accent text-brand-primary"
                      : "bg-brand-surface border border-brand-border text-text-muted hover:text-text-main"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Filter size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-brand-accent/50 cursor-pointer flex-1 sm:flex-initial sm:w-40"
            >
              <option value="Date">Sort by Date</option>
              <option value="Price">Sort by Price</option>
              <option value="Status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Orders — Desktop Table + Mobile Cards */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-muted text-sm">Loading orders...</p>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm">No orders found.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Service</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-center">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {paginatedOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-brand-primary/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-brand-accent text-xs">{order.orderId}</td>
                        <td className="px-5 py-3">
                          <div className="font-medium text-text-main text-sm">{order.customerName}</div>
                          <div className="text-xs text-text-muted">{order.phone}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-text-main text-sm">{order.serviceName}</div>
                          <div className="text-xs text-brand-accent">{order.packageQuantity}</div>
                        </td>
                        <td className="px-5 py-3 font-medium">₹{order.price}</td>
                        <td className="px-5 py-3">{getPaymentBadge(order.paymentStatus, !!order.paymentScreenshotUrl)}</td>
                        <td className="px-5 py-3">
                          <select value={order.orderStatus} onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-md cursor-pointer border focus:outline-none ${
                              order.orderStatus === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              order.orderStatus === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                            }`}>
                            <option className="bg-brand-surface text-text-main" value="new">NEW</option>
                            <option className="bg-brand-surface text-text-main" value="processing">PROCESSING</option>
                            <option className="bg-brand-surface text-text-main" value="completed">COMPLETED</option>
                            <option className="bg-brand-surface text-text-main" value="failed">FAILED</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => setSelectedOrder(order)} className="text-text-muted hover:text-brand-accent p-1.5"><Eye size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="lg:hidden divide-y divide-brand-border">
                {paginatedOrders.map((order) => (
                  <div key={order.orderId} className="p-3 sm:p-4 space-y-2" onClick={() => setSelectedOrder(order)}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-brand-accent text-[11px]">{order.orderId}</p>
                        <p className="font-medium text-sm truncate">{order.customerName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getPaymentBadge(order.paymentStatus, !!order.paymentScreenshotUrl)}
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.orderStatus === 'completed' ? 'bg-green-500/10 text-green-500' :
                          order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                          order.orderStatus === 'failed' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>{order.orderStatus}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end text-xs">
                      <div className="text-text-muted">
                        <p>{order.serviceName}</p>
                        <p className="text-brand-accent">{order.packageQuantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base text-text-main">₹{order.price}</p>
                        <p className="text-text-muted">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Now'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Pagination */}
          {!loading && filteredAndSortedOrders.length > 0 && (
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-t border-brand-border bg-brand-primary/50">
              <span className="text-xs sm:text-sm text-text-muted">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length}
              </span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 bg-brand-surface border border-brand-border rounded-md text-xs sm:text-sm disabled:opacity-50">Prev</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 bg-brand-surface border border-brand-border rounded-md text-xs sm:text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

      </main>
      
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[85vh] sm:max-h-[90vh] flex flex-col mx-2"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-primary/50 shrink-0">
                <h3 className="font-heading font-bold text-xl text-text-main">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-primary p-4 rounded-xl border border-brand-border">
                       <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Order ID</p>
                       <p className="font-mono text-brand-accent font-medium">{selectedOrder.orderId}</p>
                    </div>
                    <div className="bg-brand-primary p-4 rounded-xl border border-brand-border">
                       <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Date</p>
                       <p className="text-text-main font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleString() : "N/A"}</p>
                    </div>
                 </div>

                  <div className="bg-brand-primary p-4 rounded-xl border border-brand-border space-y-3">
                     <div className="flex justify-between">
                        <span className="text-sm text-text-muted">Customer Name</span>
                        <span className="text-sm font-medium">{selectedOrder.customerName}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-sm text-text-muted">Phone Number</span>
                        <span className="text-sm font-medium">{selectedOrder.phone}</span>
                     </div>
                     {selectedOrder.serviceLink && (
                       <div className="flex justify-between items-start">
                          <span className="text-sm text-text-muted">Service Link</span>
                          <a href={selectedOrder.serviceLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-accent hover:underline max-w-[200px] truncate">
                            {selectedOrder.serviceLink}
                          </a>
                       </div>
                     )}
                  </div>

                 <div className="bg-brand-primary p-4 rounded-xl border border-brand-border space-y-3">
                    <div className="flex justify-between">
                       <span className="text-sm text-text-muted">Service</span>
                       <span className="text-sm font-medium">{selectedOrder.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-sm text-text-muted">Package</span>
                       <span className="text-sm font-medium text-brand-accent">{selectedOrder.packageQuantity}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-brand-border/50">
                       <span className="text-sm text-text-muted">Amount</span>
                       <span className="text-lg font-bold text-brand-accent">₹{selectedOrder.price}</span>
                    </div>
                 </div>

                 {/* Payment Status & Screenshot Section */}
                 <div className="bg-brand-primary p-4 rounded-xl border border-brand-border space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-text-muted">Payment Status</span>
                       {getPaymentBadge(selectedOrder.paymentStatus, !!selectedOrder.paymentScreenshotUrl)}
                    </div>
                    <div className="flex justify-between">
                       <span className="text-sm text-text-muted">Payment ID</span>
                       <span className="text-xs font-mono text-text-main break-all">{selectedOrder.paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-sm text-text-muted">Order Status</span>
                       <span className="text-sm font-medium uppercase text-text-main">{selectedOrder.orderStatus}</span>
                    </div>
                 </div>

                 {/* Payment Screenshot */}
                 {selectedOrder.paymentScreenshotUrl && (
                   <div className="bg-brand-primary p-4 rounded-xl border border-yellow-500/30 space-y-3">
                     <p className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                       <Camera size={16} /> Payment Screenshot
                     </p>
                     <div 
                       className="cursor-pointer rounded-lg overflow-hidden border border-brand-border hover:border-brand-accent/50 transition-colors"
                       onClick={() => setScreenshotModal(selectedOrder.paymentScreenshotUrl!)}
                     >
                       <img 
                         src={selectedOrder.paymentScreenshotUrl} 
                         alt="Payment screenshot" 
                         className="w-full max-h-48 object-contain bg-black/20"
                       />
                     </div>
                     <p className="text-xs text-text-muted text-center">Click to view full screenshot</p>
                   </div>
                 )}

              </div>

              <div className="p-4 sm:p-6 border-t border-brand-border bg-brand-primary/50 flex flex-col gap-2 sm:gap-3 shrink-0">
                 {/* Approve Payment Button — only if pending verification */}
                 {selectedOrder.paymentStatus === "pending_verification" && selectedOrder.paymentScreenshotUrl && (
                   <button 
                     onClick={() => handleApprovePayment(selectedOrder)}
                     disabled={approving}
                     className="w-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                   >
                     {approving ? (
                       <><div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /> Approving...</>
                     ) : (
                       <><ShieldCheck size={18} /> Approve Payment</>
                     )}
                   </button>
                 )}

                 <div className="flex gap-3">
                   {selectedOrder.orderStatus !== 'completed' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedOrder.orderId, "completed")}
                        className="flex-1 bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle size={18} /> Mark Completed
                      </button>
                   )}
                   <button 
                     onClick={() => setSelectedOrder(null)}
                     className="flex-1 bg-brand-surface border border-brand-border text-text-main hover:bg-brand-border py-2.5 rounded-xl font-medium transition-all"
                   >
                     Close Card
                   </button>
                 </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screenshot Modal */}
      <AnimatePresence>
        {screenshotModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScreenshotModal(null)}
              className="absolute inset-0 bg-black/90"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-3xl w-full max-h-[85vh]"
            >
              <button
                onClick={() => setScreenshotModal(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={screenshotModal}
                alt="Payment screenshot — full view"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="flex justify-center mt-4 gap-3">
                <a
                  href={screenshotModal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-accent text-brand-primary font-medium rounded-lg text-sm hover:bg-brand-accent-hover transition-colors"
                >
                  Open in New Tab
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
