import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    const DesktopTimer = () => (_jsx("div", { className: "rounded-lg p-2 bg-gradient-to-r from-purple-50 via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800", children: _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Clock, { className: "text-purple-600", size: 16 }), _jsx("span", { className: "text-purple-400", children: "INICET Countdown" }), _jsx("div", { className: "flex gap-2", children: [
                        { value: timeLeft.days, label: 'D' },
                        { value: timeLeft.hours, label: 'H' },
                        { value: timeLeft.minutes, label: 'M' },
                        { value: timeLeft.seconds, label: 'S' }
                    ].map(({ value, label }) => (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "font-bold text-purple-600", children: value }), _jsx("span", { className: "text-xs text-slate-600 dark:text-slate-400 ml-1", children: label })] }, label))) })] }) }));
    const MobileTimer = () => (_jsx("div", { className: "rounded-lg p-2 bg-gradient-to-r from-purple-50 via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800", children: _jsx("div", { className: "flex items-center justify-center gap-1 text-s", children: _jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "text-purple-600", size: 12 }), _jsx("span", { className: "text-purple-400", children: "INICET Countdown" })] }), _jsx("div", { className: "flex gap-1", children: [
                            { value: timeLeft.days, label: 'D' },
                            { value: timeLeft.hours, label: 'H' },
                            { value: timeLeft.minutes, label: 'M' },
                            { value: timeLeft.seconds, label: 'S' }
                        ].map(({ value, label }) => (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "font-bold text-purple-600", children: value }), _jsx("span", { className: "text-[0.6rem] text-slate-600 dark:text-slate-400 ml-0.5", children: label })] }, label))) })] }) }) }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden sm:block", children: _jsx(DesktopTimer, {}) }), _jsx("div", { className: "sm:hidden", children: _jsx(MobileTimer, {}) })] }));
};
export default CountdownTimer;
