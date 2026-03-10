import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DiagnosticAnalysis = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('writing'); // Default to writing as it has cool rewrites

    if (!state || !state.results) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl mb-4">No analysis data found.</h2>
                    <button onClick={() => navigate('/diagnostic')} className="bg-blue-600 px-6 py-2 rounded-full">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { results, paperId } = state;

    const tabs = [
        { id: 'reading', label: 'Reading', icon: '📖' },
        { id: 'writing', label: 'Writing', icon: '✍️' },
        { id: 'listening', label: 'Listening', icon: '🎧' },
        { id: 'speaking', label: 'Speaking', icon: '🗣️' }
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500 selection:text-white">
            {/* Header */}
            <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/diagnostic')}
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Deep Dive Analysis
                        </h1>
                        <p className="text-gray-400 text-xs">Paper Set {paperId || 'A'} • Weekly Calibration</p>
                    </div>
                </div>
                <div className="flex gap-2 bg-gray-900 p-1 rounded-full border border-gray-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-6 mt-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'writing' && <WritingAnalysis result={results.writing} />}
                        {activeTab === 'speaking' && <SpeakingAnalysis result={results.speaking} />}
                        {activeTab === 'reading' && <ReadingAnalysis result={results.reading} />}
                        {activeTab === 'listening' && <ListeningAnalysis result={results.listening} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

// --- Sub-Components ---

const WritingAnalysis = ({ result }) => {
    if (!result) return <EmptyState type="writing" />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Metrics Column */}
            <div className="space-y-6">
                <MetricCard
                    label="DSE Grade Estimate"
                    value={result.grade_label || result.level_estimate || '?'}
                    color={result.level_estimate >= 5 ? 'purple' : 'blue'}
                />

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        💡 Examiner's Feedback
                    </h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{result.feedback}</p>
                </div>

                {result.improvement_tips && (
                    <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-800/50">
                        <h3 className="text-lg font-bold mb-4 text-blue-400 flex items-center gap-2">
                            🚀 Key Action Items
                        </h3>
                        <ul className="space-y-3">
                            {result.improvement_tips.map((tip, i) => (
                                <li key={i} className="flex gap-3 text-gray-300">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Comparison Column */}
            <div className="space-y-6">
                <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                    <div className="bg-gray-800/50 p-4 border-b border-gray-700 font-bold text-gray-400 flex justify-between">
                        <span>Your Submission</span>
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">Original</span>
                    </div>
                    <div className="p-6 text-gray-300 leading-relaxed font-serif bg-black/20">
                        {result.text || "No text available."}
                    </div>
                </div>

                {result.model_rewrite && (
                    <div className="bg-purple-900/10 rounded-2xl overflow-hidden border border-purple-500/30">
                        <div className="bg-purple-900/20 p-4 border-b border-purple-500/20 font-bold text-purple-300 flex justify-between items-center">
                            <span>Level 5** Model Rewrite</span>
                            <span className="text-xs px-2 py-1 bg-purple-500/20 rounded text-purple-300">AI Improved</span>
                        </div>
                        <div className="p-6 text-gray-200 leading-relaxed font-serif relative">
                            {/* Decorative quote icon */}
                            <span className="absolute top-4 left-4 text-6xl text-purple-500/10 font-serif leading-none">“</span>
                            {result.model_rewrite}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SpeakingAnalysis = ({ result }) => {
    if (!result) return <EmptyState type="speaking" />;

    const analysis = result.analysis || {};

    return (
        <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Grade" value={result.grade_label || result.level_estimate || '?'} color="purple" />
                <MetricCard label="Score" value={result.score || 0} color="green" />
                <MetricCard label="Fluency" value={analysis.pronunciation_accent ? 'Analyzed' : 'N/A'} color="blue" />
                <MetricCard label="Structure" value={analysis.structure_content ? 'Analyzed' : 'N/A'} color="orange" />
            </div>

            {/* Detailed Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalysisCard title="🗣️ Pronunciation & Accent" content={analysis.pronunciation_accent} color="blue" />
                <AnalysisCard title="📚 Vocabulary & Usage" content={analysis.vocabulary_usage} color="green" />
                <AnalysisCard title="🏗️ Content Structure" content={analysis.structure_content} color="orange" />
            </div>

            {/* Transcript Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h3 className="tex-sm font-bold text-gray-400 uppercase tracking-wider mb-4">You Said</h3>
                    <p className="text-gray-300 leading-relaxed">{result.transcript || "(No transcript)"}</p>
                </div>

                {result.improved_transcript && (
                    <div className="bg-purple-900/10 rounded-2xl p-6 border border-purple-500/30">
                        <h3 className="tex-sm font-bold text-purple-400 uppercase tracking-wider mb-4">Level 5** Native Version</h3>
                        <p className="text-gray-200 leading-relaxed">{result.improved_transcript}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReadingAnalysis = ({ result }) => {
    if (!result) return <EmptyState type="reading" />;
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    {result.score}/100
                </h2>
                <p className="text-gray-400 text-lg mb-6">Estimated DSE Level: <span className="text-white font-bold">{result.grade_label || result.level_estimate}</span></p>
                <div className="text-gray-300 text-left bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Executive Summary</h3>
                    <p className="leading-relaxed">{result.feedback}</p>
                </div>
            </div>

            {result.question_breakdown && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 px-2">
                        <span>📊</span> Question Breakdown
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {result.question_breakdown.map((item, idx) => (
                            <div key={idx} className="bg-gray-900/40 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-xs font-mono px-2 py-0.5 bg-gray-800 rounded text-gray-400">Q{idx + 1}</span>
                                        <h4 className="font-medium text-gray-200">{item.question}</h4>
                                    </div>
                                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${item.status === 'correct' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        item.status === 'partial' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 text-[10px] uppercase font-bold">Your Answer</p>
                                        <p className={`${item.status === 'correct' ? 'text-green-200' : 'text-gray-300'}`}>{item.student_answer || "(No answer)"}</p>
                                    </div>
                                    {item.status !== 'correct' && (
                                        <div className="space-y-1">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">Suggested Answer</p>
                                            <p className="text-blue-300">{item.correct_answer}</p>
                                        </div>
                                    )}
                                </div>
                                {item.feedback && (
                                    <div className="mt-4 pt-4 border-t border-gray-800/50 text-sm text-gray-400 italic">
                                        {item.feedback}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ListeningAnalysis = ({ result }) => {
    if (!result) return <EmptyState type="listening" />;
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-center">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent mb-2">
                    {result.score}/100
                </h2>
                <p className="text-gray-400 text-lg mb-6">Estimated DSE Level: <span className="text-white font-bold">{result.grade_label || result.level_estimate}</span></p>
                <div className="text-gray-300 text-left bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Executive Summary</h3>
                    <p className="leading-relaxed">{result.feedback}</p>
                </div>
            </div>

            {result.question_breakdown && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 px-2">
                        <span>🎧</span> Question Breakdown
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {result.question_breakdown.map((item, idx) => (
                            <div key={idx} className="bg-gray-900/40 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-xs font-mono px-2 py-0.5 bg-gray-800 rounded text-gray-400">Q{idx + 1}</span>
                                        <h4 className="font-medium text-gray-200">{item.question}</h4>
                                    </div>
                                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${item.status === 'correct' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        item.status === 'partial' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 text-[10px] uppercase font-bold">Your Answer</p>
                                        <p className={`${item.status === 'correct' ? 'text-green-200' : 'text-gray-300'}`}>{item.student_answer || "(No answer)"}</p>
                                    </div>
                                    {item.status !== 'correct' && (
                                        <div className="space-y-1">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">Suggested Answer</p>
                                            <p className="text-blue-300">{item.correct_answer}</p>
                                        </div>
                                    )}
                                </div>
                                {item.feedback && (
                                    <div className="mt-4 pt-4 border-t border-gray-800/50 text-sm text-gray-400 italic">
                                        {item.feedback}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helpers ---

const MetricCard = ({ label, value, color }) => {
    const colorClasses = {
        purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        green: "bg-green-500/20 text-green-400 border-green-500/30",
        orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return (
        <div className={`p-4 rounded-2xl border ${colorClasses[color] || colorClasses.blue} flex flex-col items-center justify-center text-center`}>
            <span className="text-xs uppercase font-bold opacity-70 mb-1">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
        </div>
    );
}

const AnalysisCard = ({ title, content, color }) => {
    const borderColors = {
        blue: "border-blue-500/30 bg-blue-900/10",
        green: "border-green-500/30 bg-green-900/10",
        orange: "border-orange-500/30 bg-orange-900/10",
    };
    return (
        <div className={`p-6 rounded-2xl border ${borderColors[color] || borderColors.blue}`}>
            <h4 className="font-bold text-gray-200 mb-3">{title}</h4>
            <div className="text-sm text-gray-400 leading-relaxed">
                {content || "No detailed analysis available."}
            </div>
        </div>
    );
}

const EmptyState = ({ type }) => (
    <div className="text-center py-20 text-gray-500 animate-pulse">
        No {type} data recorded.
    </div>
);

export default DiagnosticAnalysis;
