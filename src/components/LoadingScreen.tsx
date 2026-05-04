import { ShieldCheck } from 'lucide-react';
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#E8B84B] rounded-xl flex items-center justify-center shadow-lg shadow-[#E8B84B]/20">
          <ShieldCheck size={28} className="text-[#0A0A0A]" strokeWidth={2.5} />
        </div>
        <span className="text-3xl font-black text-white tracking-tight italic uppercase">
          WORK<span className="text-[#E8B84B]">PLEX</span>
        </span>
      </div>
      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#E8B84B] to-[#00C9A7] animate-progress-indeterminate w-1/2"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
