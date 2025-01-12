import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { Flame, Calendar, Brain } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
const DAILY_TARGET = 300;
const MIN_ACCURACY_TARGET = 70;
const ProgressDashboard = ({ dailyData = [], user1Name, user2Name }) => {
    const [dateRange, setDateRange] = useState('week');
    const [selectedUser, setSelectedUser] = useState('both');
    const filteredData = useMemo(() => {
        if (!dailyData?.length)
            return [];
        const now = new Date();
        const cutoffDate = new Date();
        switch (dateRange) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setDate(now.getDate() - 30);
                break;
            case 'all':
                return dailyData;
            default:
                cutoffDate.setDate(now.getDate() - 7);
        }
        return dailyData.filter(day => new Date(day.date) >= cutoffDate);
    }, [dailyData, dateRange]);
    const stats = useMemo(() => {
        const calculateUserStats = (userData) => {
            if (!userData?.length)
                return {
                    currentStreak: 0,
                    dailyAverage: 0,
                    todayProgress: 0,
                    studyConsistency: 0
                };
            let currentStreak = 0;
            const now = new Date();
            const sortedData = [...userData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            // Calculate streak excluding Sundays
            for (const day of sortedData) {
                const dayDate = new Date(day.date);
                if (dayDate.getDay() === 0)
                    continue; // Skip Sundays
                if (dayDate.toDateString() === now.toDateString() && day.completed < DAILY_TARGET) {
                    currentStreak = sortedData.length > 1 ? currentStreak : 0;
                    continue;
                }
                if (day.completed >= DAILY_TARGET) {
                    currentStreak++;
                }
                else {
                    break;
                }
            }
            // Calculate daily average excluding Sundays
            const nonSundayData = userData.filter(day => new Date(day.date).getDay() !== 0);
            const dailyAverage = nonSundayData.length > 0
                ? Math.round(nonSundayData.reduce((sum, day) => sum + day.completed, 0) / nonSundayData.length)
                : 0;
            const today = new Date().toISOString().split('T')[0];
            const todayData = userData.find(day => day.date === today);
            const todayProgress = todayData ? todayData.completed : 0;
            // Get last 30 days excluding Sundays
            const last30Days = userData
                .filter(day => new Date(day.date).getDay() !== 0)
                .slice(-30);
            let consistentDays = 0;
            // Calculate study Consistency
            last30Days.forEach(day => {
                const dailyAccuracy = day.completed > 0 ? (day.correct / day.completed) * 100 : 0;
                // A day is considered consistent if:
                // 1. At least 50% of daily target is completed
                // 2. Accuracy is above MIN_ACCURACY_TARGET
                if (day.completed >= DAILY_TARGET * 0.5 && dailyAccuracy >= MIN_ACCURACY_TARGET) {
                    consistentDays++;
                }
            });
            // Calculate consistency score as percentage of days meeting both targets
            const consistencyScore = Math.round((consistentDays / last30Days.length) * 100 * 10) / 10;
            return { currentStreak, dailyAverage, todayProgress, studyConsistency: consistencyScore };
        };
        const user1Data = filteredData.map(d => d.user1Data);
        const user2Data = filteredData.map(d => d.user2Data);
        return {
            user1Stats: calculateUserStats(user1Data),
            user2Stats: calculateUserStats(user2Data)
        };
    }, [filteredData]);
    const calculateGoalProgress = (data) => {
        if (selectedUser === 'both') {
            const totalCompleted = data.user1Data.completed + data.user2Data.completed;
            const totalCorrect = data.user1Data.correct + data.user2Data.correct;
            return {
                completed: totalCompleted,
                correct: totalCorrect,
                accuracy: totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100 * 10) / 10 : 0
            };
        }
        const userData = selectedUser === 'user1' ? data.user1Data : data.user2Data;
        return {
            completed: userData.completed,
            correct: userData.correct,
            accuracy: userData.completed > 0 ? Math.round((userData.correct / userData.completed) * 100 * 10) / 10 : 0
        };
    };
    const processedData = useMemo(() => {
        return filteredData.map(data => ({
            ...data,
            processedData: calculateGoalProgress(data)
        }));
    }, [filteredData, selectedUser]);
    const trendData = useMemo(() => {
        const windowSize = 7;
        return filteredData.map((data, index) => {
            // Get window of data excluding Sundays for averages
            const window = filteredData
                .slice(Math.max(0, index - windowSize + 1), index + 1)
                .filter(d => new Date(d.date).getDay() !== 0);
            const avgCompleted = window.length > 0
                ? window.reduce((sum, d) => {
                    const stats = calculateGoalProgress(d);
                    return sum + stats.completed;
                }, 0) / window.length
                : 0;
            const avgAccuracy = window.length > 0
                ? window.reduce((sum, d) => {
                    const stats = calculateGoalProgress(d);
                    return sum + stats.accuracy;
                }, 0) / window.length
                : 0;
            return {
                date: data.date,
                avgCompleted: Math.round(avgCompleted * 10) / 10,
                avgAccuracy: Math.round(avgAccuracy * 10) / 10
            };
        });
    }, [filteredData, selectedUser]);
    const selectedStats = selectedUser === 'user1'
        ? stats.user1Stats
        : selectedUser === 'user2'
            ? stats.user2Stats
            : {
                currentStreak: Math.max(stats.user1Stats.currentStreak, stats.user2Stats.currentStreak),
                dailyAverage: stats.user1Stats.dailyAverage + stats.user2Stats.dailyAverage,
                todayProgress: stats.user1Stats.todayProgress + stats.user2Stats.todayProgress,
                studyConsistency: Math.max(stats.user1Stats.studyConsistency, stats.user2Stats.studyConsistency)
            };
    const targetQuestions = selectedUser === 'both' ? DAILY_TARGET * 2 : DAILY_TARGET;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between gap-4 mb-6", children: _jsxs(Select, { value: selectedUser, onValueChange: setSelectedUser, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Select User" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "both", children: "Both Users" }), _jsx(SelectItem, { value: "user1", children: user1Name }), _jsx(SelectItem, { value: "user2", children: user2Name })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(MetricCard, { title: "Current Streak", value: `${selectedStats.currentStreak}`, valueUnit: "days", icon: _jsx(Flame, { className: "h-4 w-4" }), tooltip: "Days with target completed (excluding Sundays)", iconColor: "#f97316" }), _jsx(MetricCard, { title: "Daily Average", value: selectedStats.dailyAverage, valueUnit: "questions", icon: _jsx(Calendar, { className: "h-4 w-4" }), tooltip: "Average questions per day (excluding Sundays)", iconColor: "#a855f7" }), _jsx(MetricCard, { title: "Study Consistency", value: selectedStats.studyConsistency, valueUnit: "%", icon: _jsx(Brain, { className: "h-4 w-4" }), tooltip: "Days meeting targets (last 30 days, excluding Sundays)", iconColor: "#4ec9b0" })] }), _jsxs("div", { className: "mt-4", children: [_jsx(Progress, { value: (selectedStats.todayProgress / targetQuestions) * 100 }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [selectedStats.todayProgress, " of ", targetQuestions, " questions completed today (", Math.round((selectedStats.todayProgress / targetQuestions) * 100), "%)"] })] }), _jsxs(Tabs, { defaultValue: "progress", className: "w-full", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "progress", children: "Progress" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" })] }), _jsxs(TabsContent, { value: "progress", className: "min-h-[400px] h-[50vh]", children: [_jsx("div", { className: "mb-4", children: _jsxs(Select, { value: dateRange, onValueChange: setDateRange, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Date Range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "Last Week" }), _jsx(SelectItem, { value: "month", children: "Last Month" }), _jsx(SelectItem, { value: "all", children: "All Time" })] })] }) }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: processedData, margin: { top: 20, right: 20, bottom: 20, left: 20 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.3 }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, { yAxisId: "left", label: { value: 'Questions', angle: -90, position: 'insideLeft' }, domain: [0, 'auto'] }), _jsx(YAxis, { yAxisId: "right", orientation: "right", label: { value: 'Accuracy %', angle: 90, position: 'insideRight' }, domain: [0, 100] }), _jsx(Tooltip, {}), _jsx(Bar, { yAxisId: "left", dataKey: "processedData.completed", fill: "#93c5fd", name: "Questions Completed", opacity: 0.3 }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "processedData.accuracy", stroke: "#7c3aed", name: "Accuracy" })] }) })] }), _jsxs(TabsContent, { value: "trends", className: "min-h-[400px] h-[50vh]", children: [_jsx("div", { className: "mb-4", children: _jsxs(Select, { value: dateRange, onValueChange: setDateRange, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Date Range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "Last Week" }), _jsx(SelectItem, { value: "month", children: "Last Month" }), _jsx(SelectItem, { value: "all", children: "All Time" })] })] }) }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: trendData, margin: { top: 20, right: 20, bottom: 20, left: 20 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.3 }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, { yAxisId: "left", label: { value: 'Avg. Questions', angle: -90, position: 'insideLeft' }, domain: [0, 'auto'] }), _jsx(YAxis, { yAxisId: "right", orientation: "right", label: { value: 'Avg. Accuracy %', angle: 90, position: 'insideRight' }, domain: [0, 100] }), _jsx(Tooltip, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "avgCompleted", stroke: "#93c5fd", name: "7-day Avg. Completed" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "avgAccuracy", stroke: "#7c3aed", name: "7-day Avg. Accuracy" })] }) })] })] })] }));
};
export default ProgressDashboard;
