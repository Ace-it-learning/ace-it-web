import React from 'react';
import { ArrowRight, CheckCircle, AlertCircle, RefreshCcw, Star } from 'lucide-react';
import NextPathRecommendations from './NextPathRecommendations';

const WritingReview = ({ submission, feedback, onTryAgain, onNext, topic, level, lessonMode }) => {
    // feedback schema: { score_estimated, critique_points[], polished_text, key_changes[], general_comment }

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header / Score Card */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
                    <Star size={16} className="fill-yellow-600 text-yellow-600" />
                    Estimated Level: {feedback.score_estimated}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                    Writing Polish Report
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                    {feedback.general_comment}
                </p>
            </div>

            {/* Main Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                {/* Left: Original */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Draft</span>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-full min-h-[400px]">
                        <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-600 font-serif">
                            {submission}
                        </p>
                    </div>
                </div>

                {/* Right: Polished */}
                <div className="space-y-4 relative group">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                            <RefreshCcw size={12} className="animate-spin-slow" />
                            Level 5* Rewrite
                        </span>
                    </div>
                    <div className="absolute inset-x-0 top-10 bottom-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-[2rem] -z-10 blur-xl transition-opacity opacity-70 group-hover:opacity-100" />
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100 border-2 border-indigo-100 h-full min-h-[400px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Star size={120} className="fill-black" />
                        </div>
                        <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-900 font-serif relative z-10">
                            {feedback.polished_text}
                        </p>
                    </div>
                </div>
            </div>

            {/* Critique & Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Critique Points */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <AlertCircle className="text-indigo-600" />
                        Examiner's Critique
                    </h3>
                    <ul className="space-y-4">
                        {feedback.critique_points.map((point, idx) => (
                            <li key={idx} className="flex gap-3 text-gray-600 leading-snug">
                                <span className="flex-none size-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mt-0.5">
                                    {idx + 1}
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Key Changes (Diffs) */}
                <div className="lg:col-span-2 bg-gray-50 rounded-[2rem] p-8 border border-gray-200">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <CheckCircle className="text-green-600" />
                        Why It's Better (Key Changes)
                    </h3>
                    <div className="space-y-4">
                        {feedback.key_changes.map((change, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded line-through decoration-red-300 decoration-2">
                                            {change.original}
                                        </span>
                                        <ArrowRight size={14} className="text-gray-300" />
                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold border border-green-100">
                                            {change.improved}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 italic">
                                        "{change.reason}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Next Path Recommendations */}
            <NextPathRecommendations
                level={level}
                topic={topic}
                lessonMode={lessonMode}
                onRetry={onTryAgain}
                onExit={onNext}
            />
        </div>
    );
};

export default WritingReview;
