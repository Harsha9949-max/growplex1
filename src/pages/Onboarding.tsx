import { Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  CreditCard,
  FileCheck,
  Fingerprint,
  Globe,
  Lock,
  Megaphone,
  PenTool,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../lib/firebase';
import { encryptData, generateDeviceFingerprint } from '../lib/security';

const ventures = [
  { id: 'BuyRix', name: 'BuyRix', desc: 'Social Media Growth & Influencer Marketing', icon: Zap, color: '#E8B84B', bg: 'bg-[#E8B84B]/10', border: 'border-[#E8B84B]/20' },
  { id: 'Vyuma', name: 'Vyuma', desc: 'Content Creation & Brand Storytelling', icon: PenTool, color: '#00C9A7', bg: 'bg-[#00C9A7]/10', border: 'border-[#00C9A7]/20' },
  { id: 'TrendyVerse', name: 'TrendyVerse', desc: 'Fashion, Lifestyle & Viral Trend Content', icon: Sparkles, color: '#A855F7', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'Growplex', name: 'Growplex', desc: 'Digital Marketing & Lead Generation', icon: TrendingUp, color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
];

const userTypes = [
  { id: 'content_creator', name: 'Content Creator', commission: 'Up to 15%', commissionRate: 15, desc: 'Create content, promote products and earn.', icon: PenTool, color: '#E8B84B', bg: 'bg-[#E8B84B]/10', border: 'border-[#E8B84B]/20', badge: '15% Comm.' },
  { id: 'promoter', name: 'Promoter', commission: 'Up to 10%', commissionRate: 10, desc: 'Share links, run campaigns and refer.', icon: Megaphone, color: '#00C9A7', bg: 'bg-[#00C9A7]/10', border: 'border-[#00C9A7]/20', badge: '10% Comm.' },
  { id: 'partner', name: 'Partner', commission: 'Premium', commissionRate: 25, desc: 'Exclusive access. Needs Admin approval.', icon: Globe, color: '#94A3B8', bg: 'bg-slate-500/10', border: 'border-slate-500/20', locked: true, badge: 'Req. Approval' },
];

const Onboarding: React.FC = () => {
  const { currentUser, userProfile, updateOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    venture: userProfile?.venture || '',
    userType: userProfile?.userType || '',
    photoURL: userProfile?.photoURL || '',
    aadhaar: '',
    pan: '',
    upiId: userProfile?.paymentInfo?.upiId || '',
    bankName: userProfile?.paymentInfo?.bankName || '',
    accountNumber: userProfile?.paymentInfo?.accountNumber || '',
    ifscCode: userProfile?.paymentInfo?.ifscCode || '',
    isDigitalAgreementSigned: userProfile?.isDigitalAgreementSigned || false,
  });

  const handleNext = async () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const fingerprint = await generateDeviceFingerprint();
        const encryptedAadhaar = await encryptData(formData.aadhaar, currentUser!.uid);
        const encryptedPan = await encryptData(formData.pan, currentUser!.uid);

        const isPartner = formData.userType === 'partner';
        
        await updateOnboarding({
          fullName: formData.fullName,
          venture: formData.venture as any,
          userType: formData.userType as any,
          photoURL: formData.photoURL,
          deviceFingerprint: fingerprint,
          kyc: {
            aadhaar: encryptedAadhaar,
            pan: encryptedPan
          },
          paymentInfo: {
            upiId: formData.upiId,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode
          },
          isDigitalAgreementSigned: formData.isDigitalAgreementSigned,
          onboardingStep: 7,
          onboardingStatus: 'completed',
          partnerApproved: isPartner ? false : undefined,
          partnerAppliedAt: isPartner ? Timestamp.now() : undefined,
          signingBonus: 27,
          wallets: { earned: 0, pending: 27, bonus: 0, savings: 0 }
        });

        toast.success(isPartner ? 'Application Submitted!' : '🎉 Welcome to WorkPlex! Rs.27 Bonus Added!');
        navigate('/dashboard');
      } catch (error) {
        console.error(error);
        toast.error('Onboarding failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${currentUser.uid}/profile_pic`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData({ ...formData, photoURL: url });
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isNextDisabled = () => {
    if (loading || uploading) return true;
    switch (step) {
      case 1: return !formData.fullName.trim();
      case 2: return !formData.venture;
      case 3: return !formData.userType;
      case 4: return !formData.photoURL;
      case 5: return formData.aadhaar.length < 12 || formData.pan.length < 10;
      case 6: return !formData.upiId.trim() || !formData.bankName.trim() || !formData.accountNumber.trim();
      case 7: return !formData.isDigitalAgreementSigned;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
                <User size={32} className="text-brand-gold" />
              </div>
              <h2 className="text-2xl font-black text-white italic">Who are you?</h2>
              <p className="text-slate-400 mt-1">Start with your professional identity.</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-gold mb-2 ml-1">Full Name (Bank Records)</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-brand-gold transition-all"
                placeholder="Enter full legal name"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-teal/20">
                <Briefcase size={32} className="text-brand-teal" />
              </div>
              <h2 className="text-2xl font-black text-white italic">Select Venture</h2>
              <p className="text-slate-400 mt-1">Choose your primary ecosystem.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ventures.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setFormData({ ...formData, venture: v.id as any })}
                  className={`p-5 rounded-2xl border-2 transition-all text-left ${formData.venture === v.id ? `${v.bg} border-brand-gold shadow-lg` : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                >
                  <v.icon size={24} style={{ color: v.color }} className="mb-3" />
                  <h3 className="text-white font-black mb-1 text-sm uppercase tracking-widest">{v.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
                <TrendingUp size={32} className="text-brand-gold" />
              </div>
              <h2 className="text-2xl font-black text-white italic">Choose Your Role</h2>
              <p className="text-slate-400 mt-1">How will you earn within WorkPlex?</p>
            </div>
            <div className="space-y-4">
              {userTypes.map((ut) => (
                <button
                  key={ut.id}
                  onClick={() => setFormData({ ...formData, userType: ut.id as any })}
                  className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${formData.userType === ut.id ? `${ut.bg} border-brand-gold` : 'bg-white/[0.02] border-white/5'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ut.bg} border ${ut.border}`}>
                    <ut.icon size={20} style={{ color: ut.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-black text-sm uppercase tracking-widest">{ut.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/10 text-brand-gold`}>{ut.badge}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{ut.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-teal/20">
                <Camera size={32} className="text-brand-teal" />
              </div>
              <h2 className="text-2xl font-black text-white italic">Profile Photo</h2>
              <p className="text-slate-400 mt-1">A professional photo increases trust.</p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-2 border-brand-gold/50 overflow-hidden bg-white/5 flex items-center justify-center">
                  {formData.photoURL ? (
                    <img src={formData.photoURL} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <User size={48} className="text-slate-600" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-[#0A0A0A] shadow-lg hover:scale-110 transition-transform"
                >
                  <Upload size={18} />
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              <p className="text-xs text-slate-500">Max 2MB. JPG or PNG. Face must be clearly visible.</p>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
                <Fingerprint size={32} className="text-brand-gold" />
              </div>
              <h2 className="text-2xl font-black text-white italic">Identity Verification</h2>
              <p className="text-slate-400 mt-1 text-sm">Encrypted storage. Verified by HVRS Innovations.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#555] mb-2 ml-1">Aadhaar Number (12 Digits)</label>
                <input
                  type="text"
                  maxLength={12}
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white tracking-[0.3em] font-black focus:border-brand-gold transition-all"
                  placeholder="0000 0000 0000"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#555] mb-2 ml-1">PAN Card Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white tracking-[0.2em] font-black focus:border-brand-gold transition-all"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl flex gap-3">
                <Lock size={16} className="text-brand-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-brand-gold/70 leading-relaxed italic">Your data is AES-256 encrypted client-side. Even HVRS admins can't see your full numbers without decryption authorization.</p>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-teal/20">
                <CreditCard size={32} className="text-brand-teal" />
              </div>
              <h2 className="text-2xl font-black text-white italic">Payout Settings</h2>
              <p className="text-slate-400 mt-1">Automatic settlements for your earnings.</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-brand-gold transition-all"
                placeholder="UPI ID (e.g. name@okaxis)"
              />
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-brand-gold transition-all"
                placeholder="Bank Name"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-brand-gold transition-all"
                  placeholder="A/C Number"
                />
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-5 text-white focus:border-brand-gold transition-all"
                  placeholder="IFSC Code"
                />
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
                <FileCheck size={32} className="text-brand-gold" />
              </div>
              <h2 className="text-2xl font-black text-white italic">The WorkPlex Contract</h2>
              <p className="text-slate-400 mt-1 uppercase text-[10px] tracking-widest font-bold">Independent Contractor Agreement</p>
            </div>
            <div className="max-h-[220px] overflow-y-auto p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-[12px] text-slate-400 leading-relaxed font-mono">
              <p className="mb-3 text-white font-black">1. Engagement</p>
              <p className="mb-3">Contractor agrees to provide digital services across {formData.venture} platform. No employer-employee relationship exists.</p>
              <p className="mb-3 text-white font-black">2. Payouts & Bonus</p>
              <p className="mb-3">Standard Rs.27 signing bonus applies. Weekly payouts via {formData.upiId}. Minimum withdrawal: Rs.100.</p>
              <p className="mb-3 text-white font-black">3. Privacy & IP</p>
              <p className="mb-3">All work produced is IP of HVRS Innovations. Sensitive data is protected by AES-GCM encryption.</p>
            </div>
            <label className="flex items-center gap-4 p-5 bg-white/[0.03] rounded-2xl border border-white/5 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={formData.isDigitalAgreementSigned}
                onChange={(e) => setFormData({ ...formData, isDigitalAgreementSigned: e.target.checked })}
                className="w-6 h-6 rounded-lg accent-brand-gold" 
              />
              <div>
                <span className="text-sm font-black text-white italic block group-hover:text-brand-gold transition-colors">I Sign Digitally</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Legally binding via IP: {currentUser?.uid.slice(0, 8)}</span>
              </div>
            </label>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const stepLabels = ['Identity', 'Venture', 'Role', 'Profile', 'KYC', 'Payment', 'Legal'];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col p-4 md:p-8 font-sans overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(232,184,75,0.3)]">
              <ShieldCheck size={20} className="text-[#0A0A0A]" strokeWidth={3} />
            </div>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">Work<span className="text-brand-gold">Plex</span></span>
          </div>
          <div className="flex gap-1.5">
            {stepLabels.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === step ? 'w-8 bg-brand-gold' : i + 1 < step ? 'w-4 bg-brand-teal' : 'w-2 bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full relative">
             <div className="glass-card p-8 md:p-10 border border-white/5 rounded-[40px] bg-white/[0.02] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              <div className="mt-10 flex gap-4">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                  className={`flex-[2] py-4.5 rounded-2xl font-black text-lg italic transition-all flex items-center justify-center gap-3 ${step === 7 ? 'bg-gradient-to-r from-brand-teal to-[#10D9B7] text-[#0A0A0A]' : 'bg-brand-gold text-[#0A0A0A]'} disabled:opacity-30 disabled:grayscale`}
                >
                  {loading ? <div className="w-6 h-6 border-3 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" /> : (
                    <>
                      {step === 7 ? (formData.userType === 'partner' ? 'Submit Application' : 'Finalize & Join') : 'Next Step'}
                      <ArrowRight size={20} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-2">Step {step} of 7 — {stepLabels[step - 1]}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <Lock size={10} className="text-slate-500" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">End-to-End Encrypted Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
