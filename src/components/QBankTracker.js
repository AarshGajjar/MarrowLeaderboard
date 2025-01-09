import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Target } from 'lucide-react';
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
    const calculateAccuracy = (correct, completed) => {
        return completed > 0 ? Math.round((correct / completed) * 100) : 0;
    };
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
                                                    [user]: isEditing[user] ?
                                                        { completed: '', correct: '' } :
                                                        { completed: data.completed.toString(), correct: data.correct.toString() }
                                                }));
                                                setError(prev => ({ ...prev, [user]: '' }));
                                            }, children: isEditing[user] ? "Cancel" : "Edit" })] }), _jsx("div", { className: "space-y-1", children: _jsx("div", { className: "text-sm text-slate-600", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-semibold text-lg", children: [accuracy, "%"] }), _jsxs("span", { className: "text-slate-400 text-xs", children: ["(", data.correct, "/", data.completed, ")"] })] }) }) }), error[user] && (_jsx("div", { className: "p-3 text-sm text-red-500 bg-red-50 rounded-md", children: error[user] })), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Input, { type: "number", placeholder: isEditing[user] ? "Total Questions" : "Questions Done", value: inputs[user].completed, onChange: (e) => setInputs(prev => ({
                                                ...prev,
                                                [user]: { ...prev[user], completed: e.target.value }
                                            })), min: "0", className: "bg-slate-50" }), _jsx(Input, { type: "number", placeholder: isEditing[user] ? "Total Correct" : "Correct Answers", value: inputs[user].correct, onChange: (e) => setInputs(prev => ({
                                                ...prev,
                                                [user]: { ...prev[user], correct: e.target.value }
                                            })), min: "0", className: "bg-slate-50" })] }), _jsx(Button, { onClick: () => handleSubmit(user), className: "w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-colors", children: isEditing[user] ? "Save Changes" : "Add Progress" })] }, user));
                    })] })] }));
};
export default QBankTracker;
