import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';

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
    const isUser1Leading = user1.current > user2.current;
    const leader = isUser1Leading ? user1.name : user2.name;
    const follower = isUser1Leading ? user2.name : user1.name;
  
    // Both targets reached cases
    if (user1Stats.isTargetReached && user2Stats.isTargetReached) {
      return `Both ${user1.name} and ${user2.name} have exceeded the target! 🎉 Incredible teamwork! 🏆`;
    }
  
    // Individual target reached cases
    if (user1Stats.isTargetReached) {
      return `${user1.name} has reached the target! Can ${user2.name} catch up? 🚀 The challenge is on! 💥`;
    }
    if (user2Stats.isTargetReached) {
      return `${user2.name} has reached the target! Can ${user1.name} catch up? 🚀 Never give up! 💥`;
    }

    // One user yet to start cases
    if (user1.current === 0 && user2.current > 0) {
      return `${user2.name} has taken the first step! Come on ${user1.name}, time to join the challenge! 🚀`;
    }
    if (user2.current === 0 && user1.current > 0) {
      return `${user1.name} has taken the lead! ${user2.name}, ready to jump in? The race is on! 🎯`;
    }
  
    // Calculate difference based on target percentages
    const user1Percentage = (user1.current / target) * 100;
    const user2Percentage = (user2.current / target) * 100;
    const differencePercentage = Math.abs(user1Percentage - user2Percentage);
  
    // Both at 0% progress
    if (user1Percentage === 0 && user2Percentage === 0) {
      return `The journey has just begun! 🚀 Let's get moving, ${user1.name} and ${user2.name}! Every step counts! 🔥`;
    }
  
    // Both are tied (excluding 0%)
    if (user1Percentage === user2Percentage) {
      return `Wow! It's a dead heat between ${user1.name} and ${user2.name}! Who will take the lead? 🏁 Keep pushing! 💪`;
    }
  
    // Very close competition cases
    if (differencePercentage < 5) {
      return "It's neck and neck! What an exciting race! 🔥 Inches away from victory! 🏁";
    }
  
    // Closer competition cases
    if (differencePercentage < 15) {
      return `${follower} is closing in on ${leader}! Keep pushing! 💪 The gap is narrowing! 🌟`;
    }
  
    // Comeback momentum detected
    if ((isUser1Leading && user2.previous !== undefined && user2.previous < user2.current) || 
        (!isUser1Leading && user1.previous !== undefined && user1.previous < user1.current)) {
      return `${follower} is making a comeback! 🚀 Will ${leader} hold onto the lead? This is getting intense! 🔥`;
    }
  
    // Significant lead cases
    if (differencePercentage >= 15 && differencePercentage < 30) {
      return `${leader} is pulling ahead! ${follower}, it's time to make your move! 🎯 Every moment counts! ⏱️`;
    }
  
    // Large lead cases
    if (differencePercentage >= 30) {
      return `${leader} is dominating the challenge! ${follower}, don't lose hope - epic comebacks happen! 🚀 Believe in yourself! 💥`;
    }
  
    // Fallback message for any unexpected scenarios
    return `${leader} is in the lead! Stay motivated and keep pushing your limits! 💪`;
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
          <div className="w-20 h-20 rounded-full bg-white shadow-lg flex flex-col items-center justify-center p-2 border border-slate-100 transition-transform duration-300 ease-in-out hover:shadow-xl hover:border-slate-200 -translate-y-4">
            <div className="w-full flex justify-center items-center gap-1">
              <p className="font-semibold text-xs whitespace-nowrap">{name}</p>
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
            <p className="text-[10px] text-slate-500">{current}/{target}</p>
            {!isTargetReached ? (
              <p className="text-[10px] text-red-500">{questionsLeft} left</p>
            ) : (
              <p className="text-[10px] text-green-500">+{extraProgress}</p>
            )}
          </div>
          <div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-6 w-3 h-3 rotate-45 bg-white border-b border-r border-slate-100"
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-2 pb-4 px-6 relative">
        <p className="text-m text-center mb-2 pb-5 text-slate-600 font-semibold bg-gradient-to-r from-purple-100/50 to-blue-100/50 py-2 px-4 rounded-lg shadow-sm">{getMotivationalMessage()}</p>
        <div className="relative mt-16 mx-[6%]">
          <div className="h-3 w-full rounded-full bg-[#faf5ff] overflow-hidden shadow-inner">
            {[user1Stats, user2Stats].map((stats, index) => {
              const user = index === 0 ? user1 : user2;
              const gradientColors = index === 0
                ? 'from-[#2563eb]/90 to-[#3b82f6]/90'
                : 'from-[#7242eb]/80 to-[#8b5cf6]/80';
              
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
                        ? 'radial-gradient(circle at center, #3b82f6, #2563eb)'
                        : 'radial-gradient(circle at center, #8b5cf6, #7242eb)',
                      transform: 'translate(50%, -50%)',
                      boxShadow: index === 0 
                        ? '0 0 10px #2563eb80' 
                        : '0 0 10px #7242eb80',
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