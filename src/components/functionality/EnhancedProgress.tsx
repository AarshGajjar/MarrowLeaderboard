import React, { useMemo, useState } from 'react';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Crown, Rocket } from 'lucide-react';

interface DualUserProgressProps {
  user1: {
    previous?: number;
    name: string;
    current: number;
    color: string;
  };
  user2: {
    previous?: number;
    name: string;
    current: number;
    color: string;
  };
  target: number;
}

const DualUserProgress: React.FC<DualUserProgressProps> = ({ user1, user2, target }) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  const getLeadingUser = () => user1.current >= user2.current ? user1.name : user2.name;

  // Calculate maxProgress considering target and both users' current values
  const maxProgress = Math.max(user1.current, user2.current, target);

  const getProgressStats = (current: number) => {
    const rawPercentage = (current / target) * 100;
    const isTargetReached = current >= target;
    const questionsLeft = Math.max(target - current, 0);
    const visualPosition = (current / maxProgress) * 100; // Use maxProgress for positioning
    return { 
      rawPercentage, 
      visualPosition, 
      isTargetReached, 
      questionsLeft,
      extraProgress: isTargetReached ? current - target : 0
    };
  };

  const user1Stats = getProgressStats(user1.current);
  const user2Stats = getProgressStats(user2.current);

  const getMotivationalMessage = () => {
    // Helper functions for cleaner code
    const calculateProgress = (current: number, target: number) => (current / target) * 100;
    const formatPercentage = (value: number) => Math.round(value);
    
    // Calculate progress stats
    const user1Progress = calculateProgress(user1.current, target);
    const user2Progress = calculateProgress(user2.current, target);
    const differencePercentage = Math.abs(user1Progress - user2Progress);
    const isUser1Leading = user1Progress > user2Progress;
    const leader = isUser1Leading ? user1 : user2;
    const follower = isUser1Leading ? user2 : user1;
    const leaderStats = isUser1Leading ? user1Stats : user2Stats;
    const followerStats = isUser1Leading ? user2Stats : user1Stats;
    
    // Track momentum and progress patterns
    const hasLeaderMomentum = leader.previous !== undefined && leader.current > leader.previous;
    const hasFollowerMomentum = follower.previous !== undefined && follower.current > follower.previous;
    const isLeaderSlowing = leader.previous !== undefined && leader.current < leader.previous;
    const bothProgressing = hasLeaderMomentum && hasFollowerMomentum;
    
    // Target achievement scenarios
    if (user1Stats.isTargetReached && user2Stats.isTargetReached) {
      // Look at raw percentages to determine if it was a close finish
      const percentageDiff = Math.abs(user1Stats.rawPercentage - user2Stats.rawPercentage);
      const closeFinish = percentageDiff < 5; // Within 5% of each other
      
      if (closeFinish) {
        return `Phenomenal effort! ${user1.name} and ${user2.name} both crushed the target in an incredibly close race! 🏆 Simply outstanding! ⭐`;
      }
      return `Champions, both of you! ${user1.name} and ${user2.name} have conquered the challenge! 🎉 Time to set new heights! 🚀`;
    }
  
    if (user1Stats.isTargetReached || user2Stats.isTargetReached) {
      const achiever = user1Stats.isTargetReached ? user1.name : user2.name;
      const chaser = user1Stats.isTargetReached ? user2.name : user1.name;
      const chaserStats = user1Stats.isTargetReached ? user2Stats : user1Stats;
      
      // Use questionsLeft to provide more specific encouragement
      if (chaserStats.questionsLeft <= 3) {
        return `${achiever} has crossed the finish line! ${chaser}, you're just ${chaserStats.questionsLeft} questions away from glory! 💪 Final sprint! ⚡`;
      }
      
      if (chaserStats.rawPercentage > 90) {
        return `${achiever} has made it! ${chaser} is so close - just that final push needed! 💪 Victory awaits! ⚡`;
      }
      return `${achiever} has reached the summit! ${chaser}, you're on your way - keep that fire burning! 🔥 The view is worth it! 🏔️`;
    }
  
    // Starting phase scenarios
    if (user1.current === 0 && user2.current === 0) {
      return `The stage is set for an epic challenge! ${user1.name} and ${user2.name}, your journey to greatness begins now! 🎬 Ready, set, go! 🚀`;
    }
  
    if (user1.current === 0 || user2.current === 0) {
      const starter = user1.current > 0 ? user1.name : user2.name;
      const waiting = user1.current === 0 ? user1.name : user2.name;
      const starterProgress = formatPercentage(Math.max(user1Progress, user2Progress));
      
      if (starterProgress < 5) {
        return `${starter} has taken the first brave step! ${waiting}, the perfect time to join is now! 🎯 Let the challenge begin! 💫`;
      }
      return `${starter} is ${starterProgress}% of the way there! ${waiting}, jump in - the competition is heating up! 🔥 Your time to shine! ⭐`;
    }
  
    // Progress patterns and momentum scenarios
    if (bothProgressing) {
      if (differencePercentage < 2) {
        return `Incredible pace from both! ${leader.name} and ${follower.name} are pushing each other to new heights! 🏃‍♂️ Pure determination! ⚡`;
      }
      return `What a spectacle! Both ${leader.name} and ${follower.name} are on fire! 🔥 Keep this amazing momentum going! 🚀`;
    }
  
    if (hasFollowerMomentum && isLeaderSlowing) {
      const gap = formatPercentage(differencePercentage);
      return `The tide is turning! ${follower.name} is gaining ground, just ${gap}% behind ${leader.name}! 🌊 Momentum shift! 🔄`;
    }
  
    // Competition closeness scenarios
    if (user1Progress === user2Progress) {
      const progress = formatPercentage(user1Progress);
      if (progress > 75) {
        return `Dead heat at ${progress}%! ${user1.name} and ${user2.name} are sprinting to the finish! 🏁 Who wants it more? 💥`;
      }
      return `Perfectly matched at ${progress}%! ${user1.name} and ${user2.name}, this is anyone's game! ⚖️ Break the tie! 🎯`;
    }
  
    if (differencePercentage < 5) {
      return `Only ${formatPercentage(differencePercentage)}% separates ${leader.name} and ${follower.name}! 📊 Every effort counts! ⚡`;
    }
  
    // Progress milestone scenarios with questions left context
    const leaderProgress = formatPercentage(Math.max(user1Progress, user2Progress));
    const followerProgress = formatPercentage(Math.min(user1Progress, user2Progress));
  
    if (leaderProgress >= 90) {
      return `${leader.name} is in the final stretch with ${leaderStats.questionsLeft} questions to go! ${follower.name} at ${followerProgress}% - time for an epic finish! 🏁`;
    }
  
    if (leaderProgress >= 75) {
      return `${leader.name} is crushing it at ${leaderProgress}%! ${follower.name}, channel your inner champion - ${followerStats.questionsLeft} questions to greatness! 🦁`;
    }
  
    if (leaderProgress >= 50) {
      const extraProgress = leaderStats.extraProgress > 0 ? ` (+${leaderStats.extraProgress}% bonus)` : '';
      return `Halfway hero ${leader.name} at ${leaderProgress}%${extraProgress}! ${follower.name} pushing at ${followerProgress}% - the race is far from over! 🎯`;
    }
  
    if (differencePercentage >= 30) {
      return `${leader.name} has built a strong lead of ${formatPercentage(differencePercentage)}%! ${follower.name}, every champion has faced adversity! 💪 Rise up! 🚀`;
    }
  
    // Generic progress messages with extra progress context
    const leaderExtra = leaderStats.extraProgress > 0 ? ` (+${leaderStats.extraProgress}% bonus)` : '';
    const followerExtra = followerStats.extraProgress > 0 ? ` (+${followerStats.extraProgress}% bonus)` : '';
    
    return `${leader.name} leads at ${leaderProgress}%${leaderExtra}, with ${follower.name} at ${followerProgress}%${followerExtra}! Every step forward is a victory! 🌟 Keep pushing! 💫`;
  };
  

  interface UserIndicatorProps {
    name: string;
    current: number;
    color: string;
    position: number;
    isTargetReached: boolean;
    questionsLeft: number;
    extraProgress: number;
    isLeading: boolean;
    isFirstUser: boolean;
  }

  const UserIndicator = ({ 
    name, 
    current, 
    color, 
    position, 
    isTargetReached, 
    questionsLeft,
    extraProgress,
    isLeading,
    isFirstUser
  }: UserIndicatorProps) => {
    const displayPosition = Math.min(Math.max(position, 0), 100);
    
    const baseClassName = "absolute flex flex-col items-center transition-transform duration-300 ease-in-out";
    const hoverClassName = hoveredUser === name ? "z-30 scale-110" : 
                          hoveredUser === null && isLeading ? "z-20" : "z-10";
    
    return (
      <div 
        className={`${baseClassName} ${hoverClassName}`}
        style={{ 
          left: `${displayPosition}%`, 
          top: '-4rem',
          transform: 'translateX(-50%)'
        }}
        onMouseEnter={() => setHoveredUser(name)}
        onMouseLeave={() => setHoveredUser(null)}
      >
        <div className="relative will-change-transform">
          <div className="w-20 h-20 rounded-full bg-card shadow-lg flex flex-col items-center justify-center p-2 border border-border transition-transform duration-300 ease-in-out hover:shadow-xl hover:border-border/80 -translate-y-4">
            <div className="w-full flex justify-center items-center gap-1">
              <p className="font-semibold text-xs whitespace-nowrap text-foreground">{name}</p>
              {isLeading && (
                <Crown 
                  className="w-3 h-3 text-yellow-500"
                  style={{
                    filter: 'drop-shadow(0 0 2px rgba(234, 179, 8, 0.5))',
                  }}
                />
              )}
            </div>
            <p className="text-sm font-bold" style={{ color }}>{Math.round((current / target) * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">{current}/{target}</p>
            {!isTargetReached ? (
              <p className="text-[10px] text-red-400">{questionsLeft} left</p>
            ) : (
              <p className="text-[10px] text-green-400">+{extraProgress}</p>
            )}
          </div>
          <div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-6 w-3 h-3 rotate-45 bg-card border-b border-r border-border"
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-lg rounded-lg overflow-hidden bg-gradient-to-br from-white/80 via-white/90 to-white/80 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-800/20">
      <CardHeader className="border-b p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
        <Rocket className="w-5 h-5 text-amber-500" />
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Today's Sprint
        </span>
      </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4 px-6 relative">
      <p className="text-m text-center mb-2 pb-5 text-foreground font-semibold 
        bg-gradient-to-r from-slate-50/80 via-slate-100/80 to-slate-50/80 
        dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 
        backdrop-blur-sm py-3 px-6 rounded-lg 
        shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] 
        dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]
        transform transition-all duration-300 hover:scale-[1.02] 
        border border-slate-200/50 dark:border-slate-700/50
        animate-fade-in">
        {getMotivationalMessage()}
      </p>
      <div className="relative mt-16 mx-[6%]">
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden shadow-inner dark:bg-slate-800">
        {[user1Stats, user2Stats].map((stats, index) => {
          const user = index === 0 ? user1 : user2;
          const gradientColors = index === 0
          ? 'from-purple-400 to-purple-600 dark:from-purple-400 dark:to-purple-600'
          : 'from-blue-400 to-blue-600 dark:from-blue-400 dark:to-blue-600';
          
          const relativeWidth = (user.current / maxProgress) * 100;
          const isLeading = user.current >= (index === 0 ? user2.current : user1.current);
          
          const barClassName = `absolute h-full transition-all duration-1000 ease-in-out bg-gradient-to-r ${gradientColors} ${
          hoveredUser === user.name ? 'z-20' : 
          hoveredUser === null && isLeading ? 'z-10' : 'z-0'
          }`;

          return (
          <div key={user.name} 
            className={barClassName}
            style={{ width: `${relativeWidth}%` }}
          >
            <div 
            className="absolute right-0 top-1/2 w-4 h-4 rounded-full will-change-transform"
            style={{
              background: index === 0
              ? 'radial-gradient(circle at center, #a855f7, #9333ea)'
              : 'radial-gradient(circle at center, #60a5fa, #3b82f6)',
              transform: 'translate(50%, -50%)',
              boxShadow: index === 0 
              ? '0 0 10px rgba(168, 85, 247, 0.5)' 
              : '0 0 10px rgba(96, 165, 250, 0.5)',
            }}
            />
          </div>
          );
        })}
        </div>

        <UserIndicator 
        {...user1}
        position={user1Stats.visualPosition}
        isTargetReached={user1Stats.isTargetReached}
        questionsLeft={user1Stats.questionsLeft}
        extraProgress={user1Stats.extraProgress}
        isLeading={user1.current > user2.current}
        isFirstUser={true}
        />
        <UserIndicator 
        {...user2}
        position={user2Stats.visualPosition}
        isTargetReached={user2Stats.isTargetReached}
        questionsLeft={user2Stats.questionsLeft}
        extraProgress={user2Stats.extraProgress}
        isLeading={user2.current > user1.current}
        isFirstUser={false}
        />
      </div>
      </CardContent>
    </Card>
  );
};

export default DualUserProgress;