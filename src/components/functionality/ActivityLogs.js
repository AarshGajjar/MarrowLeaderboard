import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, RefreshCw, List } from 'lucide-react';
const calculateAccuracy = (correct, total) => {
    if (total === 0)
        return '0.0';
    return ((correct / total) * 100).toFixed(1);
};
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};
const isSameDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate());
};
const formatTimeRange = (slotIndex) => {
    const startHour = slotIndex * 3;
    const endHour = startHour + 3;
    return `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`;
};
const getCurrentDate = () => {
    // Get current UTC time
    const now = new Date();
    // Add 5 hours and 30 minutes to get IST
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istTime.toISOString().split('T')[0];
};
const ActivityLogs = ({ logs, userNames, onRefresh }) => {
    const [isRangeMode, setIsRangeMode] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: getCurrentDate(),
        end: getCurrentDate()
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [selectedUsers, setSelectedUsers] = useState(['user1', 'user2']);
    // Update filtering to handle both single day and range modes
    const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        if (!isRangeMode) {
            return isSameDate(log.timestamp, dateRange.start) && selectedUsers.includes(log.user_type);
        }
        endDate.setHours(23, 59, 59);
        return (logDate >= startDate &&
            logDate <= endDate &&
            selectedUsers.includes(log.user_type));
    });
    const timeSlots = Array(8).fill(null).map(() => ({
        total: 0,
        correct: 0,
        logs: []
    }));
    filteredLogs.forEach(log => {
        const date = new Date(log.timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        // Calculate the slot index: each slot covers 3 hours (0–2:59, 3–5:59, …, 21–23:59)
        const slotIndex = Math.floor((hours + minutes / 60) / 3);
        // Ensure the slot index is within bounds (0 to 7)
        if (slotIndex >= 0 && slotIndex < timeSlots.length) {
            timeSlots[slotIndex].total += log.completed;
            timeSlots[slotIndex].correct += log.correct;
            timeSlots[slotIndex].logs.push(log);
        }
    });
    const maxTotal = Math.max(...timeSlots.filter(slot => slot.total > 0).map(slot => slot.total), 1 // Prevent division by zero
    );
    const dailyTotals = filteredLogs.reduce((acc, log) => {
        const userType = log.user_type;
        acc[userType].completed += log.completed;
        acc[userType].correct += log.correct;
        return acc;
    }, {
        user1: { completed: 0, correct: 0 },
        user2: { completed: 0, correct: 0 }
    });
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const getLogPosition = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        // Adjust angle calculation for 24-hour clock (15 degrees per hour instead of 30)
        const angle = (hours * 15 + minutes * 0.25) - 90;
        const radians = angle * (Math.PI / 180);
        return {
            x: Math.cos(radians),
            y: Math.sin(radians)
        };
    };
    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => prev.includes(user)
            ? prev.filter(u => u !== user)
            : [...prev, user]);
    };
    useEffect(() => {
        // Function to check if we need to update the date
        const checkDate = () => {
            const newDate = getCurrentDate();
            if (dateRange.start !== newDate && !isRangeMode) {
                console.log('Date changed in IST:', newDate);
                setDateRange({
                    start: newDate,
                    end: newDate
                });
                // Refresh data when date changes
                onRefresh();
            }
        };
        // Calculate time until next check (next minute in IST)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istTime = new Date(now.getTime() + istOffset);
        // Calculate milliseconds until next minute
        const msUntilNextMinute = 60000 - (istTime.getSeconds() * 1000 + istTime.getMilliseconds());
        console.log('Current IST time:', istTime.toISOString());
        console.log('Ms until next check:', msUntilNextMinute);
        // Initial check
        checkDate();
        // Set up the interval
        const initialTimeout = setTimeout(() => {
            checkDate();
            // After initial alignment, check every minute
            const interval = setInterval(checkDate, 60000);
            return () => clearInterval(interval);
        }, msUntilNextMinute);
        return () => clearTimeout(initialTimeout);
    }, [dateRange.start, isRangeMode, onRefresh]);
    return (_jsxs(Card, { className: "w-full max-w-2xl shadow-lg rounded-lg overflow-hidden bg-gradient-to-br from-white/80 via-white/90 to-white/80 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-800/20", children: [_jsx(CardHeader, { className: "border-b p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/20 dark:to-blue-900/20", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-lg font-semibold", children: [_jsx(Clock, { className: "w-5 h-5 text-amber-500" }), _jsx("span", { className: "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "Activity Log" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: isRefreshing, className: "hover:bg-gradient-to-r hover:from-purple-600/5 hover:to-blue-600/5", children: _jsx(RefreshCw, { className: `w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}` }) })] }) }), _jsxs(CardContent, { className: "p-4 space-y-4", children: [_jsxs("div", { className: "flex border rounded-md bg-white dark:bg-slate-900 dark:border-slate-700", children: [_jsxs("button", { className: `flex-1 p-2 transition-colors rounded-l-md ${activeTab === 'list'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                    : 'hover:bg-gradient-to-r hover:from-purple-600/5 hover:to-blue-600/5'}`, onClick: () => setActiveTab('list'), children: [_jsx(List, { className: "w-4 h-4 inline-block mr-2" }), "List View"] }), _jsxs("button", { className: `flex-1 p-2 transition-colors rounded-r-md ${activeTab === 'clock'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                    : 'hover:bg-gradient-to-r hover:from-purple-600/5 hover:to-blue-600/5'}`, onClick: () => setActiveTab('clock'), children: [_jsx(Clock, { className: "w-4 h-4 inline-block mr-2" }), "Clock View"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Select Date" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                            setIsRangeMode(!isRangeMode);
                                            if (!isRangeMode) {
                                                setDateRange({ start: getCurrentDate(), end: getCurrentDate() });
                                            }
                                        }, className: "text-sm text-purple-600 hover:text-purple-700", children: isRangeMode ? 'Single Day' : 'Date Range' })] }), isRangeMode ? (_jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "text-sm text-gray-600 mb-1 block", children: "Start Date" }), _jsx(Input, { type: "date", value: dateRange.start, onChange: (e) => setDateRange(prev => ({ ...prev, start: e.target.value })), className: "w-full border-purple-600/50 focus:ring-purple-600/50", max: dateRange.end })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "text-sm text-gray-600 mb-1 block", children: "End Date" }), _jsx(Input, { type: "date", value: dateRange.end, onChange: (e) => setDateRange(prev => ({ ...prev, end: e.target.value })), className: "w-full border-purple-600/50 focus:ring-purple-600/50", min: dateRange.start })] })] })) : (_jsx(Input, { type: "date", value: dateRange.start, onChange: (e) => setDateRange(prev => ({ ...prev, start: e.target.value, end: e.target.value })), className: "w-full border-purple-600/50 focus:ring-purple-600/50" }))] }), _jsx("div", { className: "flex gap-2 justify-center", children: ['user1', 'user2'].map((userType) => (_jsx(Button, { variant: selectedUsers.includes(userType) ? 'default' : 'outline', size: "sm", onClick: () => toggleUserSelection(userType), className: `
                ${selectedUsers.includes(userType)
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'text-gray-600'}
                ${!selectedUsers.includes(userType) && 'opacity-50'}
              `, children: userNames[userType] }, userType))) }), ['user1', 'user2'].map((userType) => (_jsxs("div", { className: `text-sm font-medium flex items-center justify-between p-2 rounded ${userType === 'user1'
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'} ${!selectedUsers.includes(userType) && 'opacity-50'}`, children: [_jsx("span", { children: userNames[userType] }), _jsxs("div", { children: [dailyTotals[userType].completed, " completed, ", dailyTotals[userType].correct, " correct", " (", calculateAccuracy(dailyTotals[userType].correct, dailyTotals[userType].completed), "%)"] })] }, userType))), activeTab === 'clock' && (_jsx("div", { className: "p-4", children: _jsx(TooltipProvider, { children: _jsxs("svg", { viewBox: "-1.2 -1.2 2.4 2.4", className: "w-full max-w-xs mx-auto", children: [_jsx("circle", { cx: "0", cy: "0", r: "1", fill: "none", stroke: "rgb(203 213 225)", strokeWidth: "0.05" }), [...Array(24)].map((_, i) => {
                                        const angle = (i * 15 - 90) * (Math.PI / 180);
                                        return (_jsx("line", { x1: Math.cos(angle) * 0.9, y1: Math.sin(angle) * 0.9, x2: Math.cos(angle) * 1, y2: Math.sin(angle) * 1, stroke: "hsl(var(--muted-foreground))", strokeWidth: i % 6 === 0 ? "0.04" : "0.02" }, i));
                                    }), timeSlots.map((slot, index) => {
                                        const startAngleDeg = index * 45 - 90; // 45° per slot
                                        const endAngleDeg = (index + 1) * 45 - 90;
                                        const startAngleRad = startAngleDeg * (Math.PI / 180);
                                        const endAngleRad = endAngleDeg * (Math.PI / 180);
                                        const startX = 0.9 * Math.cos(startAngleRad);
                                        const startY = 0.9 * Math.sin(startAngleRad);
                                        const endX = 0.9 * Math.cos(endAngleRad);
                                        const endY = 0.9 * Math.sin(endAngleRad);
                                        // Calculate the accuracy and intensity based on the slot's data
                                        const accuracy = slot.total > 0 ? slot.correct / slot.total : 0;
                                        const intensity = slot.total > 0 ? (slot.total / maxTotal) : 0;
                                        return (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("path", { d: `M 0 0 L ${startX} ${startY} A 0.9 0.9 0 0 1 ${endX} ${endY} Z`, fill: slot.total > 0 ? "url(#gradient)" : "transparent", fillOpacity: intensity * 0.3, stroke: "none", className: "cursor-pointer hover:fill-opacity-50 transition-all" }) }), _jsxs(TooltipContent, { side: "right", className: "p-2 space-y-1", children: [_jsx("p", { className: "font-medium", children: formatTimeRange(index) }), _jsxs("div", { className: "space-y-0.5 text-sm", children: [_jsxs("p", { children: ["Total Questions: ", slot.total] }), _jsxs("p", { children: ["Correct Answers: ", slot.correct] }), _jsxs("p", { children: ["Accuracy: ", calculateAccuracy(slot.correct, slot.total), "%"] })] })] })] }, index));
                                    }), _jsx("defs", { children: _jsxs("linearGradient", { id: "gradient", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [_jsx("stop", { offset: "0%", stopColor: "rgb(147 51 234)" }), _jsx("stop", { offset: "100%", stopColor: "rgb(37 99 235)" })] }) }), filteredLogs.map((log) => {
                                        const { x, y } = getLogPosition(log.timestamp);
                                        return (_jsxs("g", { transform: `translate(${x}, ${y})`, children: [_jsx("circle", { r: "0.05", fill: log.user_type === 'user1' ? 'rgb(147 51 234)' : 'rgb(37 99 235)', stroke: "hsl(var(--background))", strokeWidth: "0.01" }), _jsx("title", { children: `${log.user_type === 'user1' ? userNames.user1 : userNames.user2}
              Completed: ${log.completed}
              Correct: ${log.correct}
              Time: ${new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: false })}` })] }, log.id));
                                    }), _jsx("circle", { cx: "0", cy: "0", r: "0.05", fill: "hsl(var(--foreground))" })] }) }) })), activeTab === 'list' && (_jsx("div", { className: "max-h-[350px] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border dark:border-slate-700", children: filteredLogs.length > 0 ? (_jsx("div", { className: "divide-y divide-gray-100 dark:divide-gray-800", children: filteredLogs.map((log) => (_jsxs("div", { className: `p-3 transition-colors flex justify-between items-center ${log.user_type === 'user1'
                                    ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `w-2 h-2 rounded-full ${log.user_type === 'user1'
                                                    ? 'bg-purple-600 dark:bg-purple-500'
                                                    : 'bg-blue-600 dark:bg-blue-500'}` }), _jsx("span", { className: log.user_type === 'user1'
                                                    ? 'text-purple-600 dark:text-purple-400'
                                                    : 'text-blue-600 dark:text-blue-400', children: userNames[log.user_type] })] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [log.completed, " completed, ", log.correct, " correct", " (", calculateAccuracy(log.correct, log.completed), "%)"] }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: formatDate(log.timestamp) })] }, log.id))) })) : (_jsx("div", { className: "text-center text-gray-500 dark:text-gray-400 py-4", children: "No entries found for this date" })) }))] })] }));
};
export default ActivityLogs;
