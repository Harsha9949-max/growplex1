import { ArrowRight, Lock, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginWithEmail, signInWithGoogle, currentUser, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser && userProfile) {
      if (isAdmin || userProfile.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userProfile.role === 'team_member' || userProfile.role === 'influencer') {
        navigate('/team/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, userProfile, isAdmin, navigate, loading]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Logged in with Google');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      <SEO title="Login | Growplex" description="Login securely to your Growplex account." noindex={true} />
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#E8B84B]/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#00C9A7]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <Link to="/">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="w-20 h-20 bg-gradient-to-br from-[#E8B84B] to-[#B88E2F] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(232,184,75,0.3)] rotate-3 cursor-pointer"
            >
              <ShieldCheck size={40} className="text-[#0A0A0A]" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tight italic hover:text-[#E8B84B] transition-colors cursor-pointer">
              GROW<span className="text-[#E8B84B]">PLEX</span>
            </h1>
          </Link>
          <p className="text-slate-400 font-medium">Elevate your hustle. Manage your empire.</p>
        </div>

        <div className="glass-card p-8 md:p-10 border border-white/5 rounded-[32px] bg-white/[0.03] backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8B84B] mb-3 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-white text-lg font-medium focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all placeholder:text-slate-600 group-hover:bg-white/[0.05]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8B84B] mb-3 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-white text-lg font-medium focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all placeholder:text-slate-600 group-hover:bg-white/[0.05]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8B84B] to-[#FFD700] transition-transform group-hover:scale-105" />
              <div className="relative py-4.5 rounded-2xl flex items-center justify-center gap-3 text-[#0A0A0A] font-black text-lg">
                {loading ? (
                  <div className="w-6 h-6 border-3 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
              <span className="bg-[#0A0A0A] px-4 backdrop-blur-md">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
          >
            {googleLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                </div>
                <span>Google</span>
              </>
            )}
          </button>

          <p className="mt-8 text-center text-slate-400 text-sm font-medium px-4">
            Don't have an account? <Link to="/register" className="text-[#E8B84B] hover:underline font-bold">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
