import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '../lib/supabase';
import StatsComparison from './functionality/StatsComparision';
import DualUserProgress from './functionality/EnhancedProgress';
import ActivityLogs from './functionality/ActivityLogs';
import { Toaster } from 'sonner';
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
const getISTDate = () => {
    const date = new Date();
    const istTime = date.getTime() + (5.5 * 60 * 60 * 1000);
    const istDate = new Date(istTime);
    return istDate.toISOString().split('T')[0];
};
const isSameDate = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate());
};
// Section toggle component
// Alert component
const StatusAlert = ({ message, type }) => (_jsx(Alert, { className: `${type === 'success' ? 'bg-green-50' : 'bg-red-50'} mb-4`, children: _jsxs("div", { className: "flex items-center gap-2", children: [type === 'success' ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(AlertCircle, { className: "w-4 h-4 text-red-500" })), _jsx(AlertDescription, { children: message })] }) }));
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
    const getTodaysTotals = (logs) => {
        const today = getISTDate();
        return logs.reduce((acc, log) => {
            if (isSameDate(log.timestamp, today)) {
                const userKey = log.user_type;
                acc[userKey].completed += log.completed;
                acc[userKey].correct += log.correct;
            }
            return acc;
        }, {
            user1: { completed: 0, correct: 0 },
            user2: { completed: 0, correct: 0 }
        });
    };
    // Common alert component
    const alertComponent = showAlert.visible && (_jsx(StatusAlert, { message: showAlert.message, type: showAlert.type, onClose: () => setShowAlert(prev => ({ ...prev, visible: false })) }));
    // Common content components
    const statsComparisonComponent = (_jsx(StatsComparison, { stats: state.stats, onUpdateProgress: handleSubmit, dailyData: dailyProgress, activityLogs: activityLogs }));
    const activityLogsComponent = (_jsx(ActivityLogs, { logs: activityLogs, userNames: {
            user1: state.stats.user1.name,
            user2: state.stats.user2.name
        }, onRefresh: refreshData }));
    const progressComponent = (_jsx(DualUserProgress, { user1: {
            name: state.stats.user1.name,
            current: getTodaysTotals(activityLogs).user1.completed,
            color: "#2563eb"
        }, user2: {
            name: state.stats.user2.name,
            current: getTodaysTotals(activityLogs).user2.completed,
            color: "#7242eb"
        }, target: DAILY_TARGET }));
    return (_jsxs(_Fragment, { children: [_jsx(Toaster, { position: "top-center", richColors: true, expand: true, closeButton: true }), _jsxs("div", { className: "flex flex-col gap-6 lg:hidden", children: [alertComponent, _jsx("div", { className: "w-full", children: progressComponent }), _jsx("div", { className: "w-full", children: statsComparisonComponent }), _jsx("div", { className: "w-full", children: activityLogsComponent })] }), _jsxs("div", { className: "hidden lg:grid grid-rows-[auto_1fr] gap-6 w-full max-w-[1600px] mx-auto", children: [_jsx("div", { className: "row-span-1 w-full", children: progressComponent }), _jsxs("div", { className: "grid grid-cols-2 gap-6 justify-center items-start", children: [statsComparisonComponent, activityLogsComponent] })] })] }));
};
export default QBankTracker;
