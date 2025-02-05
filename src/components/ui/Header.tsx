import React from 'react';
import imgsrc from '@/assets/marrow.png';

const LeaderboardHeader = () => {
  return (
    <div className="w-full p-6">
      <div className="relative flex items-center justify-center">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-purple-600/5 rounded-lg blur-xl" />
        
        {/* Main container */}
        <div className="relative flex items-center gap-4 px-8 py-4 
                      bg-gradient-to-br from-white/80 via-white/90 to-white/80 
                      dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-900/80 
                      rounded-lg backdrop-blur-sm 
                      border border-white/20 dark:border-slate-800/20 
                      shadow-lg transition-all duration-300">
          
          {/* Icon */}
          <img src={imgsrc} alt="marrow" className="w-12 h-12" />
          
          {/* Title */}
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            QBank Challenge
          </h1>
        </div>

        {/* Subtle highlight effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-blue-500/0 
                      rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

export default LeaderboardHeader;