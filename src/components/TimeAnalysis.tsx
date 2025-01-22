import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Label } from 'recharts';

interface ActivityLog {
  user_type: string;
  completed: number;
  correct: number;
  timestamp: string;
}

interface TimeAnalysisProps {
  activityLogs: ActivityLog[];
  selectedUser: string;
  dateRange?: string;
}

const TimeAnalysis: React.FC<TimeAnalysisProps> = ({ activityLogs, selectedUser, dateRange = 'all' }) => {
  const { hourlyData, averageAccuracy, peakHour, lowPoint } = useMemo(() => {
    const filteredLogs = activityLogs.filter(log => 
      selectedUser === 'both' || log.user_type === selectedUser
    );

    const hours = Array(24).fill(null).map((_, hour) => {
      const logsInHour = filteredLogs.filter(log => 
        new Date(log.timestamp).getHours() === hour
      );
      
      const totalCorrect = logsInHour.reduce((sum, log) => sum + log.correct, 0);
      const totalCompleted = logsInHour.reduce((sum, log) => sum + log.completed, 0);
      const accuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100 * 10) / 10 : 0;

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        accuracy,
        attempts: logsInHour.length,
        totalQuestions: totalCompleted,
        hourValue: hour
      };
    });

    const validAccuracies = hours.filter(h => h.accuracy > 0).map(h => h.accuracy);
    const average = validAccuracies.length > 0 
      ? Math.round(validAccuracies.reduce((a, b) => a + b) / validAccuracies.length * 10) / 10
      : 0;

    const peak = hours.reduce((max, curr) => 
      (curr.accuracy > max.accuracy) ? curr : max, 
      { accuracy: 0, hour: '' }
    );

    const low = hours.reduce((min, curr) => 
      (curr.accuracy > 0 && curr.accuracy < min.accuracy) ? curr : min,
      { accuracy: 100, hour: '' }
    );

    return {
      hourlyData: hours,
      averageAccuracy: average,
      peakHour: peak,
      lowPoint: low
    };
  }, [activityLogs, selectedUser, dateRange]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance by Hour</h3>
          <p className="text-sm text-gray-500">Accuracy trends and activity patterns</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-violet-600 rounded-full" />
            <span className="text-gray-600">Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-violet-200 rounded" />
            <span className="text-gray-600">Volume</span>
          </div>
        </div>
      </div>

      <div className="relative h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={hourlyData} margin={{ top: 20, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="hour"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickMargin={8}
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickMargin={8}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickMargin={8}
            />
            
            <ReferenceLine 
              yAxisId="left" 
              y={averageAccuracy}
              stroke="#dc2626"
              strokeDasharray="3 3"
              label={
                <Label 
                  value={`Avg ${averageAccuracy}%`} 
                  position="right" 
                  fill="#dc2626"
                  fontSize={10}
                />
              }
            />

            <Tooltip 
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-2">{data.hour}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-violet-600">Accuracy:</span>
                        <span className="font-medium">{data.accuracy}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-violet-400">Questions:</span>
                        <span className="font-medium">{data.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Sessions:</span>
                        <span className="font-medium">{data.attempts}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Bar 
              yAxisId="right"
              dataKey="totalQuestions" 
              fill="#a78bfa"
              opacity={0.2}
              radius={[4, 4, 0, 0]}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="accuracy"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="absolute top-0 right-0 flex gap-4">
          {peakHour.accuracy > 0 && (
            <div className="bg-green-50 px-3 py-2 rounded-lg text-sm">
              <span className="text-green-600 font-medium">Peak: </span>
              <span className="text-green-800">
                {peakHour.hour} ({peakHour.accuracy}%)
              </span>
            </div>
          )}
          {lowPoint.accuracy < 100 && (
            <div className="bg-red-50 px-3 py-2 rounded-lg text-sm">
              <span className="text-red-600 font-medium">Low: </span>
              <span className="text-red-800">
                {lowPoint.hour} ({lowPoint.accuracy}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;