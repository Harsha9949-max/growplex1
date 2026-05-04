import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aggregate customers from orders
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customerMap = new Map();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.phone) {
          if (!customerMap.has(data.phone)) {
            customerMap.set(data.phone, {
              name: data.customerName,
              phone: data.phone,
              totalOrders: 1,
              totalSpent: data.price || 0,
              lastOrder: data.createdAt
            });
          } else {
            const existing = customerMap.get(data.phone);
            existing.totalOrders += 1;
            existing.totalSpent += data.price || 0;
            if (data.createdAt > existing.lastOrder) {
              existing.lastOrder = data.createdAt;
            }
          }
        }
      });
      setCustomers(Array.from(customerMap.values()));
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch customers:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Customer Management</h1>
          <p className="text-text-muted text-sm mt-1">View customer history and details</p>
        </div>
      </div>
      
      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 border-l border-brand-border">Total Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Last Order</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-text-muted">No customers found yet.</td></tr>
              ) : customers.map((c, i) => (
                <tr key={i} className="hover:bg-brand-primary/30">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-text-muted">{c.phone}</td>
                  <td className="px-6 py-4 border-l border-brand-border text-center font-bold text-brand-accent">{c.totalOrders}</td>
                  <td className="px-6 py-4 font-medium">₹{c.totalSpent}</td>
                  <td className="px-6 py-4 text-text-muted text-xs">{c.lastOrder ? new Date(c.lastOrder.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <button className="text-text-muted hover:text-text-main text-xs font-medium">Manage</button>
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
