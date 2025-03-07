import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO, startOfWeek, addDays, isAfter} from 'date-fns';

interface HeatmapProps {
  dailyProgress: Array<{
    date: string;
    user1Completed: number;
    user1Correct: number;
    user2Completed: number;
    user2Correct: number;
  }>;
  userNames: {
    user1: string;
    user2: string;
  };
}

const ActivityHeatmap: React.FC<HeatmapProps> = ({ dailyProgress, userNames }) => {
  const [activeUser, setActiveUser] = useState<'user1' | 'user2' | 'both'>('both');
  
  // Generate the grid from first activity to today
  const dateData = useMemo(() => {
    if (!dailyProgress.length) {
      return { grid: [] };
    }
    
    // Find the first activity date
    const sortedDates = [...dailyProgress]
      .filter(day => day.user1Completed > 0 || day.user2Completed > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Default to Jan 1 if no activity found
    const firstActivityDate = sortedDates.length > 0 
      ? parseISO(sortedDates[0].date) 
      : new Date(2025, 0, 1);
    
    // Current date as the end date
    const today = new Date();
    
    // Start from the beginning of the week that contains the first activity
    const firstDayOfCalendar = startOfWeek(firstActivityDate);
    
    // Calculate how many weeks we need
    const totalDays = Math.ceil((today.getTime() - firstDayOfCalendar.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);
    
    // Create the grid
    const grid: Array<Array<{date: Date, formattedDate: string, hasActivity: boolean}>> = [];
    
    // Initialize the grid with empty arrays for each day of the week (0-6)
    for (let i = 0; i < 7; i++) {
      grid[i] = [];
    }
    
    // Fill the grid with dates from first activity to today
    for (let i = 0; i <= totalWeeks; i++) {
      for (let j = 0; j < 7; j++) {
        const date = addDays(firstDayOfCalendar, i * 7 + j);
        
        // Only include days up to today
        if (isAfter(date, today)) continue;
        
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Check if this date has any activity
        const dayData = dailyProgress.find(d => d.date === formattedDate);
        const hasActivity = dayData ? (dayData.user1Completed > 0 || dayData.user2Completed > 0) : false;
        
        grid[j].push({
          date,
          formattedDate,
          hasActivity
        });
      }
    }
    
    return { grid };
  }, [dailyProgress]);

  // Find max value for color intensity scaling
  const maxValue = useMemo(() => {
    if (!dailyProgress.length) return 10;
    
    let max = 0;
    dailyProgress.forEach(day => {
      if (activeUser === 'user1' || activeUser === 'both') {
        max = Math.max(max, day.user1Completed);
      }
      if (activeUser === 'user2' || activeUser === 'both') {
        max = Math.max(max, day.user2Completed);
      }
    });
    
    return max || 10; // Default to 10 if no data
  }, [dailyProgress, activeUser]);

  // Get intensity color with the new colors
  const getColorIntensity = (value: number, userType: 'user1' | 'user2') => {
    if (value === 0) return '#ebedf0'; // Empty cell color
    
    // Scale the value between 0 and 4 (for 5 levels of intensity)
    const normalizedValue = Math.min(Math.floor((value / maxValue) * 5), 4);
    
    // Custom color schemes based on provided colors
    // Purple for user1: #7242eb with varying opacity
    const user1Colors = [
      '#ebedf0',
      '#cdbcf0', // Lighter purple
      '#a48ce6', // Light purple
      '#8865ed', // Medium purple
      '#7242eb'  // Full purple
    ];
    
    // Blue for user2: #2563eb with varying opacity
    const user2Colors = [
      '#ebedf0',
      '#a6c1f4', // Lighter blue
      '#7799ee', // Light blue
      '#4b7bef', // Medium blue
      '#2563eb'  // Full blue
    ];
    
    return userType === 'user1' ? user1Colors[normalizedValue] : user2Colors[normalizedValue];
  };

  // Find activity value for a specific day
  const getDayActivity = (date: string, userType: 'user1' | 'user2') => {
    const dayData = dailyProgress.find(d => d.date === date);
    if (!dayData) return 0;
    
    return userType === 'user1' ? dayData.user1Completed : dayData.user2Completed;
  };

  // Generate tooltip text for a specific day
  const getTooltipText = (date: string) => {
    let tooltipText = format(parseISO(date), 'MMMM d, yyyy');
    
    const dayData = dailyProgress.find(d => d.date === date);
    if (!dayData) return `${tooltipText}: No activity`;
    
    if (activeUser === 'user1' || activeUser === 'both') {
      tooltipText += `\n${userNames.user1}: ${dayData.user1Completed} questions`;
    }
    
    if (activeUser === 'user2' || activeUser === 'both') {
      tooltipText += `\n${userNames.user2}: ${dayData.user2Completed} questions`;
    }
    
    return tooltipText;
  };

  // Generate legend for the heatmap
  const renderLegend = () => {
    const legendColors = [0, 1, 2, 3, 4]; // 5 intensity levels
    
    return (
      <div className="flex items-center text-xs gap-1 mt-4">
        <span className="mr-1">Less</span>
        {legendColors.map((level) => {
          const color1 = getColorIntensity(level * (maxValue/4), 'user1');
          const color2 = getColorIntensity(level * (maxValue/4), 'user2');
          
          let colorToUse;
          if (activeUser === 'user1') {
            colorToUse = color1;
          } else if (activeUser === 'user2') {
            colorToUse = color2;
          } else {
            // For "both" mode, show a split cell
            colorToUse = `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)`;
          }
          
          return (
            <div 
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ background: colorToUse }}
            />
          );
        })}
        <span className="ml-1">More</span>
      </div>
    );
  };

  // Only render days that have activity
  const weekColumns = useMemo(() => {
    if (!dateData.grid.length) return [];
    
    // Transpose the grid to get weeks as columns
    const weeks: Array<Array<{date: Date, formattedDate: string, hasActivity: boolean}>> = [];
    
    // Find the maximum length across all rows
    const maxWeeks = Math.max(...dateData.grid.map(row => row.length));
    
    for (let weekIndex = 0; weekIndex < maxWeeks; weekIndex++) {
      const week: Array<{date: Date, formattedDate: string, hasActivity: boolean}> = [];
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        if (dateData.grid[dayIndex] && dateData.grid[dayIndex][weekIndex]) {
          week.push(dateData.grid[dayIndex][weekIndex]);
        }
      }
      
      // Check if this week has any activity
      const hasActivityInWeek = week.some(day => day.hasActivity);
      
      if (hasActivityInWeek) {
        weeks.push(week);
      }
    }
    
    return weeks;
  }, [dateData]);

  if (weekColumns.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No activity data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Activity Heatmap</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={activeUser === 'both' ? "default" : "outline"}
              onClick={() => setActiveUser('both')}
              className="px-3 py-1 h-8"
            >
              Both
            </Button>
            <Button 
              size="sm" 
              variant={activeUser === 'user1' ? "default" : "outline"}
              onClick={() => setActiveUser('user1')}
              className="px-3 py-1 h-8"
              style={{ backgroundColor: activeUser === 'user1' ? '#7242eb' : '' }}
            >
              {userNames.user1}
            </Button>
            <Button 
              size="sm" 
              variant={activeUser === 'user2' ? "default" : "outline"}
              onClick={() => setActiveUser('user2')}
              className="px-3 py-1 h-8"
              style={{ backgroundColor: activeUser === 'user2' ? '#2563eb' : '' }}
            >
              {userNames.user2}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[750px]">
            {/* The grid without month and day indicators */}
            <div className="flex">
              <div className="flex">
                {weekColumns.map((week, weekIndex) => (
                  <div key={weekIndex} className="mr-1">
                    {week.map((dayData, dayIndex) => {
                      let user1Activity = getDayActivity(dayData.formattedDate, 'user1');
                      let user2Activity = getDayActivity(dayData.formattedDate, 'user2');
                      
                      let color;
                      if (activeUser === 'user1') {
                        color = getColorIntensity(user1Activity, 'user1');
                      } else if (activeUser === 'user2') {
                        color = getColorIntensity(user2Activity, 'user2');
                      } else if (activeUser === 'both') {
                        if (user1Activity > 0 && user2Activity > 0) {
                          // Split cell for both users
                          color = `linear-gradient(90deg, 
                                    ${getColorIntensity(user1Activity, 'user1')} 50%, 
                                    ${getColorIntensity(user2Activity, 'user2')} 50%)`;
                        } else if (user1Activity > 0) {
                          color = getColorIntensity(user1Activity, 'user1');
                        } else if (user2Activity > 0) {
                          color = getColorIntensity(user2Activity, 'user2');
                        } else {
                          color = '#ebedf0'; // Empty cell
                        }
                      }
                      
                      return (
                        <div 
                          key={dayIndex}
                          className="w-3 h-3 rounded-sm mb-1 cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all"
                          style={{ background: color }}
                          title={getTooltipText(dayData.formattedDate)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {renderLegend()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;