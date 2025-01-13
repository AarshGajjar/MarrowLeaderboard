import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crosshair, TrendingUp, Award, Target, Plus, Lock, XCircle, Clock, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProgressDashboard from './DailyProgressGraph';
import imgSrc from '@/assets/marrow.png';

// Type definitions
type UserKey = 'user1' | 'user2';

interface UserStats {
  completed: number;
  correct: number;
  name: string;
}

interface ActivityLog {
  id: number;
  user_type: UserKey;
  completed: number;
  correct: number;
  timestamp: string;
  created_at: string;
}

interface DailyProgress {
  date: string;
  user1Completed: number;
  user1Correct: number;
  user2Completed: number;
  user2Correct: number;
}

interface AppState {
  stats: {
    user1: UserStats;
    user2: UserStats;
  };
  inputs: {
    user1: { completed: string; correct: string };
    user2: { completed: string; correct: string };
  };
  error: {
    user1: string;
    user2: string;
  };
  password: {
    user1: string;
    user2: string;
  };
  showPasswordInput: {
    user1: boolean;
    user2: boolean;
  };
  showInputs: {
    user1: boolean;
    user2: boolean;
  };
}

// Utility functions
const calculateAccuracy = (correct: number, total: number): string => {
  if (total === 0) return '0';
  return ((correct / total) * 100).toFixed(1);
};

const calculateMetrics = (stats: UserStats) => {
  const accuracy = parseFloat(calculateAccuracy(stats.correct, stats.completed));
  const accuracyThreshold = 80;
  const accuracyBonus = accuracy >= accuracyThreshold ? (accuracy - accuracyThreshold) * 2 : 0;
  const points = stats.completed + (accuracyBonus * stats.completed / 100);
  
  return {
    accuracy,
    points: Math.round(points),
    questionsPerDay: stats.completed,
    effectiveScore: stats.correct
  };
};

const determineLeader = (
  user1Metrics: ReturnType<typeof calculateMetrics>,
  user2Metrics: ReturnType<typeof calculateMetrics>
): ComparisonResult => {
  const compareAndGetLeader = (value1: number, value2: number): UserKey => {
    return value1 >= value2 ? 'user1' : 'user2';
  };

  const comparisons = {
    accuracy: {
      diff: user1Metrics.accuracy - user2Metrics.accuracy,
      leader: compareAndGetLeader(user1Metrics.accuracy, user2Metrics.accuracy),
      metric: 'accuracy',
      value: Math.abs(user1Metrics.accuracy - user2Metrics.accuracy).toFixed(1) + '%'
    },
    volume: {
      diff: user1Metrics.questionsPerDay - user2Metrics.questionsPerDay,
      leader: compareAndGetLeader(user1Metrics.questionsPerDay, user2Metrics.questionsPerDay),
      metric: 'questions',
      value: Math.abs(user1Metrics.questionsPerDay - user2Metrics.questionsPerDay).toString()
    },
    points: {
      diff: user1Metrics.points - user2Metrics.points,
      leader: compareAndGetLeader(user1Metrics.points, user2Metrics.points),
      metric: 'points',
      value: Math.abs(user1Metrics.points - user2Metrics.points).toString()
    },
    effectiveScore: {
      diff: user1Metrics.effectiveScore - user2Metrics.effectiveScore,
      leader: compareAndGetLeader(user1Metrics.effectiveScore, user2Metrics.effectiveScore),
      metric: 'correct',
      value: Math.abs(user1Metrics.effectiveScore - user2Metrics.effectiveScore).toString()
    }
  } as const;

  const overallLeader: UserKey = compareAndGetLeader(user1Metrics.points, user2Metrics.points);
  
  return {
    overallLeader,
    comparisons,
    user1Metrics,
    user2Metrics
  };
};

// Add these type definitions
interface Comparison {
  diff: number;
  leader: UserKey;
  metric: string;
  value: string;
}

interface ComparisonResult {
  overallLeader: UserKey;
  comparisons: {
    accuracy: Comparison;
    volume: Comparison;
    points: Comparison;
    effectiveScore: Comparison;
  };
  user1Metrics: ReturnType<typeof calculateMetrics>;
  user2Metrics: ReturnType<typeof calculateMetrics>;
}


const getISTDate = () => {
  const date = new Date();
  const istTime = date.getTime() + (5.5 * 60 * 60 * 1000);
  const istDate = new Date(istTime);
  return istDate.toISOString().split('T')[0];
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
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

// Stats comparison component
const StatsComparison = ({ stats }: { stats: { user1: UserStats; user2: UserStats } }) => {
  const user1Metrics = calculateMetrics(stats.user1);
  const user2Metrics = calculateMetrics(stats.user2);
  const comparison = determineLeader(user1Metrics, user2Metrics);

  // Filter out points from VS display (keep accuracy, volume, effectiveScore)
  const displayComparisons = Object.entries(comparison.comparisons)
    .filter(([key]) => key !== 'points')
    .map(([key, value]) => value);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'accuracy':
        return <Crosshair className="w-4 h-4" />;
      case 'questions':
        return <Award className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {/* User 1 Stats */}
        <div className="space-y-2">
          <div className="font-medium text-lg">{stats.user1.name}</div>
          <div className="text-3xl font-bold text-blue-600">
            {user1Metrics.accuracy}%
          </div>
          <div className="text-sm text-gray-600">
            {stats.user1.completed} questions
          </div>
          <div className="text-sm text-gray-600">
            {stats.user1.correct} correct
          </div>
          <div className="text-sm font-medium text-purple-600">
            {user1Metrics.points} points
          </div>
        </div>

        {/* Comparison Section */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-xl font-semibold text-purple-600 mb-2">VS</div>
          {displayComparisons.map((value) => (
            <div
              key={value.metric}
              className={`w-full p-2 rounded-lg ${
                value.leader === 'user1' ? 'bg-blue-50' : 'bg-purple-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-gray-600">
                  {getMetricIcon(value.metric)}
                  <span className="text-sm capitalize">{value.metric}</span>
                </div>
                <span className={`text-sm font-medium ${
                  value.leader === 'user1' ? 'text-blue-600' : 'text-purple-600'
                }`}>
                  {stats[value.leader].name}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">
                  +{value.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* User 2 Stats */}
        <div className="space-y-2">
          <div className="font-medium text-lg">{stats.user2.name}</div>
          <div className="text-3xl font-bold text-blue-600">
            {user2Metrics.accuracy}%
          </div>
          <div className="text-sm text-gray-600">
            {stats.user2.completed} questions
          </div>
          <div className="text-sm text-gray-600">
            {stats.user2.correct} correct
          </div>
          <div className="text-sm font-medium text-purple-600">
            {user2Metrics.points} points
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center space-x-2 bg-yellow-50 rounded-full px-4 py-2">
        <Crown size={16} className="text-yellow-500" />
        <span className="text-sm font-medium text-yellow-700">
          {stats[comparison.overallLeader].name} is leading with {
            comparison.comparisons.points.value
          } more points!
        </span>
      </div>

      <div className="text-xs text-center text-gray-500 mt-2">
        Points = Questions Completed + Bonus for Accuracy above 80%
      </div>
    </div>
  );
};

// Activity Log Component
const ActivityLogSection = ({ 
  logs, 
  userNames 
}: { 
  logs: ActivityLog[];
  userNames: { user1: string; user2: string; }
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredLogs = logs.filter(log => isSameDate(log.timestamp, selectedDate));

  const dailyTotals = filteredLogs.reduce((acc, log) => {
    const userType = log.user_type;
    if (!acc[userType]) {
      acc[userType] = { completed: 0, correct: 0 };
    }
    acc[userType].completed += log.completed;
    acc[userType].correct += log.correct;
    return acc;
  }, {} as Record<'user1' | 'user2', { completed: number; correct: number; }>);

  return (
    <Card className="w-full max-w-2xl">
      <div className="p-4 border-b space-y-3">
        <div className="font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity Log
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full"
        />
        {Object.entries(dailyTotals).map(([userType, totals]) => (
          <div key={userType} className="text-sm text-gray-600">
            <span className="font-medium">
              {userType === 'user1' ? userNames.user1 : userNames.user2}
            </span>
            {" total: "}
            {totals.completed} completed, {totals.correct} correct
            {" ("}
            {calculateAccuracy(totals.correct, totals.completed)}
            {"% accuracy)"}
          </div>
        ))}
      </div>
      <div className="max-h-64 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="text-sm p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    {log.user_type === 'user1' ? userNames.user1 : userNames.user2}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  <span className="inline-block mr-3">Completed: {log.completed}</span>
                  <span className="inline-block mr-3">Correct: {log.correct}</span>
                  <span className="inline-block">
                    Accuracy: {calculateAccuracy(log.correct, log.completed)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No entries found for this date
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Main component
const QBankTracker = () => {
  const [state, setState] = useState<AppState>({
    stats: {
      user1: { completed: 0, correct: 0, name: "Aarsh" },
      user2: { completed: 0, correct: 0, name: "Aman" }
    },
    inputs: {
      user1: { completed: '', correct: '' },
      user2: { completed: '', correct: '' }
    },
    error: {
      user1: '',
      user2: ''
    },
    password: {
      user1: '',
      user2: ''
    },
    showPasswordInput: {
      user1: false,
      user2: false
    },
    showInputs: {
      user1: false,
      user2: false
    }
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Password verification
  const verifyPassword = (user: UserKey, password: string): boolean => {
    const passwords = { user1: '9696', user2: '6969' };
    return password === passwords[user];
  };

  // Data fetching functions
  const fetchData = async () => {
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        supabase
          .from('qbank_stats')
          .select('*')
          .eq('id', 'main')
          .single(),
        supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (statsResponse.error && statsResponse.error.code !== 'PGRST116') {
        throw statsResponse.error;
      }

      if (logsResponse.error) {
        throw logsResponse.error;
      }

      if (statsResponse.data?.stats) {
        setState(prev => ({ ...prev, stats: statsResponse.data.stats }));
      }

      if (logsResponse.data) {
        setActivityLogs(logsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchDailyProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      const transformedData = data?.map(entry => ({
        date: entry.date,
        user1Completed: entry.user1_completed,
        user1Correct: entry.user1_correct,
        user2Completed: entry.user2_completed,
        user2Correct: entry.user2_correct
      }));

      setDailyProgress(transformedData || []);
    } catch (error) {
      console.error('Failed to fetch daily progress:', error);
    }
  };

  // Update functions
  const updateDailyProgress = async (user: UserKey, completed: number, correct: number) => {
    const today = getISTDate();
    try {
      const { data: existingData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      const userCompletedField = `${user}_completed`;
      const userCorrectField = `${user}_correct`;

      if (existingData) {
        await supabase
          .from('daily_progress')
          .update({
            [userCompletedField]: (existingData[userCompletedField] || 0) + completed,
            [userCorrectField]: (existingData[userCorrectField] || 0) + correct
          })
          .eq('date', today);
      } else {
        await supabase
          .from('daily_progress')
          .insert({
            date: today,
            user1_completed: user === 'user1' ? completed : 0,
            user1_correct: user === 'user1' ? correct : 0,
            user2_completed: user === 'user2' ? completed : 0,
            user2_correct: user === 'user2' ? correct : 0
          });
      }

      await fetchDailyProgress();
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  };

  const handlePasswordSubmit = (user: UserKey) => {
    if (verifyPassword(user, state.password[user])) {
      setState(prev => ({
        ...prev,
        showPasswordInput: { ...prev.showPasswordInput, [user]: false },
        showInputs: { ...prev.showInputs, [user]: true },
        password: { ...prev.password, [user]: '' },
        error: { ...prev.error, [user]: '' }
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: { ...prev.error, [user]: 'Incorrect password' }
      }));
    }
  };

  const handleSubmit = async (user: UserKey) => {
    const newCompleted = parseInt(state.inputs[user].completed) || 0;
    const newCorrect = parseInt(state.inputs[user].correct) || 0;

    // Validation
    if (newCompleted === 0 || newCorrect > newCompleted || newCompleted < 0 || newCorrect < 0) {
      setState(prev => ({
        ...prev,
        error: { ...prev.error, [user]: "Invalid input values" }
      }));
      return;
    }

    try {
      const updatedStats = {
        ...state.stats,
        [user]: {
          ...state.stats[user],
          completed: state.stats[user].completed + newCompleted,
          correct: state.stats[user].correct + newCorrect,
        },
      };

      // Create the activity log entry
      const { data: logData, error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_type: user,
          completed: newCompleted,
          correct: newCorrect,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (logError) throw logError;

      // Update stats and daily progress
      const [statsResult, progressResult] = await Promise.all([
        supabase
          .from('qbank_stats')
          .upsert({
            id: 'main',
            stats: updatedStats,
            last_updated: new Date().toISOString(),
          }),
        updateDailyProgress(user, newCompleted, newCorrect)
      ]);

      if (statsResult.error) throw statsResult.error;

      // Update local state
      setState(prev => ({
        ...prev,
        stats: updatedStats,
        inputs: { ...prev.inputs, [user]: { completed: '', correct: '' } },
        showInputs: { ...prev.showInputs, [user]: false }
      }));

      // Update activity logs state with the new entry
      if (logData) {
        setActivityLogs(prev => [logData, ...prev.slice(0, 9)]); // Keep only the last 10 entries
      }

      // Refresh data to ensure consistency
      await fetchData();

    } catch (error) {
      console.error('Failed to update data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, [user]: "Failed to update progress" }
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    fetchDailyProgress();
  }, []);

  return (
    <Card className="w-full max-w-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center">
          <img src={imgSrc} alt="Marrow Logo" className="w-12 h-12" />
        </div>
        <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Marrow QBank Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatsComparison stats={state.stats} />
        
        {(['user1', 'user2'] as UserKey[]).map((user) => (
          <div key={user} className="space-y-3 p-4 rounded-lg bg-white shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Target className="text-blue-500" size={20} />
                <span className="font-medium">{state.stats[user].name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setState(prev => ({
                  ...prev,
                  showPasswordInput: { ...prev.showPasswordInput, [user]: true }
                }))}
              >
                <Plus size={16} className="mr-1" />
                Add Progress
              </Button>
            </div>

            {state.showPasswordInput[user] && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-gray-500" />
                  <Input
                    type="password"
                    value={state.password[user]}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      password: { ...prev.password, [user]: e.target.value },
                      error: { ...prev.error, [user]: '' }
                    }))}
                    placeholder="Enter password"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setState(prev => ({
                      ...prev,
                      showPasswordInput: { ...prev.showPasswordInput, [user]: false },
                      password: { ...prev.password, [user]: '' },
                      error: { ...prev.error, [user]: '' }
                    }))}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
                {state.error[user] && (
                  <div className="text-red-500 text-sm">{state.error[user]}</div>
                )}
                <Button 
                  onClick={() => handlePasswordSubmit(user)}
                  className="w-full"
                >
                  Verify Password
                </Button>
              </div>
            )}

            {state.showInputs[user] && (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={state.inputs[user].completed}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    inputs: {
                      ...prev.inputs,
                      [user]: { ...prev.inputs[user], completed: e.target.value }
                    },
                    error: { ...prev.error, [user]: '' }
                  }))}
                  placeholder="Questions completed in this session"
                  className="w-full"
                />
                <Input
                  type="number"
                  value={state.inputs[user].correct}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    inputs: {
                      ...prev.inputs,
                      [user]: { ...prev.inputs[user], correct: e.target.value }
                    },
                    error: { ...prev.error, [user]: '' }
                  }))}
                  placeholder="Correct answers in this session"
                  className="w-full"
                />
                {state.error[user] && (
                  <div className="text-red-500 text-sm">{state.error[user]}</div>
                )}
                <Button 
                  onClick={() => handleSubmit(user)}
                  className="w-full"
                >
                  Add Progress
                </Button>
              </div>
            )}
            
            {!state.showInputs[user] && !state.showPasswordInput[user] && (
              <div className="space-y-1">
                <div>Total Questions: {state.stats[user].completed}</div>
                <div>Correct: {state.stats[user].correct}</div>
                <div className="font-semibold text-lg">
                  Accuracy: {calculateAccuracy(state.stats[user].correct, state.stats[user].completed)}%
                </div>
              </div>
            )}
          </div>
        ))}

        {dailyProgress.length > 0 && (
          <ProgressDashboard 
            dailyData={dailyProgress.map(day => ({
              date: day.date,
              user1Data: {
                date: day.date,
                completed: day.user1Completed,
                correct: day.user1Correct,
                accuracy: (day.user1Correct / day.user1Completed * 100) || 0,
                goalProgress: (day.user1Correct / day.user1Completed * 100) || 0,
              },
              user2Data: {
                date: day.date,
                completed: day.user2Completed,
                correct: day.user2Correct,
                accuracy: (day.user2Correct / day.user2Completed * 100) || 0,
                goalProgress: (day.user2Correct / day.user2Completed * 100) || 0,
              }
            }))}
            user1Name={state.stats.user1.name}
            user2Name={state.stats.user2.name}
            getDate={getISTDate}
          />
        )}

        {activityLogs.length > 0 && (
          <ActivityLogSection 
            logs={activityLogs}
            userNames={{
              user1: state.stats.user1.name,
              user2: state.stats.user2.name
            }}
          />
        )}
        
      </CardContent>
    </Card>
  );
};

export default QBankTracker;