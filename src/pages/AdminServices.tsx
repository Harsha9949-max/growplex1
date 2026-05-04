import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Package as PackageIcon, Plus, Percent, Edit, Trash2, X, Save } from 'lucide-react';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Service, Package } from '../types';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Service | null>(null);
  
  useEffect(() => {
    const q = query(collection(db, "services"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Service[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Service);
      });
      setServices(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      await deleteDoc(doc(db, "services", id));
    }
  };

  const handleEdit = (service: Service) => {
    setIsEditing(service);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Manage Services</h1>
          <p className="text-text-muted mt-2">Manage the services provided on your platform</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert("Bulk update coming soon!")} className="bg-brand-surface border border-brand-border text-text-main py-2 px-4 rounded-xl font-medium flex items-center gap-2 hover:border-brand-accent/50 transition-all">
            <Percent size={18} className="text-brand-accent" /> Bulk Update Prices
          </button>
          <button 
             onClick={() => setIsEditing({
               id: '', name: '', category: 'Instagram Followers', deliveryTime: '1-24 hours', description: '', packages: []
             } as any)}
             className="bg-brand-accent text-brand-primary py-2 px-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D4A33B] transition-colors"
          >
            <Plus size={18} /> Add Service
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-text-muted">Loading services...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/50 text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold border-b border-brand-border">Service Name</th>
                  <th className="px-6 py-4 font-bold border-b border-brand-border">Category</th>
                  <th className="px-6 py-4 font-bold border-b border-brand-border hidden md:table-cell">Packages</th>
                  <th className="px-6 py-4 font-bold border-b border-brand-border hidden lg:table-cell">Delivery Time</th>
                  <th className="px-6 py-4 font-bold border-b border-brand-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-brand-border hover:bg-brand-primary/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary border border-brand-border flex items-center justify-center shrink-0">
                          <PackageIcon size={20} className="text-brand-accent" />
                        </div>
                        <div>
                          <p className="font-bold text-text-main">{service.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-brand-primary border border-brand-border px-3 py-1 rounded-full text-xs font-semibold text-text-muted whitespace-nowrap">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <p className="text-sm font-medium">{(service.packages || []).length} variants</p>
                      <p className="text-xs text-text-muted">
                        Start: ₹{(service.packages && service.packages.length > 0) ? Math.min(...service.packages.map(p => Number(p.price) || 0)) : 0}
                      </p>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell text-sm text-text-muted">
                      {service.deliveryTime}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(service)} className="p-2 text-text-muted hover:text-brand-accent bg-brand-primary border border-brand-border rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-2 text-text-muted hover:text-red-500 bg-brand-primary border border-brand-border rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && (
          <div className="p-4 border-t border-brand-border bg-brand-primary/20 text-center text-sm text-text-muted">
             Showing all {services.length} active services
          </div>
        )}
      </div>

      {isEditing && (
         <ServiceEditorModal service={isEditing} onClose={() => setIsEditing(null)} />
      )}
    </AdminLayout>
  );
}

function ServiceEditorModal({ service, onClose }: { service: Service, onClose: () => void }) {
  const [formData, setFormData] = useState<Service>({ ...service, packages: service.packages ? [...service.packages] : [] });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (formData.id) {
         await updateDoc(doc(db, "services", formData.id), {
           name: formData.name,
           category: formData.category,
           description: formData.description || '',
           deliveryTime: formData.deliveryTime || '',
           packages: formData.packages
         });
      } else {
         await addDoc(collection(db, "services"), {
           name: formData.name,
           category: formData.category,
           description: formData.description || '',
           deliveryTime: formData.deliveryTime || '',
           packages: formData.packages
         });
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error saving service");
    } finally {
      setSaving(false);
    }
  };

  const handlePkgChange = (idx: number, key: string, val: string | number) => {
    const np = [...formData.packages];
    np[idx] = { ...np[idx], [key]: key === 'price' ? Number(val) || 0 : val };
    setFormData({ ...formData, packages: np });
  };

  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { id: Date.now().toString(), quantity: "100", price: 10 }]
    });
  };

  const removePackage = (idx: number) => {
    const np = [...formData.packages];
    np.splice(idx, 1);
    setFormData({ ...formData, packages: np });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
       <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-brand-border flex justify-between items-center sticky top-0 bg-brand-surface z-10">
             <h2 className="text-xl font-bold">{formData.id ? 'Edit Service' : 'Add Service'}</h2>
             <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={20}/></button>
          </div>
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-text-muted mb-1">Service Name</label>
                   <input type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg px-3 py-2 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
                   <input type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg px-3 py-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-text-muted mb-1">Delivery Time</label>
                   <input type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg px-3 py-2 text-sm" value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})} placeholder="e.g. 1-24 hours" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
                   <input type="text" className="w-full bg-brand-primary border border-brand-border rounded-lg px-3 py-2 text-sm" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
             </div>
             
             <div>
               <div className="flex justify-between items-center mb-3">
                 <label className="block text-sm font-bold">Packages ({formData.packages.length})</label>
                 <button onClick={addPackage} className="text-xs font-medium text-brand-accent hover:underline flex items-center"><Plus size={14} className="mr-1"/> Add Package</button>
               </div>
               
               <div className="space-y-3">
                 {formData.packages.map((pkg, idx) => (
                    <div key={pkg.id || idx} className="flex gap-3 items-center bg-brand-primary p-3 rounded-lg border border-brand-border">
                       <div className="flex-1">
                          <label className="block text-[10px] text-text-muted uppercase mb-1">Quantity / Name</label>
                          <input type="text" value={pkg.quantity} onChange={(e) => handlePkgChange(idx, 'quantity', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded text-sm px-2 py-1" />
                       </div>
                       <div className="w-32">
                          <label className="block text-[10px] text-text-muted uppercase mb-1">Price (₹)</label>
                          <input type="number" value={pkg.price} onChange={(e) => handlePkgChange(idx, 'price', e.target.value)} className="w-full bg-brand-surface border border-brand-border rounded text-sm px-2 py-1" />
                       </div>
                       <div className="pt-5">
                         <button onClick={() => removePackage(idx)} className="p-1.5 text-text-muted hover:text-red-500 bg-brand-surface rounded border border-brand-border">
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </div>
                 ))}
                 {formData.packages.length === 0 && (
                   <div className="text-center p-4 text-text-muted text-sm border border-dashed border-brand-border rounded-lg">No packages added.</div>
                 )}
               </div>
             </div>
          </div>
          <div className="p-6 border-t border-brand-border flex justify-end gap-3 bg-brand-surface sticky bottom-0">
             <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium text-text-muted hover:bg-brand-primary transition-colors">Cancel</button>
             <button disabled={saving} onClick={handleSave} className="bg-brand-accent text-brand-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#D4A33B] transition-colors disabled:opacity-50">
               <Save size={18} /> {saving ? 'Saving...' : 'Save Service'}
             </button>
          </div>
       </div>
    </div>
  );
}
