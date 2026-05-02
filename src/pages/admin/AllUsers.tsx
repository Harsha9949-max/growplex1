import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  User as UserIcon, 
  Wallet, 
  Plus, 
  MoreVertical,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Lock,
  Unlock,
  Clock
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Transaction } from '../../types';
import { formatINR, OperationType } from '../../lib/utils';
import { handleFirestoreError } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const AllUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [addAmount, setAddAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddFunds = async () => {
    if (!selectedUser || !addAmount) return;
    const amount = parseFloat(addAmount);
    if (isNaN(amount)) return toast.error('Invalid amount');

    setProcessing(true);
    try {
      // 1. Update user balance
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        walletBalance: increment(amount)
      });

      // 2. Create transaction record
      const txId = doc(collection(db, 'transactions')).id;
      const transaction: Transaction = {
        id: txId,
        userId: selectedUser.uid,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, 'transactions', txId), transaction);

      toast.success(`₹${amount} added to ${selectedUser.username}'s wallet`);
      setSelectedUser(null);
      setAddAmount('');
    } catch (error) {
      toast.error('Failed to add funds');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
      toast.success(`${user.username} is now an ${newRole}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleApprovePartner = async (user: UserProfile) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        partnerApproved: true,
      });
      toast.success(`✅ ${user.username} approved as Partner!`);
    } catch (error) {
      toast.error('Failed to approve Partner');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.uid.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Users</h2>
          <p className="text-slate-400 mt-1">View and manage all registered platform users.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-[#1A193D] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#1A193D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">User Info</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">User Type</th>
                <th className="px-6 py-4 font-bold">Venture</th>
                <th className="px-6 py-4 font-bold">Wallet</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <UserIcon size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{user.fullName || user.username}</span>
                          <span className="text-[10px] text-slate-500">{user.email || user.phone}</span>
                        </div>
                      </div>
                    </td>
                    {/* System Role */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all",
                          user.role === 'admin' 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}
                      >
                        {user.role === 'admin' && <Shield size={10} />}
                        {user.role}
                      </button>
                    </td>
                    {/* User Type + Partner Status */}
                    <td className="px-6 py-4">
                      {user.userType ? (
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1.5 w-fit",
                            user.userType === 'content_creator' ? 'bg-[#E8B84B]/10 text-[#E8B84B] border-[#E8B84B]/20' :
                            user.userType === 'promoter' ? 'bg-[#00C9A7]/10 text-[#00C9A7] border-[#00C9A7]/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          )}>
                            {user.userType === 'partner' && (
                              user.partnerApproved ? <Unlock size={10} /> : <Lock size={10} />
                            )}
                            {user.userType.replace('_', ' ')}
                          </span>
                          {user.userType === 'partner' && (
                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                              user.partnerApproved ? 'text-brand-teal' : 'text-amber-400'
                            }`}>
                              {user.partnerApproved ? '✅ Approved' : '🟡 Pending Review'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    {/* Venture */}
                    <td className="px-6 py-4">
                      {user.venture ? (
                        <span className="text-xs font-bold text-brand-gold">{user.venture}</span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    {/* Wallet */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-400">{formatINR(user.walletBalance)}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-brand-gold/20 text-slate-400 hover:text-brand-gold transition-all border border-white/10"
                          title="Add Funds"
                        >
                          <Plus size={16} />
                        </button>
                        {/* Partner Approve Button */}
                        {user.userType === 'partner' && !user.partnerApproved && (
                          <button
                            onClick={() => handleApprovePartner(user)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all border border-amber-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                            title="Approve Partner"
                          >
                            <CheckCircle2 size={12} />
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1A193D] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                  <Wallet size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Add Funds to Wallet</h3>
                <p className="text-slate-400 text-sm mt-1">User: {selectedUser.username}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="Enter amount to add"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFunds}
                    disabled={processing || !addAmount}
                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default AllUsers;
