import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Calendar } from 'lucide-react';

interface DailyProgress {
  date: string;
  user1Completed: number;
  user1Correct: number;
  user2Completed: number;
  user2Correct: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
}

const DailyProgressGraph = ({ 
  dailyData, 
  user1Name, 
  user2Name 
}: { 
  dailyData: DailyProgress[];
  user1Name: string;
  user2Name: string;
}) => {
  const [dateRange, setDateRange] = useState('all');
  const [showTrendLines, setShowTrendLines] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['completed', 'correct']);

  // Process data to include more metrics
  const processedData = useMemo(() => {
    const data = dailyData.map(day => {
      const user1Accuracy = (day.user1Correct / day.user1Completed * 100);
      const user2Accuracy = (day.user2Correct / day.user2Completed * 100);
      
      // Calculate improvement rates (day-over-day change)
      const user1Improvement = day.user1Correct / day.user1Completed;
      const user2Improvement = day.user2Correct / day.user2Completed;

      return {
        ...day,
        date: new Date(day.date).toLocaleDateString(),
        user1Accuracy: user1Accuracy.toFixed(1),
        user2Accuracy: user2Accuracy.toFixed(1),
        user1ImprovementRate: (user1Improvement * 100).toFixed(1),
        user2ImprovementRate: (user2Improvement * 100).toFixed(1),
        totalCompleted: day.user1Completed + day.user2Completed,
        totalCorrect: day.user1Correct + day.user2Correct,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter based on date range
    if (dateRange === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return data.filter(item => new Date(item.date) >= lastWeek);
    }
    if (dateRange === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return data.filter(item => new Date(item.date) >= lastMonth);
    }
    return data;
  }, [dailyData, dateRange]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const latest = processedData[processedData.length - 1];
    const previous = processedData[processedData.length - 2];
    
    const getTrend = (current: number, prev: number) => ((current - prev) / prev * 100);
    
    return [
      {
        title: 'Total Completion Rate',
        value: `${((latest.totalCorrect / latest.totalCompleted) * 100).toFixed(1)}%`,
        trend: getTrend(latest.totalCorrect / latest.totalCompleted, previous.totalCorrect / previous.totalCompleted),
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        title: `${user1Name}'s Accuracy`,
        value: `${latest.user1Accuracy}%`,
        trend: getTrend(Number(latest.user1Accuracy), Number(previous.user1Accuracy)),
        icon: <ArrowRight className="h-4 w-4" />
      },
      {
        title: `${user2Name}'s Accuracy`,
        value: `${latest.user2Accuracy}%`,
        trend: getTrend(Number(latest.user2Accuracy), Number(previous.user2Accuracy)),
        icon: <ArrowRight className="h-4 w-4" />
      }
    ];
  }, [processedData, user1Name, user2Name]);

  const MetricCard = ({ title, value, trend, icon }: MetricCard) => (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        {icon}
      </div>
      <div className="mt-2 flex items-center">
        <span className="text-2xl font-semibold">{value}</span>
        <span className={`ml-2 flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    </div>
  );

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Performance Analytics Dashboard</CardTitle>
          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Toggle 
              pressed={showTrendLines} 
              onPressedChange={setShowTrendLines}
              aria-label="Toggle trend lines"
            >
              <TrendingUp className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {summaryMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="progress">Progress Overview</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy Analysis</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="user1Completed" 
                  fill="#8884d8" 
                  opacity={0.2} 
                  name={`${user1Name} Total`}
                />
                <Bar 
                  dataKey="user2Completed" 
                  fill="#82ca9d" 
                  opacity={0.2}
                  name={`${user2Name} Total`}
                />
                <Line
                  type="monotone"
                  dataKey="user1Correct"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name={`${user1Name} Correct`}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="user2Correct"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name={`${user2Name} Correct`}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="accuracy" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="user1Accuracy"
                  fill="#8884d8"
                  stroke="#8884d8"
                  fillOpacity={0.3}
                  name={`${user1Name} Accuracy`}
                />
                <Area
                  type="monotone"
                  dataKey="user2Accuracy"
                  fill="#82ca9d"
                  stroke="#82ca9d"
                  fillOpacity={0.3}
                  name={`${user2Name} Accuracy`}
                />
                {showTrendLines && (
                  <>
                    <Line
                      type="linear"
                      dataKey="user1Accuracy"
                      stroke="#8884d8"
                      strokeDasharray="5 5"
                      name={`${user1Name} Trend`}
                    />
                    <Line
                      type="linear"
                      dataKey="user2Accuracy"
                      stroke="#82ca9d"
                      strokeDasharray="5 5"
                      name={`${user2Name} Trend`}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="trends" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="user1ImprovementRate"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name={`${user1Name} Improvement`}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="user2ImprovementRate"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name={`${user2Name} Improvement`}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailyProgressGraph;