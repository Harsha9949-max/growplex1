import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Edit2, Trash2, Plus, 
  Filter, X, MoreVertical, CheckCircle, Percent,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, writeBatch
} from "firebase/firestore";
import { Package } from "../types";

interface ServiceDocument {
  id: string; // Document ID
  serviceId: string;
  category: "Instagram" | "YouTube" | "Telegram" | "Facebook" | string;
  serviceName: string;
  packages: Package[];
  deliveryTime: string;
  status: "active" | "inactive";
  createdAt: any;
  updatedAt: any;
  description?: string;
}

const CATEGORY_OPTIONS = ["Instagram", "YouTube", "Telegram", "Facebook"];

export default function AdminServices() {
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Services");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDocument | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "Instagram",
    serviceName: "",
    deliveryTime: "1-24 hours",
    description: "",
    status: "active" as "active" | "inactive",
    packages: [{ id: `pkg_${Date.now()}`, quantity: "", price: 0 }] as Package[]
  });
  const [bulkPercentage, setBulkPercentage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "services"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ServiceDocument[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as any);
      });
      
      // Sort manually by createdAt descending
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      setServices(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch services:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenForm = (service?: ServiceDocument) => {
    if (service) {
      setEditingService(service);
      setFormData({
        category: service.category,
        serviceName: service.serviceName,
        deliveryTime: service.deliveryTime,
        description: service.description || "",
        status: service.status,
        packages: [...service.packages]
      });
    } else {
      setEditingService(null);
      setFormData({
        category: "Instagram",
        serviceName: "",
        deliveryTime: "1-24 hours",
        description: "",
        status: "active",
        packages: [{ id: `pkg_${Date.now()}`, quantity: "", price: 0 }]
      });
    }
    setIsFormOpen(true);
  };

  const handlePackageChange = (index: number, field: keyof Package, value: string | number) => {
    const newPkgs = [...formData.packages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setFormData({ ...formData, packages: newPkgs });
  };

  const addPackageRow = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { id: `pkg_${Date.now()}_${Math.random()}`, quantity: "", price: 0 }]
    });
  };

  const removePackageRow = (index: number) => {
    const newPkgs = formData.packages.filter((_, i) => i !== index);
    setFormData({ ...formData, packages: newPkgs });
  };

  const handleSaveService = async () => {

    if (!formData.serviceName || formData.packages.length === 0) return alert("Service Name and at least 1 package are required.");

    try {
      if (editingService) {
        const docRef = doc(db, "services", editingService.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        await addDoc(collection(db, "services"), {
          serviceId: `SRV-${randomNum}`,
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    }
  };

  const handleDeleteService = async (id: string) => {

    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, "services", id));
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleToggleStatus = async (service: ServiceDocument) => {

    const newStatus = service.status === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "services", service.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleBulkUpdate = async () => {

    const percentage = parseFloat(bulkPercentage);
    if (isNaN(percentage) || percentage === 0) return alert("Please enter a valid percentage.");

    if (!confirm(`Are you sure you want to update ALL prices by ${percentage > 0 ? '+' : ''}${percentage}%?`)) return;

    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, "services"));
      
      let count = 0;
      snapshot.forEach((document) => {
        const data = document.data() as ServiceDocument;
        const newPackages = data.packages.map(pkg => ({
          ...pkg,
          price: Math.round(Number(pkg.price) * (1 + percentage / 100))
        }));
        
        batch.update(document.ref, {
          packages: newPackages,
          updatedAt: serverTimestamp()
        });
        count++;
      });
      
      if (count > 0) {
        await batch.commit();
        alert(`Successfully updated prices for ${count} services.`);
      }
      setIsBulkUpdateOpen(false);
      setBulkPercentage("");
    } catch (error) {
      console.error("Bulk update failed:", error);
      alert("Bulk update failed.");
    }
  };

  const filteredServices = useMemo(() => {
    let result = [...services];

    if (statusFilter !== "All Services") {
      const statusObj: Record<string, string> = {
        "Active Services": "active",
        "Inactive Services": "inactive"
      };
      if (statusObj[statusFilter]) {
        result = result.filter(s => s.status === statusObj[statusFilter]);
      }
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.serviceName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [services, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <AdminLayout>
      <main className="flex-grow max-w-7xl mx-auto w-full mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Service Management</h1>
            <p className="text-text-muted mt-1">Manage Growplex services and dynamic pricing</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
               onClick={() => setIsBulkUpdateOpen(true)}
               className="bg-brand-surface border border-brand-border hover:border-brand-accent/50 text-text-main py-2 px-4 rounded-xl font-medium flex items-center gap-2 transition-all"
            >
               <Percent size={18} className="text-brand-accent" /> Bulk Price Update
            </button>
            <button
               onClick={() => handleOpenForm()}
               className="bg-brand-accent hover:bg-brand-accent-hover text-brand-primary py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
               <Plus size={18} /> Add Service
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 w-full lg:w-auto">
            {["All Services", "Active Services", "Inactive Services"].map((filter) => (
              <button
                key={filter}
                onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter
                    ? "bg-brand-accent text-brand-primary"
                    : "bg-brand-surface border border-brand-border text-text-muted hover:text-text-main"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-sm text-text-main focus:outline-none focus:border-brand-accent/50"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-4">Service ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 min-w-[200px]">Service Name</th>
                  <th className="px-6 py-4">Packages</th>
                  <th className="px-6 py-4">Delivery Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading services...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                      No services found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service) => (
                    <tr key={service.id} className={`hover:bg-brand-primary/30 transition-colors ${service.status === 'inactive' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-medium font-mono text-text-muted">{service.serviceId}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-brand-primary border border-brand-border text-xs">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-main">
                        {service.serviceName}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {service.packages.length} Packages<br/>
                        <span className="text-brand-accent">Starting ₹{Math.min(...service.packages.map(p => Number(p.price)))}</span>
                      </td>
                      <td className="px-6 py-4 text-text-muted">{service.deliveryTime}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-primary transition-colors ${
                            service.status === 'active' ? 'bg-brand-accent' : 'bg-brand-border'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              service.status === 'active' ? 'translate-x-2' : '-translate-x-2'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleOpenForm(service)}
                            className="text-text-muted hover:text-brand-accent transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="text-text-muted hover:text-red-500 transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && filteredServices.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-brand-primary/50">
              <span className="text-sm text-text-muted">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredServices.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredServices.length)} of {filteredServices.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 bg-brand-surface border border-brand-border rounded-md text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 bg-brand-surface border border-brand-border rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Add / Edit Service Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-brand-border flex justify-between items-center bg-brand-primary/50 shrink-0">
                <h3 className="font-heading font-bold text-xl text-text-main">
                  {editingService ? "Edit Service" : "Add Service"}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-muted">Category</label>
                       <select 
                         value={formData.category}
                         onChange={(e) => setFormData({...formData, category: e.target.value})}
                         className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 appearance-none"
                       >
                         {CATEGORY_OPTIONS.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                         ))}
                       </select>
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-muted">Service Name</label>
                       <input 
                         type="text"
                         value={formData.serviceName}
                         onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                         placeholder="e.g. Instagram Followers"
                         className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50"
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-muted">Delivery Time</label>
                       <input 
                         type="text"
                         value={formData.deliveryTime}
                         onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                         placeholder="e.g. 1-24 hours"
                         className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50"
                       />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-muted">Status</label>
                       <select 
                         value={formData.status}
                         onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                         className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 appearance-none"
                       >
                         <option value="active">Active</option>
                         <option value="inactive">Inactive</option>
                       </select>
                    </div>
                 </div>
                 
                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-muted">Description (Optional)</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Service description visible to users"
                      rows={2}
                      className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 resize-none"
                    />
                 </div>

                 {/* Packages Section */}
                 <div className="pt-4 border-t border-brand-border">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-heading font-medium text-text-main">Packages</h4>
                       <button 
                         onClick={addPackageRow}
                         className="text-sm text-brand-accent hover:text-brand-accent-hover font-medium flex items-center gap-1"
                       >
                         <Plus size={14} /> Add Package
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                       {formData.packages.map((pkg, index) => (
                         <div key={pkg.id || index} className="flex gap-3 items-center bg-brand-primary/50 p-2 pl-3 rounded-lg border border-brand-border">
                            <div className="flex-grow">
                               <input 
                                 type="text"
                                 placeholder="Quantity (e.g. 1000)"
                                 value={pkg.quantity}
                                 onChange={(e) => handlePackageChange(index, "quantity", e.target.value)}
                                 className="w-full bg-transparent text-sm focus:outline-none"
                               />
                            </div>
                            <div className="w-[1px] h-6 bg-brand-border"></div>
                            <div className="w-24 relative">
                               <span className="absolute left-2 top-1.5 text-text-muted text-sm">₹</span>
                               <input 
                                 type="number"
                                 placeholder="Price"
                                 value={pkg.price}
                                 onChange={(e) => handlePackageChange(index, "price", Number(e.target.value))}
                                 className="w-full bg-transparent text-sm focus:outline-none pl-6"
                               />
                            </div>
                            {formData.packages.length > 1 && (
                              <button 
                                onClick={() => removePackageRow(index)}
                                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-brand-primary rounded-md transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>

              </div>

              <div className="p-5 border-t border-brand-border bg-brand-primary/50 flex justify-end gap-3 shrink-0">
                 <button 
                   onClick={() => setIsFormOpen(false)}
                   className="px-5 py-2.5 bg-brand-surface border border-brand-border text-text-main hover:bg-brand-border rounded-xl font-medium transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSaveService}
                   className="px-6 py-2.5 bg-brand-accent text-brand-primary hover:bg-brand-accent-hover rounded-xl font-bold transition-all"
                 >
                   {editingService ? "Update Service" : "Save Service"}
                 </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Bulk Price Update Modal */}
      <AnimatePresence>
        {isBulkUpdateOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkUpdateOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-5 border-b border-brand-border bg-brand-primary/50">
                <h3 className="font-heading font-bold text-xl text-text-main flex items-center gap-2">
                  <Percent size={20} className="text-brand-accent" /> Bulk Price Update
                </h3>
              </div>
              
              <div className="p-6">
                 <div className="mb-4 text-sm text-text-muted flex items-start gap-2 bg-brand-primary p-3 rounded-xl border border-brand-border">
                    <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p>This will increase or decrease the prices of <strong>ALL</strong> packages across <strong>ALL</strong> services by the percentage you specify.</p>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main">Percentage Value (%)</label>
                    <div className="relative">
                       <input 
                         type="number"
                         placeholder="e.g. 40"
                         value={bulkPercentage}
                         onChange={(e) => setBulkPercentage(e.target.value)}
                         className="w-full bg-brand-primary border border-brand-border rounded-xl px-4 py-3 text-lg font-medium text-text-main focus:outline-none focus:border-brand-accent/50"
                       />
                       <span className="absolute right-4 top-3 text-text-muted font-medium">%</span>
                    </div>
                    <p className="text-xs text-text-muted">Enter a positive number to increase, negative to decrease. Example: 40 will make a ₹100 package cost ₹140.</p>
                 </div>
              </div>

              <div className="p-5 border-t border-brand-border bg-brand-primary/50 flex justify-end gap-3">
                 <button 
                   onClick={() => setIsBulkUpdateOpen(false)}
                   className="px-4 py-2 bg-brand-surface border border-brand-border text-text-main hover:bg-brand-border rounded-xl font-medium transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleBulkUpdate}
                   className="px-5 py-2 bg-brand-accent text-brand-primary hover:bg-brand-accent-hover rounded-xl font-bold transition-all"
                 >
                   Apply Update
                 </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
