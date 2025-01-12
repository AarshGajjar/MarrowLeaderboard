import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, Flame, Calendar } from 'lucide-react';

interface UserProgress {
  date: string;
  completed: number;
  correct: number;
  accuracy: number;
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
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
}

const DAILY_TARGET = 300;

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  subtitle,
}) => (
  <Card>
    <CardContent className="pt-6 px-6 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="rounded-full p-2 bg-gray-100">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ dailyData = [], user1Name, user2Name }) => {
  const [dateRange, setDateRange] = useState('week');
  const [selectedUser, setSelectedUser] = useState('both');

  const filteredData = useMemo(() => {
    if (!dailyData?.length) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (dateRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setDate(now.getDate() - 30);
    }
  
    return dailyData.filter(day => new Date(day.date) >= cutoffDate);
  }, [dailyData, dateRange]);

  const stats = useMemo(() => {
    const calculateUserStats = (userData: UserProgress[]) => {
      if (!userData?.length) return { currentStreak: 0, dailyAverage: 0, todayProgress: 0 };

      let currentStreak = 0;
      const now = new Date();
      const sortedData = [...userData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      for (const day of sortedData) {
        const dayDate = new Date(day.date);
        if (dayDate.toDateString() === now.toDateString() && day.completed < DAILY_TARGET) {
          currentStreak = sortedData.length > 1 ? currentStreak : 0;
          continue;
        }
        if (day.completed >= DAILY_TARGET) {
          currentStreak++;
        } else {
          break;
        }
      }

      const dailyAverage = Math.round(
        userData.reduce((sum, day) => sum + day.completed, 0) / userData.length
      );

      const today = new Date().toISOString().split('T')[0];
      const todayData = userData.find(day => day.date === today);
      const todayProgress = todayData ? todayData.completed : 0;

      return { currentStreak, dailyAverage, todayProgress };
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
    return filteredData.map(data => ({
      ...data,
      processedData: calculateGoalProgress(data)
    }));
  }, [filteredData, selectedUser]);

  const trendData = useMemo(() => {
    const windowSize = 7;
    return filteredData.map((data, index) => {
      const window = filteredData.slice(Math.max(0, index - windowSize + 1), index + 1);
      const avgCompleted = window.reduce((sum, d) => {
        const stats = calculateGoalProgress(d);
        return sum + stats.completed;
      }, 0) / window.length;
      const avgAccuracy = window.reduce((sum, d) => {
        const stats = calculateGoalProgress(d);
        return sum + stats.accuracy;
      }, 0) / window.length;

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
          todayProgress: stats.user1Stats.todayProgress + stats.user2Stats.todayProgress
        };

  const targetQuestions = selectedUser === 'both' ? DAILY_TARGET * 2 : DAILY_TARGET;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard
          title="Current Streak"
          value={`${selectedStats.currentStreak} days`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          subtitle="Days with target completed"
        />
        <MetricCard
          title="Daily Average"
          value={`${selectedStats.dailyAverage} questions`}
          icon={<Calendar className="h-4 w-4 text-purple-500" />}
          subtitle="Questions completed per day"
        />
        <MetricCard
          title="Today's Progress"
          value={`${selectedStats.todayProgress}/${targetQuestions}`}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          subtitle={`${Math.round((selectedStats.todayProgress / targetQuestions) * 100)}% of daily target`}
        />
      </div>

      <div className="mt-4">
        <Progress value={(selectedStats.todayProgress / targetQuestions) * 100} />
        <p className="text-sm text-gray-500 mt-1">
          {selectedStats.todayProgress} of {targetQuestions} questions completed today
        </p>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="min-h-[400px] h-[50vh]">
          <div className="mb-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Questions', angle: -90, position: 'insideLeft' }}
                domain={[0, 'auto']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                label={{ value: 'Accuracy %', angle: 90, position: 'insideRight' }}
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
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
            </ComposedChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trends" className="min-h-[400px] h-[50vh]">
          <div className="mb-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Avg. Questions', angle: -90, position: 'insideLeft' }}
                domain={[0, 'auto']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                label={{ value: 'Avg. Accuracy %', angle: 90, position: 'insideRight' }}
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressDashboard;