import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExamHeader from '../components/exam/ExamHeader';

const SpeakingResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (state?.result) {
            setResult(state.result);
        } else if (state?.loading) {
            // Should be handled by loading state in UI if stuck, 
            // but normally we navigate here only when result is ready or loading=true 
            // If just loading=true and no result comes (e.g. reload), we might be stuck.
            // For now, redirect home if no state at all.
        } else {
            navigate('/dashboard');
        }
    }, [state]);

    if (state?.error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-6 p-6 text-center">
            <div className="size-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center border-2 border-red-500/50">
                <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold">Grading could not complete</h2>
            <div className="max-w-md bg-gray-800 p-4 rounded-xl border border-gray-700 text-gray-300 font-mono text-sm leading-relaxed">
                {state.error}
            </div>
            <p className="text-gray-400">Please try taking the exam again later.</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
            >
                Return to Dashboard
            </button>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <h2 className="text-xl font-bold animate-pulse">Calculating Your Speaking Score...</h2>
            <p className="text-gray-400">Analyzing Pronunciation, Fluency & Communication Strategies</p>
            <p className="text-xs text-gray-500 mt-4 opacity-50">This may take up to 60 seconds.</p>
        </div>
    );

    const { scores, feedback, model_response } = result;
    const totalScore = scores.total || 0;

    // Calculate Level (Max 28)
    // 28=5**, 24-27=5*, 21-23=5, 18-20=4, 14-17=3...
    const getLevel = (s) => {
        if (s >= 26) return "5**";
        if (s >= 23) return "5*";
        if (s >= 20) return "5";
        if (s >= 16) return "4";
        if (s >= 12) return "3";
        if (s >= 8) return "2";
        return "1";
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <ExamHeader
                title="Speaking Assessment Report"
                timeLeft={0}
                onExit={() => navigate('/', { state: { examCompleted: true, examId: state?.examId || 'speaking_mock' } })}
            />

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: SCORES (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* OVERALL */}
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Predicted Grade</h3>
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-600 mb-2">
                            {getLevel(totalScore)}
                        </div>
                        <div className="text-gray-500 font-mono">Total Validated Score: {totalScore} / 28</div>
                    </div>

                    {/* RADAR / DOMAIN SCORES */}
                    <div className="space-y-3">
                        {[
                            { label: "Pronunciation", score: scores.pronunciation, icon: "🎤" },
                            { label: "Communication Strategies", score: scores.communication, icon: "🤝" },
                            { label: "Vocabulary", score: scores.vocabulary, icon: "📖" },
                            { label: "Ideas & Organisation", score: scores.ideas, icon: "💡" }
                        ].map(item => (
                            <div key={item.label} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <span className="flex items-center gap-3 font-bold text-gray-300">
                                    <span>{item.icon}</span> {item.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                            <div key={n} className={`h-1.5 w-3 rounded-full ${n <= item.score ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                        ))}
                                    </div>
                                    <span className="font-mono font-bold text-green-400 w-8 text-right">{item.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: FEEDBACK & TRANSCRIPT (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* FEEDBACK */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="font-bold text-xl mb-4 text-white flex items-center gap-2">🤖 AI Examiner's Feedback</h3>
                        <p className="text-gray-300 italic mb-6 border-l-4 border-green-500 pl-4 py-2 bg-gray-700/30 rounded-r">
                            "{feedback.summary}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-green-400 font-bold uppercase text-xs mb-3">✅ Strengths</h4>
                                <ul className="space-y-2">
                                    {feedback.strengths.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                                            <span className="text-green-500">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-orange-400 font-bold uppercase text-xs mb-3">🚀 Areas for Improvement</h4>
                                <ul className="space-y-2">
                                    {feedback.weaknesses.map((w, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                                            <span className="text-orange-500">⚠</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-900/20 p-4 rounded-xl border border-blue-800/50">
                            <h4 className="text-blue-400 font-bold text-sm mb-1">💡 Pro Tip</h4>
                            <p className="text-sm text-gray-300">{feedback.improvement_advice}</p>
                        </div>
                    </div>

                    {/* MODEL RESPONSE */}
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        <div className="p-4 bg-gray-700 border-b border-gray-600 font-bold text-gray-200">
                            🏆 Level 5** Model Contribution
                        </div>
                        <div className="p-6 text-gray-300 leading-relaxed font-serif whitespace-pre-wrap">
                            {model_response}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default SpeakingResultPage;
