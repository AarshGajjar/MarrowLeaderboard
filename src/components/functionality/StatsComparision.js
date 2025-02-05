import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChartLine, Crown, Plus, Swords } from 'lucide-react';
import ProgressPopup from '@/components/functionality/ProgressPopup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserStatsRadarChart from '@/components/functionality/RadarChart';
import { toast } from 'sonner';
import { calculateMetrics, calculateDailyAverage, calculateConsistencyAndStreak } from '@/utils/dataPreprocessing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const StatsComparison = ({ stats, dailyData, activityLogs, onUpdateProgress }) => {
    const [activeUser, setActiveUser] = useState(null);
    const [inputs, setInputs] = useState({ completed: '', correct: '' });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordMode, setIsPasswordMode] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [selectedProgressUser, setSelectedProgressUser] = useState('user1');
    const [isRadarChartOpen, setIsRadarChartOpen] = useState(false);
    const user1Metrics = calculateMetrics(stats.user1);
    const user2Metrics = calculateMetrics(stats.user2);
    const leader = user1Metrics.points > user2Metrics.points ? 'user1' : 'user2';
    const pointsDiff = Math.abs(user1Metrics.points - user2Metrics.points);
    const user1DailyAverage = calculateDailyAverage(dailyData.filter(data => data.user1Completed !== undefined)
        .map(data => ({
        date: data.date,
        completed: data.user1Completed
    })));
    const user2DailyAverage = calculateDailyAverage(dailyData.filter(data => data.user2Completed !== undefined)
        .map(data => ({
        date: data.date,
        completed: data.user2Completed
    })));
    const user1ConsistencyAndStreak = calculateConsistencyAndStreak(dailyData.filter(data => data.user1Completed !== undefined)
        .map(data => ({
        date: data.date,
        completed: data.user1Completed,
        correct: data.user1Correct
    })));
    const user2ConsistencyAndStreak = calculateConsistencyAndStreak(dailyData.filter(data => data.user2Completed !== undefined)
        .map(data => ({
        date: data.date,
        completed: data.user2Completed,
        correct: data.user2Correct
    })));
    const handlePasswordSubmit = () => {
        if (activeUser && password === (activeUser === 'user1' ? '9696' : '6969')) {
            setIsPasswordMode(false);
            setPassword('');
            setError('');
        }
        else {
            setError('Incorrect password');
        }
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async () => {
        if (isSubmitting)
            return;
        const completed = parseInt(inputs.completed);
        const correct = parseInt(inputs.correct);
        if (!activeUser || isNaN(completed) || isNaN(correct) ||
            correct > completed || completed < 0 || correct < 0) {
            toast.error('Invalid input');
            return;
        }
        try {
            setIsSubmitting(true);
            setError('');
            await onUpdateProgress(activeUser, completed, correct);
            toast.success(`${completed} questions added for ${stats[activeUser].name}`);
            setInputs({ completed: '', correct: '' });
            setActiveUser(null);
            setIsPasswordMode(true);
            setIsDialogOpen(false);
        }
        catch (error) {
            console.error('Progress update failed:', error);
            toast.error('Failed to update progress. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const ComparisonBar = ({ label, value1, value2, unit = '' }) => {
        const colors = {
            better: 'bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500',
            worse: 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
            label: 'text-slate-700 dark:text-slate-200'
        };
        const max = Math.max(value1, value2) * 1.3;
        const width1 = (value1 / max) * 100;
        const width2 = (value2 / max) * 100;
        return (_jsxs("div", { className: "w-full p-4 rounded-lg", children: [_jsx("div", { className: "text-s font-medium text-center mb-3 text-white-700", children: label }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 text-right", children: _jsxs("span", { className: "font-semibold text-l text-[#7242eb] dark:text-purple-400 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 shadow-sm", children: [unit === '%' ? value1.toFixed(2) : value1, unit] }) }), _jsxs("div", { className: "flex-1 h-8 rounded-lg relative", children: [_jsxs("div", { className: "absolute inset-0 flex", children: [_jsx("div", { className: "w-1/2 flex justify-end", children: _jsx("div", { className: `absolute top-0 bottom-0 right-1/2 ${value1 >= value2 ? colors.better : colors.worse} rounded-l-lg transition-all duration-300`, style: {
                                                    width: `${width1 / 2}%`,
                                                    right: '50%'
                                                } }) }), _jsx("div", { className: "w-1/2", children: _jsx("div", { className: `absolute top-0 bottom-0 left-1/2 ${value2 >= value1 ? colors.better : colors.worse} rounded-r-lg transition-all duration-300`, style: {
                                                    width: `${width2 / 2}%`,
                                                    left: '50%'
                                                } }) })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("span", { className: "text-xs font-bold bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-sm", children: [Math.abs(value1 - value2).toFixed(unit === '%' ? 2 : 0), unit] }) })] }), _jsx("div", { className: "w-16 text-left", children: _jsxs("span", { className: "font-semibold text-l text-[#4287eb] dark:text-blue-400 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 shadow-sm", children: [unit === '%' ? value2.toFixed(2) : value2, unit] }) })] })] }));
    };
    return (_jsx(_Fragment, { children: _jsxs(Card, { className: "w-full max-w-2xl shadow-lg rounded-lg overflow-hidden bg-gradient-to-br from-white/80 via-white/90 to-white/80 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-slate-800/20", children: [_jsx(CardHeader, { className: "border-b p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/20 dark:to-blue-900/20", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-lg font-semibold", children: [_jsx(Swords, { className: "w-5 h-5 text-amber-500" }), _jsx("span", { className: "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "Battle Arena" })] }) }) }), _jsxs(CardContent, { className: "p-4 sm:p-6", children: [_jsxs("div", { className: "flex flex-row justify-between items-start mb-8 gap-2", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsx("h3", { className: "font-semibold text-xl text-[#7242eb] dark:text-purple-400 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 shadow-sm", children: stats.user1.name }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-1 sm:gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => { setActiveUser('user1'); setIsDialogOpen(true); }, className: "hover:bg-purple-50 border-purple-600/20 text-xs sm:text-sm w-full sm:w-auto", children: [_jsx(Plus, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-600" }), _jsx("span", { className: "text-purple-600", children: "Add" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => { setSelectedProgressUser('user1'); setShowProgress(true); }, className: "hover:bg-blue-50 border-blue-600/20 text-xs sm:text-sm w-full sm:w-auto", children: [_jsx(ChartLine, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600" }), _jsx("span", { className: "text-blue-600", children: "Stats" })] })] })] }) }), _jsx("div", { className: "flex-shrink-0 w-16 sm:w-24", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 rounded-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-8 sm:w-12 h-8 sm:h-12" }), _jsx("button", { onClick: () => setIsRadarChartOpen(true), className: "text-base sm:text-lg font-semibold text-purple-600/70 relative z-10 p-2 hover:text-blue-600 transition-colors", children: "VS" })] }), _jsx("div", { className: "flex justify-center mt-2", children: _jsx("div", { className: "relative", children: _jsx(UserStatsRadarChart, { user1: {
                                                            name: stats.user1.name,
                                                            total: stats.user1.completed,
                                                            correct: stats.user1.correct,
                                                            accuracy: user1Metrics.accuracy,
                                                            dailyAverage: user1DailyAverage,
                                                            consistency: user1ConsistencyAndStreak.consistency,
                                                            streak: user1ConsistencyAndStreak.streak
                                                        }, user2: {
                                                            name: stats.user2.name,
                                                            total: stats.user2.completed,
                                                            correct: stats.user2.correct,
                                                            accuracy: user2Metrics.accuracy,
                                                            dailyAverage: user2DailyAverage,
                                                            consistency: user2ConsistencyAndStreak.consistency,
                                                            streak: user2ConsistencyAndStreak.streak
                                                        }, isOpen: isRadarChartOpen, onOpenChange: setIsRadarChartOpen }) }) })] }) }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsx("h3", { className: "font-semibold text-xl text-[#4287eb] dark:text-blue-400 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 shadow-sm", children: stats.user2.name }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-1 sm:gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => { setActiveUser('user2'); setIsDialogOpen(true); }, className: "hover:bg-purple-50 border-purple-600/20 text-xs sm:text-sm w-full sm:w-auto", children: [_jsx(Plus, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-600" }), _jsx("span", { className: "text-purple-600", children: "Add" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => { setSelectedProgressUser('user2'); setShowProgress(true); }, className: "hover:bg-blue-50 border-blue-600/20 text-xs sm:text-sm w-full sm:w-auto", children: [_jsx(ChartLine, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600" }), _jsx("span", { className: "text-blue-600", children: "Stats" })] })] })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(ComparisonBar, { label: "Total Completed", value1: stats.user1.completed, value2: stats.user2.completed }), _jsx(ComparisonBar, { label: "Correct Answers", value1: stats.user1.correct, value2: stats.user2.correct }), _jsx(ComparisonBar, { label: "Accuracy", value1: user1Metrics.accuracy, value2: user2Metrics.accuracy, unit: "%" })] }), _jsx("div", { className: "mt-8 flex justify-center", children: _jsx(TooltipProvider, { children: _jsxs(Tooltip, { delayDuration: 0, children: [_jsx(TooltipTrigger, { children: _jsxs("div", { className: "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg shadow-sm cursor-help", children: [_jsx(Crown, { className: "w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400" }), _jsxs("span", { className: "text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200", children: [stats[leader].name, " leads by ", pointsDiff, " points"] })] }) }), _jsx(TooltipContent, { className: "max-w-xs", side: "top", children: _jsx("p", { className: "text-xs sm:text-sm", children: "Points = Questions Completed + +2% points per 1% accuracy above 80%" }) })] }) }) }), _jsx(Dialog, { open: isDialogOpen, onOpenChange: (open) => {
                                setIsDialogOpen(open);
                                if (!open) {
                                    setActiveUser(null);
                                    setIsPasswordMode(true);
                                    setError('');
                                    setInputs({ completed: '', correct: '' });
                                }
                            }, children: _jsxs(DialogContent, { className: "sm:max-w-[325px]", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Add ", activeUser === 'user1' ? stats.user1.name : stats.user2.name, "'s progress"] }) }), isPasswordMode ? (_jsxs("div", { className: "space-y-4", children: [_jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Password", className: "text-lg tracking-wider" }), _jsx(Button, { className: "w-full", onClick: handlePasswordSubmit, children: "Verify" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx(Input, { type: "number", placeholder: "Questions Completed", value: inputs.completed, onChange: (e) => setInputs(prev => ({ ...prev, completed: e.target.value })), className: "text-lg" }), _jsx(Input, { type: "number", placeholder: "Correct Answers", value: inputs.correct, onChange: (e) => setInputs(prev => ({ ...prev, correct: e.target.value })), className: "text-lg" }), _jsx(Button, { className: "w-full", onClick: handleSubmit, disabled: isSubmitting, children: isSubmitting ? 'Updating...' : 'Add' })] })), error && _jsx("p", { className: "text-sm text-rose-600 text-center", children: error })] }) }), _jsx(ProgressPopup, { isOpen: showProgress, onClose: () => setShowProgress(false), dailyData: dailyData.map(p => ({
                                date: p.date,
                                user1Data: {
                                    completed: p.user1Completed,
                                    correct: p.user1Correct,
                                    date: p.date,
                                    accuracy: p.user1Completed > 0 ? (p.user1Correct / p.user1Completed) * 100 : 0
                                },
                                user2Data: {
                                    completed: p.user2Completed,
                                    correct: p.user2Correct,
                                    date: p.date,
                                    accuracy: p.user2Completed > 0 ? (p.user2Correct / p.user2Completed) * 100 : 0
                                }
                            })), user1Name: stats.user1.name, user2Name: stats.user2.name, selectedUser: selectedProgressUser, activityLogs: activityLogs })] })] }) }));
};
export default StatsComparison;
