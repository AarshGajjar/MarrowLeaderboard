import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { Flame, Calendar, Brain } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import EnhancedProgress from '@/components/ui/EnhancedProgress';
import TimeAnalysis from '@/components/ui/TimeAnalysis';

interface UserProgress {
  date: string;
  completed: number;
  correct: number;
  accuracy: number;
}

interface ActivityLog {
  id: number;
  user_type: 'user1' | 'user2';
  completed: number;
  correct: number;
  timestamp: string;
  created_at: string;
}

interface DailyData {
  date: string;
  user1Data: UserProgress;
  user2Data: UserProgress;
}

interface ProgressDashboardProps {
  dailyData: DailyData[];
  user1Name: string;
  user2Name: string;
  getDate?: () => string; 
  activityLogs: ActivityLog[];
}

const DAILY_TARGET = 200;
const MIN_ACCURACY_TARGET = 70;

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ dailyData = [], user1Name, user2Name,  getDate = () => new Date().toISOString().split('T')[0], activityLogs }) => {
  const [dateRange, setDateRange] = useState('week');
  const [selectedUser, setSelectedUser] = useState('both');

  const filteredData = useMemo(() => {
    if (!dailyData?.length) return [];
    
    const now = new Date(getDate());
    const cutoffDate = new Date(getDate());
    
    switch(dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        return dailyData;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }
  
    return dailyData.filter(day => new Date(day.date) >= cutoffDate);
  }, [dailyData, dateRange]);

  const stats = useMemo(() => {
    const calculateUserStats = (userData: UserProgress[]) => {
      const today = new Date(getDate()).toISOString().split('T')[0];
      if (!userData?.length) return { 
        currentStreak: 0, 
        dailyAverage: 0, 
        todayProgress: 0,
        studyConsistency: 0
      };
    
      // Streak calculation
      let currentStreak = 0;
      const now = new Date(getDate());
      const sortedData = [...userData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (const day of sortedData) {
        const dayDate = new Date(day.date);
        if (dayDate.getDay() === 0 || dayDate.toDateString() === now.toDateString()) continue; // Skip Sundays and today
        
        if (day.completed >= DAILY_TARGET) {
          currentStreak++;
        } else {
          break;
        }
      }
           
      // Calculate daily average excluding Sundays AND today
      const nonSundayData = userData.filter(day => 
        new Date(day.date).getDay() !== 0 && // Exclude Sundays
        day.date !== today // Exclude today
      );
      
      const dailyAverage = nonSundayData.length > 0
        ? Math.round(
          nonSundayData.reduce((sum, day) => sum + day.completed, 0) / nonSundayData.length
        )
        : 0;
    
      const todayData = userData.find(day => day.date === today);
      const todayProgress = todayData ? todayData.completed : 0;
      
      // Get last 30 days excluding current day and Sundays
      const last30Days = userData
        .filter(day => day.date !== today && new Date(day.date).getDay() !== 0)
        .slice(-30);
      
      let consistentDays = 0;
    
      // Calculate study Consistency
      last30Days.forEach(day => {
        const dailyAccuracy = day.completed > 0 ? (day.correct / day.completed) * 100 : 0;
        if (day.completed >= DAILY_TARGET * 0.5 && dailyAccuracy >= MIN_ACCURACY_TARGET) {
          consistentDays++;
        }
      });
      
      const consistencyScore = last30Days.length > 0 
        ? Math.round((consistentDays / last30Days.length) * 100 * 10) / 10
        : 0;
    
      return { currentStreak, dailyAverage, todayProgress, studyConsistency: consistencyScore };
    };

    const user1Data = filteredData.map(d => d.user1Data);
    const user2Data = filteredData.map(d => d.user2Data);

    return {
      user1Stats: calculateUserStats(user1Data),
      user2Stats: calculateUserStats(user2Data)
    };
  }, [filteredData]);

  const calculateGoalProgress = (data: DailyData) => {
    if (selectedUser === 'both') {
      const totalCompleted = data.user1Data.completed + data.user2Data.completed;
      const totalCorrect = data.user1Data.correct + data.user2Data.correct;
      return {
        completed: totalCompleted,
        correct: totalCorrect,
        accuracy: totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100 * 10) / 10 : 0
      };
    }
    const userData = selectedUser === 'user1' ? data.user1Data : data.user2Data;
    return {
      completed: userData.completed,
      correct: userData.correct,
      accuracy: userData.completed > 0 ? Math.round((userData.correct / userData.completed) * 100 * 10) / 10 : 0
    };
  };

  const processedData = useMemo(() => {
    return filteredData
      .map(data => {
        const baseProcessed = calculateGoalProgress(data);
        return {
          ...data,
          // Keep the combined stats for accuracy calculation
          processedData: baseProcessed,
          // Add separate values for user1 and user2
          user1Completed: data.user1Data.completed,
          user2Completed: data.user2Data.completed,
          // Add separate accuracy values if needed
          user1Accuracy: data.user1Data.completed > 0 
            ? Math.round((data.user1Data.correct / data.user1Data.completed) * 100 * 10) / 10 
            : 0,
          user2Accuracy: data.user2Data.completed > 0 
            ? Math.round((data.user2Data.correct / data.user2Data.completed) * 100 * 10) / 10 
            : 0
        };
      })
      .filter(day => {
        // Filter based on selected user
        if (selectedUser === 'both') {
          return day.user1Completed > 0 || day.user2Completed > 0;
        }
        return selectedUser === 'user1' 
          ? day.user1Completed > 0 
          : day.user2Completed > 0;
      });
  }, [filteredData, selectedUser]);

  const trendData = useMemo(() => {
    const today = new Date(getDate()).toISOString().split('T')[0];
    const windowSize = 7;
    return filteredData
    .filter(d => d.date !== today) // Filter out today's data
    .map((data, index, filteredArray) => {
      const window = filteredArray
        .slice(Math.max(0, index - windowSize + 1), index + 1);
      
      const avgCompleted = window.length > 0
        ? window.reduce((sum, d) => {
            const stats = calculateGoalProgress(d);
            return sum + stats.completed;
          }, 0) / window.length
        : 0;
      
      const avgAccuracy = window.length > 0
        ? window.reduce((sum, d) => {
            const stats = calculateGoalProgress(d);
            return sum + stats.accuracy;
          }, 0) / window.length
        : 0;

      return {
        date: data.date,
        avgCompleted: Math.round(avgCompleted * 10) / 10,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10
      };
    });
}, [filteredData, selectedUser]);

  const selectedStats = selectedUser === 'user1' 
    ? stats.user1Stats 
    : selectedUser === 'user2' 
      ? stats.user2Stats
      : {
          currentStreak: Math.max(stats.user1Stats.currentStreak, stats.user2Stats.currentStreak),
          dailyAverage: stats.user1Stats.dailyAverage + stats.user2Stats.dailyAverage,
          todayProgress: stats.user1Stats.todayProgress + stats.user2Stats.todayProgress,
          studyConsistency: Math.max(stats.user1Stats.studyConsistency, stats.user2Stats.studyConsistency)
        };

  const targetQuestions = selectedUser === 'both' ? DAILY_TARGET * 2 : DAILY_TARGET;

  return (
    <div className="w-full space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Study Progress Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-4 mb-6">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both Users</SelectItem>
                <SelectItem value="user1">{user1Name}</SelectItem>
                <SelectItem value="user2">{user2Name}</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Conditional rendering for metric cards based on selection */}
          {selectedUser === "both" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
              title="Daily Average"
              value={selectedStats.dailyAverage}
              valueUnit="questions"
              icon={<Calendar className="h-4 w-4" />}
              tooltip="Average questions per day (excluding Sundays)"
              iconColor="#a855f7"
              />
              <MetricCard
              title="Study Consistency"
              value={Math.round((stats.user1Stats.studyConsistency + stats.user2Stats.studyConsistency) / 2)}
              valueUnit="%"
              icon={<Brain className="h-4 w-4" />}
              tooltip="Average Consistency of both users (last 30 days, excluding Sundays)"
              iconColor="#4ec9b0"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Current Streak"
                value={selectedStats.currentStreak}
                valueUnit="days"
                icon={<Flame className="h-4 w-4" />}
                tooltip="Days with target completed (excluding Sundays)"
                iconColor="#f97316"
              />
              <MetricCard
                title="Daily Average"
                value={selectedStats.dailyAverage}
                valueUnit="questions"
                icon={<Calendar className="h-4 w-4" />}
                tooltip="Average questions per day (excluding Sundays)"
                iconColor="#a855f7"
              />
              <MetricCard
                title="Study Consistency"
                value={selectedStats.studyConsistency}
                valueUnit="%"
                icon={<Brain className="h-4 w-4" />}
                tooltip="Days with atleast 150 questions, and 70% accuracy (last 30 days, excluding Sundays)"
                iconColor="#4ec9b0"
              />
            </div>
          )}
  
          <div className="w-full mt-4">
            <EnhancedProgress 
            current={selectedStats.todayProgress} 
            target={targetQuestions}
            />
          </div>
  
          <div className="w-full mt-6">
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="timeAnalysis">Time Analysis</TabsTrigger>
              </TabsList>
  
              <TabsContent value="progress">
                <div className="mb-4">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full aspect-[4/3] sm:aspect-[16/9]">
                  <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    />
                    <YAxis 
                    yAxisId="left"
                    label={{ value: 'Questions', angle: -90, position: 'insideLeft', offset: 0 }}
                    domain={[0, 'auto']}
                    tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', offset: 0 }}
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                    formatter={(value, name) => {
                      if (name === "Accuracy") {
                      return [`${value}%`, name];
                      }
                      return [value, name];
                    }}
                    />
                    {selectedUser === 'both' ? (
                    <>
                      <Bar yAxisId="left" stackId="users" dataKey="user1Completed" fill="#93c5fd" name={user1Name} opacity={0.3}/>
                      <Bar yAxisId="left" stackId="users" dataKey="user2Completed" fill="#818cf8" name={user2Name} opacity={0.3}/>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="processedData.accuracy"
                        stroke="#7c3aed"
                        name="Combined Accuracy"
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        yAxisId="left"
                        dataKey="processedData.completed"
                        fill="#93c5fd"
                        name="Questions Completed"
                        opacity={0.3}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="processedData.accuracy"
                        stroke="#7c3aed"
                        name="Accuracy"
                      />
                    </>
                  )}
                  </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </TabsContent>

                <TabsContent value="trends">
                <div className="mb-4">
                  <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
                <div className="w-full aspect-[4/3] sm:aspect-[16/9]">
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    />
                    <YAxis 
                    yAxisId="left"
                    label={{ value: 'Avg. Questions', angle: -90, position: 'insideLeft', offset: 0 }}
                    domain={[0, 'auto']}
                    tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: 'Avg. Accuracy %', angle: 90, position: 'insideRight', offset: 0 }}
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                    formatter={(value, name) => {
                      if (name === "7-day Avg. Accuracy") {
                      return [`${value}%`, name];
                      }
                      return [value, name];
                    }}
                    />
                    <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgCompleted"
                    stroke="#93c5fd"
                    name="7-day Avg. Completed"
                    />
                    <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgAccuracy"
                    stroke="#7c3aed"
                    name="7-day Avg. Accuracy"
                    />
                  </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="timeAnalysis">
                <TimeAnalysis 
                  activityLogs={activityLogs} 
                  selectedUser={selectedUser} 
                  dateRange={dateRange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;