import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
const UserStatsRadarChart = ({ user1, user2, isOpen, onOpenChange }) => {
    const radarData = useMemo(() => {
        const getNormalizedValue = (val1, val2) => {
            const max = Math.max(val1, val2);
            if (max === 0)
                return 0;
            return 100 * (val1 / max);
        };
        return [
            {
                subject: 'Total',
                [user1.name]: getNormalizedValue(user1.total, user2.total),
                [user2.name]: getNormalizedValue(user2.total, user1.total)
            },
            {
                subject: 'Correct',
                [user1.name]: getNormalizedValue(user1.correct, user2.correct),
                [user2.name]: getNormalizedValue(user2.correct, user1.correct)
            },
            {
                subject: 'Accuracy',
                [user1.name]: user1.total === 0 ? 0 : user1.accuracy,
                [user2.name]: user2.total === 0 ? 0 : user2.accuracy
            },
            {
                subject: 'Daily Avg',
                [user1.name]: getNormalizedValue(user1.dailyAverage, user2.dailyAverage),
                [user2.name]: getNormalizedValue(user2.dailyAverage, user1.dailyAverage)
            },
            {
                subject: 'Consistency',
                [user1.name]: user1.total === 0 ? 0 : user1.consistency,
                [user2.name]: user2.total === 0 ? 0 : user2.consistency
            },
            {
                subject: 'Streak',
                [user1.name]: getNormalizedValue(user1.streak, user2.streak),
                [user2.name]: getNormalizedValue(user2.streak, user1.streak)
            }
        ];
    }, [user1, user2]);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "w-[95vw] max-w-md p-0 max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { className: "p-4 pb-0", children: _jsxs(DialogTitle, { className: "text-xl font-semibold text-gray-800", children: [user1.name, " VS ", user2.name] }) }), _jsxs("div", { className: "flex flex-col space-y-4 p-4", children: [_jsx("div", { className: "h-[300px] w-full relative", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadarChart, { data: radarData, margin: { top: -10, right: -20, bottom: -20, left: -20 }, children: [_jsx(PolarGrid, { stroke: "#e0e0e0", strokeWidth: 0.5, strokeDasharray: "3 3" }), _jsx(PolarAngleAxis, { dataKey: "subject", tick: {
                                                fill: '#666',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                textAnchor: 'middle',
                                            }, tickLine: false }), _jsx(Radar, { name: user1.name, dataKey: user1.name, stroke: "#3b82f6", fill: "#3b82f6", fillOpacity: 0.2, strokeWidth: 2 }), _jsx(Radar, { name: user2.name, dataKey: user2.name, stroke: "#8b5cf6", fill: "#8b5cf6", fillOpacity: 0.2, strokeWidth: 2 }), _jsx(Tooltip, { cursor: false, contentStyle: {
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                            }, formatter: (value, name, props) => {
                                                const metric = props.payload.subject;
                                                if (metric === 'Accuracy')
                                                    return `${value.toFixed(1)}%`;
                                                const originalValue = metric === 'Total' ?
                                                    (name === user1.name ? user1.total : user2.total) :
                                                    metric === 'Correct' ?
                                                        (name === user1.name ? user1.correct : user2.correct) :
                                                        metric === 'Daily Avg' ?
                                                            (name === user1.name ? user1.dailyAverage : user2.dailyAverage) :
                                                            metric === 'Consistency' ?
                                                                (name === user1.name ? user1.consistency : user2.consistency) :
                                                                (name === user1.name ? user1.streak : user2.streak);
                                                return originalValue.toFixed(1);
                                            } })] }) }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Card, { className: "bg-gray-50", children: _jsxs(CardContent, { className: "p-4", children: [_jsx("h3", { className: "font-medium text-gray-600 mb-2", children: user1.name }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("p", { children: ["Total: ", user1.total] }), _jsxs("p", { children: ["Correct: ", user1.correct] }), _jsxs("p", { children: ["Accuracy: ", user1.accuracy.toFixed(1), "%"] }), _jsxs("p", { children: ["Daily Avg: ", user1.dailyAverage.toFixed(1)] }), _jsxs("p", { children: ["Consistency: ", user1.consistency.toFixed(1), "%"] }), _jsxs("p", { children: ["Streak: ", user1.streak] })] })] }) }), _jsx(Card, { className: "bg-gray-50", children: _jsxs(CardContent, { className: "p-4", children: [_jsx("h3", { className: "font-medium text-gray-600 mb-2", children: user2.name }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("p", { children: ["Total: ", user2.total] }), _jsxs("p", { children: ["Correct: ", user2.correct] }), _jsxs("p", { children: ["Accuracy: ", user2.accuracy.toFixed(1), "%"] }), _jsxs("p", { children: ["Daily Avg: ", user2.dailyAverage.toFixed(1)] }), _jsxs("p", { children: ["Consistency: ", user2.consistency.toFixed(1), "%"] }), _jsxs("p", { children: ["Streak: ", user2.streak] })] })] }) })] })] })] }) }));
};
export default UserStatsRadarChart;
