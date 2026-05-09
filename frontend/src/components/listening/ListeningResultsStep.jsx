import React, { useState, useRef, useEffect } from 'react';
import { 
    Layers, Zap, AlertCircle, MessageSquare, 
    ChevronRight, X, RefreshCw, Volume2, PlayCircle,
    CheckCircle, ListChecks, FileText, Layout,
    MinusCircle, PenTool, Award, Trophy, Home, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ListeningResultsStep = ({ results, audioSrc, mode, level, marginalXP, prevBestScore, onMoveToPartB }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('student'); // For Part B exemplars
    const [playingSegment, setPlayingSegment] = useState(null); // id of playing segment
    const [loadingSegment, setLoadingSegment] = useState(null); // id of loading segment
    const audioRef = useRef(null);
    
    // Ensure strictly at top when landing here (Results Page)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Map Score to DSE Level (Part A)
    // Map Score to DSE Level (Universal Standard)
    const getDSELevel = (score) => {
        if (score >= 90) return "5**";
        if (score >= 82) return "5*";
        if (score >= 75) return "5";
        if (score >= 65) return "4";
        if (score >= 50) return "3";
        if (score >= 40) return "2";
        return "1";
    };

    const isPartA = mode === 'A';
    const score = results?.score || 0;
    const earnedXP = Math.floor((score / 100) * (isPartA ? 25 : 50));
    
    // Level 4 Cap Logic for B1
    const isB1 = level === 'B1';
    
    // Define levels hierarchy for comparison
    const levelRank = { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "5*": 6, "5**": 7 };
    
    // Normalize rawLevel to ensure it's a DSE grade (not "B2")
    // Always use Score-to-Level mapping for consistency (avoiding LLM hallucinations)
    const dseGrade = getDSELevel(score);

    const isCapped = isB1 && levelRank[dseGrade] > 4;
    const dseLevel = isCapped ? "4" : dseGrade;

    const playReference = (text, id) => {
        if (!text) return;
        
        console.log(`[ResultsStep] Snippet playback requested for ID: ${id}`);
        
        // Stop any current playback
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setLoadingSegment(null);
        setPlayingSegment(id);

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 1.0;
            
            utterance.onend = () => {
                setPlayingSegment(null);
            };

            utterance.onerror = (e) => {
                console.error("Browser TTS Error:", e);
                setPlayingSegment(null);
            };

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error("[ResultsStep] Snippet Playback Error:", err);
            setPlayingSegment(null);
        }
    };

    const calculateDSELevel = (score) => {
        if (score >= 90) return "5**";
        if (score >= 82) return "5*";
        if (score >= 75) return "5";
        if (score >= 65) return "4";
        if (score >= 50) return "3";
        if (score >= 40) return "2";
        return "1";
    };

    const predictedLevel = calculateDSELevel(results?.score || 0);

    const getXPMessage = () => {
        if (marginalXP > 0) return `Personal best! +${marginalXP} XP added to your total.`;
        const currentScore = results?.score || 0;
        const nextTarget = currentScore >= 90 ? 100 : currentScore >= 82 ? 90 : currentScore >= 75 ? 82 : currentScore >= 65 ? 75 : 65;
        return `High score matched (${currentScore}%). Reach ${nextTarget}% for next XP reward.`;
    };

    // Derived Breakdown Data
    const breakdown = results?.breakdown || [];
    const contentPoints = results?.contentBreakdown || [];

    return (
        <div className="max-w-4xl mx-auto py-12 animate-in zoom-in-95 fade-in duration-700">
            {/* Achievement Hero Section */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] -mr-40 -mt-40 rounded-full"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 mb-4 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300 w-fit">
                           <Award size={12} /> Mission Performance Report
                        </div>
                        <h2 className="text-4xl font-black mb-1 tracking-tight">MISSION ACCOMPLISHED</h2>
                        <p className="text-slate-400 font-bold mb-6 italic text-sm">
                            {isPartA ? 'Part A: The Data Sprint' : 'Part B: Integrated Skills'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="text-green-500" size={18} />
                                <span className="text-xl font-black">{score}% <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1 font-black">Score</span></span>
                            </div>
                            <div className={`px-6 py-2 rounded-2xl shadow-lg flex items-center gap-2 ${marginalXP > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <Zap size={16} className={`fill-current ${marginalXP > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xl font-black">+{marginalXP} XP</span>
                                    {marginalXP === 0 ? (
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">Best: {prevBestScore}% matched</span>
                                            <span className="text-[9px] font-black text-amber-500/80 uppercase mt-0.5">Surpass {prevBestScore}% for next XP reward</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">New High Score!</span>
                                            <span className="text-[9px] font-black text-green-400 uppercase mt-0.5">Record Smashed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="w-40 h-40 rounded-full border-[8px] border-white/5 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[8px] border-indigo-500/30 border-t-indigo-500 animate-spin-slow"></div>
                            <span className="text-5xl font-black tracking-tighter">{dseLevel}</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] shadow-xl whitespace-nowrap">
                            Predicted Level
                        </div>
                    </div>
                </div>
            </div>

            {/* Critique & Actions Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-2 text-rose-500">
                        <MessageSquare size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chief Examiner critique</span>
                    </div>
                    <div className="relative w-full">
                        <span className="absolute -left-3 -top-3 text-slate-100 text-6xl font-black select-none opacity-50">"</span>
                        <p className="text-xl font-bold text-slate-800 leading-tight relative pt-2 pl-2">
                            {results?.feedback || "Outstanding capture of technical data. You demonstrate precise factual extraction expected at Level 5."}
                        </p>
                    </div>
                </div>
            </div>

            {/* DETAILED MISSION BREAKDOWN */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <Layout size={12} /> Detailed Mission Breakdown
                    </div>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {isPartA ? (
                    /* PART A BREAKDOWN: Row-by-Row Q&A Analysis */
                    <div className="grid gap-4">
                        {(breakdown || []).map((item, idx) => (
                            <div key={item.id || idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item {idx + 1}</span>
                                            {item.isCorrect ? (
                                                <span className="bg-green-100 text-green-700 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest">Correct Task</span>
                                            ) : (
                                                <span className="bg-rose-100 text-rose-700 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest">Inaccurate</span>
                                            )}
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-4">{item.label}</h4>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Your Entry</span>
                                                <p className={`font-bold text-sm ${item.isCorrect ? 'text-slate-700' : 'text-rose-600 line-through opacity-60'}`}>
                                                    {item.studentAnswer || "(Blank)"}
                                                </p>
                                            </div>
                                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Correct Answer</span>
                                                <p className="text-indigo-900 font-black text-sm">{item.correctAnswer}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rationale & Segment Player */}
                                    <div className="md:w-1/3 bg-orange-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg border border-orange-500/20">
                                        <div className="absolute top-0 right-0 p-2 opacity-15">
                                            <Volume2 size={42} />
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                           <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest">AI Rationale</span>
                                           <button 
                                                onClick={() => playReference(item.rationale || item.correctAnswer, item.id || idx)}
                                                disabled={loadingSegment !== null && loadingSegment !== (item.id || idx)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all 
                                                    ${playingSegment === (item.id || idx) ? 'bg-amber-400 text-amber-900 animate-pulse scale-105' : 
                                                      loadingSegment === (item.id || idx) ? 'bg-white text-indigo-600 animate-bounce' : 
                                                      'bg-white/20 hover:bg-white/30 text-white'}`}
                                           >
                                               {loadingSegment === (item.id || idx) ? <RefreshCw size={12} className="animate-spin" /> : 
                                                playingSegment === (item.id || idx) ? <RotateCcw size={12} /> : 
                                                <PlayCircle size={12} />}
                                               {loadingSegment === (item.id || idx) ? 'Loading...' : 'Play script'}
                                           </button>
                                        </div>
                                        <p className="text-[13px] font-bold text-white leading-relaxed italic border-l-2 border-white/40 pl-3">
                                            "{item.rationale || `The speaker stated '${item.correctAnswer}' clearly at ${Math.floor(item.startTime / 60)}:${(item.startTime % 60).toString().padStart(2, '0')}.`}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* PART B BREAKDOWN: Checklist & Exemplars */
                    <div className="space-y-12">
                        {/* 1. Content Points Checklist */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ListChecks size={20} className="text-indigo-600" /> Data Integration Checklist
                                </h4>
                                <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full italic">
                                    Integration Metric: {contentPoints.filter(p => p.met).length} / {contentPoints.length} Points
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(contentPoints || []).map((point, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${point.met ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100 grayscale-[0.6]'}`}>
                                        <div className={`p-2 rounded-xl mt-0.5 ${point.met ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            {point.met ? <CheckCircle size={14} /> : <MinusCircle size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-black mb-1 ${point.met ? 'text-green-900' : 'text-slate-500'}`}>{point.point}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-bold italic text-slate-400 uppercase">
                                                    Source: {point.documentSource || 'Official Data File'}
                                                </span>
                                                {point.documentSource?.toLowerCase().includes('audio') && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playReference(point.rationale || point.point, `pt-${idx}`);
                                                        }}
                                                        disabled={loadingSegment !== null && loadingSegment !== `pt-${idx}`}
                                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all 
                                                            ${playingSegment === `pt-${idx}` ? 'bg-amber-400 text-amber-900 scale-105' : 
                                                              loadingSegment === `pt-${idx}` ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 
                                                              'bg-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white'}`}
                                                    >
                                                        {loadingSegment === `pt-${idx}` ? <RefreshCw size={8} className="animate-spin" /> : 
                                                         playingSegment === `pt-${idx}` ? <RotateCcw size={8} /> : 
                                                         <Volume2 size={8} />}
                                                        {loadingSegment === `pt-${idx}` ? 'Loading' : playingSegment === `pt-${idx}` ? 'Playing' : 'Play Segment'}
                                                    </button>
                                                )}
                                            </div>
                                            {point.rationale && (
                                                <p className="mt-2 text-[10px] font-bold text-slate-400 leading-tight italic">
                                                    "{point.rationale}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Model Answer Showcase (Exemplars) */}
                        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            {/* Tab Header */}
                            <div className="bg-white border-b border-white/5 flex p-2 gap-2">
                                {[
                                    { id: 'student', label: 'Your Draft', icon: PenToolCustom },
                                    { id: 'grade5', label: 'Grade 5 Exemplar', icon: Award }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                                            ${activeTab === tab.id 
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-y-[-2px]' 
                                                : 'text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        <span className="opacity-60 hidden sm:inline">Compare</span> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Deck */}
                            <div className="p-10 min-h-[400px] max-h-[600px] overflow-y-auto selection:bg-indigo-500 selection:text-white">
                                <div className="max-w-prose mx-auto">
                                    <div className="prose prose-sm prose-invert max-w-none">
                                        <h3 className="text-amber-400 font-black uppercase text-xs mb-8 tracking-widest border-b border-white/10 pb-4">
                                            {activeTab === 'student' ? 'Mission Transcript: Student Submission' : 
                                             'HKEAA Benchmark: Level 5 High Standard'}
                                        </h3>
                                        
                                        <p className="text-slate-100 font-bold text-lg leading-[1.8] whitespace-pre-wrap">
                                            {activeTab === 'student' ? (results?.studentDraft || "No submission text found.") : 
                                             (results?.exemplar5 || "Model answer generating...")}
                                        </p>
                                    </div>
                                    
                                    {activeTab !== 'student' && (
                                        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                                            <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                            <div>
                                                <h5 className="text-[10px] font-black text-amber-500 uppercase mb-1">Study Advice</h5>
                                                <p className="text-xs font-bold text-slate-400">
                                                    Notice the seamless integration of Data File documents (dates, names) with the Audio specifics. Elite answers never treat document info as a simple list.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mission Actions Footer */}
            <div className="mt-16 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
                {isPartA && (
                    <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl px-6">
                        <button 
                            onClick={onMoveToPartB}
                            className="flex-1 min-w-[200px] bg-slate-900 text-white rounded-2xl py-5 px-8 font-black text-sm uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                            <Layers size={18} /> Proceed to Part B
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="text-sm font-black text-[#F1783B] uppercase tracking-widest hover:text-[#d96520] transition-colors flex items-center gap-2 underline-offset-4 hover:underline"
                    >
                        <Home size={16} className="text-[#F1783B]" strokeWidth={2.5} /> Back to Dashboard
                    </button>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" aria-hidden />
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="text-sm font-black text-slate-800 uppercase tracking-widest hover:text-indigo-700 transition-colors flex items-center gap-2 underline-offset-4 hover:underline"
                    >
                        <ChevronRight size={16} className="text-indigo-600" strokeWidth={2.5} /> Try next Quest
                    </button>
                </div>

                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 pointer-events-none mt-4">
                    End of Mission Report
                </div>
            </div>
        </div>
    );
};

const PenToolCustom = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} height={size} 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l5 5"/><path d="M11 11l5 5"/>
    </svg>
);

export default ListeningResultsStep;
