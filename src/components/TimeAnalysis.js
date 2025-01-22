import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Label } from 'recharts';
const TimeAnalysis = ({ activityLogs, selectedUser, dateRange = 'all' }) => {
    const { hourlyData, averageAccuracy, peakHour, lowPoint } = useMemo(() => {
        const filteredLogs = activityLogs.filter(log => selectedUser === 'both' || log.user_type === selectedUser);
        const hours = Array(24).fill(null).map((_, hour) => {
            const logsInHour = filteredLogs.filter(log => new Date(log.timestamp).getHours() === hour);
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
        const peak = hours.reduce((max, curr) => (curr.accuracy > max.accuracy) ? curr : max, { accuracy: 0, hour: '' });
        const low = hours.reduce((min, curr) => (curr.accuracy > 0 && curr.accuracy < min.accuracy) ? curr : min, { accuracy: 100, hour: '' });
        return {
            hourlyData: hours,
            averageAccuracy: average,
            peakHour: peak,
            lowPoint: low
        };
    }, [activityLogs, selectedUser, dateRange]);
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex flex-wrap gap-4 justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Performance by Hour" }), _jsx("p", { className: "text-sm text-gray-500", children: "Accuracy trends and activity patterns" })] }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-violet-600 rounded-full" }), _jsx("span", { className: "text-gray-600", children: "Accuracy" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-violet-200 rounded" }), _jsx("span", { className: "text-gray-600", children: "Volume" })] })] })] }), _jsxs("div", { className: "relative h-80 sm:h-96", children: [_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: hourlyData, margin: { top: 20, right: 10, bottom: 20, left: 10 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f1f5f9" }), _jsx(XAxis, { dataKey: "hour", tick: { fill: '#64748b', fontSize: 10 }, tickMargin: 8 }), _jsx(YAxis, { yAxisId: "left", domain: [0, 100], tick: { fill: '#64748b', fontSize: 10 }, tickMargin: 8 }), _jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fill: '#64748b', fontSize: 10 }, tickMargin: 8 }), _jsx(ReferenceLine, { yAxisId: "left", y: averageAccuracy, stroke: "#dc2626", strokeDasharray: "3 3", label: _jsx(Label, { value: `Avg ${averageAccuracy}%`, position: "right", fill: "#dc2626", fontSize: 10 }) }), _jsx(Tooltip, { content: ({ payload }) => {
                                        if (!payload?.length)
                                            return null;
                                        const data = payload[0].payload;
                                        return (_jsxs("div", { className: "bg-white p-4 shadow-lg rounded-lg border border-gray-100", children: [_jsx("p", { className: "font-semibold text-gray-800 mb-2", children: data.hour }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("span", { className: "text-violet-600", children: "Accuracy:" }), _jsxs("span", { className: "font-medium", children: [data.accuracy, "%"] })] }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("span", { className: "text-violet-400", children: "Questions:" }), _jsx("span", { className: "font-medium", children: data.totalQuestions })] }), _jsxs("div", { className: "flex justify-between gap-4", children: [_jsx("span", { className: "text-gray-500", children: "Sessions:" }), _jsx("span", { className: "font-medium", children: data.attempts })] })] })] }));
                                    } }), _jsx(Bar, { yAxisId: "right", dataKey: "totalQuestions", fill: "#a78bfa", opacity: 0.2, radius: [4, 4, 0, 0] }), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "accuracy", stroke: "#7c3aed", strokeWidth: 2.5, dot: false })] }) }), _jsxs("div", { className: "absolute top-0 right-0 flex gap-4", children: [peakHour.accuracy > 0 && (_jsxs("div", { className: "bg-green-50 px-3 py-2 rounded-lg text-sm", children: [_jsx("span", { className: "text-green-600 font-medium", children: "Peak: " }), _jsxs("span", { className: "text-green-800", children: [peakHour.hour, " (", peakHour.accuracy, "%)"] })] })), lowPoint.accuracy < 100 && (_jsxs("div", { className: "bg-red-50 px-3 py-2 rounded-lg text-sm", children: [_jsx("span", { className: "text-red-600 font-medium", children: "Low: " }), _jsxs("span", { className: "text-red-800", children: [lowPoint.hour, " (", lowPoint.accuracy, "%)"] })] }))] })] })] }));
};
export default TimeAnalysis;
