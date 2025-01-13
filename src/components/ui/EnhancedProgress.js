import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy } from 'lucide-react';
const EnhancedProgress = ({ current, target }) => {
    const rawPercentage = (current / target) * 100;
    const progressPercentage = Math.min(rawPercentage, 100);
    const isTargetReached = current >= target;
    const questionsLeft = Math.max(target - current, 0);
    return (_jsx(Card, { className: "w-full", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx(Badge, { variant: isTargetReached ? "default" : "secondary", className: "font-medium", children: isTargetReached ?
                                    _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), " Target Reached!"] }) :
                                    `${questionsLeft} questions left today` }), _jsxs(Badge, { variant: "outline", className: "font-medium", children: [Math.round(rawPercentage), "% Complete"] })] }), _jsxs("div", { className: "relative", children: [_jsx(Progress, { value: progressPercentage, className: `h-2 transition-all duration-500 ${isTargetReached
                                    ? 'bg-slate-100 [&>div]:bg-indigo-500'
                                    : 'bg-slate-100 [&>div]:bg-slate-600'}` }), isTargetReached && (_jsx(Trophy, { className: "absolute right-0 top-5 w-5 h-5 text-yellow-500 animate-bounce", style: {
                                    filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.5))',
                                    animation: 'bounce 2s infinite'
                                } }))] }), _jsx("div", { className: "flex justify-between items-center text-sm", children: _jsxs("div", { className: "space-y-1", children: [_jsxs("p", { className: "font-medium text-slate-700", children: [current, " of ", target, " completed"] }), !isTargetReached && (_jsx("p", { className: "text-slate-500", children: "Keep going! You're doing great" }))] }) })] }) }) }));
};
export default EnhancedProgress;
