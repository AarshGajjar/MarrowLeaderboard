import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyProgress {
  date: string;
  user1Completed: number;
  user1Correct: number;
  user2Completed: number;
  user2Correct: number;
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
  const formatName = (value: string | number): string => {
    if (typeof value === 'string') {
      return value.replace(/([A-Z])/g, ' $1').trim();
    }
    return String(value);
  };

  // Sort data by date
  const sortedData = [...dailyData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Daily Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch {
                    return value;
                  }
                }}
                formatter={(value, name) => [value, formatName(name)]}
              />
              <Legend formatter={(value) => formatName(value)} />
              <Line 
                type="monotone" 
                dataKey="user1Completed" 
                stroke="#8884d8" 
                name={`${user1Name} Completed`}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="user1Correct" 
                stroke="#82ca9d" 
                name={`${user1Name} Correct`}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="user2Completed" 
                stroke="#ffc658" 
                name={`${user2Name} Completed`}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="user2Correct" 
                stroke="#ff7300" 
                name={`${user2Name} Correct`}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgressGraph;