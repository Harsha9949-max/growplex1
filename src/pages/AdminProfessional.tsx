import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Navbar } from "../components/Navbar";
import { Loader2, RefreshCw, Plus, Edit2, ShieldCheck, Save, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Service {
  id: string;
  serviceId: string;
  name: string;
  category: string;
  basePrice: number;
  marginPct?: number;
  finalPrice: number;
  syncSource: "api" | "manual";
  isActive: boolean;
}

export default function AdminProfessional() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMargin, setEditMargin] = useState<number>(25);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ name: "", category: "", basePrice: 0, marginPct: 25 });
  
  const { currentUser } = useAuth();

  const logAdminAction = async (actionType: string, targetId: string, oldValue: any, newValue: any) => {
    try {
      await addDoc(collection(db, "adminActions"), {
        adminEmail: currentUser?.email || "unknown",
        actionType,
        targetId,
        oldValue,
        newValue,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to log admin action", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "services"));
      const s = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
      setServices(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncServices = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/services/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail: currentUser?.email })
      });
      if (!res.ok) throw new Error("Sync failed");
      await fetchServices();
    } catch (err) {
      console.error(err);
      alert("Failed to sync services from API.");
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateMargin = async (id: string, basePrice: number) => {
    try {
      const finalPrice = basePrice * (1 + editMargin / 100);
      await updateDoc(doc(db, "services", id), {
        marginPct: editMargin,
        finalPrice: finalPrice
      });
      await logAdminAction("MARGIN_UPDATE", id, "previous", editMargin);
      setEditingId(null);
      await fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await updateDoc(doc(db, "services", service.id), {
        isActive: !service.isActive
      });
      await logAdminAction("TOGGLE_ACTIVE", service.id, service.isActive, !service.isActive);
      await fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManualService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalPrice = newService.basePrice * (1 + newService.marginPct / 100);
      const generatedId = "MANUAL_" + Math.random().toString(36).substr(2, 9).toUpperCase();
      await addDoc(collection(db, "services"), {
        serviceId: generatedId,
        name: newService.name,
        category: newService.category,
        basePrice: newService.basePrice,
        marginPct: newService.marginPct,
        finalPrice: finalPrice,
        syncSource: "manual",
        isActive: true,
        createdAt: serverTimestamp()
      });
      await logAdminAction("ADD_MANUAL_OFFER", generatedId, null, newService);
      setShowAddModal(false);
      setNewService({ name: "", category: "", basePrice: 0, marginPct: 25 });
      await fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-brand-accent flex items-center gap-2">
              <ShieldCheck size={28} />
              Professional Dashboard
            </h1>
            <p className="text-text-muted mt-1">Privileged Access: Manage SMM Services & Margins</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-brand-surface border border-brand-border text-text-main px-4 py-2 rounded-lg hover:border-brand-accent transition flex items-center gap-2"
            >
              <Plus size={18} />
              Add Manual Offer
            </button>
            <button 
              onClick={syncServices}
              disabled={syncing}
              className="bg-brand-accent text-brand-primary font-bold px-4 py-2 rounded-lg hover:bg-brand-accent-hover transition flex items-center gap-2"
            >
              {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {syncing ? "Syncing..." : "Sync GrowwSmm API"}
            </button>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#111111] text-text-muted">
                <tr>
                  <th className="p-4 font-normal uppercase tracking-wider">Service</th>
                  <th className="p-4 font-normal uppercase tracking-wider">Type</th>
                  <th className="p-4 font-normal uppercase tracking-wider">Base Price</th>
                  <th className="p-4 font-normal uppercase tracking-wider">Margin (%)</th>
                  <th className="p-4 font-normal uppercase tracking-wider">Final Price</th>
                  <th className="p-4 font-normal uppercase tracking-wider">Status</th>
                  <th className="p-4 font-normal uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-muted">
                      <div className="flex justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-muted">No services found. Sync from API or add manual offers.</td>
                  </tr>
                ) : (
                  services.map(service => (
                    <tr key={service.id} className="hover:bg-brand-primary/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{service.name}</div>
                        <div className="text-xs text-text-muted">{service.category} • ID: {service.serviceId}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${service.syncSource === 'api' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                          {service.syncSource.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">₹{service.basePrice.toFixed(2)}</td>
                      <td className="p-4 flex items-center gap-2">
                        {editingId === service.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-16 bg-brand-primary border border-brand-border px-2 py-1 rounded outline-none" 
                              value={editMargin} 
                              onChange={(e) => setEditMargin(Number(e.target.value))}
                            />
                            <button onClick={() => handleUpdateMargin(service.id, service.basePrice)} className="text-green-500 hover:text-green-400">
                              <Save size={16} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-mono">{service.marginPct || 25}%</span>
                            <button onClick={() => { setEditingId(service.id); setEditMargin(service.marginPct || 25); }} className="text-text-muted hover:text-brand-accent">
                              <Edit2 size={14} />
                            </button>
                          </>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-brand-accent">₹{service.finalPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleActive(service)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${service.isActive ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                        >
                          {service.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="p-4">
                        {/* More actions if needed */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Manual Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Add Manual Offer</h2>
            <form onSubmit={handleAddManualService} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Offer Title</label>
                <input required type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg p-3 text-text-main" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. VIP Consultation" />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Category</label>
                <input required type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg p-3 text-text-main" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} placeholder="e.g. Premium Offers" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Base Cost (₹)</label>
                  <input required type="number" min="0" step="0.01" className="w-full bg-brand-primary border border-brand-border rounded-lg p-3 text-text-main" value={newService.basePrice} onChange={e => setNewService({...newService, basePrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">Margin (%)</label>
                  <input required type="number" min="0" className="w-full bg-brand-primary border border-brand-border rounded-lg p-3 text-text-main" value={newService.marginPct} onChange={e => setNewService({...newService, marginPct: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-accent text-brand-primary font-bold py-3 rounded-lg mt-4 hover:bg-brand-accent-hover transition">
                Create Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
