import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  ScatterChart, 
  Scatter, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Label 
} from 'recharts';

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

const TimeAnalysis: React.FC<TimeAnalysisProps> = ({ 
  activityLogs, 
  selectedUser, 
  dateRange = 'all' 
}) => {
  const [viewType, setViewType] = useState<'chart' | 'scatter'>('chart');

  const { 
    hourlyData, 
    averageAccuracy, 
    peakPeriod, 
    lowPeriod, 
    scatterData 
  } = useMemo(() => {
    // Filter logs based on selected user
    const filteredLogs = activityLogs.filter(log => 
      selectedUser === 'both' || log.user_type === selectedUser
    );

    // Interval data processing (unchanged from previous version)
    const intervals = [
      { label: '12 AM - 3 AM', range: [0, 3] },
      { label: '3 AM - 6 AM', range: [3, 6] },
      { label: '6 AM - 9 AM', range: [6, 9] },
      { label: '9 AM - 12 PM', range: [9, 12] },
      { label: '12 PM - 3 PM', range: [12, 15] },
      { label: '3 PM - 6 PM', range: [15, 18] },
      { label: '6 PM - 9 PM', range: [18, 21] },
      { label: '9 PM - 12 AM', range: [21, 24] }
    ];

    const processedIntervals = intervals.map(interval => {
      const logsInInterval = filteredLogs.filter(log => {
        const hour = new Date(log.timestamp).getHours();
        return hour >= interval.range[0] && hour < interval.range[1];
      });
      
      const totalCorrect = logsInInterval.reduce((sum, log) => sum + log.correct, 0);
      const totalCompleted = logsInInterval.reduce((sum, log) => sum + log.completed, 0);
      const accuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100 * 10) / 10 : 0;

      return {
        hour: interval.label,
        accuracy,
        attempts: logsInInterval.length,
        totalQuestions: totalCompleted,
        intervalValue: interval.range[0]
      };
    }).filter(interval => interval.totalQuestions > 0);

    // Scatter plot data preparation
    const scatterData = filteredLogs.map(log => {
      const date = new Date(log.timestamp);
      const hour = date.getHours() + date.getMinutes() / 60;
      const accuracy = log.completed > 0 
        ? Math.round((log.correct / log.completed) * 100 * 10) / 10 
        : 0;
      
      return {
        x: hour,
        y: accuracy,
        timestamp: log.timestamp,
        completed: log.completed,
        correct: log.correct
      };
    });

    const validAccuracies = processedIntervals.filter(h => h.accuracy > 0).map(h => h.accuracy);
    const average = validAccuracies.length > 0 
      ? Math.round(validAccuracies.reduce((a, b) => a + b) / validAccuracies.length * 10) / 10
      : 0;

    const peak = processedIntervals.reduce((max, curr) => 
      (curr.accuracy > max.accuracy) ? curr : max, 
      { accuracy: 0, hour: '' }
    );

    const low = processedIntervals.reduce((min, curr) => 
      (curr.accuracy > 0 && curr.accuracy < min.accuracy) ? curr : min,
      { accuracy: 100, hour: '' }
    );

    return {
      hourlyData: processedIntervals,
      averageAccuracy: average,
      peakPeriod: peak,
      lowPeriod: low,
      scatterData
    };
  }, [activityLogs, selectedUser, dateRange]);

  const renderChart = () => {
    if (viewType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              type="number"
              dataKey="x"
              domain={[0, 24]}
              ticks={[0, 6, 12, 18, 24]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(value) => {
                const hours = Math.floor(value);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedHours = hours % 12 || 12;
                return `${formattedHours} ${ampm}`;
              }}
              tickMargin={8}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickMargin={8}
            />
            <Tooltip 
              content={({ payload }) => {
                if (!payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-2">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-violet-600">Accuracy:</span>
                        <span className="font-medium">{data.y}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-violet-400">Correct:</span>
                        <span className="font-medium">{data.correct}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium">{data.completed}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter 
              data={scatterData} 
              fill="#7c3aed"
              fillOpacity={0.5}
              dataKey="y"
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return (
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
                  <p className="font-semibold text-gray-800 mb-2">{data.hour} hrs</p>
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
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance by 3-Hour Intervals</h3>
          <p className="text-sm text-gray-500">Accuracy trends and activity patterns</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setViewType('chart')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewType === 'chart' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chart
            </button>
            <button 
              onClick={() => setViewType('scatter')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewType === 'scatter' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Scatter
            </button>
          </div>
          <div className="flex gap-4 text-sm hidden sm:flex">
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
      </div>

      <div className="relative h-80 sm:h-96 mb-4">
        {renderChart()}
      </div>

      {(peakPeriod.accuracy > 0 || lowPeriod.accuracy < 100) && (
        <div className="flex gap-4 justify-end">
          {peakPeriod.accuracy > 0 && (
            <div className="bg-green-50 px-3 py-2 rounded-lg text-sm">
              <span className="text-green-700 font-medium">Peak: </span>
              <span className="text-green-600">
                {peakPeriod.hour} ({peakPeriod.accuracy}%)
              </span>
            </div>
          )}
          {lowPeriod.accuracy < 100 && (
            <div className="bg-red-50 px-3 py-2 rounded-lg text-sm">
              <span className="text-red-700 font-medium">Low: </span>
              <span className="text-red-600">
                {lowPeriod.hour} ({lowPeriod.accuracy}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeAnalysis;