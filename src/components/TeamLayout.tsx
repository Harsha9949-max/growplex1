import React from 'react';
import Sidebar from './Sidebar';

interface TeamLayoutProps {
  children: React.ReactNode;
}

export const TeamLayout: React.FC<TeamLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-brand-primary text-text-main font-sans flex font-normal">
      <Sidebar />
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen relative overflow-hidden w-full">
        {/* Reservation for mobile to not overlap general buttons */}
        <div className="md:hidden h-14 shrink-0" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
