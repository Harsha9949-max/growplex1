import React, { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Search, Filter, Eye, RefreshCw } from "lucide-react";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                      payment.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-brand-accent hover:underline text-xs">Verify / Refund</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
