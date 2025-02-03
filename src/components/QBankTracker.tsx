import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Crosshair, Award, Check, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '../lib/supabase';
import CountdownTimer from './ui/Countdown';
import imgSrc from '@/assets/marrow.png';
import StatsComparison from './functionality/StatsComparision';
import DualUserProgress from './functionality/EnhancedProgress';
import  ActivityLogs from './functionality/ActivityLogs';

// Type definitions
interface UserStats {
  completed: number;
  correct: number;
  name: string;
}

const DAILY_TARGET = 200;

type UserKey = 'user1' | 'user2';
type AlertType = 'success' | 'error';

interface StatsComparisonProps {
  stats: {
    user1: UserStats;
    user2: UserStats;
  };
  onUpdateProgress: (user: UserKey, completed: number, correct: number) => Promise<void>;
  showPasswordInput: {
    user1: boolean;
    user2: boolean;
  };
  setShowPasswordInput: (user: UserKey, value: boolean) => void;
  passwordState: {
    user1: string;
    user2: string;
  };
  onPasswordChange: (user: UserKey, value: string) => void;
  error: {
    user1: string;
    user2: string;
  };
}

interface SectionHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

interface StatusAlertProps {
  message: string;
  type: AlertType;
  onClose: () => void;
}

interface UserProgress {
  completed: number;
  correct: number;
  date: string;
  accuracy: number;
}

interface DailyData {
  user1Data: UserProgress;
  user2Data: UserProgress;
  date: string;
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

const getMetricIcon = (metric: string): React.ReactNode => {
  switch (metric) {
    case 'accuracy':
      return <Crosshair className="w-4 h-4" />;
    case 'questions':
      return <Award className="w-4 h-4" />;
    case 'correct':
      return <Check className="w-4 h-4" />;
    default:
      return null;
  }
};

const convertToDailyData = (progress: DailyProgress[]): DailyData[] => {
  return progress.map(p => ({
    date: p.date,
    user1Data: {
      completed: p.user1Completed,
      correct: p.user1Correct,
      date: p.date,
      accuracy: p.user1Completed > 0 ? (p.user1Correct / p.user1Completed) * 100 : 0
    },
    user2Data: {
      completed: p.user2Completed,
      correct: p.user2Correct,
      date: p.date,
      accuracy: p.user2Completed > 0 ? (p.user2Correct / p.user2Completed) * 100 : 0
    }
  }));
};
  // Section toggle component
  const SectionHeader: React.FC<SectionHeaderProps> = ({ title, isExpanded, onToggle, icon }) => (
    <div
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </div>
  );

  // Alert component
  const StatusAlert: React.FC<StatusAlertProps> = ({ message, type, onClose }) => (
    <Alert className={`${type === 'success' ? 'bg-green-50' : 'bg-red-50'} mb-4`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );

// Main component
const QBankTracker: React.FC = () => {
  
  const [state, setState] = useState<AppState>({
    stats: {
      user1: { completed: 0, correct: 0, name: "Aarsh" },
      user2: { completed: 0, correct: 0, name: "Aman" }
    },
    inputs: {
      user1: { completed: '', correct: '' },
      user2: { completed: '', correct: '' }
    },
    showInputs: {
      user1: false,
      user2: false
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
    }
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Refresh data function
  const refreshData = async () => {
    await fetchData();
    await fetchDailyProgress();
  };

  // Alerts
  const [showAlert, setShowAlert] = useState<{
    message: string;
    type: AlertType;
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const [expandedSections, setExpandedSections] = useState<{
    progress: boolean;
    charts: boolean;
    logs: boolean;
  }>({
    progress: true,
    charts: false,
    logs: false,
  });

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

  const handleSubmit = async (user: UserKey, completed: number, correct: number) => {
    
    // Validation
    if (completed === 0 || correct > completed || completed < 0 || correct < 0) {
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
          completed: state.stats[user].completed + completed,
          correct: state.stats[user].correct + correct,
        },
      };
  
      // Update stats in database
      const { error: statsError } = await supabase
        .from('qbank_stats')
        .upsert({
          id: 'main',
          stats: updatedStats,
          last_updated: new Date().toISOString(),
        });
  
      if (statsError) throw statsError;
  
      // Create activity log entry
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_type: user,
          completed: completed,
          correct: correct,
          timestamp: new Date().toISOString()
        });
  
      if (logError) throw logError;
  
      // Update daily progress
      await updateDailyProgress(user, completed, correct);
  
      // Update local state
      setState(prev => ({
        ...prev,
        stats: updatedStats
      }));
  
      // Refresh data to ensure consistency
      await fetchData();
  
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error; // This will be caught by the StatsComparison component
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
      <CardContent className="space-y-6"><CountdownTimer />
        {showAlert.visible && (
          <StatusAlert
            message={showAlert.message}
            type={showAlert.type}
            onClose={() => setShowAlert(prev => ({ ...prev, visible: false }))}
          />
        )}

        <StatsComparison
          stats={state.stats}
          onUpdateProgress={handleSubmit}
          dailyData={dailyProgress}
          activityLogs={activityLogs}
        />

        {/* Daily progress section */}
        <DualUserProgress
          user1={{
            name:state.stats.user1.name,
            current: dailyProgress.length > 0 ? dailyProgress[dailyProgress.length - 1].user1Completed : 0,
            color: "#2563eb"
          }}
          user2={{
            name:state.stats.user2.name, 
            current: dailyProgress.length > 0 ? dailyProgress[dailyProgress.length - 1].user2Completed : 0,
            color: "#7242eb"
          }}
          target={DAILY_TARGET}
        />

        {/* Activity Logs Section */}
        <div className="border rounded-lg overflow-hidden">
          <ActivityLogs
              logs={activityLogs}
              userNames={{
                user1: state.stats.user1.name,
                user2: state.stats.user2.name
              }}
              onRefresh={refreshData}
            />
        </div>
      </CardContent>
    </Card>
  );
};

export default QBankTracker;

function setShowAlert(arg0: { message: string; type: string; visible: boolean; }) {
  throw new Error('Function not implemented.');
}
