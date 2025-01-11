import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
const DailyProgressGraph = ({ dailyData, user1Name, user2Name }) => {
    const [dateRange, setDateRange] = useState('all');
    const [showTrendLines, setShowTrendLines] = useState(false);
    // Process data to include more metrics
    const processedData = useMemo(() => {
        const data = dailyData.map(day => {
            const user1Accuracy = (day.user1Correct / day.user1Completed * 100);
            const user2Accuracy = (day.user2Correct / day.user2Completed * 100);
            return {
                ...day,
                date: new Date(day.date).toLocaleDateString(),
                user1Accuracy: user1Accuracy.toFixed(1),
                user2Accuracy: user2Accuracy.toFixed(1),
                user1ImprovementRate: (user1Accuracy).toFixed(1),
                user2ImprovementRate: (user2Accuracy).toFixed(1),
                totalCompleted: day.user1Completed + day.user2Completed,
                totalCorrect: day.user1Correct + day.user2Correct,
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        const getTrend = (current, prev) => ((current - prev) / prev * 100);
        return [
            {
                title: 'Total Completion Rate',
                value: `${((latest.totalCorrect / latest.totalCompleted) * 100).toFixed(1)}%`,
                trend: getTrend(latest.totalCorrect / latest.totalCompleted, previous.totalCorrect / previous.totalCompleted),
                icon: _jsx(TrendingUp, { className: "h-4 w-4" })
            },
            {
                title: `${user1Name}'s Accuracy`,
                value: `${latest.user1Accuracy}%`,
                trend: getTrend(Number(latest.user1Accuracy), Number(previous.user1Accuracy)),
                icon: _jsx(ArrowRight, { className: "h-4 w-4" })
            },
            {
                title: `${user2Name}'s Accuracy`,
                value: `${latest.user2Accuracy}%`,
                trend: getTrend(Number(latest.user2Accuracy), Number(previous.user2Accuracy)),
                icon: _jsx(ArrowRight, { className: "h-4 w-4" })
            }
        ];
    }, [processedData, user1Name, user2Name]);
    const MetricCard = ({ title, value, trend, icon }) => (_jsxs("div", { className: "bg-white rounded-lg p-4 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500 truncate", children: title }), icon] }), _jsxs("div", { className: "mt-2 flex items-center", children: [_jsx("span", { className: "text-2xl font-semibold", children: value }), _jsxs("span", { className: `ml-2 flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`, children: [trend > 0 ? _jsx(TrendingUp, { className: "h-4 w-4" }) : _jsx(TrendingDown, { className: "h-4 w-4" }), Math.abs(trend).toFixed(1), "%"] })] })] }));
    return (_jsxs(Card, { className: "w-full mt-6", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsx(CardTitle, { className: "text-lg", children: "Performance Analytics" }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs(Select, { value: dateRange, onValueChange: setDateRange, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, { placeholder: "Date Range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Time" }), _jsx(SelectItem, { value: "week", children: "Last Week" }), _jsx(SelectItem, { value: "month", children: "Last Month" })] })] }), _jsx(Toggle, { pressed: showTrendLines, onPressedChange: setShowTrendLines, "aria-label": "Toggle trend lines", children: _jsx(TrendingUp, { className: "h-4 w-4" }) })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: summaryMetrics.map((metric, index) => (_jsx(MetricCard, { ...metric }, index))) }), _jsxs(Tabs, { defaultValue: "progress", className: "w-full", children: [_jsxs(TabsList, { className: "mb-4 flex flex-wrap", children: [_jsx(TabsTrigger, { value: "progress", children: "Progress" }), _jsx(TabsTrigger, { value: "accuracy", children: "Accuracy" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" })] }), _jsx(TabsContent, { value: "progress", className: "h-[400px] min-w-0", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: processedData, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.3 }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }), _jsx(YAxis, { tick: { fontSize: 12 } }), _jsx(Tooltip, {}), _jsx(Legend, { wrapperStyle: { fontSize: 12 } }), _jsx(Bar, { dataKey: "user1Completed", fill: "#8884d8", opacity: 0.2, name: `${user1Name} Total` }), _jsx(Bar, { dataKey: "user2Completed", fill: "#82ca9d", opacity: 0.2, name: `${user2Name} Total` }), _jsx(Line, { type: "monotone", dataKey: "user1Correct", stroke: "#8884d8", strokeWidth: 2, name: `${user1Name} Correct`, dot: { r: 3 } }), _jsx(Line, { type: "monotone", dataKey: "user2Correct", stroke: "#82ca9d", strokeWidth: 2, name: `${user2Name} Correct`, dot: { r: 3 } })] }) }) }), _jsx(TabsContent, { value: "accuracy", className: "h-[400px] min-w-0", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: processedData, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.3 }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }), _jsx(YAxis, { domain: [0, 100], unit: "%", tick: { fontSize: 12 } }), _jsx(Tooltip, {}), _jsx(Legend, { wrapperStyle: { fontSize: 12 } }), _jsx(Line, { type: "monotone", dataKey: "user1Accuracy", stroke: "#8884d8", strokeWidth: 2, name: `${user1Name} Accuracy`, dot: { r: 3 } }), _jsx(Line, { type: "monotone", dataKey: "user2Accuracy", stroke: "#82ca9d", strokeWidth: 2, name: `${user2Name} Accuracy`, dot: { r: 3 } }), showTrendLines && (_jsxs(_Fragment, { children: [_jsx(Line, { type: "linear", dataKey: "user1Accuracy", stroke: "#8884d8", strokeDasharray: "5 5", name: `${user1Name} Trend`, dot: false }), _jsx(Line, { type: "linear", dataKey: "user2Accuracy", stroke: "#82ca9d", strokeDasharray: "5 5", name: `${user2Name} Trend`, dot: false })] }))] }) }) }), _jsx(TabsContent, { value: "trends", className: "h-[400px] min-w-0", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: processedData, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.3 }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }), _jsx(YAxis, { domain: [0, 100], unit: "%", tick: { fontSize: 12 } }), _jsx(Tooltip, {}), _jsx(Legend, { wrapperStyle: { fontSize: 12 } }), _jsx(Line, { type: "monotone", dataKey: "user1ImprovementRate", stroke: "#8884d8", strokeWidth: 2, name: `${user1Name} Improvement`, dot: { r: 3 } }), _jsx(Line, { type: "monotone", dataKey: "user2ImprovementRate", stroke: "#82ca9d", strokeWidth: 2, name: `${user2Name} Improvement`, dot: { r: 3 } })] }) }) })] })] })] }));
};
export default DailyProgressGraph;
