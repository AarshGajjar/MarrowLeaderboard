import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Crosshair, Award, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '../lib/supabase';
import CountdownTimer from './ui/Countdown';
import imgSrc from '@/assets/marrow.png';
import StatsComparison from './functionality/StatsComparision';
import DualUserProgress from './functionality/EnhancedProgress';
import ActivityLogs from './functionality/ActivityLogs';
const DAILY_TARGET = 200;
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
const isSameDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate());
};
const getMetricIcon = (metric) => {
    switch (metric) {
        case 'accuracy':
            return _jsx(Crosshair, { className: "w-4 h-4" });
        case 'questions':
            return _jsx(Award, { className: "w-4 h-4" });
        case 'correct':
            return _jsx(Check, { className: "w-4 h-4" });
        default:
            return null;
    }
};
const convertToDailyData = (progress) => {
    return progress.map(p => ({
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
    }));
};
// Section toggle component
const SectionHeader = ({ title, isExpanded, onToggle, icon }) => (_jsxs("div", { className: "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50", onClick: onToggle, children: [_jsxs("div", { className: "flex items-center gap-2", children: [icon, _jsx("h3", { className: "font-medium", children: title })] }), isExpanded ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" })] }));
// Alert component
const StatusAlert = ({ message, type, onClose }) => (_jsx(Alert, { className: `${type === 'success' ? 'bg-green-50' : 'bg-red-50'} mb-4`, children: _jsxs("div", { className: "flex items-center gap-2", children: [type === 'success' ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(AlertCircle, { className: "w-4 h-4 text-red-500" })), _jsx(AlertDescription, { children: message })] }) }));
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
        showInputs: {
            user1: false,
            user2: false
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
        }
    });
    const [dailyProgress, setDailyProgress] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    // Refresh data function
    const refreshData = async () => {
        await fetchData();
        await fetchDailyProgress();
    };
    // Alerts
    const [showAlert, setShowAlert] = useState({ message: '', type: 'success', visible: false });
    const [expandedSections, setExpandedSections] = useState({
        progress: true,
        charts: false,
        logs: false,
    });
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
    const handleSubmit = async (user, completed, correct) => {
        // Validation
        if (completed === 0 || correct > completed || completed < 0 || correct < 0) {
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
                    completed: state.stats[user].completed + completed,
                    correct: state.stats[user].correct + correct,
                },
            };
            // Update stats in database
            const { error: statsError } = await supabase
                .from('qbank_stats')
                .upsert({
                id: 'main',
                stats: updatedStats,
                last_updated: new Date().toISOString(),
            });
            if (statsError)
                throw statsError;
            // Create activity log entry
            const { error: logError } = await supabase
                .from('activity_logs')
                .insert({
                user_type: user,
                completed: completed,
                correct: correct,
                timestamp: new Date().toISOString()
            });
            if (logError)
                throw logError;
            // Update daily progress
            await updateDailyProgress(user, completed, correct);
            // Update local state
            setState(prev => ({
                ...prev,
                stats: updatedStats
            }));
            // Refresh data to ensure consistency
            await fetchData();
        }
        catch (error) {
            console.error('Failed to update progress:', error);
            throw error; // This will be caught by the StatsComparison component
        }
    };
    // Initial data fetch
    useEffect(() => {
        fetchData();
        fetchDailyProgress();
    }, []);
    return (_jsxs(Card, { className: "w-full max-w-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "flex justify-center", children: _jsx("img", { src: imgSrc, alt: "Marrow Logo", className: "w-12 h-12" }) }), _jsx(CardTitle, { className: "text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "Marrow QBank Challenge" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx(CountdownTimer, {}), showAlert.visible && (_jsx(StatusAlert, { message: showAlert.message, type: showAlert.type, onClose: () => setShowAlert(prev => ({ ...prev, visible: false })) })), _jsx(StatsComparison, { stats: state.stats, onUpdateProgress: handleSubmit, dailyData: dailyProgress, activityLogs: activityLogs }), _jsx(DualUserProgress, { user1: {
                            name: state.stats.user1.name,
                            current: dailyProgress.length > 0 ? dailyProgress[dailyProgress.length - 1].user1Completed : 0,
                            color: "#2563eb"
                        }, user2: {
                            name: state.stats.user2.name,
                            current: dailyProgress.length > 0 ? dailyProgress[dailyProgress.length - 1].user2Completed : 0,
                            color: "#7242eb"
                        }, target: DAILY_TARGET }), _jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsx(ActivityLogs, { logs: activityLogs, userNames: {
                                user1: state.stats.user1.name,
                                user2: state.stats.user2.name
                            }, onRefresh: refreshData }) })] })] }));
};
export default QBankTracker;
function setShowAlert(arg0) {
    throw new Error('Function not implemented.');
}
