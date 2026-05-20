import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      if (email === 'marateyh@gmail.com' || email === process.env.VITE_ADMIN_EMAIL_OVERRIDE) {
        navigate('/admin/professional');
      } else {
        navigate(returnTo);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      import('../lib/firebase').then(({ auth }) => {
        if (auth.currentUser?.email === 'marateyh@gmail.com' || auth.currentUser?.email === process.env.VITE_ADMIN_EMAIL_OVERRIDE) {
          navigate('/admin/professional');
        } else {
          navigate(returnTo);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-brand-accent mb-2">Welcome Back</h1>
          <p className="text-text-muted">Sign in to your Growplex account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-primary border border-brand-border rounded-lg pl-10 pr-4 py-3 text-text-main focus:outline-none focus:border-brand-accent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-primary border border-brand-border rounded-lg pl-10 pr-4 py-3 text-text-main focus:outline-none focus:border-brand-accent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent text-brand-primary font-bold py-3 rounded-lg hover:bg-brand-accent-hover transition flex justify-center items-center gap-2 mt-2"
          >
            {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px bg-brand-border flex-1"></div>
          <span className="text-xs text-text-muted uppercase tracking-wider">OR</span>
          <div className="h-px bg-brand-border flex-1"></div>
        </div>

        <button 
          onClick={handleGoogle}
          className="w-full mt-6 bg-brand-primary border border-brand-border hover:bg-brand-border/50 text-text-main font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-text-muted">
          Don't have an account? <Link to="/signup" className="text-brand-accent hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}

