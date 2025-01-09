import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Target } from 'lucide-react';

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

  const calculateAccuracy = (correct: number, completed: number): number => {
    return completed > 0 ? Math.round((correct / completed) * 100) : 0;
  };

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
                      [user]: isEditing[user] ? 
                        { completed: '', correct: '' } : 
                        { completed: data.completed.toString(), correct: data.correct.toString() }
                    }));
                    setError(prev => ({ ...prev, [user]: '' }));
                  }}
                >
                  {isEditing[user] ? "Cancel" : "Edit"}
                </Button>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{accuracy}%</span>
                    <span className="text-slate-400 text-xs">({data.correct}/{data.completed})</span>
                  </div>
                </div>
              </div>

              {error[user] && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error[user]}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder={isEditing[user] ? "Total Questions" : "Questions Done"}
                  value={inputs[user].completed}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    [user]: { ...prev[user], completed: e.target.value }
                  }))}
                  min="0"
                  className="bg-slate-50"
                />
                <Input
                  type="number"
                  placeholder={isEditing[user] ? "Total Correct" : "Correct Answers"}
                  value={inputs[user].correct}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    [user]: { ...prev[user], correct: e.target.value }
                  }))}
                  min="0"
                  className="bg-slate-50"
                />
              </div>
              
              <Button 
                onClick={() => handleSubmit(user)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-colors"
              >
                {isEditing[user] ? "Save Changes" : "Add Progress"}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QBankTracker;