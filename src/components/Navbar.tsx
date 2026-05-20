import { Lock, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userProfile, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-brand-primary/80 border-b border-brand-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-bold font-heading text-brand-accent tracking-tighter flex items-center gap-2">
              <img src="/logo.svg" alt="Growplex Level Up" className="w-8 h-8" />
              Growplex
            </Link>
          </div>
          
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

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-colors"
                >
                  <User size={16} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-main">{userProfile?.name || 'Account'}</span>
                  <ChevronDown size={14} className="text-text-muted" />
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-xl shadow-xl overflow-hidden py-1"
                    >
                      <Link 
                        to="/orders" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-text-main hover:bg-brand-primary transition-colors"
                      >
                        Order History
                      </Link>
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-brand-primary transition-colors flex items-center gap-2"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="text-text-muted hover:text-text-main font-medium text-sm px-4 py-2 rounded-lg hover:bg-brand-surface transition-colors"
              >
                Login
              </Link>
            )}

            <Link 
              to="/services" 
              className="bg-brand-accent text-brand-primary px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent-hover hover:shadow-[0_0_15px_rgba(232,184,75,0.4)] transition-all duration-300 text-sm"
            >
              Start Growth Now
            </Link>
          </div>

          <button 
            className="md:hidden text-text-main p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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

                <div className="h-px bg-brand-border my-2 mx-4" />
                
                {currentUser ? (
                  <>
                    <Link
                      to="/orders"
                      className="px-4 py-3 rounded-lg font-medium text-text-main hover:bg-brand-surface flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} className="text-brand-accent" />
                      Order History
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-500/10 text-left flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-3 rounded-lg font-medium text-text-main hover:bg-brand-surface"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}

                <Link 
                  to="/services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-brand-accent text-brand-primary px-6 py-3 rounded-xl font-bold text-center mt-3 min-h-[48px] flex items-center justify-center"
                >
                  Start Growth Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
