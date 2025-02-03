import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, RefreshCw, List, Info, User } from 'lucide-react';

interface ActivityLog {
  id: number;
  user_type: 'user1' | 'user2';
  completed: number;
  correct: number;
  timestamp: string;
  created_at: string;
}

interface ActivityLogProps {
  logs: ActivityLog[];
  userNames: {
    user1: string;
    user2: string;
  };
  onRefresh: () => Promise<void>;
}

const calculateAccuracy = (correct: number, total: number): string => {
  if (total === 0) return '0.0';
  return ((correct / total) * 100).toFixed(1);
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const isSameDate = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const ActivityLogs: React.FC<ActivityLogProps> = ({ logs, userNames, onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'clock'>('list');
  const [selectedUsers, setSelectedUsers] = useState<('user1' | 'user2')[]>(['user1', 'user2']);

  // Adjust the filtering to ensure only logs from the selected date are considered
  const filteredLogs = logs.filter(log => 
    isSameDate(log.timestamp, selectedDate) && 
    selectedUsers.includes(log.user_type)
  );

  const timeSlots = Array(8).fill(null).map(() => ({ 
    total: 0, 
    correct: 0, 
    logs: [] as ActivityLog[] 
  }));
  
  
  filteredLogs.forEach(log => {
    const date = new Date(log.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // Calculate the slot index: each slot covers 3 hours (0–2:59, 3–5:59, …, 21–23:59)
    const slotIndex = Math.floor((hours + minutes / 60) / 3);
    
    // Ensure the slot index is within bounds (0 to 7)
    if (slotIndex >= 0 && slotIndex < timeSlots.length) {
      timeSlots[slotIndex].total += log.completed;
      timeSlots[slotIndex].correct += log.correct;
      timeSlots[slotIndex].logs.push(log);
    }
  });
  

  const maxTotal = Math.max(
    ...timeSlots.filter(slot => slot.total > 0).map(slot => slot.total),
    1 // Prevent division by zero
  );

  const dailyTotals = filteredLogs.reduce((acc, log) => {
    const userType = log.user_type as 'user1' | 'user2';
    acc[userType].completed += log.completed;
    acc[userType].correct += log.correct;
    return acc;
  }, {
    user1: { completed: 0, correct: 0 },
    user2: { completed: 0, correct: 0 }
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getLogPosition = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Adjust angle calculation for 24-hour clock (15 degrees per hour instead of 30)
    const angle = (hours * 15 + minutes * 0.25) - 90;
    const radians = angle * (Math.PI / 180);
    
    return {
      x: Math.cos(radians),
      y: Math.sin(radians)
    };
  };

  const toggleUserSelection = (user: 'user1' | 'user2') => {
    setSelectedUsers(prev => 
      prev.includes(user) 
        ? prev.filter(u => u !== user)
        : [...prev, user]
    );
  };

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="border-b p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Activity Log
            </span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hover:bg-gradient-to-r hover:from-purple-600/5 hover:to-blue-600/5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex border rounded-md bg-white">
          <button
            className={`flex-1 p-2 transition-colors rounded-l-md ${
              activeTab === 'list' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'hover:bg-gradient-to-r hover:from-purple-600/5 hover:to-blue-600/5'
            }`}
            onClick={() => setActiveTab('list')}
          >
            <List className="w-4 h-4 inline-block mr-2" />
            List View
          </button>
          <button
            className={`flex-1 p-2 transition-colors rounded-r-md ${
              activeTab === 'clock' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'hover:bg-gradient-to-r hover:from-purple-600/5 hover:to-blue-600/5'
            }`}
            onClick={() => setActiveTab('clock')}
          >
            <Clock className="w-4 h-4 inline-block mr-2" />
            Clock View
          </button>
        </div>

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border-purple-600/50 focus:ring-purple-600/50"
        />
        
        <div className="flex gap-2 justify-center">
          {(['user1', 'user2'] as const).map((userType) => (
            <Button
              key={userType}
              variant={selectedUsers.includes(userType) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleUserSelection(userType)}
              className={`
                ${selectedUsers.includes(userType) 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-600'}
                ${!selectedUsers.includes(userType) && 'opacity-50'}
              `}
            >
              {userNames[userType]}
            </Button>
          ))}
        </div>

        {(['user1', 'user2'] as const).map((userType) => (
          <div 
            key={userType} 
            className={`text-sm font-medium flex items-center justify-between p-2 rounded ${
              userType === 'user1' 
                ? 'bg-purple-50 text-purple-600' 
                : 'bg-blue-50 text-blue-600'
            } ${!selectedUsers.includes(userType) && 'opacity-50'}`}
          >
            <span>{userNames[userType]}</span>
            <div>
              {dailyTotals[userType].completed} completed, {dailyTotals[userType].correct} correct 
              {" ("}{calculateAccuracy(dailyTotals[userType].correct, dailyTotals[userType].completed)}%)
            </div>
          </div>
        ))}

        {activeTab === 'clock' && (
          <div className="p-4">
            <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full max-w-xs mx-auto">
              <circle cx="0" cy="0" r="1" fill="none" stroke="rgb(203 213 225)" strokeWidth="0.05" />
              
              {/* 24-hour markers */}
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15 - 90) * (Math.PI / 180);
                return (
                  <line
                    key={i}
                    x1={Math.cos(angle) * 0.9}
                    y1={Math.sin(angle) * 0.9}
                    x2={Math.cos(angle) * 1}
                    y2={Math.sin(angle) * 1}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={i % 6 === 0 ? "0.04" : "0.02"}
                  />
                );
              })}

              {/* Dynamic heatmap calculation */}
              {timeSlots.map((slot, index) => {
                const startAngleDeg = index * 45 - 90; // 45° per slot
                const endAngleDeg = (index + 1) * 45 - 90;
                const startAngleRad = startAngleDeg * (Math.PI / 180);
                const endAngleRad = endAngleDeg * (Math.PI / 180);

                const startX = 0.9 * Math.cos(startAngleRad);
                const startY = 0.9 * Math.sin(startAngleRad);
                const endX = 0.9 * Math.cos(endAngleRad);
                const endY = 0.9 * Math.sin(endAngleRad);

                // Calculate the accuracy and intensity based on the slot's data
                const accuracy = slot.total > 0 ? slot.correct / slot.total : 0;
                const intensity = slot.total > 0 ? (slot.total / maxTotal) : 0;
                const hue = accuracy * 120; // This gives a hue from red (0) to green (120)

                return (
                  <path
                    key={index}
                    d={`M 0 0 L ${startX} ${startY} A 0.9 0.9 0 0 1 ${endX} ${endY} Z`}
                    fill={slot.total > 0 ? "url(#gradient)" : "transparent"}
                    fillOpacity={intensity * 0.3}
                    stroke="none"
                  />
                );
              })}

              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(147 51 234)" />
                  <stop offset="100%" stopColor="rgb(37 99 235)" />
                </linearGradient>
              </defs>

              {/* Update log markers to use primary/secondary colors */}
              {filteredLogs.map((log) => {
                const { x, y } = getLogPosition(log.timestamp);
                
                return (
                  <g key={log.id} transform={`translate(${x}, ${y})`}>
                    <circle
                      r="0.05"
                      fill={log.user_type === 'user1' ? 'rgb(147 51 234)' : 'rgb(37 99 235)'}
                      stroke="hsl(var(--background))"
                      strokeWidth="0.01"
                    />
                    <title>
                      {`${log.user_type === 'user1' ? userNames.user1 : userNames.user2}
            Completed: ${log.completed}
            Correct: ${log.correct}
            Time: ${new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false })}`}
                    </title>
                  </g>
                );
              })}

              <circle cx="0" cy="0" r="0.05" fill="hsl(var(--foreground))" />
            </svg>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="max-h-64 overflow-y-auto rounded-lg bg-white">
            {filteredLogs.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 transition-colors flex justify-between items-center ${
                      log.user_type === 'user1' 
                        ? 'hover:bg-purple-50' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        log.user_type === 'user1' 
                          ? 'bg-purple-600' 
                          : 'bg-blue-600'
                      }`} />
                      <span className={
                        log.user_type === 'user1' 
                          ? 'text-purple-600' 
                          : 'text-blue-600'
                      }>
                        {userNames[log.user_type]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {log.completed} completed, {log.correct} correct 
                      {" ("}{calculateAccuracy(log.correct, log.completed)}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No entries found for this date
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;