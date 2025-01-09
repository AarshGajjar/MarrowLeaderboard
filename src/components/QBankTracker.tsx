import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Target, Edit2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      metric: 'correct answers',
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
  
  return (
    <div className="space-y-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-2">
          <div className="font-medium text-lg">{stats.user1.name}</div>
          <div className="text-3xl font-bold text-blue-600">
            {user1Metrics.accuracy}%
          </div>
          <div className="text-sm text-gray-600">
            {stats.user1.completed} cards
          </div>
          <div className="text-sm font-medium text-purple-600">
            {user1Metrics.points} points
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-xl font-semibold text-purple-600">VS</div>
          {Object.entries(comparison.comparisons).map(([key, value]) => (
            <div key={key} className="text-sm text-gray-600">
              {value.value} {value.metric}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="font-medium text-lg">{stats.user2.name}</div>
          <div className="text-3xl font-bold text-blue-600">
            {user2Metrics.accuracy}%
          </div>
          <div className="text-sm text-gray-600">
            {stats.user2.completed} cards
          </div>
          <div className="text-sm font-medium text-purple-600">
            {user2Metrics.points} points
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center space-x-2">
        <Crown size={16} className="text-yellow-500" />
        <span className="text-sm font-medium text-yellow-600">
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
    user1: { completed: 0, correct: 0, name: "bholipunjaban69" },
    user2: { completed: 0, correct: 0, name: "gorlin" },
  });

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

  useEffect(() => {
    fetchData();
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

    const updatedStats = {
      ...stats,
      [user]: {
        ...stats[user],
        completed: mode[user] === 'edit' ? newCompleted : stats[user].completed + newCompleted,
        correct: mode[user] === 'edit' ? newCorrect : stats[user].correct + newCorrect,
      },
    };

    try {
      const { error: upsertError } = await supabase
        .from('qbank_stats')
        .upsert({
          id: 'main',
          stats: updatedStats,
          last_updated: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

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
      console.error('Failed to update stats:', error);
    }
  };

  return (
    <Card className="w-full max-w-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          QBank Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatsComparison stats={stats} />
        
        {(['user1', 'user2'] as UserKey[]).map((user) => (
          <div key={user} className="space-y-3 p-4 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="text-blue-500" size={20} />
                <span className="font-medium">{stats[user].name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode(prev => ({
                    ...prev,
                    [user]: mode[user] === 'add' ? 'view' : 'add'
                  }))}
                >
                  <Plus size={16} className="mr-1" />
                  Add Progress
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (mode[user] === 'edit') {
                      setMode(prev => ({ ...prev, [user]: 'view' }));
                      setInputs(prev => ({
                        ...prev,
                        [user]: { completed: '', correct: '' },
                      }));
                    } else {
                      setMode(prev => ({ ...prev, [user]: 'edit' }));
                      setInputs(prev => ({
                        ...prev,
                        [user]: {
                          completed: stats[user].completed.toString(),
                          correct: stats[user].correct.toString(),
                        },
                      }));
                    }
                  }}
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit Stats
                </Button>
              </div>
            </div>

            {mode[user] !== 'view' && (
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
            
            {mode[user] === 'view' && (
              <div className="space-y-1">
                <div>Total Questions: {stats[user].completed}</div>
                <div>Correct Answers: {stats[user].correct}</div>
                <div className="font-semibold text-lg">
                  Accuracy: {calculateAccuracy(stats[user].correct, stats[user].completed)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QBankTracker;