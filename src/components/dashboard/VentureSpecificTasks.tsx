import { Flame, Star } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../lib/utils';

interface TaskCardProps {
  title: string;
  reward: number;
  expiry: string;
  difficulty: 'Easy' | 'Mid' | 'Hard';
  venture: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, reward, expiry, difficulty, venture: _venture }) => {
  const diffColors = {
    Easy: 'text-brand-teal',
    Mid: 'text-brand-gold',
    Hard: 'text-orange-500'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-all group cursor-pointer border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Star size={18} className="text-white/20 group-hover:text-brand-gold transition-colors" />
        </div>
        <div>
          <h5 className="text-sm font-black text-white italic group-hover:text-brand-gold transition-colors">{title}</h5>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black uppercase text-orange-400 tracking-widest">{expiry}</span>
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <span className={`text-[9px] font-black uppercase tracking-widest ${diffColors[difficulty]}`}>{difficulty}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-brand-teal font-black text-sm">{formatINR(reward)}</span>
      </div>
    </div>
  );
};

interface VentureSpecificTasksProps {
  venture: string;
}

const VentureSpecificTasks: React.FC<VentureSpecificTasksProps> = ({ venture }) => {
  const mockTasks: Record<string, TaskCardProps[]> = {
    BuyRix: [
      { title: 'Instagram Reel Engagement', reward: 45, expiry: '1h left', difficulty: 'Easy', venture: 'BuyRix' },
      { title: 'X (Twitter) Viral Campaign', reward: 120, expiry: '3h left', difficulty: 'Mid', venture: 'BuyRix' },
    ],
    Vyuma: [
      { title: 'Product Story Script', reward: 250, expiry: '5h left', difficulty: 'Hard', venture: 'Vyuma' },
      { title: 'Brand Logo Feedback', reward: 30, expiry: '12h left', difficulty: 'Easy', venture: 'Vyuma' },
    ],
    TrendyVerse: [
      { title: 'Fashion Trend Analysis', reward: 180, expiry: '2h left', difficulty: 'Mid', venture: 'TrendyVerse' },
      { title: 'Lifestyle Reel Submission', reward: 400, expiry: '8h left', difficulty: 'Hard', venture: 'TrendyVerse' },
    ],
    Growplex: [
      { title: 'Lead Generation Sync', reward: 90, expiry: '2h left', difficulty: 'Mid', venture: 'Growplex' },
      { title: 'SEO Keyword Audit', reward: 350, expiry: '6h left', difficulty: 'Hard', venture: 'Growplex' },
    ],
  };

  const tasks = mockTasks[venture as keyof typeof mockTasks] || mockTasks.Growplex;

  return (
    <div className="bg-[#121212] border border-white/5 rounded-[2rem] p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
            <Flame size={16} className="text-orange-500" /> Hot Tasks
          </h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Earned via {venture}</p>
        </div>
        <Link to="/services" className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline">View All</Link>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <TaskCard key={i} {...task} venture={venture} />
        ))}
      </div>
      
      <button className="w-full mt-8 py-4 bg-white/5 hover:bg-brand-gold hover:text-[#0A0A0A] rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all duration-300">
        Refresh Pipeline
      </button>
    </div>
  );
};

export default VentureSpecificTasks;
