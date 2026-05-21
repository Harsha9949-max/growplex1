import { format } from "date-fns";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { Activity, CreditCard, FileText, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

interface LogEvent {
  id: string;
  type: "order" | "transaction" | "system";
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    
    // Fetch latest orders
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersEvents = snapshot.docs.map(doc => {
        const data = doc.data();
        let title = "New Order Placed";
        if (data.orderStatus === "completed") title = "Order Completed";
        if (data.orderStatus === "processing") title = "Order Processing";
        if (data.orderStatus === "cancelled" || data.orderStatus === "failed") title = "Order Failed/Cancelled";
        
        return {
          id: `order_${doc.id}`,
          type: "order" as const,
          title,
          description: `Order ${data.orderId || doc.id} for ${data.serviceName} (${data.price ? `₹${data.price}` : 'N/A'}) by ${data.customerName || data.userId || 'Unknown'}`,
          timestamp: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          status: data.orderStatus
        };
      });
      
      updateLogs("orders", ordersEvents);
    }, (error) => {
       console.error("Error fetching orders for logs", error);
    });

    // Fetch transactions
    const qTransactions = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const txEvents = snapshot.docs.map(doc => {
        const data = doc.data();
        let title = "Wallet Deposit";
        if (data.type === "order_debit") title = "Wallet Debit (Order)";
        if (data.type === "refund") title = "Wallet Refund";

        return {
          id: `tx_${doc.id}`,
          type: "transaction" as const,
          title: `${title} - ${data.status}`,
          description: `Amount: ₹${data.amount} for user: ${data.userId || 'Unknown'} via ${data.razorpayPaymentId || 'System'}`,
          timestamp: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          status: data.status
        };
      });

      updateLogs("transactions", txEvents);
    }, (error) => {
       console.error("Error fetching tx for logs", error);
    });

    let eventCaches: Record<string, LogEvent[]> = { orders: [], transactions: [] };
    
    function updateLogs(type: "orders" | "transactions", newEvents: LogEvent[]) {
      if (unmounted) return;
      eventCaches[type] = newEvents;
      const combined = [...eventCaches.orders, ...eventCaches.transactions];
      combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setLogs(combined.slice(0, 100)); // Keep top 100
      setLoading(false);
    }

    return () => {
      unmounted = true;
      unsubscribeOrders();
      unsubscribeTransactions();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Audit Logs</h1>
          <p className="text-text-muted text-sm mt-1">Track system events and user actions</p>
        </div>
      </div>
      
      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg overflow-hidden">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-text-muted">
             <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
             <p>Loading audit logs...</p>
           </div>
        ) : logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-text-muted">
             <FileText size={48} className="mb-4 opacity-30" />
             <p>No system events recorded yet.</p>
           </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {logs.map(log => (
              <div key={log.id} className="p-4 sm:p-5 flex gap-4 hover:bg-brand-primary/30 transition-colors">
                 <div className="mt-1 shrink-0">
                    {log.type === "order" && <ShoppingCart size={20} className="text-blue-500" />}
                    {log.type === "transaction" && <CreditCard size={20} className="text-green-500" />}
                    {log.type === "system" && <Activity size={20} className="text-brand-accent" />}
                 </div>
                 <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text-main text-sm sm:text-base">{log.title}</h4>
                        {log.status && (
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                             ['completed', 'paid'].includes(log.status) ? 'bg-green-500/10 text-green-500' :
                             ['processing'].includes(log.status) ? 'bg-blue-500/10 text-blue-500' :
                             ['failed', 'cancelled'].includes(log.status) ? 'bg-red-500/10 text-red-500' :
                             'bg-yellow-500/10 text-yellow-500'
                           }`}>
                             {log.status}
                           </span>
                        )}
                      </div>
                      <p className="text-text-muted text-xs sm:text-sm">{log.description}</p>
                    </div>
                    <div className="text-xs text-text-muted shrink-0 whitespace-nowrap">
                       {format(log.timestamp, "MMM dd, yyyy · HH:mm:ss")}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
