import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Copy, Image as ImageIcon, Link as LinkIcon, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db, storage } from "../lib/firebase";

export interface OfferBanner {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  link: string;
  isActive: boolean;
  createdAt?: any;
}

export default function AdminOffers() {
  const [offers, setOffers] = useState<OfferBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New Offer State
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [offerLink, setOfferLink] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data: OfferBanner[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() } as OfferBanner);
      });
      setOffers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopFile(file);
      setDesktopPreview(URL.createObjectURL(file));
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileFile(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  const activeCount = offers.filter(o => o.isActive).length;

  const handleCreateOffer = async () => {
    if (!desktopFile || !mobileFile) {
      alert("Both desktop and mobile banners are required.");
      return;
    }
    setSaving(true);
    try {
      // Upload Desktop
      const desktopStorageRef = ref(storage, `offer-banners/desktop_${Date.now()}_${desktopFile.name}`);
      await uploadBytes(desktopStorageRef, desktopFile);
      const desktopUrl = await getDownloadURL(desktopStorageRef);

      // Upload Mobile
      const mobileStorageRef = ref(storage, `offer-banners/mobile_${Date.now()}_${mobileFile.name}`);
      await uploadBytes(mobileStorageRef, mobileFile);
      const mobileUrl = await getDownloadURL(mobileStorageRef);

      const canBeActive = activeCount < 3;

      await addDoc(collection(db, "offers"), {
        desktopImageUrl: desktopUrl,
        mobileImageUrl: mobileUrl,
        link: offerLink,
        isActive: canBeActive, // Auto activate if slots are open
        createdAt: serverTimestamp()
      });

      alert("Offer banner added successfully!");
      setIsAdding(false);
      setDesktopFile(null);
      setMobileFile(null);
      setDesktopPreview(null);
      setMobilePreview(null);
      setOfferLink("");
      if (desktopRef.current) desktopRef.current.value = "";
      if (mobileRef.current) mobileRef.current.value = "";
      
      loadOffers();
    } catch (e) {
      console.error(e);
      alert("Error adding offer banner");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (offer: OfferBanner) => {
    if (!offer.isActive && activeCount >= 3) {
      alert("Maximum 3 offers can be active at a time. Disable one first.");
      return;
    }
    
    try {
      await setDoc(doc(db, "offers", offer.id), { isActive: !offer.isActive }, { merge: true });
      loadOffers();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await deleteDoc(doc(db, "offers", id));
      loadOffers();
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Offer Banners</h1>
          <p className="text-text-muted text-sm mt-1">Manage promotional banners for desktop and mobile</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-accent text-brand-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent-hover transition-colors"
        >
          {isAdding ? "Cancel" : <><Plus size={18} /> Add New Offer</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 mb-8 shadow-lg max-w-3xl">
          <h2 className="text-lg font-bold font-heading mb-4">Create New Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Desktop Banner */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Desktop Banner URL (e.g. 1920x400)</label>
              <div 
                onClick={() => desktopRef.current?.click()}
                className="border-2 border-dashed border-brand-border rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent transition-colors bg-brand-primary relative overflow-hidden"
              >
                {desktopPreview ? (
                  <img src={desktopPreview} alt="Desktop Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={24} className="text-text-muted mb-2" />
                    <span className="text-sm font-medium text-text-muted">Click to upload Desktop Banner</span>
                  </>
                )}
              </div>
              <input type="file" ref={desktopRef} className="hidden" accept="image/*" onChange={handleDesktopChange} />
            </div>

            {/* Mobile Banner */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Mobile Banner URL (e.g. 600x400)</label>
              <div 
                onClick={() => mobileRef.current?.click()}
                className="border-2 border-dashed border-brand-border rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent transition-colors bg-brand-primary relative overflow-hidden"
              >
                {mobilePreview ? (
                  <img src={mobilePreview} alt="Mobile Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={24} className="text-text-muted mb-2" />
                    <span className="text-sm font-medium text-text-muted">Click to upload Mobile Banner</span>
                  </>
                )}
              </div>
              <input type="file" ref={mobileRef} className="hidden" accept="image/*" onChange={handleMobileChange} />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-muted mb-2">Target Link (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                value={offerLink}
                onChange={e => setOfferLink(e.target.value)}
                placeholder="/services or https://example.com"
                className="w-full bg-brand-primary border border-brand-border rounded-lg pl-12 pr-4 py-3 text-text-main focus:outline-none focus:border-brand-accent/50"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleCreateOffer}
              disabled={saving || !desktopFile || !mobileFile}
              className="bg-brand-accent text-brand-primary px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Offer"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => (
            <div key={offer.id} className={`bg-brand-surface border ${offer.isActive ? 'border-brand-accent shadow-[0_0_15px_rgba(232,184,75,0.1)]' : 'border-brand-border'} rounded-xl overflow-hidden`}>
               <div className="relative h-32 bg-brand-primary border-b border-brand-border group">
                 {/* Show desktop by default, or mobile via switch? Just show desktop for preview */}
                 <img src={offer.desktopImageUrl} alt="Banner" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">Desktop Preview</span>
                 </div>
               </div>
               <div className="p-4">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold font-heading flex items-center gap-2">
                        Status: 
                        <span className={`px-2 py-0.5 rounded text-xs ${offer.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                      {offer.link && (
                        <p className="text-xs text-text-muted mt-1 truncate max-w-[200px] flex items-center gap-1">
                          <LinkIcon size={12}/> {offer.link}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteOffer(offer.id)}
                      className="text-text-muted hover:text-red-500 transition-colors p-1"
                      title="Delete Offer"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
                 
                 <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                       {offer.isActive ? "Shown to users" : "Hidden"}
                    </span>
                    <button 
                      onClick={() => toggleStatus(offer)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${offer.isActive ? 'bg-brand-accent' : 'bg-brand-border'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${offer.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
               </div>
            </div>
          ))}

          {offers.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-brand-border rounded-xl text-text-muted">
              No offers uploaded yet. Click "Add New Offer" to create one.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
