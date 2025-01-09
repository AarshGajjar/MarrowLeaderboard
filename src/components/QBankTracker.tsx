import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserStats {
  completed: number;
  correct: number;
  name: string;
}

interface Inputs {
  completed: string;
  correct: string;
}

interface IsEditing {
  user1: boolean;
  user2: boolean;
}

type UserKey = 'user1' | 'user2';

const QBankTracker = () => {
  const [stats, setStats] = useState<{ user1: UserStats; user2: UserStats }>({
    user1: { completed: 0, correct: 0, name: "bholipunjaban69" },
    user2: { completed: 0, correct: 0, name: "gorlin" }
  });

  const [inputs, setInputs] = useState<{ user1: Inputs; user2: Inputs }>({
    user1: { completed: '', correct: '' },
    user2: { completed: '', correct: '' }
  });

  const [isEditing, setIsEditing] = useState<IsEditing>({
    user1: false,
    user2: false
  });

  const [error, setError] = useState<{ user1: string; user2: string }>({
    user1: '',
    user2: ''
  });

  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    isSyncing: boolean;
    lastSynced: number | null; // Allow null or number
    error: string;
  }>({
    isOnline: true,
    isSyncing: false,
    lastSynced: null,
    error: '',
  });

  // Merge local data with server data
  const mergeData = (
    localData: { user1: UserStats; user2: UserStats },
    serverData: { user1: UserStats; user2: UserStats }
  ) => {
    return {
      user1: {
        completed: localData.user1.completed + serverData.user1.completed,
        correct: localData.user1.correct + serverData.user1.correct,
        name: localData.user1.name,
      },
      user2: {
        completed: localData.user2.completed + serverData.user2.completed,
        correct: localData.user2.correct + serverData.user2.correct,
        name: localData.user2.name,
      }
    };
  };

  // Sync data with Supabase
  const syncData = async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const { data: serverData, error: fetchError } = await supabase
        .from('qbank_stats')
        .select('*')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const dataToUpdate = serverData
        ? mergeData(stats, serverData.stats)
        : stats;

      const { error: upsertError } = await supabase
        .from('qbank_stats')
        .upsert({
          id: 'main',
          stats: dataToUpdate,
          last_updated: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      setStats(dataToUpdate);
      setSyncStatus(prev => ({
        ...prev,
        lastSynced: Date.now(),
        isSyncing: false,
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Sync failed. Will retry later.'
      }));
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel('qbank_stats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qbank_stats' }, (payload: any) => {
        const serverData = payload.new.stats;
        if (serverData) {
          setStats(prev => mergeData(prev, serverData));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle the submit action
  const handleSubmit = (user: UserKey) => {
    const newCompleted = parseInt(inputs[user].completed) || 0;
    const newCorrect = parseInt(inputs[user].correct) || 0;

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

    setError(prev => ({ ...prev, [user]: '' }));
    setStats(prev => ({
      ...prev,
      [user]: {
        ...prev[user],
        completed: isEditing[user] ? newCompleted : prev[user].completed + newCompleted,
        correct: isEditing[user] ? newCorrect : prev[user].correct + newCorrect
      }
    }));

    setInputs(prev => ({
      ...prev,
      [user]: { completed: '', correct: '' }
    }));

    setIsEditing(prev => ({
      ...prev,
      [user]: false
    }));
  };

  // Calculate accuracy
  const calculateAccuracy = (correct: number, completed: number): number => {
    return completed > 0 ? Math.round((correct / completed) * 100) : 0;
  };

  // Get leader based on score
  const getLeader = (): UserKey => {
    const getScore = (user: UserKey): number => {
      const accuracy = calculateAccuracy(stats[user].correct, stats[user].completed);
      const completionPoints = Math.min(stats[user].completed / 100, 1); // Cap at 100 questions
      return (accuracy * 0.7) + (completionPoints * 30); // 70% weight to accuracy, 30% to completion (max 30 points)
    };

    const user1Score = getScore('user1');
    const user2Score = getScore('user2');
    return user1Score >= user2Score ? "user1" : "user2";
  };

  // Comparison header component
  const ComparisonHeader = () => {
    const leader = getLeader();
    return (
      <div className="flex justify-around items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
        {(['user1', 'user2'] as UserKey[]).map((user) => {
          const data = stats[user];
          const accuracy = calculateAccuracy(data.correct, data.completed);
          const isLeader = leader === user;
          return (
            <div key={user} className="text-center space-y-2">
              <div className="relative pt-6">
                {isLeader && (
                  <Crown 
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-yellow-500" 
                    size={24} 
                  />
                )}
                <div className="font-medium text-lg">{data.name}</div>
              </div>
              <div className="text-sm text-slate-600">
                <div className="font-semibold text-lg">{accuracy}%</div>
                <div>Total Questions: {data.completed}</div>
                <div className="text-xs text-slate-500">
                  {data.correct} correct answers
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          QBank Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ComparisonHeader />
        
        {(['user1', 'user2'] as UserKey[]).map((user) => {
          const data = stats[user];
          const accuracy = calculateAccuracy(data.correct, data.completed);
          
          return (
            <div key={user} className="space-y-3 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="text-blue-500" size={20} />
                  <span className="font-medium">{data.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(prev => ({
                      ...prev,
                      [user]: !prev[user]
                    }));
                    setInputs(prev => ({
                      ...prev,
                      [user]: { completed: '', correct: '' }
                    }));
                  }}
                >
                  {isEditing[user] ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              {isEditing[user] ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={inputs[user].completed}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      [user]: { ...prev[user], completed: e.target.value }
                    }))}
                    placeholder="Completed"
                  />
                  <Input
                    type="number"
                    value={inputs[user].correct}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      [user]: { ...prev[user], correct: e.target.value }
                    }))}
                    placeholder="Correct"
                  />
                  {error[user] && (
                    <div className="text-red-500 text-sm">{error[user]}</div>
                  )}
                  <Button onClick={() => handleSubmit(user)}>Save</Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div>Total Questions: {data.completed}</div>
                  <div>Correct Answers: {data.correct}</div>
                  <div className="font-semibold text-lg">Accuracy: {accuracy}%</div>
                </div>
              )}
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={syncData}
        >
          Sync Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default QBankTracker;
