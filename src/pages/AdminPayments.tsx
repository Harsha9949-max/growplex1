import { collection, doc, onSnapshot, orderBy, query, updateDoc, deleteField } from "firebase/firestore";
import { Camera, Check, CheckCircle, Copy, ExternalLink, Filter, RefreshCw, Search, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const renderCopyButton = (text: string) => (
    <button 
      onClick={() => handleCopy(text)}
      className="p-1 hover:bg-brand-border rounded text-text-muted hover:text-brand-accent transition-colors hidden sm:block"
      title="Copy to clipboard"
    >
      {copiedText === text ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.paymentId) { // Only orders with payment info
          fetched.push({ id: docSnap.id, ...data });
        }
      });
      setPayments(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch payments:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdatePaymentStatus = async (paymentId: string, docId: string, newPaymentStatus: string, newOrderStatus: string) => {
    try {
      setUpdatingId(paymentId);

      await updateDoc(doc(db, "orders", docId), {
        paymentStatus: newPaymentStatus,
        orderStatus: newOrderStatus,
        paymentScreenshotUrl: deleteField(),
      });
      setSelectedPayment(null);
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Failed to update payment. Check permissions.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') return 'bg-green-500/10 text-green-500';
    if (status === 'pending_verification') return 'bg-yellow-500/10 text-yellow-500';
    if (status === 'uploading_screenshot') return 'bg-blue-500/10 text-blue-500';
    if (status === 'failed') return 'bg-red-500/10 text-red-500';
    return 'bg-brand-border text-text-muted';
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Payment Management</h1>
          <p className="text-text-muted text-sm mt-1">View and manage transactions and refunds</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-brand-surface border border-brand-border px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-brand-primary/50 transition-colors">
            <RefreshCw size={16} /> Sync Payments
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-brand-border flex justify-between items-center">
           <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
             <input type="text" placeholder="Search Payments..." className="w-full pl-9 pr-4 py-2 bg-brand-primary border border-brand-border rounded-lg text-sm text-text-main focus:outline-none focus:border-brand-accent/50" />
           </div>
           <button className="text-text-muted hover:text-text-main p-2">
             <Filter size={18} />
           </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              ) : payments.map(payment => (
                <tr key={payment.id} className="hover:bg-brand-primary/30">
                  <td className="px-6 py-4 font-mono text-xs">{payment.paymentId}</td>
                  <td className="px-6 py-4 font-mono text-brand-accent text-xs">{payment.orderId}</td>
                  <td className="px-6 py-4">{payment.customerName}</td>
                  <td className="px-6 py-4 font-medium">₹{payment.price}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${getStatusBadge(payment.paymentStatus)}`}>
                       {payment.paymentStatus.replace('_', ' ')}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedPayment(payment)}
                      className="text-brand-accent hover:underline text-xs font-medium flex items-center gap-1"
                    >
                      Verify / Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-primary shrink-0">
              <h3 className="font-bold text-lg font-heading hidden sm:block">Verify Payment</h3>
              <h3 className="font-bold text-lg font-heading sm:hidden">Payment Details</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-brand-border transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold tracking-wider">Order ID</label>
                  <div className="flex gap-2 items-center text-sm font-mono text-brand-accent mt-1">
                    {selectedPayment.orderId} {renderCopyButton(selectedPayment.orderId)}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold tracking-wider">Payment ID</label>
                  <div className="flex gap-2 items-center text-sm font-mono mt-1 break-all">
                    {selectedPayment.paymentId} {renderCopyButton(selectedPayment.paymentId)}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold tracking-wider">Customer</label>
                  <p className="text-sm mt-1">{selectedPayment.customerName} ({selectedPayment.phone})</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold tracking-wider">Amount</label>
                  <p className="text-lg font-bold text-green-500 mt-1">₹{selectedPayment.price}</p>
                </div>
                <div>
                   <label className="text-xs text-text-muted uppercase font-bold tracking-wider">Current Status</label>
                   <div className="mt-1">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase ${getStatusBadge(selectedPayment.paymentStatus)}`}>
                       {selectedPayment.paymentStatus.replace('_', ' ')}
                     </span>
                   </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs text-text-muted uppercase font-bold tracking-wider mb-2 block">Payment Screenshot</label>
                {selectedPayment.paymentScreenshotUrl ? (
                  <div className="border border-brand-border rounded-xl p-2 bg-brand-primary">
                    <a href={`/receipt/${selectedPayment.orderId}`} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <img 
                        src={selectedPayment.paymentScreenshotUrl} 
                        alt="Payment Screenshot" 
                        className="w-full h-auto max-h-64 object-contain rounded-lg"
                      />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                         <ExternalLink className="text-white drop-shadow-md" size={32} />
                       </div>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-brand-primary border border-brand-border border-dashed rounded-xl text-text-muted">
                    <Camera size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No screenshot uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-brand-border bg-brand-primary flex flex-wrap gap-3 justify-end shrink-0">
              <button
                onClick={() => handleUpdatePaymentStatus(selectedPayment.paymentId, selectedPayment.id, "failed", "failed")}
                disabled={updatingId === selectedPayment.paymentId}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <XCircle size={16} /> Mark as Failed / Refund
              </button>
              <button
                onClick={() => handleUpdatePaymentStatus(selectedPayment.paymentId, selectedPayment.id, "paid", "processing")}
                disabled={updatingId === selectedPayment.paymentId}
                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <CheckCircle size={16} /> Verify Successful Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
