import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy } from 'lucide-react';

interface EnhancedProgressProps {
  current: number;
  target: number;
}

const EnhancedProgress: React.FC<EnhancedProgressProps> = ({ current, target }) => {
  const rawPercentage = (current / target) * 100;
  const progressPercentage = Math.min(rawPercentage, 100);
  const isTargetReached = current >= target;
  const questionsLeft = Math.max(target - current, 0);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={isTargetReached ? "default" : "secondary"} className="font-medium">
              {isTargetReached ? 
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Target Reached!
                </span> : 
                `${questionsLeft} questions left today`
              }
            </Badge>
            <Badge variant="outline" className="font-medium">
              {Math.round(rawPercentage)}% Complete
            </Badge>
          </div>

          {/* Progress section */}
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className={`h-2 transition-all duration-500 ${
                isTargetReached 
                  ? 'bg-slate-100 [&>div]:bg-indigo-500' 
                  : 'bg-slate-100 [&>div]:bg-slate-600'
              }`}
            />
            
            {/* Fixed completion marker */}
            {isTargetReached && (
              <Trophy 
              className="absolute right-0 top-5 w-5 h-5 text-yellow-500 animate-bounce" 
              style={{
                filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.5))',
                animation: 'bounce 2s infinite'
              }}
              />
            )}
          </div>

          {/* Detailed stats */}
          <div className="flex justify-between items-center text-sm">
            <div className="space-y-1">
              <p className="font-medium text-slate-700">
                {current} of {target} completed
              </p>
              {!isTargetReached && (
                <p className="text-slate-500">
                  Keep going! You're doing great
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProgress;