import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { Edit2, Plus, Shield, ShieldAlert, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";
import firebaseConfig from "../../firebase-applet-config.json";
import { toast } from "react-hot-toast";

interface AdminUser {
  id: string;
  name: string;
  fullName: string;
  email?: string;
  role: "admin" | "team_member" | "influencer" | string;
  commissionPercentage?: number;
  influencerName?: string;
  createdAt?: any;
}

const ROLE_OPTIONS = ["admin", "team_member", "influencer"];

export default function AdminRoles() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    email: "",
    password: "",
    commissionPercentage: 10,
    role: "team_member" as "admin" | "team_member" | "influencer",
    clonedPages: [] as string[],
    influencerName: ""
  });

  const availableAdminPages = [
    { name: "Orders", path: "/admin/orders" },
    { name: "Services", path: "/admin/services" },
    { name: "Payments", path: "/admin/payments" },
    { name: "Customers", path: "/admin/customers" },
    { name: "Offers", path: "/admin/offers" },
  ];

  useEffect(() => {
    // Fetch users with roles
    const q = query(collection(db, "users"), where("role", "in", ["admin", "team_member", "influencer"]));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: AdminUser[] = [];
      snapshot.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as AdminUser);
      });
      setUsers(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch admin users:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setFormData({
        id: user.id || "",
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        password: "", // do not show password edit
        commissionPercentage: user.commissionPercentage || 10,
        role: (user.role as any) || "team_member",
        clonedPages: (user as any).clonedPages || [],
        influencerName: user.influencerName || ""
      });
    } else {
      setFormData({
        id: "",
        fullName: "",
        email: "",
        password: "",
        commissionPercentage: 10,
        role: "team_member",
        clonedPages: [],
        influencerName: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.fullName || !formData.email || !formData.role) return toast.error("Name, email and role are required");
    
    const sanitizedName = formData.role === "influencer"
      ? formData.influencerName.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
      : "";

    if (formData.role === "influencer" && !sanitizedName) {
      toast.error("A valid alphanumeric Special Name / Promo Code is required for influencers");
      return;
    }

    setIsCreating(true);
    try {
      let uid = formData.id;

      if (!uid) {
        if (!formData.password) {
           toast.error("Password is required for new accounts");
           setIsCreating(false);
           return;
        }
        if (formData.password.length < 6) {
           toast.error("Password should be at least 6 characters");
           setIsCreating(false);
           return;
        }

        // Create user via identitytoolkit REST API to avoid signing out the current admin
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             email: formData.email,
             password: formData.password,
             returnSecureToken: false
           })
        });

        const data = await res.json();
        
        if (!res.ok) {
           let errMsg = "Failed to create user account";
           if (data.error?.message?.includes("WEAK_PASSWORD")) {
             errMsg = "Password should be at least 6 characters";
           } else if (data.error?.message?.includes("OPERATION_NOT_ALLOWED")) {
             errMsg = "Email/Password sign-in is not enabled in Firebase Console.";
           } else if (data.error?.message?.includes("EMAIL_EXISTS")) {
             errMsg = "The email address is already in use by another account.";
           } else if (data.error?.message) {
             errMsg = data.error.message;
           }
           throw new Error(errMsg);
        }
        
        uid = data.localId;
      }
      
      const docRef = doc(db, "users", uid);
      
      await setDoc(docRef, {
        uid: uid,
        fullName: formData.fullName,
        username: formData.email.split('@')[0],
        email: formData.email,
        role: formData.role,
        commissionPercentage: formData.commissionPercentage,
        clonedPages: formData.clonedPages,
        influencerName: sanitizedName,
        updatedAt: serverTimestamp(),
        ...(!formData.id && { 
            createdAt: serverTimestamp(),
            wallets: { earned: 0, pending: 0, bonus: 0, savings: 0 }
        })
      }, { merge: true });
      
      toast.success("User saved successfully");
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to remove this user's access?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        toast.success("User access removed");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") return <Shield size={18} className="text-purple-500" />;
    if (role === "team_member") return <Users size={18} className="text-blue-500" />;
    return <Users size={18} className="text-teal-500" />;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Team & Roles</h1>
          <p className="text-text-muted text-sm mt-1">Manage team members, influencers, and administrators</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-accent text-brand-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent-hover transition-colors"
        >
          <Plus size={18} /> Add Team Member
        </button>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-500/10 rounded-lg"><Shield size={24} className="text-purple-500"/></div>
          <div>
            <h4 className="font-bold text-text-main text-sm">Administrator</h4>
            <p className="text-xs text-text-muted">Full access to all system modules.</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 rounded-lg"><Users size={24} className="text-blue-500"/></div>
          <div>
            <h4 className="font-bold text-text-main text-sm">Team Member</h4>
            <p className="text-xs text-text-muted">Earns commission. Has access to the Team Dashboard.</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-teal-500/10 rounded-lg"><Users size={24} className="text-teal-500"/></div>
          <div>
            <h4 className="font-bold text-text-main text-sm">Influencer</h4>
            <p className="text-xs text-text-muted">Marketing partners with custom metrics.</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-brand-border">
          <h3 className="font-heading font-bold text-lg">System Users</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Commission</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">No team members found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-brand-primary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main">{user.fullName || user.name || "N/A"}</td>
                    <td className="px-6 py-4 text-text-muted">{user.email || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium text-text-main capitalize">
                          {user.role?.replace('_', ' ')}
                          {user.role === "influencer" && user.influencerName && (
                            <span className="text-xs bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded ml-2 uppercase font-mono tracking-wider">
                              {user.influencerName}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-text-main font-bold">
                      {user.commissionPercentage ? `${user.commissionPercentage}%` : "0%"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="text-text-muted hover:text-brand-accent transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-text-muted hover:text-red-500 transition-colors"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-brand-border flex justify-between items-center bg-brand-primary/50">
              <h3 className="font-heading font-bold text-xl text-text-main">
                {formData.id ? "Edit User" : "Add Team Member"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 appearance-none capitalize"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
                <p className="text-xs text-brand-accent mt-1">Select if they are team members or influencers</p>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50" 
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Email (Login ID)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled={!!formData.id}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 disabled:opacity-50" 
                  placeholder="user@example.com"
                />
              </div>
              
              {!formData.id && (
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Initial Password</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50" 
                    placeholder="Enter start password"
                  />
                </div>
              )}

              {(formData.role === "team_member" || formData.role === "influencer") && (
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Commission Percentage</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={formData.commissionPercentage}
                      onChange={e => setFormData({...formData, commissionPercentage: parseFloat(e.target.value) || 0})}
                      className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 pl-10 text-text-main focus:outline-none focus:border-brand-accent/50" 
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Their cut of the net profit generated.</p>
                </div>
              )}

              {formData.role === "influencer" && (
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1 block">Special Influencer Name (Promo Code)</label>
                  <input 
                    type="text" 
                    value={formData.influencerName}
                    onChange={e => setFormData({...formData, influencerName: e.target.value})}
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 font-bold text-brand-accent placeholder:font-normal placeholder:text-slate-600" 
                    placeholder="e.g. coolcreator (alphanumeric, no spaces)"
                  />
                  <p className="text-xs text-text-muted mt-1">Customers enter this Special Name at checkout to attribute sales to this influencer.</p>
                </div>
              )}

              {/* Cloned Admin Pages Checkboxes */}
              {(formData.role === 'team_member' || formData.role === 'influencer' || formData.role === 'admin') && (
                <div className="pt-2 border-t border-brand-border/50">
                  <label className="text-sm font-medium text-text-muted mb-2 block">Clone Admin Pages to Team Panel</label>
                  <p className="text-xs text-slate-500 mb-3">Ticked pages will instantly reflect under their team sidebar.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAdminPages.map(page => (
                      <label key={page.path} className="flex items-center gap-2 p-2 hover:bg-white/[0.02] rounded cursor-pointer transition-colors border border-brand-border/30">
                        <input 
                          type="checkbox"
                          checked={(formData.clonedPages || []).includes(page.path)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, clonedPages: [...(prev.clonedPages || []), page.path] }));
                            } else {
                              setFormData(prev => ({ ...prev, clonedPages: (prev.clonedPages || []).filter(p => p !== page.path) }));
                            }
                          }}
                          className="rounded border-brand-border bg-brand-surface text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-primary"
                        />
                        <span className="text-sm text-slate-300">{page.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-brand-border bg-brand-primary/50 flex justify-end gap-3">
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="px-5 py-2.5 bg-brand-surface border border-brand-border text-text-main hover:bg-brand-border rounded-xl font-medium transition-all"
               >
                 Cancel
               </button>
               <button 
                 disabled={isCreating}
                 onClick={handleSaveUser}
                 className="px-6 py-2.5 bg-brand-accent text-brand-primary hover:bg-brand-accent-hover rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
               >
                 {isCreating && <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>}
                 {formData.id ? "Update User" : "Create User"}
               </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
