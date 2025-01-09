import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Target, Edit2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
            metric: 'correct answers',
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
const StatsComparison = ({ stats }) => {
    const user1Metrics = calculateMetrics(stats.user1);
    const user2Metrics = calculateMetrics(stats.user2);
    const comparison = determineLeader(user1Metrics, user2Metrics);
    return (_jsxs("div", { className: "space-y-4 mb-6 p-4 bg-white rounded-lg shadow-sm", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-medium text-lg", children: stats.user1.name }), _jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [user1Metrics.accuracy, "%"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [stats.user1.completed, " cards"] }), _jsxs("div", { className: "text-sm font-medium text-purple-600", children: [user1Metrics.points, " points"] })] }), _jsxs("div", { className: "flex flex-col items-center justify-center space-y-2", children: [_jsx("div", { className: "text-xl font-semibold text-purple-600", children: "VS" }), Object.entries(comparison.comparisons).map(([key, value]) => (_jsxs("div", { className: "text-sm text-gray-600", children: [value.value, " ", value.metric] }, key)))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-medium text-lg", children: stats.user2.name }), _jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [user2Metrics.accuracy, "%"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [stats.user2.completed, " cards"] }), _jsxs("div", { className: "text-sm font-medium text-purple-600", children: [user2Metrics.points, " points"] })] })] }), _jsxs("div", { className: "flex justify-center items-center space-x-2", children: [_jsx(Crown, { size: 16, className: "text-yellow-500" }), _jsxs("span", { className: "text-sm font-medium text-yellow-600", children: [stats[comparison.overallLeader].name, " is leading with ", comparison.comparisons.points.value, " more points!"] })] }), _jsx("div", { className: "text-xs text-center text-gray-500 mt-2", children: "Points = Questions Completed + Bonus for Accuracy above 80%" })] }));
};
const QBankTracker = () => {
    const [stats, setStats] = useState({
        user1: { completed: 0, correct: 0, name: "bholipunjaban69" },
        user2: { completed: 0, correct: 0, name: "gorlin" },
    });
    const [inputs, setInputs] = useState({
        user1: { completed: '', correct: '' },
        user2: { completed: '', correct: '' },
    });
    const [mode, setMode] = useState({
        user1: 'view',
        user2: 'view',
    });
    const [error, setError] = useState({
        user1: '',
        user2: '',
    });
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('qbank_stats')
                .select('*')
                .eq('id', 'main')
                .single();
            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }
            if (data?.stats) {
                setStats(data.stats);
            }
        }
        catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };
    const handleInputChange = (user, field, value) => {
        setInputs(prev => ({
            ...prev,
            [user]: {
                ...prev[user],
                [field]: value
            }
        }));
        setError(prev => ({ ...prev, [user]: '' }));
    };
    const handleSubmit = async (user) => {
        const newCompleted = parseInt(inputs[user].completed) || 0;
        const newCorrect = parseInt(inputs[user].correct) || 0;
        // Validation
        if (newCompleted === 0) {
            setError(prev => ({
                ...prev,
                [user]: "Please enter the number of completed questions"
            }));
            return;
        }
        if (newCorrect > newCompleted) {
            setError(prev => ({
                ...prev,
                [user]: "Correct answers can't exceed total questions"
            }));
            return;
        }
        if (newCompleted < 0 || newCorrect < 0) {
            setError(prev => ({
                ...prev,
                [user]: "Values cannot be negative"
            }));
            return;
        }
        const updatedStats = {
            ...stats,
            [user]: {
                ...stats[user],
                completed: mode[user] === 'edit' ? newCompleted : stats[user].completed + newCompleted,
                correct: mode[user] === 'edit' ? newCorrect : stats[user].correct + newCorrect,
            },
        };
        try {
            const { error: upsertError } = await supabase
                .from('qbank_stats')
                .upsert({
                id: 'main',
                stats: updatedStats,
                last_updated: new Date().toISOString(),
            });
            if (upsertError)
                throw upsertError;
            setStats(updatedStats);
            setInputs(prev => ({
                ...prev,
                [user]: { completed: '', correct: '' },
            }));
            setMode(prev => ({
                ...prev,
                [user]: 'view',
            }));
        }
        catch (error) {
            console.error('Failed to update stats:', error);
        }
    };
    return (_jsxs(Card, { className: "w-full max-w-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg", children: [_jsx(CardHeader, { className: "space-y-1", children: _jsx(CardTitle, { className: "text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "QBank Challenge" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx(StatsComparison, { stats: stats }), ['user1', 'user2'].map((user) => (_jsxs("div", { className: "space-y-3 p-4 rounded-lg bg-white shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "text-blue-500", size: 20 }), _jsx("span", { className: "font-medium", children: stats[user].name })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setMode(prev => ({
                                                    ...prev,
                                                    [user]: mode[user] === 'add' ? 'view' : 'add'
                                                })), children: [_jsx(Plus, { size: 16, className: "mr-1" }), "Add Progress"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                    if (mode[user] === 'edit') {
                                                        setMode(prev => ({ ...prev, [user]: 'view' }));
                                                        setInputs(prev => ({
                                                            ...prev,
                                                            [user]: { completed: '', correct: '' },
                                                        }));
                                                    }
                                                    else {
                                                        setMode(prev => ({ ...prev, [user]: 'edit' }));
                                                        setInputs(prev => ({
                                                            ...prev,
                                                            [user]: {
                                                                completed: stats[user].completed.toString(),
                                                                correct: stats[user].correct.toString(),
                                                            },
                                                        }));
                                                    }
                                                }, children: [_jsx(Edit2, { size: 16, className: "mr-1" }), "Edit Stats"] })] })] }), mode[user] !== 'view' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { type: "number", value: inputs[user].completed, onChange: (e) => handleInputChange(user, 'completed', e.target.value), placeholder: mode[user] === 'add' ? "Questions completed in this session" : "Total questions completed", className: "w-full" }), _jsx(Input, { type: "number", value: inputs[user].correct, onChange: (e) => handleInputChange(user, 'correct', e.target.value), placeholder: mode[user] === 'add' ? "Correct answers in this session" : "Total correct answers", className: "w-full" }), error[user] && (_jsx("div", { className: "text-red-500 text-sm", children: error[user] })), _jsx(Button, { onClick: () => handleSubmit(user), className: "w-full", children: mode[user] === 'add' ? 'Add Progress' : 'Update Stats' })] })), mode[user] === 'view' && (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { children: ["Total Questions: ", stats[user].completed] }), _jsxs("div", { children: ["Correct Answers: ", stats[user].correct] }), _jsxs("div", { className: "font-semibold text-lg", children: ["Accuracy: ", calculateAccuracy(stats[user].correct, stats[user].completed), "%"] })] }))] }, user)))] })] }));
};
export default QBankTracker;
