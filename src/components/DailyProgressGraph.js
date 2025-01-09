import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const DailyProgressGraph = ({ dailyData, user1Name, user2Name }) => {
    const formatName = (value) => {
        if (typeof value === 'string') {
            return value.replace(/([A-Z])/g, ' $1').trim();
        }
        return String(value);
    };
    // Sort data by date
    const sortedData = [...dailyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return (_jsxs(Card, { className: "w-full mt-6", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Daily Progress" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-[400px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: sortedData, margin: { top: 5, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tickFormatter: (value) => {
                                        try {
                                            return new Date(value).toLocaleDateString();
                                        }
                                        catch {
                                            return value;
                                        }
                                    } }), _jsx(YAxis, {}), _jsx(Tooltip, { labelFormatter: (value) => {
                                        try {
                                            return new Date(value).toLocaleDateString();
                                        }
                                        catch {
                                            return value;
                                        }
                                    }, formatter: (value, name) => [value, formatName(name)] }), _jsx(Legend, { formatter: (value) => formatName(value) }), _jsx(Line, { type: "monotone", dataKey: "user1Completed", stroke: "#8884d8", name: `${user1Name} Completed`, strokeWidth: 2 }), _jsx(Line, { type: "monotone", dataKey: "user1Correct", stroke: "#82ca9d", name: `${user1Name} Correct`, strokeWidth: 2 }), _jsx(Line, { type: "monotone", dataKey: "user2Completed", stroke: "#ffc658", name: `${user2Name} Completed`, strokeWidth: 2 }), _jsx(Line, { type: "monotone", dataKey: "user2Correct", stroke: "#ff7300", name: `${user2Name} Correct`, strokeWidth: 2 })] }) }) }) })] }));
};
export default DailyProgressGraph;
