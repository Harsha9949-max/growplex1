import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Lock, ChevronDown } from "lucide-react";

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-brand-primary/80 border-b border-brand-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo + No Login Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-bold font-heading text-brand-accent tracking-tighter flex items-center gap-2">
              <img src="/logo.png" alt="Growplex - Cheapest SMM Panel" className="w-8 h-8 object-contain" width="32" height="32" />
              Growplex
            </Link>
            <span className="hidden lg:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent px-2.5 py-1 rounded-full border border-brand-accent/20">
              <Lock size={10} /> No Login
            </span>
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
            <Link 
              to="/services" 
              className="bg-brand-accent text-brand-primary px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent-hover hover:shadow-[0_0_15px_rgba(232,184,75,0.4)] transition-all duration-300 text-sm"
            >
              Start Growth Now
            </Link>
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
