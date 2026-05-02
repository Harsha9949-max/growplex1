import React, { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  Plus,
  Save
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service } from '../../types';
import { formatINR, OperationType } from '../../lib/utils';
import { handleFirestoreError } from '../../lib/utils';
import { fetchGrowwServices } from '../../lib/growwsmm';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<string>('');

  useEffect(() => {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, orderBy('growwServiceId', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
      
      // Auto-sync if collection is empty
      if (snapshot.empty && !syncing && loading) {
        handleSync();
      }
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loading]);

  const detectPlatform = (name: string, category: string): string => {
    const text = (name + ' ' + category).toLowerCase();
    if (text.includes('instagram')) return 'Instagram';
    if (text.includes('youtube')) return 'YouTube';
    if (text.includes('tiktok')) return 'TikTok';
    if (text.includes('facebook')) return 'Facebook';
    if (text.includes('twitter')) return 'Twitter';
    if (text.includes('telegram')) return 'Telegram';
    return 'Other';
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const growwServices = await fetchGrowwServices();
      
      if (!growwServices || growwServices.length === 0) {
        toast.error('No services returned. Check API key.');
        return;
      }

      const batch = writeBatch(db);
      
      for (const s of growwServices) {
        const text = (s.name + ' ' + s.category).toLowerCase();
        let platform = 'Other';
        if (text.includes('instagram')) platform = 'Instagram';
        else if (text.includes('youtube')) platform = 'YouTube';
        else if (text.includes('tiktok')) platform = 'TikTok';
        else if (text.includes('facebook')) platform = 'Facebook';
        else if (text.includes('twitter')) platform = 'Twitter';
        else if (text.includes('telegram')) platform = 'Telegram';
        else if (text.includes('spotify')) platform = 'Spotify';

        const serviceRef = doc(db, 'services', 
          String(s.growwServiceId));
          
        const existingService = services.find(existing => String(existing.growwServiceId) === String(s.growwServiceId));

        if (existingService) {
          // Service exists, only update prices
          batch.set(serviceRef, {
            providerRate: s.providerRate,
            displayRate: s.displayRate,
            updatedAt: Timestamp.now()
          }, { merge: true });
        } else {
          // New service, insert all details
          batch.set(serviceRef, {
            growwServiceId: s.growwServiceId,
            name: s.name,
            category: s.category,
            platform: platform,
            type: s.type || 'Default',
            providerRate: s.providerRate,
            displayRate: s.displayRate,
            minQuantity: s.minQuantity,
            maxQuantity: s.maxQuantity,
            refill: s.refill,
            cancel: s.cancel,
            isActive: true,
            updatedAt: Timestamp.now()
          });
        }
      }
      
      await batch.commit();
      toast.success('Synced ' + growwServices.length + 
        ' services successfully!');
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await updateDoc(doc(db, 'services', service.id), {
        isActive: !service.isActive
      });
      toast.success(`${service.name} is now ${!service.isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  const handleEditRate = (service: Service) => {
    setEditingId(service.id);
    setEditRate(service.displayRate.toString());
  };

  const handleSaveRate = async (service: Service) => {
    const newRate = parseFloat(editRate);
    if (isNaN(newRate)) return toast.error('Invalid rate');

    try {
      await updateDoc(doc(db, 'services', service.id), {
        displayRate: newRate,
        updatedAt: Timestamp.now()
      });
      setEditingId(null);
      toast.success('Rate updated successfully');
    } catch (error) {
      toast.error('Failed to update rate');
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.growwServiceId.toString().includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Manage Services</h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure service pricing and availability. 
            {services.length > 0 && <span className="ml-2 text-indigo-400 font-bold">({services.length} services)</span>}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-[#1A193D] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 w-full sm:w-auto"
          >
            {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            <span className="whitespace-nowrap">Sync Services</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1A193D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">ID / Name</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Platform</th>
                <th className="px-6 py-4 font-bold">Provider Rate (USD)</th>
                <th className="px-6 py-4 font-bold">Your Rate (INR)</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Loading services...
                  </td>
                </tr>
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500">#{service.growwServiceId}</span>
                        <span className="text-sm font-medium text-white max-w-[250px] truncate">{service.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">{service.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        service.platform === 'Instagram' ? "bg-pink-500/10 text-pink-400" :
                        service.platform === 'YouTube' ? "bg-red-500/10 text-red-400" :
                        service.platform === 'TikTok' ? "bg-slate-500/10 text-slate-400" :
                        service.platform === 'Facebook' ? "bg-blue-500/10 text-blue-400" :
                        service.platform === 'Twitter' ? "bg-sky-500/10 text-sky-400" :
                        "bg-slate-500/10 text-slate-400"
                      )}>
                        {service.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">${service.providerRate.toFixed(4)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === service.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editRate}
                            onChange={(e) => setEditRate(e.target.value)}
                            className="w-24 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                          />
                          <button onClick={() => handleSaveRate(service)} className="text-emerald-400 hover:text-emerald-300">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/rate">
                          <span className="text-sm font-bold text-emerald-400">{formatINR(service.displayRate)}</span>
                          <button 
                            onClick={() => handleEditRate(service)}
                            className="opacity-0 group-hover/rate:opacity-100 text-slate-500 hover:text-white transition-opacity"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                          service.isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10">
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={28} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No services found</h3>
                    <p className="text-slate-400 mt-1">Try syncing services or adjust your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default ManageServices;
