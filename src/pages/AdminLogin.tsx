import { collection, getDocs, query, where, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { ArrowRight, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from "../lib/firebase";

export default function AdminLogin() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!p1 || !p2 || !p3) {
      setError("All 3 passwords are required");
      return;
    }

    if (p1.trim() === "HVRS" && p2.trim() === "HVRS" && p3.trim() === "HVRS") {
      const superAdminUser = {
        id: "super-admin-bypass",
        name: "Super Admin (Bypass)",
        role: "Super Admin",
      };
      localStorage.setItem("adminAuth", JSON.stringify(superAdminUser));
      navigate("/admin/dashboard");
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      // Try to query by all 3 fields, might require an index, but zig-zag join often works for simple equality.
      // Alternatively, we can query just by passwordPart1 and filter in memory.
      const q = query(usersRef, where("passwordPart1", "==", p1.trim()));
      const snapshot = await getDocs(q);
      
      let foundUser = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.passwordPart2 === p2.trim() && data.passwordPart3 === p3.trim()) {
          foundUser = { id: doc.id, ...data };
        }
      });

      if (foundUser) {
        localStorage.setItem("adminAuth", JSON.stringify(foundUser));
        
        // Redirect based on role
        if ((foundUser as any).role === "Support") {
          navigate("/admin/orders");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        setError("Invalid security passwords");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("No email associated with Google Account");
      }

      const emailLower = user.email.trim().toLowerCase();
      // Define authorized gmail
      const authorizedAdminEmail = "marateyh@gmail.com";

      if (emailLower === authorizedAdminEmail) {
        // Set up / update their user document in Firestore to be Super Admin
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const profile = {
            uid: user.uid,
            email: user.email,
            fullName: user.displayName || "Super Admin",
            username: user.email.split('@')[0],
            role: "Super Admin",
            wallets: { earned: 0, pending: 0, bonus: 0, savings: 0 },
            signingBonus: 0,
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, profile);
        } else if (userDoc.data()?.role !== "Super Admin" && userDoc.data()?.role !== "admin") {
          await updateDoc(userDocRef, { role: "Super Admin" });
        }

        const superAdminUser = {
          id: user.uid,
          name: user.displayName || "Super Admin",
          role: "Super Admin",
          email: user.email,
        };
        localStorage.setItem("adminAuth", JSON.stringify(superAdminUser));
        navigate("/admin/dashboard");
        return;
      }

      // Check if they are configured as an admin in firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        if (role === "Super Admin" || role === "Sub-Admin" || role === "Support" || role === "admin") {
          const mappedRole = role === "admin" ? "Super Admin" : role;
          const adminObj = {
            id: user.uid,
            name: userData.fullName || user.displayName || "Admin User",
            role: mappedRole,
            email: user.email,
          };
          localStorage.setItem("adminAuth", JSON.stringify(adminObj));
          if (mappedRole === "Support") {
            navigate("/admin/orders");
          } else {
            navigate("/admin/dashboard");
          }
          return;
        }
      }

      // If they are not configured, see if they are in the database by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailLower));
      const querySnapshot = await getDocs(q);
      
      let matchedUser = null;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role === "Super Admin" || data.role === "Sub-Admin" || data.role === "Support" || data.role === "admin") {
          matchedUser = { id: docSnap.id, ...data };
        }
      });

      if (matchedUser) {
        const mappedRole = (matchedUser as any).role === "admin" ? "Super Admin" : (matchedUser as any).role;
        const adminObj = {
          id: (matchedUser as any).id,
          name: (matchedUser as any).fullName || "Admin User",
          role: mappedRole,
          email: user.email,
        };
        localStorage.setItem("adminAuth", JSON.stringify(adminObj));
        if (mappedRole === "Support") {
          navigate("/admin/orders");
        } else {
          navigate("/admin/dashboard");
        }
        return;
      }

      // Deny Google Login if email doesn't match
      setError(`Unauthorized Admin: ${user.email} is not permitted to access this panel.`);
      await signOut(auth);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || "Failed to authenticate with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Back to Home/Login Button */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-md text-sm font-medium"
      >
        <ArrowLeft size={16} /> User Portal
      </Link>

      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#E8B84B]/5 rounded-full blur-[150px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-20 h-20 bg-gradient-to-br from-[#E8B84B] to-[#B88E2F] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(232,184,75,0.3)] rotate-3"
          >
            <ShieldCheck size={40} className="text-[#0A0A0A]" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white mb-3 tracking-tight">
            Admin Auth
          </h1>
          <p className="text-slate-400 font-medium">Enter your 3 security passwords</p>
        </div>

        <div className="glass-card p-8 md:p-10 border border-white/5 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8B84B] mb-2 ml-1">Password 1</label>
              <input
                type="password"
                required
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 flex-1 text-center text-white text-xl tracking-[0.2em] font-black focus:outline-none focus:border-[#E8B84B] transition-all"
                placeholder="***"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8B84B] mb-2 ml-1">Password 2</label>
              <input
                type="password"
                required
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 flex-1 text-center text-white text-xl tracking-[0.2em] font-black focus:outline-none focus:border-[#E8B84B] transition-all"
                placeholder="***"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8B84B] mb-2 ml-1">Password 3</label>
              <input
                type="password"
                required
                value={p3}
                onChange={(e) => setP3(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 flex-1 text-center text-white text-xl tracking-[0.2em] font-black focus:outline-none focus:border-[#E8B84B] transition-all"
                placeholder="***"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-6 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8B84B] to-[#FFD700] transition-transform group-hover:scale-105" />
              <div className="relative py-4 rounded-2xl flex items-center justify-center gap-3 text-[#0A0A0A] font-black text-lg">
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Access Dashboard
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              <span className="bg-[#0A0A0A] px-4 backdrop-blur-md">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                </div>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
