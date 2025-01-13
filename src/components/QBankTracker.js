import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crosshair, TrendingUp, Award, Target, Plus, Lock, XCircle, Clock, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProgressDashboard from './DailyProgressGraph';
import imgSrc from '@/assets/marrow.png';
// Utility functions
const calculateAccuracy = (correct, total) => {
    if (total === 0)
        return '0';
    return ((correct / total) * 100).toFixed(1);
};
const calculateMetrics = (stats) => {
    const accuracy = parseFloat(calculateAccuracy(stats.correct, stats.completed));
    const accuracyThreshold = 80;
    const accuracyBonus = accuracy >= accuracyThreshold ? (accuracy - accuracyThreshold) * 2 : 0;
    const points = stats.completed + (accuracyBonus * stats.completed / 100);
    return {
        accuracy,
        points: Math.round(points),
        questionsPerDay: stats.completed,
        effectiveScore: stats.correct
    };
};
const determineLeader = (user1Metrics, user2Metrics) => {
    const compareAndGetLeader = (value1, value2) => {
        return value1 >= value2 ? 'user1' : 'user2';
    };
    const comparisons = {
        accuracy: {
            diff: user1Metrics.accuracy - user2Metrics.accuracy,
            leader: compareAndGetLeader(user1Metrics.accuracy, user2Metrics.accuracy),
            metric: 'accuracy',
            value: Math.abs(user1Metrics.accuracy - user2Metrics.accuracy).toFixed(1) + '%'
        },
        volume: {
            diff: user1Metrics.questionsPerDay - user2Metrics.questionsPerDay,
            leader: compareAndGetLeader(user1Metrics.questionsPerDay, user2Metrics.questionsPerDay),
            metric: 'questions',
            value: Math.abs(user1Metrics.questionsPerDay - user2Metrics.questionsPerDay).toString()
        },
        points: {
            diff: user1Metrics.points - user2Metrics.points,
            leader: compareAndGetLeader(user1Metrics.points, user2Metrics.points),
            metric: 'points',
            value: Math.abs(user1Metrics.points - user2Metrics.points).toString()
        },
        effectiveScore: {
            diff: user1Metrics.effectiveScore - user2Metrics.effectiveScore,
            leader: compareAndGetLeader(user1Metrics.effectiveScore, user2Metrics.effectiveScore),
            metric: 'correct',
            value: Math.abs(user1Metrics.effectiveScore - user2Metrics.effectiveScore).toString()
        }
    };
    const overallLeader = compareAndGetLeader(user1Metrics.points, user2Metrics.points);
    return {
        overallLeader,
        comparisons,
        user1Metrics,
        user2Metrics
    };
};
const getISTDate = () => {
    const date = new Date();
    const istTime = date.getTime() + (5.5 * 60 * 60 * 1000);
    const istDate = new Date(istTime);
    return istDate.toISOString().split('T')[0];
};
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
// Stats comparison component
const StatsComparison = ({ stats }) => {
    const user1Metrics = calculateMetrics(stats.user1);
    const user2Metrics = calculateMetrics(stats.user2);
    const comparison = determineLeader(user1Metrics, user2Metrics);
    // Filter out points from VS display (keep accuracy, volume, effectiveScore)
    const displayComparisons = Object.entries(comparison.comparisons)
        .filter(([key]) => key !== 'points')
        .map(([key, value]) => value);
    const getMetricIcon = (metric) => {
        switch (metric) {
            case 'accuracy':
                return _jsx(Crosshair, { className: "w-4 h-4" });
            case 'questions':
                return _jsx(Award, { className: "w-4 h-4" });
            default:
                return _jsx(TrendingUp, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "space-y-4 mb-6 p-4 bg-white rounded-lg shadow-sm", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-center", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-medium text-lg", children: stats.user1.name }), _jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [user1Metrics.accuracy, "%"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [stats.user1.completed, " questions"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [stats.user1.correct, " correct"] }), _jsxs("div", { className: "text-sm font-medium text-purple-600", children: [user1Metrics.points, " points"] })] }), _jsxs("div", { className: "flex flex-col items-center justify-center space-y-3", children: [_jsx("div", { className: "text-xl font-semibold text-purple-600 mb-2", children: "VS" }), displayComparisons.map((value) => (_jsxs("div", { className: `w-full p-2 rounded-lg ${value.leader === 'user1' ? 'bg-blue-50' : 'bg-purple-50'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex items-center gap-1 text-gray-600", children: [getMetricIcon(value.metric), _jsx("span", { className: "text-sm capitalize", children: value.metric })] }), _jsx("span", { className: `text-sm font-medium ${value.leader === 'user1' ? 'text-blue-600' : 'text-purple-600'}`, children: stats[value.leader].name })] }), _jsx("div", { className: "flex justify-between items-baseline", children: _jsxs("span", { className: "text-lg font-bold", children: ["+", value.value] }) })] }, value.metric)))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-medium text-lg", children: stats.user2.name }), _jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [user2Metrics.accuracy, "%"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [stats.user2.completed, " questions"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [stats.user2.correct, " correct"] }), _jsxs("div", { className: "text-sm font-medium text-purple-600", children: [user2Metrics.points, " points"] })] })] }), _jsxs("div", { className: "flex justify-center items-center space-x-2 bg-yellow-50 rounded-full px-4 py-2", children: [_jsx(Crown, { size: 16, className: "text-yellow-500" }), _jsxs("span", { className: "text-sm font-medium text-yellow-700", children: [stats[comparison.overallLeader].name, " is leading with ", comparison.comparisons.points.value, " more points!"] })] }), _jsx("div", { className: "text-xs text-center text-gray-500 mt-2", children: "Points = Questions Completed + Bonus for Accuracy above 80%" })] }));
};
// Activity Log Component
const ActivityLogSection = ({ logs, userNames }) => {
    return (_jsxs("div", { className: "space-y-3 p-4 rounded-lg bg-white shadow-sm", children: [_jsxs("div", { className: "font-medium flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Recent Activity"] }), _jsx("div", { className: "space-y-2", children: logs.map((log) => (_jsxs("div", { className: "text-sm p-2 bg-gray-50 rounded-md", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: log.user_type === 'user1' ? userNames.user1 : userNames.user2 }), _jsx("span", { className: "text-gray-500", children: formatDate(log.timestamp) })] }), _jsxs("div", { className: "text-gray-600", children: ["Completed: ", log.completed, " | Correct: ", log.correct, " | Accuracy: ", calculateAccuracy(log.correct, log.completed), "%"] })] }, log.id))) })] }));
};
// Main component
const QBankTracker = () => {
    const [state, setState] = useState({
        stats: {
            user1: { completed: 0, correct: 0, name: "Aarsh" },
            user2: { completed: 0, correct: 0, name: "Aman" }
        },
        inputs: {
            user1: { completed: '', correct: '' },
            user2: { completed: '', correct: '' }
        },
        error: {
            user1: '',
            user2: ''
        },
        password: {
            user1: '',
            user2: ''
        },
        showPasswordInput: {
            user1: false,
            user2: false
        },
        showInputs: {
            user1: false,
            user2: false
        }
    });
    const [dailyProgress, setDailyProgress] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    // Password verification
    const verifyPassword = (user, password) => {
        const passwords = { user1: '9696', user2: '6969' };
        return password === passwords[user];
    };
    // Data fetching functions
    const fetchData = async () => {
        try {
            const [statsResponse, logsResponse] = await Promise.all([
                supabase
                    .from('qbank_stats')
                    .select('*')
                    .eq('id', 'main')
                    .single(),
                supabase
                    .from('activity_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10)
            ]);
            if (statsResponse.error && statsResponse.error.code !== 'PGRST116') {
                throw statsResponse.error;
            }
            if (logsResponse.error) {
                throw logsResponse.error;
            }
            if (statsResponse.data?.stats) {
                setState(prev => ({ ...prev, stats: statsResponse.data.stats }));
            }
            if (logsResponse.data) {
                setActivityLogs(logsResponse.data);
            }
        }
        catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };
    const fetchDailyProgress = async () => {
        try {
            const { data, error } = await supabase
                .from('daily_progress')
                .select('*')
                .order('date', { ascending: true });
            if (error)
                throw error;
            const transformedData = data?.map(entry => ({
                date: entry.date,
                user1Completed: entry.user1_completed,
                user1Correct: entry.user1_correct,
                user2Completed: entry.user2_completed,
                user2Correct: entry.user2_correct
            }));
            setDailyProgress(transformedData || []);
        }
        catch (error) {
            console.error('Failed to fetch daily progress:', error);
        }
    };
    // Update functions
    const updateDailyProgress = async (user, completed, correct) => {
        const today = getISTDate();
        try {
            const { data: existingData } = await supabase
                .from('daily_progress')
                .select('*')
                .eq('date', today)
                .maybeSingle();
            const userCompletedField = `${user}_completed`;
            const userCorrectField = `${user}_correct`;
            if (existingData) {
                await supabase
                    .from('daily_progress')
                    .update({
                    [userCompletedField]: (existingData[userCompletedField] || 0) + completed,
                    [userCorrectField]: (existingData[userCorrectField] || 0) + correct
                })
                    .eq('date', today);
            }
            else {
                await supabase
                    .from('daily_progress')
                    .insert({
                    date: today,
                    user1_completed: user === 'user1' ? completed : 0,
                    user1_correct: user === 'user1' ? correct : 0,
                    user2_completed: user === 'user2' ? completed : 0,
                    user2_correct: user === 'user2' ? correct : 0
                });
            }
            await fetchDailyProgress();
        }
        catch (error) {
            console.error('Error updating daily progress:', error);
        }
    };
    const handlePasswordSubmit = (user) => {
        if (verifyPassword(user, state.password[user])) {
            setState(prev => ({
                ...prev,
                showPasswordInput: { ...prev.showPasswordInput, [user]: false },
                showInputs: { ...prev.showInputs, [user]: true },
                password: { ...prev.password, [user]: '' },
                error: { ...prev.error, [user]: '' }
            }));
        }
        else {
            setState(prev => ({
                ...prev,
                error: { ...prev.error, [user]: 'Incorrect password' }
            }));
        }
    };
    const handleSubmit = async (user) => {
        const newCompleted = parseInt(state.inputs[user].completed) || 0;
        const newCorrect = parseInt(state.inputs[user].correct) || 0;
        // Validation
        if (newCompleted === 0 || newCorrect > newCompleted || newCompleted < 0 || newCorrect < 0) {
            setState(prev => ({
                ...prev,
                error: { ...prev.error, [user]: "Invalid input values" }
            }));
            return;
        }
        try {
            const updatedStats = {
                ...state.stats,
                [user]: {
                    ...state.stats[user],
                    completed: state.stats[user].completed + newCompleted,
                    correct: state.stats[user].correct + newCorrect,
                },
            };
            // Create the activity log entry
            const { data: logData, error: logError } = await supabase
                .from('activity_logs')
                .insert({
                user_type: user,
                completed: newCompleted,
                correct: newCorrect,
                timestamp: new Date().toISOString()
            })
                .select()
                .single();
            if (logError)
                throw logError;
            // Update stats and daily progress
            const [statsResult, progressResult] = await Promise.all([
                supabase
                    .from('qbank_stats')
                    .upsert({
                    id: 'main',
                    stats: updatedStats,
                    last_updated: new Date().toISOString(),
                }),
                updateDailyProgress(user, newCompleted, newCorrect)
            ]);
            if (statsResult.error)
                throw statsResult.error;
            // Update local state
            setState(prev => ({
                ...prev,
                stats: updatedStats,
                inputs: { ...prev.inputs, [user]: { completed: '', correct: '' } },
                showInputs: { ...prev.showInputs, [user]: false }
            }));
            // Update activity logs state with the new entry
            if (logData) {
                setActivityLogs(prev => [logData, ...prev.slice(0, 9)]); // Keep only the last 10 entries
            }
            // Refresh data to ensure consistency
            await fetchData();
        }
        catch (error) {
            console.error('Failed to update data:', error);
            setState(prev => ({
                ...prev,
                error: { ...prev.error, [user]: "Failed to update progress" }
            }));
        }
    };
    // Initial data fetch
    useEffect(() => {
        fetchData();
        fetchDailyProgress();
    }, []);
    return (_jsxs(Card, { className: "w-full max-w-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "flex justify-center", children: _jsx("img", { src: imgSrc, alt: "Marrow Logo", className: "w-12 h-12" }) }), _jsx(CardTitle, { className: "text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "Marrow QBank Challenge" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx(StatsComparison, { stats: state.stats }), ['user1', 'user2'].map((user) => (_jsxs("div", { className: "space-y-3 p-4 rounded-lg bg-white shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "text-blue-500", size: 20 }), _jsx("span", { className: "font-medium", children: state.stats[user].name })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "ml-auto", onClick: () => setState(prev => ({
                                            ...prev,
                                            showPasswordInput: { ...prev.showPasswordInput, [user]: true }
                                        })), children: [_jsx(Plus, { size: 16, className: "mr-1" }), "Add Progress"] })] }), state.showPasswordInput[user] && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lock, { size: 16, className: "text-gray-500" }), _jsx(Input, { type: "password", value: state.password[user], onChange: (e) => setState(prev => ({
                                                    ...prev,
                                                    password: { ...prev.password, [user]: e.target.value },
                                                    error: { ...prev.error, [user]: '' }
                                                })), placeholder: "Enter password", className: "flex-1" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setState(prev => ({
                                                    ...prev,
                                                    showPasswordInput: { ...prev.showPasswordInput, [user]: false },
                                                    password: { ...prev.password, [user]: '' },
                                                    error: { ...prev.error, [user]: '' }
                                                })), children: _jsx(XCircle, { size: 16 }) })] }), state.error[user] && (_jsx("div", { className: "text-red-500 text-sm", children: state.error[user] })), _jsx(Button, { onClick: () => handlePasswordSubmit(user), className: "w-full", children: "Verify Password" })] })), state.showInputs[user] && (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { type: "number", value: state.inputs[user].completed, onChange: (e) => setState(prev => ({
                                            ...prev,
                                            inputs: {
                                                ...prev.inputs,
                                                [user]: { ...prev.inputs[user], completed: e.target.value }
                                            },
                                            error: { ...prev.error, [user]: '' }
                                        })), placeholder: "Questions completed in this session", className: "w-full" }), _jsx(Input, { type: "number", value: state.inputs[user].correct, onChange: (e) => setState(prev => ({
                                            ...prev,
                                            inputs: {
                                                ...prev.inputs,
                                                [user]: { ...prev.inputs[user], correct: e.target.value }
                                            },
                                            error: { ...prev.error, [user]: '' }
                                        })), placeholder: "Correct answers in this session", className: "w-full" }), state.error[user] && (_jsx("div", { className: "text-red-500 text-sm", children: state.error[user] })), _jsx(Button, { onClick: () => handleSubmit(user), className: "w-full", children: "Add Progress" })] })), !state.showInputs[user] && !state.showPasswordInput[user] && (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { children: ["Total Questions: ", state.stats[user].completed] }), _jsxs("div", { children: ["Correct: ", state.stats[user].correct] }), _jsxs("div", { className: "font-semibold text-lg", children: ["Accuracy: ", calculateAccuracy(state.stats[user].correct, state.stats[user].completed), "%"] })] }))] }, user))), activityLogs.length > 0 && (_jsx(ActivityLogSection, { logs: activityLogs, userNames: {
                            user1: state.stats.user1.name,
                            user2: state.stats.user2.name
                        } })), dailyProgress.length > 0 && (_jsx(ProgressDashboard, { dailyData: dailyProgress.map(day => ({
                            date: day.date,
                            user1Data: {
                                date: day.date,
                                completed: day.user1Completed,
                                correct: day.user1Correct,
                                accuracy: (day.user1Correct / day.user1Completed * 100) || 0,
                                goalProgress: (day.user1Correct / day.user1Completed * 100) || 0,
                            },
                            user2Data: {
                                date: day.date,
                                completed: day.user2Completed,
                                correct: day.user2Correct,
                                accuracy: (day.user2Correct / day.user2Completed * 100) || 0,
                                goalProgress: (day.user2Correct / day.user2Completed * 100) || 0,
                            }
                        })), user1Name: state.stats.user1.name, user2Name: state.stats.user2.name, getDate: getISTDate }))] })] }));
};
export default QBankTracker;
