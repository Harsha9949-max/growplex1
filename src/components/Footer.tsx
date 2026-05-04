import { Facebook, Instagram, Send, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-12 sm:pt-20 pb-8 sm:pb-10 px-4 border-t border-brand-border text-text-main">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-10 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:pr-8">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Growplex" className="w-8 h-8" />
              <h2 className="text-2xl font-bold font-heading text-brand-accent">Growplex</h2>
            </Link>
            <p className="text-text-muted mb-3 sm:mb-4 leading-relaxed text-xs sm:text-sm">
              The cheapest SMM panel in the world. No login required. Instant delivery of Instagram followers, YouTube subscribers, Telegram members & more. A product of <strong className="text-text-main">HVRS Innovations</strong>.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mb-6">
              <a href="https://www.instagram.com/growplex.sbs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-text-muted hover:text-brand-accent hover:border-brand-accent/50 transition-all" aria-label="Growplex Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/share/1AaqiFb82m/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-text-muted hover:text-brand-accent hover:border-brand-accent/50 transition-all" aria-label="Growplex Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://youtube.com/@growplexsbs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-text-muted hover:text-brand-accent hover:border-brand-accent/50 transition-all" aria-label="Growplex YouTube">
                <Youtube size={18} />
              </a>
            </div>
            <p className="text-xs text-text-muted">
              🌍 We serve worldwide: India, USA, UK, Brazil, Nigeria, UAE, and 50+ countries.
            </p>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold sm:font-bold text-sm sm:text-lg mb-3 sm:mb-6 text-text-main">Services</h3>
            <ul className="space-y-2 sm:space-y-3 text-text-muted text-xs sm:text-sm">
              <li><Link to="/services" className="hover:text-brand-accent transition-colors">Instagram Followers</Link></li>
              <li><Link to="/services" className="hover:text-brand-accent transition-colors">Instagram Likes</Link></li>
              <li><Link to="/services" className="hover:text-brand-accent transition-colors">YouTube Subscribers</Link></li>
              <li><Link to="/services" className="hover:text-brand-accent transition-colors">YouTube Views</Link></li>
              <li><Link to="/services" className="hover:text-brand-accent transition-colors">Telegram Members</Link></li>
              <li><Link to="/services" className="hover:text-brand-accent transition-colors">View All Services →</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold sm:font-bold text-sm sm:text-lg mb-3 sm:mb-6 text-text-main">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3 text-text-muted text-xs sm:text-sm">
              <li><Link to="/how-it-works" className="hover:text-brand-accent transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-accent transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-brand-accent transition-colors">FAQ</Link></li>
              <li><Link to="/blog" className="hover:text-brand-accent transition-colors">Blog</Link></li>
              <li><Link to="/about" className="hover:text-brand-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="font-heading font-semibold sm:font-bold text-sm sm:text-lg mb-3 sm:mb-6 text-text-main">Legal</h3>
            <ul className="space-y-2 sm:space-y-3 text-text-muted text-xs sm:text-sm mb-6 sm:mb-8">
              <li><Link to="/privacy-policy" className="hover:text-brand-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-brand-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-brand-accent transition-colors">Refund & Refill Policy</Link></li>
            </ul>
            <h3 className="font-heading font-semibold sm:font-bold text-sm sm:text-lg mb-3 sm:mb-4 text-text-main">Contact</h3>
            <ul className="space-y-2 sm:space-y-3 text-text-muted text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Send size={14} className="text-brand-accent flex-shrink-0" />
                <span>support@growplex.sbs</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border text-center text-text-muted text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Growplex by HVRS Innovations. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-brand-accent transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-brand-accent transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-brand-accent transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
