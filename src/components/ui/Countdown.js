import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    useEffect(() => {
        const calculateTimeLeft = () => {
            const examDate = new Date('2025-05-18T07:00:00');
            const now = new Date();
            const difference = examDate.getTime() - now.getTime();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-4 mb-6", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-2", children: [_jsx(Clock, { className: "text-blue-500", size: 20 }), _jsx("span", { className: "font-medium", children: "INICET Countdown" })] }), _jsxs("div", { className: "grid grid-cols-4 gap-2 text-center", children: [_jsxs("div", { className: "bg-slate-50 p-2 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: timeLeft.days }), _jsx("div", { className: "text-xs text-slate-600", children: "Days" })] }), _jsxs("div", { className: "bg-slate-50 p-2 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: timeLeft.hours }), _jsx("div", { className: "text-xs text-slate-600", children: "Hours" })] }), _jsxs("div", { className: "bg-slate-50 p-2 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: timeLeft.minutes }), _jsx("div", { className: "text-xs text-slate-600", children: "Minutes" })] }), _jsxs("div", { className: "bg-slate-50 p-2 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: timeLeft.seconds }), _jsx("div", { className: "text-xs text-slate-600", children: "Seconds" })] })] })] }));
};
export default CountdownTimer;
