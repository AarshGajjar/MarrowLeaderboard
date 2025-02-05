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
  const [viewType, setViewType] = useState<'chart' | 'scatter' | 'clock'>('chart');

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

  const getClockIndicators = (data: any[]) => {
    return Array.from({ length: 24 }, (_, hour) => {
      const interval = data.find(d => 
        d.intervalValue <= hour && 
        hour < (d.intervalValue + 3)
      );
      
      return {
        hour,
        rotation: hour * 15,
        activity: interval?.totalQuestions || 0,
        accuracy: interval?.accuracy || 0
      };
    });
  };

  const renderClock = () => {
    const indicators = getClockIndicators(hourlyData);
    const maxActivity = Math.max(...indicators.map(i => i.activity));

    return (
      <div className="relative w-80 h-80 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700">
          {indicators.map((indicator) => {
            const activityScale = indicator.activity / maxActivity;
            const accuracyColor = indicator.accuracy >= 70 
              ? 'bg-green-500 dark:bg-green-400' 
              : indicator.accuracy >= 50 
                ? 'bg-yellow-500 dark:bg-yellow-400' 
                : 'bg-red-500 dark:bg-red-400';

            return (
              <div
                key={indicator.hour}
                className="absolute w-1 transform -translate-x-1/2 origin-bottom"
                style={{
                  height: '48%',
                  left: '50%',
                  top: '2%',
                  transform: `rotate(${indicator.rotation}deg)`
                }}
              >
                {indicator.activity > 0 && (
                  <div
                    className={`absolute bottom-0 w-full ${accuracyColor}`}
                    style={{
                      height: `${Math.max(activityScale * 100, 10)}%`,
                      opacity: 0.6
                    }}
                  />
                )}
              </div>
            );
          })}
          
          {/* Updated clock numbers */}
          {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => {
            const angle = hour * 15;
            const x = 50 + 42 * Math.sin(angle * Math.PI / 180);
            const y = 50 - 42 * Math.cos(angle * Math.PI / 180);
            
            return (
              <div
                key={hour}
                className="absolute text-xxs font-medium text-gray-600 dark:text-gray-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: 'var(--tw-bg-opacity)',
                  padding: '2px 4px',
                  borderRadius: '2px',
                }}
              >
                <span className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded">
                  {`${hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}${hour < 12 ? 'AM' : 'PM'}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
                  <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-violet-600 dark:text-violet-400">Accuracy:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{data.y}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-violet-400 dark:text-violet-300">Correct:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{data.correct}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500 dark:text-gray-400">Total:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{data.completed}</span>
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
                <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{data.hour} hrs</p>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-4">
                      <span className="text-violet-600 dark:text-violet-400">Accuracy:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{data.accuracy}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-violet-400 dark:text-violet-300">Questions:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{data.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 dark:text-gray-400">Sessions:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{data.attempts}</span>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance by 3-Hour Intervals</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy trends and activity patterns</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setViewType('chart')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewType === 'chart' 
                  ? 'bg-violet-600 text-white dark:bg-violet-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Chart
            </button>
            <button 
              onClick={() => setViewType('scatter')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewType === 'scatter' 
                  ? 'bg-violet-600 text-white dark:bg-violet-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Scatter
            </button>
            <button 
              onClick={() => setViewType('clock')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewType === 'clock' 
                  ? 'bg-violet-600 text-white dark:bg-violet-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Clock
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-80 sm:h-96 mb-4">
        {viewType === 'clock' ? renderClock() : viewType === 'scatter' ? renderChart() : renderChart()}
      </div>

      {(peakPeriod.accuracy > 0 || lowPeriod.accuracy < 100) && (
        <div className="flex gap-4 justify-end">
          {peakPeriod.accuracy > 0 && (
            <div className="bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg text-sm">
              <span className="text-green-700 dark:text-green-400 font-medium">Peak: </span>
              <span className="text-green-600 dark:text-green-300">
                {peakPeriod.hour} ({peakPeriod.accuracy}%)
              </span>
            </div>
          )}
          {lowPeriod.accuracy < 100 && (
            <div className="bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg text-sm">
              <span className="text-red-700 dark:text-red-400 font-medium">Low: </span>
              <span className="text-red-600 dark:text-red-300">
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