import { Lock, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/blog", label: "Blog" },
  { to: "/support", label: "Support" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-brand-primary/80 border-b border-brand-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-bold font-heading text-brand-accent tracking-tighter flex items-center gap-2">
              <img src="/logo.svg" alt="Growplex Level Up" className="w-8 h-8" />
              Growplex
            </Link>
            {currentUser ? (
              <span className="hidden lg:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full border border-green-500/20">
                 {userProfile?.username || "Logged in"}
              </span>
            ) : (
              <span className="hidden lg:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent px-2.5 py-1 rounded-full border border-brand-accent/20">
                <Lock size={10} /> Secure
              </span>
            )}
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-brand-accent bg-brand-accent/10"
                    : "text-text-muted hover:text-text-main hover:bg-brand-surface"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <Link
                  to={
                    isAdmin 
                      ? "/admin/dashboard" 
                      : (userProfile?.role === 'team_member' || userProfile?.role === 'influencer')
                        ? "/team/dashboard"
                        : "/dashboard"
                  }
                  className="text-text-muted hover:text-brand-accent px-3 py-2 text-sm font-bold transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-muted hover:text-brand-accent px-3 py-2 text-sm font-bold transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/login" 
                  className="bg-brand-accent text-brand-primary px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent-hover hover:shadow-[0_0_15px_rgba(232,184,75,0.4)] transition-all duration-300 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-text-main p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-brand-border bg-brand-primary"
            >
              <div className="px-4 pt-2 pb-6 flex flex-col gap-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-3 rounded-lg font-medium min-h-[48px] flex items-center transition-colors ${
                      isActive(link.to)
                        ? "text-brand-accent bg-brand-accent/10"
                        : "text-text-muted hover:text-text-main hover:bg-brand-surface"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {currentUser ? (
                  <>
                    <Link
                      to={
                        isAdmin 
                          ? "/admin/dashboard" 
                          : (userProfile?.role === 'team_member' || userProfile?.role === 'influencer')
                            ? "/team/dashboard"
                            : "/dashboard"
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg font-medium text-brand-accent bg-brand-accent/10 min-h-[48px] flex items-center mt-3"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="bg-red-500/10 text-red-500 px-6 py-3 rounded-xl font-bold text-center mt-3 min-h-[48px] flex items-center justify-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-brand-accent border border-brand-accent/30 px-6 py-3 rounded-xl font-bold text-center mt-3 min-h-[48px] flex items-center justify-center"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-brand-accent text-brand-primary px-6 py-3 rounded-xl font-bold text-center mt-3 min-h-[48px] flex items-center justify-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
