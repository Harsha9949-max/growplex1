import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { Edit2, Plus, Shield, ShieldAlert, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

interface AdminUser {
  id: string;
  name: string;
  passwordPart1: string;
  passwordPart2: string;
  passwordPart3: string;
  role: "Super Admin" | "Sub-Admin" | "Support";
  createdAt?: any;
}

const ROLE_OPTIONS = ["Super Admin", "Sub-Admin", "Support"];

export default function AdminRoles() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    passwordPart1: "",
    passwordPart2: "",
    passwordPart3: "",
    role: "Support" as "Super Admin" | "Sub-Admin" | "Support"
  });

  useEffect(() => {
    // Fetch users with roles
    const q = query(collection(db, "users"), where("role", "in", ["Super Admin", "Sub-Admin", "Support"]));
    
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
        id: user.id,
        name: user.name || "",
        passwordPart1: user.passwordPart1 || "",
        passwordPart2: user.passwordPart2 || "",
        passwordPart3: user.passwordPart3 || "",
        role: user.role
      });
    } else {
      setFormData({
        id: "",
        name: "",
        passwordPart1: "",
        passwordPart2: "",
        passwordPart3: "",
        role: "Support"
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.passwordPart1 || !formData.passwordPart2 || !formData.passwordPart3) return alert("All 3 password parts are required");
    
    try {
      // In a real app, you would also need to create a Firebase Auth user if they don't exist.
      // Here we just manage the roles in the Firestore collection.
      const docId = formData.id || Date.now().toString(); // Generate unique ID
      const docRef = doc(db, "users", docId);
      
      await setDoc(docRef, {
        name: formData.name,
        passwordPart1: formData.passwordPart1,
        passwordPart2: formData.passwordPart2,
        passwordPart3: formData.passwordPart3,
        role: formData.role,
        updatedAt: serverTimestamp(),
        ...(!formData.id && { createdAt: serverTimestamp() })
      }, { merge: true });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user role");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to remove this admin's access?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "Super Admin") return <Shield size={18} className="text-purple-500" />;
    if (role === "Sub-Admin") return <ShieldAlert size={18} className="text-blue-500" />;
    return <Users size={18} className="text-teal-500" />;
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Role & Access Control</h1>
          <p className="text-text-muted text-sm mt-1">Manage admin permissions and assigned roles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-accent text-brand-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent-hover transition-colors"
        >
          <Plus size={18} /> Assign Role
        </button>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-500/10 rounded-lg"><Shield size={24} className="text-purple-500"/></div>
          <div>
            <h4 className="font-bold text-text-main text-sm">Super Admin</h4>
            <p className="text-xs text-text-muted">Full access to all modules and settings.</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 rounded-lg"><ShieldAlert size={24} className="text-blue-500"/></div>
          <div>
            <h4 className="font-bold text-text-main text-sm">Sub-Admin</h4>
            <p className="text-xs text-text-muted">Can manage orders, services, and users.</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-teal-500/10 rounded-lg"><Users size={24} className="text-teal-500"/></div>
          <div>
            <h4 className="font-bold text-text-main text-sm">Support</h4>
            <p className="text-xs text-text-muted">Can only view and process orders.</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-brand-border">
          <h3 className="font-heading font-bold text-lg">System Administrators</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold border-b border-brand-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Passwords</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">No administrators found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-brand-primary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main">{user.name || "N/A"}</td>
                    <td className="px-6 py-4 text-text-muted">
                      {user.passwordPart1 ? "*** *** ***" : "Not Set"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium text-text-main">{user.role}</span>
                      </div>
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
                {formData.id ? "Edit User Role" : "Assign New Role"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50" 
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Security Passwords</label>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    value={formData.passwordPart1}
                    onChange={e => setFormData({...formData, passwordPart1: e.target.value})}
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50" 
                    placeholder="Password 1 (e.g. HVRS)"
                  />
                  <input 
                    type="password" 
                    value={formData.passwordPart2}
                    onChange={e => setFormData({...formData, passwordPart2: e.target.value})}
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50" 
                    placeholder="Password 2 (e.g. HVRS)"
                  />
                  <input 
                    type="password" 
                    value={formData.passwordPart3}
                    onChange={e => setFormData({...formData, passwordPart3: e.target.value})}
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50" 
                    placeholder="Password 3 (e.g. HVRS)"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-brand-accent/50 appearance-none"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-brand-border bg-brand-primary/50 flex justify-end gap-3">
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="px-5 py-2.5 bg-brand-surface border border-brand-border text-text-main hover:bg-brand-border rounded-xl font-medium transition-all"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSaveUser}
                 className="px-6 py-2.5 bg-brand-accent text-brand-primary hover:bg-brand-accent-hover rounded-xl font-bold transition-all"
               >
                 {formData.id ? "Update Role" : "Assign Role"}
               </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
