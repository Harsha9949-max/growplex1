import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Camera, 
  Mail, 
  Phone,
  FileText,
  ChevronRight,
  LogOut,
  Moon,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: ShieldCheck, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
         <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mission <span className="text-brand-gold">Settings</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Customize your professional identity and security.</p>
        </div>
        <button 
          onClick={() => signOut()}
          className="px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
        >
          <LogOut size={14} />
          Terminal Exit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl border transition-all ${
                activeTab === tab.id 
                ? 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="ml-auto w-1 h-1 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(232,184,75,1)]" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="glass-card bg-brand-card/20 border border-white/5 rounded-[2.5rem] p-12 shadow-3xl">
            {activeTab === 'profile' && (
              <div className="space-y-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 pb-12 border-b border-white/5">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="opacity-50" />
                      )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-brand-gold text-black shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{userProfile?.fullName || userProfile?.username}</h3>
                    <p className="text-brand-gold font-bold uppercase tracking-widest text-[10px] mt-1">{userProfile?.userType?.replace('_', ' ') || 'Gig Professional'}</p>
                    <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                      <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">KYC VERIFIED</span>
                      <span className="px-4 py-1.5 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-[9px] font-black text-brand-teal uppercase tracking-widest">PARTNER</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2">
                      <User size={12} /> Legal Full Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={userProfile?.fullName}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white font-medium focus:border-brand-gold/30 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2">
                      <Mail size={12} /> Contact Email
                    </label>
                    <input 
                      type="email" 
                      defaultValue={userProfile?.email}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white font-medium focus:border-brand-gold/30 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2">
                      <Phone size={12} /> Phone Intel
                    </label>
                    <input 
                      type="text" 
                      defaultValue={userProfile?.phone}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white font-medium focus:border-brand-gold/30 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-2">
                      <Globe size={12} /> Venture Portfolio
                    </label>
                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-brand-gold font-black uppercase tracking-widest text-[10px]">
                      {userProfile?.venture || 'Global Network'}
                    </div>
                  </div>
                </div>

                <div className="pt-8 text-right">
                  <button className="px-10 py-4 rounded-2xl bg-brand-gold text-black font-black uppercase tracking-widest text-[10px] shadow-[0_10px_30px_rgba(232,184,75,0.3)] hover:scale-105 transition-all">
                    Update Professional Hub
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-12">
                 <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Financial <span className="text-brand-gold">Security</span></h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage your withdrawal credentials & access.</p>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                             <CreditCard size={20} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-widest">Withdrawal Method</p>
                             <p className="text-[10px] text-slate-500 mt-1">UPI: {userProfile?.upiId || 'Not Configured'}</p>
                          </div>
                       </div>
                       <button className="text-brand-gold text-[10px] font-black uppercase tracking-widest">Update</button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-brand-teal/10 text-brand-teal">
                             <ShieldCheck size={20} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-widest">KYC Status</p>
                             <p className="text-[10px] text-slate-500 mt-1">Identity Verified (Aadhaar / PAN)</p>
                          </div>
                       </div>
                       <span className="text-brand-teal text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Channel <span className="text-brand-gold">Preferences</span></h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Control how missions alerts reach you.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Push Notifications', desc: 'Instant browser alerts for task approvals.' },
                    { label: 'System Alerts', desc: 'In-app notification center updates.' },
                    { label: 'Marketing Insights', desc: 'Bonus opportunities and venture updates.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">{item.label}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-brand-gold p-1 flex justify-end items-center">
                        <div className="w-4 h-4 rounded-full bg-black" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
