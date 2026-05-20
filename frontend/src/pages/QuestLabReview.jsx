import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, XCircle, Info, ArrowLeft, 
    Trophy, Target, Calendar, MessageSquare, 
    Zap, Headphones, BookOpen, FileText, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingPage } from '../components/shared';

const QuestLabReview = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [result, setResult] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [showPassage, setShowPassage] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            if (!resultId || !user) return;
            setIsFetching(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/results/${resultId}?uid=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setResult(data);
                } else {
                    console.error("[QuestLabReview] Failed to fetch historical result");
                    navigate('/achievements');
                }
            } catch (err) {
                console.error("[QuestLabReview] Error fetching result:", err);
                navigate('/achievements');
            } finally {
                setIsFetching(false);
            }
        };
        fetchResult();
    }, [resultId, user, navigate]);

    if (isFetching) {
        return (
            <LoadingPage 
                title="Retrieving Mission Data..." 
                subtext="Syncing with historical records for detailed mission analysis."
            />
        );
    }

    if (!result) return null;

    const isListening = result.module?.toLowerCase() === 'listening';
    const hasPassage = Boolean(result.passage);
    const hasQuestions = Array.isArray(result.questions) && result.questions.length > 0;
    const Icon = isListening ? Headphones : BookOpen;
    const themeColor = isListening ? 'text-indigo-600' : 'text-emerald-600';
    const bgColor = isListening ? 'bg-indigo-50' : 'bg-emerald-50';


    const renderPassage = () => {
        if (!hasPassage) return null;
        return (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className={`w-5 h-5 ${themeColor}`} />
                        <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">Reading Passage</h4>
                    </div>
                    <button
                        onClick={() => setShowPassage(!showPassage)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        {showPassage ? 'Hide' : 'Show'}
                    </button>
                </div>
                {showPassage && (
                    <div className="prose prose-slate max-w-none">
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                            {result.passage}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderQuestionReview = () => {
        if (!hasQuestions) {
            // Fallback to old generic breakdown
            return renderLegacyBreakdown();
        }

        const content = result.content || {};
        
        return (
            <div className="space-y-6">
                {result.questions.map((q, idx) => {
                    const resultData = content[q.id] || {};
                    const isCorrect = typeof resultData === 'boolean' ? resultData : resultData?.correct;
                    const feedbackText = typeof resultData === 'string' ? resultData : (resultData?.feedback || "");
                    const isMCQ = q.type === 'mcq' || (q.options && Array.isArray(q.options) && q.options.length > 0);
                    
                    return (
                        <div key={q.id} className={`bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md ${
                            isCorrect ? 'border-green-200' : 'border-red-200'
                        }`}>
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                        isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                        {isMCQ ? 'Multiple Choice' : 'Open-ended'}
                                    </span>
                                </div>
                                {isCorrect ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <CheckCircle2 size={12} /> Correct
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <XCircle size={12} /> Mistake
                                    </span>
                                )}
                            </div>
                            
                            {/* Question Text */}
                            <div className="mb-4">
                                <p className="text-slate-800 font-medium leading-relaxed">{q.question}</p>
                            </div>
                            
                            {/* Options for MCQ */}
                            {isMCQ && q.options && (
                                <div className="space-y-2 mb-4">
                                    {q.options.map((opt, optIdx) => {
                                        const optLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
                                        const isUserChoice = q.userAnswer === optLabel;
                                        const isCorrectOption = q.correctAnswer === optLabel;
                                        
                                        let optionClass = "flex items-center gap-3 p-3 rounded-xl border text-sm ";
                                        if (isCorrectOption) {
                                            optionClass += "bg-green-50 border-green-300 text-green-800";
                                        } else if (isUserChoice && !isCorrectOption) {
                                            optionClass += "bg-red-50 border-red-300 text-red-800";
                                        } else {
                                            optionClass += "bg-slate-50 border-slate-200 text-slate-600";
                                        }
                                        
                                        return (
                                            <div key={optIdx} className={optionClass}>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                                    isCorrectOption ? 'bg-green-500 text-white' :
                                                    isUserChoice ? 'bg-red-500 text-white' :
                                                    'bg-slate-200 text-slate-500'
                                                }`}>
                                                    {optLabel}
                                                </span>
                                                <span>{opt}</span>
                                                {isUserChoice && (
                                                    <span className="ml-auto text-[10px] font-black uppercase tracking-wider">
                                                        {isCorrectOption ? 'Your Answer ✓' : 'Your Answer ✗'}
                                                    </span>
                                                )}
                                                {isCorrectOption && !isUserChoice && (
                                                    <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-green-600">
                                                        Correct Answer
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Open-ended answer display */}
                            {!isMCQ && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className={`p-4 rounded-xl border ${
                                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                    }`}>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Your Answer</p>
                                        <p className={`text-sm font-medium ${
                                            isCorrect ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {q.userAnswer || "(No answer provided)"}
                                        </p>
                                    </div>
                                    {q.correctAnswer && (
                                        <div className="p-4 rounded-xl border bg-green-50 border-green-200">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-green-600 mb-2">Correct Answer</p>
                                            <p className="text-sm font-medium text-green-800">{q.correctAnswer}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Feedback */}
                            {feedbackText && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">AI Examiner Feedback</p>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">{feedbackText}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderLegacyBreakdown = () => {
        const content = result.content || {};
        const entries = Object.entries(content);
        
        if (entries.length === 0) {
            return (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No detailed breakdown available for this quest.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-4">
                {entries.map(([id, data], idx) => {
                    const isCorrect = typeof data === 'boolean' ? data : data?.correct;
                    const feedbackText = typeof data === 'string' ? data : (data?.feedback || "Standard assessment completed.");
                    return (
                        <div key={id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                        isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <h4 className="font-bold text-slate-800">Task Performance</h4>
                                </div>
                                {isCorrect ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <CheckCircle2 size={12} /> Correct
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <XCircle size={12} /> Mistake
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                "{feedbackText}"
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans selection:bg-indigo-100 pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 flex items-center justify-between z-50 sticky top-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/achievements')}
                        className="p-3 hover:bg-slate-100 bg-white border border-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-0.5">
                            <h1 className="font-extrabold text-slate-900 tracking-tight text-xl">{result.questName || 'Quest Review'}</h1>
                            <span className={`px-2.5 py-1 ${bgColor} ${themeColor} rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-sm`}>
                                {result.module}
                            </span>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-3">
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(result.timestamp).toLocaleDateString()}</span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1.5 text-orange-500"><Zap size={12} /> {result.xpAwarded} XP Earned</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Status</div>
                        <div className="text-xs font-bold text-slate-900">Completed Successfully</div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                        {result.score}%
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-8 py-12">
                {/* Score Spotlight */}
                <div className="text-center mb-16 animate-in zoom-in-95 duration-500">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-200 mb-6">
                        <Trophy className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 mb-2">{result.score}%</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Quest Mastered</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Feedback Card */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${isListening ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className={`w-4 h-4 ${themeColor}`} />
                                <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">AI Examiner Summary</h4>
                            </div>
                            <p className="text-lg text-slate-800 font-medium italic leading-relaxed">
                                "{result.feedback?.summary || 'Excellent effort on this mission. You have demonstrated a strong understanding of the core concepts.'}"
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-4 h-4 text-orange-400" />
                                <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">Reflective Analysis</h4>
                            </div>
                            <p className="text-slate-300 leading-relaxed font-light">
                                Your performance in this {result.module} quest indicates high engagement with the material. Review the breakdown below to pinpoint specific areas where your precision can be enhanced further.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-50 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                <Zap size={24} />
                            </div>
                            <div className="text-2xl font-black text-slate-900">+{result.xpAwarded}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">XP Awarded</div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-50 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-2xl ${bgColor} ${themeColor} flex items-center justify-center mb-4`}>
                                <Icon size={24} />
                            </div>
                            <div className="text-2xl font-black text-slate-900">{result.module}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Mode</div>
                        </div>
                    </div>
                </div>

                {/* Passage Section (for Reading quests) */}
                {renderPassage()}

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-[#FDFDFF] px-4 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                            {hasQuestions ? 'Question Review' : 'Performance Breakdown'}
                        </span>
                    </div>
                </div>

                {renderQuestionReview()}
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50">
                <div className="max-w-4xl mx-auto flex gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestLabReview;
