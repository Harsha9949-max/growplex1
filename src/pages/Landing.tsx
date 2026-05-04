import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans selection:bg-brand-gold/30 selection:text-white">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-gold/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-teal/5 blur-[120px] rounded-full animate-pulse delay-1000" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-brand-bg/80 backdrop-blur-2xl border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-brand-gold/20 group-hover:scale-110 transition-all duration-500">
              <Zap size={22} className="text-black fill-black" />
            </div>
            <span className="text-2xl font-display font-black tracking-tighter text-white">WORKPLEX</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Ventures', 'Tasks', 'Wallet', 'Leaderboard'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-400 hover:text-brand-gold transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-white hover:text-brand-gold transition-colors uppercase tracking-widest">Sign In</Link>
            <Link to="/register" className="gold-gradient text-black px-7 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-gold/10">Start Earning</Link>
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-brand-bg border-b border-brand-border overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6">
                {['Ventures', 'Tasks', 'Wallet', 'Leaderboard'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-slate-400 hover:text-brand-gold transition-colors uppercase tracking-widest"
                  >
                    {item}
                  </a>
                ))}
                <div className="h-px bg-brand-border my-2" />
                <Link to="/login" className="text-lg font-bold text-white uppercase tracking-widest">Sign In</Link>
                <Link to="/register" className="gold-gradient text-black px-6 py-4 rounded-2xl font-black text-center uppercase tracking-widest">Join WorkPlex</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md animate-float">
              <Sparkles size={14} />
              Powered by HVRS Innovations
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white leading-[0.9] tracking-tighter uppercase mb-10">
              Work From Home <br />
              <span className="glow-text italic">Earn Daily</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-14 px-4">
              Join India's most advanced commission-based gig network. 
              Complete simple tasks across multiple ventures and withdraw your earnings daily.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="group relative px-12 py-5 bg-brand-gold rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(232,184,75,0.3)]">
                <span className="relative z-10 text-black font-black uppercase tracking-widest flex items-center gap-3">
                  Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>
              <a href="#ventures" className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/10 hover:border-brand-gold/30 transition-all duration-300 backdrop-blur-md">
                Explore Ventures
              </a>
            </div>
          </motion.div>

          {/* Social Proof / Partners */}
          <div className="mt-32 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-10">Active Ventures</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              {['BuyRix', 'Vyuma', 'TrendyVerse', 'Growplex'].map((venture) => (
                <span key={venture} className="text-2xl font-display font-black tracking-tighter text-white hover:text-brand-gold transition-colors cursor-default">
                  {venture.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split - How it works */}
      <section id="tasks" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none">
                Simple Tasks. <br />
                <span className="text-brand-gold">Real Earnings.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                No complex skills required. Pick tasks from our diverse range of ventures, submit proof of completion, and watch your wallet grow in real-time.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: 'Choose Your Role', desc: 'Content Creator (15%), Promoter (10%), or exclusive Partner tier.' },
                  { title: 'Submit Proof', desc: 'Easy upload system for screenshots, links, and text proof.' },
                  { title: 'Instant Joining Bonus', desc: 'Earn up to Rs.500 in bonuses. Guaranteed Rs.27 credited on signup.*' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] overflow-hidden bg-gradient-to-br from-brand-gold/20 to-brand-teal/20 border border-white/10 backdrop-blur-3xl relative group">
                <div className="absolute inset-0 bg-[#121212]/60 mix-blend-overlay"></div>
                {/* Mockup or Premium Image placeholder */}
                <div className="absolute inset-10 border border-white/10 rounded-2xl bg-brand-bg/80 p-8 flex flex-col gap-6 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                  <div className="h-6 w-32 bg-white/5 rounded-full" />
                  <div className="h-12 w-full bg-brand-gold/10 rounded-xl border border-brand-gold/20 border-dashed" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-2xl" />
                    <div className="h-24 bg-brand-teal/10 rounded-2xl border border-brand-teal/20" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-white/10 rounded-full" />
                    <div className="h-4 w-4/5 bg-white/10 rounded-full" />
                  </div>
                  <div className="mt-auto h-14 w-full gold-gradient rounded-xl flex items-center justify-center font-black text-black uppercase tracking-widest text-sm">
                    Submit Proof
                  </div>
                </div>
              </div>
              
              {/* Floating Badge — Up to Rs.500 */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 teal-gradient rounded-full blur-[80px] opacity-30" />
              <div className="absolute -bottom-6 -right-6 p-5 bg-brand-teal rounded-2xl text-black font-black flex flex-col items-center shadow-2xl shadow-brand-teal/20 animate-float">
                <span className="text-[10px] uppercase tracking-widest mb-1 opacity-70">Joining Bonus</span>
                <span className="text-2xl font-black">Up to</span>
                <span className="text-4xl font-black">Rs.500</span>
                <span className="text-[9px] uppercase tracking-widest mt-1 opacity-60">*Rs.27 guaranteed</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats / Numbers */}
      <section className="py-24 border-y border-brand-border bg-brand-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: 'Gig Workers', value: '12K+', icon: Users },
              { label: 'Daily Payouts', value: 'Rs.50K+', icon: Wallet },
              { label: 'Active Tasks', value: '500+', icon: Briefcase },
              { label: 'Growth Strategies', value: '18+', icon: TrendingUp }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-slate-500 mb-4 flex justify-center transform group-hover:scale-110 transition-transform">
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl md:text-5xl font-display font-black text-white mb-2">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="leaderboard" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Trophy size={14} />
            Gamification Engine
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-10">
            Climb the <span className="text-brand-teal">Leaderboard</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400 font-medium mb-20">
            Compete with others, maintain your streak, and earn unique badges. 
            Higher ranks unlock mystery tasks with 2x rewards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Weekly Streaks', bonus: 'Rs.50 Bonus', desc: 'Complete tasks daily to unlock bonus payouts.', color: 'border-orange-500/20 bg-orange-500/5' },
              { title: 'Leaderboard Rank', bonus: 'Legend Status', desc: 'Top performers get access to high-ticket roles.', color: 'border-brand-teal/20 bg-brand-teal/5' },
              { title: 'Badge Economy', bonus: '12+ Badges', desc: 'Display your achievements on your public profile.', color: 'border-brand-gold/20 bg-brand-gold/5' }
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className={`p-10 rounded-[2.5rem] border ${card.color} text-left relative overflow-hidden group`}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-display font-black text-white uppercase italic mb-2">{card.title}</h3>
                  <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-6">{card.bonus}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
                <ChevronRight size={40} className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 group-hover:scale-125 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="p-16 md:p-24 bg-brand-card border border-white/5 rounded-[4rem] text-center relative overflow-hidden shadow-2xl shadow-black">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 blur-[100px] rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-teal/10 blur-[100px] rounded-full -ml-48 -mb-48" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-8 leading-none">
                Start Earning <br />
                <span className="glow-text">Tonight.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-14 max-w-lg mx-auto">
                No join fees. No hidden costs. Just pure opportunity. 
                Register now and earn <span className="text-brand-gold font-black">up to Rs.500</span> in joining bonuses — starting with Rs.27 guaranteed on day one.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register" className="w-full sm:w-auto px-12 py-5 gold-gradient text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-gold/20">
                  Join the Network
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-12 py-5 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                  Member Login
                </Link>
              </div>
              
              <p className="mt-6 text-slate-600 text-[10px] font-medium">
                *Guaranteed Rs.27 joining bonus credited instantly. Additional bonuses up to Rs.500 available through streak rewards and referrals.
              </p>
              
              <div className="mt-12 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck size={16} /> 100% Secure Payments via Razorpay
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-brand-border bg-brand-bg relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center">
                <Zap size={22} className="text-black fill-black" />
              </div>
              <span className="text-2xl font-display font-black tracking-tighter text-white">WORKPLEX</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {['About', 'Ventures', 'Privacy', 'Contractor Agreement', 'Contact'].map((item) => (
                <a key={item} href="#" className="text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">{item}</a>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-brand-border/50">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              © 2026 WORKPLEX. A Division of HVRS Innovations Private Limited.
            </p>
            <div className="flex items-center gap-10">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Made for India</span>
              <div className="h-px w-12 bg-brand-border" />
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em]">Premium Build</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
