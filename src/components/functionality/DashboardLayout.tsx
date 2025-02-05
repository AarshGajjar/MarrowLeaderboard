import React from 'react';
import DarkModeToggle from '../functionality/DarkModeToggle';
import CountdownTimer from '../ui/Countdown';
import LeaderboardHeader from '../ui/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-blue-900 dark:via-gray-800 dark:to-purple-900 flex flex-col">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex-1 flex justify-start">
              <CountdownTimer />
            </div>
            
            <div className="flex-1">
              <LeaderboardHeader />
            </div>
            
            <div className="flex-1 flex justify-end">
              <DarkModeToggle />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col items-center py-4">
            <div className="w-full mb-4">
              <LeaderboardHeader />
            </div>
            
            <div className="w-full flex items-center justify-between px-0">
                <div className="scale-75 -ml-4">
                <CountdownTimer />
                </div>
              <div className="scale-75">
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;