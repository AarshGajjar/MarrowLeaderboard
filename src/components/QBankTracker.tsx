import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {  Crosshair, TrendingUp, Award, Crown, Target, Edit2, Plus, Lock, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DailyProgressGraph from './DailyProgressGraph';
import imgSrc from '@/assets/marrow.png';

interface UserStats {
  completed: number;
  correct: number;
  name: string;
}

type UserKey = 'user1' | 'user2';

interface StatsType {
  user1: UserStats;
  user2: UserStats;
}

interface Inputs {
  completed: string;
  correct: string;
}

interface DailyProgress {
  date: string;
  user1Completed: number;
  user1Correct: number;
  user2Completed: number;
  user2Correct: number;
}

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

const StatsComparison = ({ stats }: { stats: StatsType }) => {
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


const QBankTracker = () => {
  const [stats, setStats] = useState<{ user1: UserStats; user2: UserStats }>({
    user1: { completed: 0, correct: 0, name: "Aarsh" },
    user2: { completed: 0, correct: 0, name: "Aman" },
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);  

  const [inputs, setInputs] = useState<{ user1: Inputs; user2: Inputs }>({
    user1: { completed: '', correct: '' },
    user2: { completed: '', correct: '' },
  });

  const [mode, setMode] = useState<{ [key in UserKey]: 'view' | 'add' | 'edit' }>({
    user1: 'view',
    user2: 'view',
  });

  const [error, setError] = useState<{ user1: string; user2: string }>({
    user1: '',
    user2: '',
  });

  // Password function
  const [passwordInput, setPasswordInput] = useState<{ [key in UserKey]: string}>({
    user1: '',
    user2: '',
  })
  const [showPasswordInput, setShowPasswordInput] = useState<{ [key in UserKey]: boolean }>({
    user1: false,
    user2: false,
  });
  const [passwordError, setPasswordError] = useState<{ [key in UserKey]: string }>({
    user1: '',
    user2: '',
  });

  // Password validation
  const verifyPassword = (user: UserKey, password: string) => {
    const correctPasswords = {
      user1: '9696', 
      user2: '6969'  
    };

    if (password === correctPasswords[user]) {
      setPasswordError(prev => ({ ...prev, [user]: '' }));
      setShowPasswordInput(prev => ({ ...prev, [user]: false }));
      return true;
    }
    
    setPasswordError(prev => ({ ...prev, [user]: 'Incorrect password' }));
    return false;
  };

  // Modified function to handle mode changes with password verification
  const handleModeChange = (user: UserKey, newMode: 'view' | 'add' | 'edit') => {
    if (newMode === 'view') {
      setMode(prev => ({ ...prev, [user]: 'view' }));
      setShowPasswordInput(prev => ({ ...prev, [user]: false }));
      setPasswordInput(prev => ({ ...prev, [user]: '' }));
      setPasswordError(prev => ({ ...prev, [user]: '' }));
      if (newMode === 'view' && mode[user] === 'edit') {
        setInputs(prev => ({
          ...prev,
          [user]: { completed: '', correct: '' },
        }));
      }
    } else {
      setShowPasswordInput(prev => ({ ...prev, [user]: true }));
      if (newMode === 'edit') {
        setInputs(prev => ({
          ...prev,
          [user]: {
            completed: stats[user].completed.toString(),
            correct: stats[user].correct.toString(),
          },
        }));
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchDailyProgress();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('qbank_stats')
        .select('*')
        .eq('id', 'main')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };


  const fetchDailyProgress = async () => {
    try {
      console.log('Fetching daily progress...'); // Debug log
      const { data: tableData, error: tableError } = await supabase
        .from('daily_progress')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('Error accessing daily_progress table:', tableError);
        return;
      }

      const { data, error: fetchError } = await supabase
      .from('daily_progress')
      .select('date, user1_completed, user1_correct, user2_completed, user2_correct')
      .order('date', { ascending: true });
 
      if (fetchError) {
        console.error('Supabase error:', fetchError); // Detailed error logging
        return;
      }

      console.log('Raw daily progress data:', data); // Debug log

      if (!data || data.length === 0) {
        console.log('No daily progress data found in the table');
        return;
      }
        
      // Transform the snake_case data to camelCase for the component
      const transformedData = data.map(entry => ({
        date: entry.date,
        user1Completed: entry.user1_completed,
        user1Correct: entry.user1_correct,
        user2Completed: entry.user2_completed,
        user2Correct: entry.user2_correct
      }));

        console.log('Transformed daily progress data:', transformedData); // Debug log
        setDailyProgress(transformedData);
      } catch (error) {
      console.error('Failed to fetch daily progress:', error);
    }
  };

  const updateDailyProgress = async (user: UserKey, completed: number, correct: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    
    try {
      console.log('Updating daily progress for:', { user, completed, correct, today }); // Debug log
      
      // First, try to get today's entry
      const { data: existingData, error: fetchError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing entry:', fetchError);
        throw fetchError;
      }

      const userCompletedField = `${user}_completed`;
      const userCorrectField = `${user}_correct`;

      if (existingData) {
        console.log('Existing entry found:', existingData); // Debug log
        
        // Update existing entry using snake_case column names
        const updateData = {
          [userCompletedField]: (existingData[userCompletedField] || 0) + completed,
          [userCorrectField]: (existingData[userCorrectField] || 0) + correct
        };

        const { error: updateError } = await supabase
          .from('daily_progress')
          .update(updateData)
          .eq('date', today);

        if (updateError) {
          console.error('Error updating entry:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new entry for today'); // Debug log
        
        // Create new entry using snake_case column names
        const newEntry = {
          date: today,
          user1_completed: user === 'user1' ? completed : 0,
          user1_correct: user === 'user1' ? correct : 0,
          user2_completed: user === 'user2' ? completed : 0,
          user2_correct: user === 'user2' ? correct : 0
        };

        const { error: insertError } = await supabase
          .from('daily_progress')
          .insert(newEntry);

        if (insertError) {
          console.error('Error inserting new entry:', insertError);
          throw insertError;
        }
      }

      // Fetch updated data
      await fetchDailyProgress();
      
    } catch (error) {
      console.error('Error in updateDailyProgress:', error);
    }
  };

  const handleInputChange = (
    user: UserKey,
    field: 'completed' | 'correct',
    value: string
  ) => {
    setInputs(prev => ({
      ...prev,
      [user]: {
        ...prev[user],
        [field]: value
      }
    }));
    setError(prev => ({ ...prev, [user]: '' }));
  };

  const handleSubmit = async (user: UserKey) => {

    if (!verifyPassword(user, passwordInput[user])) {
      return;
    }

    const newCompleted = parseInt(inputs[user].completed) || 0;
    const newCorrect = parseInt(inputs[user].correct) || 0;

    // Validation
    if (newCompleted === 0) {
      setError(prev => ({
        ...prev,
        [user]: "Please enter the number of completed questions"
      }));
      return;
    }

    if (newCorrect > newCompleted) {
      setError(prev => ({
        ...prev,
        [user]: "Correct answers can't exceed total questions"
      }));
      return;
    }

    if (newCompleted < 0 || newCorrect < 0) {
      setError(prev => ({
        ...prev,
        [user]: "Values cannot be negative"
      }));
      return;
    }

    try {
      console.log('Starting handleSubmit for:', user); // Debug log

      // First update the total stats
      const updatedStats = {
        ...stats,
        [user]: {
          ...stats[user],
          completed: mode[user] === 'edit' ? newCompleted : stats[user].completed + newCompleted,
          correct: mode[user] === 'edit' ? newCorrect : stats[user].correct + newCorrect,
        },
      };

      console.log('Updating stats with:', updatedStats); // Debug log

      const { error: statsError } = await supabase
        .from('qbank_stats')
        .upsert({
          id: 'main',
          stats: updatedStats,
          last_updated: new Date().toISOString(),
        });

      if (statsError) throw statsError;

      console.log('Stats updated successfully, mode is:', mode[user]);

      // Only update daily progress when adding new progress, not when editing
      if (mode[user] === 'add') {
        console.log('Calling updateDailyProgress with:', {
          user,
          newCompleted,
          newCorrect
        });
        await updateDailyProgress(user, newCompleted, newCorrect);
      }

      setStats(updatedStats);
      setInputs(prev => ({
        ...prev,
        [user]: { completed: '', correct: '' },
      }));
      setMode(prev => ({
        ...prev,
        [user]: 'view',
      }));

    } catch (error) {
      console.error('Failed to update data:', error);
    }
  };

  return (
    <Card className="w-full max-w-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      <CardHeader className="space-y-1">
        <div className = "flex justify-center">
          <img src={imgSrc} alt="Marrow Logo" className="w-12 h-12" />
        </div>
        <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Marrow QBank Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatsComparison stats={stats} />
        
        {(['user1', 'user2'] as UserKey[]).map((user) => (
          <div key={user} className="space-y-3 p-4 rounded-lg bg-white shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Target className="text-blue-500" size={20} />
                <span className="font-medium">{stats[user].name}</span>
              </div>
              <div className="flex flex-wrap ml-auto gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  onClick={() => handleModeChange(user, mode[user] === 'add' ? 'view' : 'add')}
                >
                  <Plus size={16} className="mr-1" />
                  Add Progress
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  onClick={() => handleModeChange(user, mode[user] === 'add' ? 'view' : 'add')}
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit Stats
                </Button>
              </div>
            </div>

            
            {showPasswordInput[user] && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-gray-500" />
                  <Input
                    type="password"
                    value={passwordInput[user]}
                    onChange={(e) => {
                      setPasswordInput(prev => ({ ...prev, [user]: e.target.value }));
                      setPasswordError(prev => ({ ...prev, [user]: '' }));
                    }}
                    placeholder="Enter password"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordInput(prev => ({ ...prev, [user]: false }));
                      setPasswordInput(prev => ({ ...prev, [user]: '' }));
                      setPasswordError(prev => ({ ...prev, [user]: '' }));
                      setMode(prev => ({ ...prev, [user]: 'view' }));
                    }}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
                {passwordError[user] && (
                  <div className="text-red-500 text-sm">{passwordError[user]}</div>
                )}
                <Button 
                  onClick={() => {
                    if (verifyPassword(user, passwordInput[user])) {
                      setMode(prev => ({ ...prev, [user]: showPasswordInput[user] ? 'add' : 'edit' }));
                    }
                  }}
                  className="w-full"
                >
                  Verify Password
                </Button>
              </div>
            )}

            {mode[user] !== 'view' && !showPasswordInput[user] && (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={inputs[user].completed}
                  onChange={(e) => handleInputChange(user, 'completed', e.target.value)}
                  placeholder={mode[user] === 'add' ? "Questions completed in this session" : "Total questions completed"}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={inputs[user].correct}
                  onChange={(e) => handleInputChange(user, 'correct', e.target.value)}
                  placeholder={mode[user] === 'add' ? "Correct answers in this session" : "Total correct answers"}
                  className="w-full"
                />
                {error[user] && (
                  <div className="text-red-500 text-sm">{error[user]}</div>
                )}
                <Button 
                  onClick={() => handleSubmit(user)}
                  className="w-full"
                >
                  {mode[user] === 'add' ? 'Add Progress' : 'Update Stats'}
                </Button>
              </div>
            )}
            
            {mode[user] === 'view' && !showPasswordInput[user] && (
              <div className="space-y-1">
                <div>Total Questions: {stats[user].completed}</div>
                <div>Correct: {stats[user].correct}</div>
                <div className="font-semibold text-lg">
                  Accuracy: {calculateAccuracy(stats[user].correct, stats[user].completed)}%
                </div>
              </div>
            )}
          </div>
        ))}

        {dailyProgress.length > 0 && (
          <DailyProgressGraph 
            dailyData={dailyProgress}
            user1Name={stats.user1.name}
            user2Name={stats.user2.name}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default QBankTracker;