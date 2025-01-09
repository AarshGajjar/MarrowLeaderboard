import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
const QBankTracker = () => {
    const [stats, setStats] = useState({
        user1: { completed: 0, correct: 0, name: "bholipunjaban69" },
        user2: { completed: 0, correct: 0, name: "gorlin" }
    });
    const [inputs, setInputs] = useState({
        user1: { completed: '', correct: '' },
        user2: { completed: '', correct: '' }
    });
    const [isEditing, setIsEditing] = useState({
        user1: false,
        user2: false
    });
    const [error, setError] = useState({
        user1: '',
        user2: ''
    });
    const [syncStatus, setSyncStatus] = useState({
        isOnline: true,
        isSyncing: false,
        lastSynced: null,
        error: '',
    });
    // Merge local data with server data
    const mergeData = (localData, serverData) => {
        return {
            user1: {
                completed: localData.user1.completed + serverData.user1.completed,
                correct: localData.user1.correct + serverData.user1.correct,
                name: localData.user1.name,
            },
            user2: {
                completed: localData.user2.completed + serverData.user2.completed,
                correct: localData.user2.correct + serverData.user2.correct,
                name: localData.user2.name,
            }
        };
    };
    // Sync data with Supabase
    const syncData = async () => {
        if (!syncStatus.isOnline || syncStatus.isSyncing)
            return;
        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
        try {
            const { data: serverData, error: fetchError } = await supabase
                .from('qbank_stats')
                .select('*')
                .single();
            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }
            const dataToUpdate = serverData
                ? mergeData(stats, serverData.stats)
                : stats;
            const { error: upsertError } = await supabase
                .from('qbank_stats')
                .upsert({
                id: 'main',
                stats: dataToUpdate,
                last_updated: new Date().toISOString()
            });
            if (upsertError)
                throw upsertError;
            setStats(dataToUpdate);
            setSyncStatus(prev => ({
                ...prev,
                lastSynced: Date.now(),
                isSyncing: false,
            }));
        }
        catch (error) {
            console.error('Sync failed:', error);
            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                error: 'Sync failed. Will retry later.'
            }));
        }
    };
    useEffect(() => {
        const subscription = supabase
            .channel('qbank_stats_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'qbank_stats' }, (payload) => {
            const serverData = payload.new.stats;
            if (serverData) {
                setStats(prev => mergeData(prev, serverData));
            }
        })
            .subscribe();
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    // Handle the submit action
    const handleSubmit = (user) => {
        const newCompleted = parseInt(inputs[user].completed) || 0;
        const newCorrect = parseInt(inputs[user].correct) || 0;
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
        setError(prev => ({ ...prev, [user]: '' }));
        setStats(prev => ({
            ...prev,
            [user]: {
                ...prev[user],
                completed: isEditing[user] ? newCompleted : prev[user].completed + newCompleted,
                correct: isEditing[user] ? newCorrect : prev[user].correct + newCorrect
            }
        }));
        setInputs(prev => ({
            ...prev,
            [user]: { completed: '', correct: '' }
        }));
        setIsEditing(prev => ({
            ...prev,
            [user]: false
        }));
    };
    // Calculate accuracy
    const calculateAccuracy = (correct, completed) => {
        return completed > 0 ? Math.round((correct / completed) * 100) : 0;
    };
    // Get leader based on score
    const getLeader = () => {
        const getScore = (user) => {
            const accuracy = calculateAccuracy(stats[user].correct, stats[user].completed);
            const completionPoints = Math.min(stats[user].completed / 100, 1); // Cap at 100 questions
            return (accuracy * 0.7) + (completionPoints * 30); // 70% weight to accuracy, 30% to completion (max 30 points)
        };
        const user1Score = getScore('user1');
        const user2Score = getScore('user2');
        return user1Score >= user2Score ? "user1" : "user2";
    };
    // Comparison header component
    const ComparisonHeader = () => {
        const leader = getLeader();
        return (_jsx("div", { className: "flex justify-around items-center mb-6 p-4 bg-white rounded-lg shadow-sm", children: ['user1', 'user2'].map((user) => {
                const data = stats[user];
                const accuracy = calculateAccuracy(data.correct, data.completed);
                const isLeader = leader === user;
                return (_jsxs("div", { className: "text-center space-y-2", children: [_jsxs("div", { className: "relative pt-6", children: [isLeader && (_jsx(Crown, { className: "absolute -top-1 left-1/2 transform -translate-x-1/2 text-yellow-500", size: 24 })), _jsx("div", { className: "font-medium text-lg", children: data.name })] }), _jsxs("div", { className: "text-sm text-slate-600", children: [_jsxs("div", { className: "font-semibold text-lg", children: [accuracy, "%"] }), _jsxs("div", { children: ["Total Questions: ", data.completed] }), _jsxs("div", { className: "text-xs text-slate-500", children: [data.correct, " correct answers"] })] })] }, user));
            }) }));
    };
    return (_jsxs(Card, { className: "w-full max-w-md bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg", children: [_jsx(CardHeader, { className: "space-y-1", children: _jsx(CardTitle, { className: "text-2xl text-center font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "QBank Challenge" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx(ComparisonHeader, {}), ['user1', 'user2'].map((user) => {
                        const data = stats[user];
                        const accuracy = calculateAccuracy(data.correct, data.completed);
                        return (_jsxs("div", { className: "space-y-3 p-4 rounded-lg bg-white shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "text-blue-500", size: 20 }), _jsx("span", { className: "font-medium", children: data.name })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                setIsEditing(prev => ({
                                                    ...prev,
                                                    [user]: !prev[user]
                                                }));
                                                setInputs(prev => ({
                                                    ...prev,
                                                    [user]: { completed: '', correct: '' }
                                                }));
                                            }, children: isEditing[user] ? 'Cancel' : 'Edit' })] }), isEditing[user] ? (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { type: "number", value: inputs[user].completed, onChange: (e) => setInputs(prev => ({
                                                ...prev,
                                                [user]: { ...prev[user], completed: e.target.value }
                                            })), placeholder: "Completed" }), _jsx(Input, { type: "number", value: inputs[user].correct, onChange: (e) => setInputs(prev => ({
                                                ...prev,
                                                [user]: { ...prev[user], correct: e.target.value }
                                            })), placeholder: "Correct" }), error[user] && (_jsx("div", { className: "text-red-500 text-sm", children: error[user] })), _jsx(Button, { onClick: () => handleSubmit(user), children: "Save" })] })) : (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { children: ["Total Questions: ", data.completed] }), _jsxs("div", { children: ["Correct Answers: ", data.correct] }), _jsxs("div", { className: "font-semibold text-lg", children: ["Accuracy: ", accuracy, "%"] })] }))] }, user));
                    }), _jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: syncData, children: "Sync Data" })] })] }));
};
export default QBankTracker;
