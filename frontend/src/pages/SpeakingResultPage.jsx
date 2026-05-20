import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Languages, Sparkles, MessageSquare, ArrowLeft, Trophy, Calendar, Eye, GraduationCap, Play } from 'lucide-react';
import ExamHeader from '../components/exam/ExamHeader';
import { GRAMMAR_MAPPING } from '../constants/grammarMapping';
import { useState, useEffect } from 'react';
import { useAvatar } from '../context/AvatarContext';

const SpeakingResultPage = () => {
    const { state } = useLocation();
    const { resultId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeAgent, englishTutor } = useAvatar();
    
    const [result, setResult] = useState(state?.result || null);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (!result && resultId && user) {
            const fetchResult = async () => {
                setIsFetching(true);
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/results/${resultId}?uid=${user.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResult(data);
                    } else {
                        console.error("[SpeakingResult] Failed to fetch historical result");
                        navigate('/dashboard');
                    }
                } catch (err) {
                    console.error("[SpeakingResult] Error fetching historical result:", err);
                    navigate('/dashboard');
                } finally {
                    setIsFetching(false);
                }
            };
            fetchResult();
        } else if (!result && !state?.loading && !resultId) {
            navigate('/dashboard');
        }
    }, [resultId, result, user, navigate, state]);

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

    if (isFetching || (!result && state?.loading)) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <h2 className="text-xl font-bold animate-pulse">Retrieving Your Speaking Performance...</h2>
            <p className="text-gray-400">Analyzing Pronunciation, Fluency & Communication Strategies</p>
        </div>
    );

    const scores = result.scores || {};
    const feedback = result.feedback || {};
    const model_response = result.model_response || '';
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
                onExit={() => navigate('/dashboard', { 
                    state: { 
                        mockCompleted: true, 
                        type: 'Speaking', 
                        level: getLevel(totalScore), 
                        score: `${totalScore}/28` 
                    } 
                })}
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
                        <div className="text-gray-500 font-mono mb-6">Total Validated Score: {totalScore} / 28</div>

                        {/* XP AWARDED & BREAKDOWN (New) */}
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-left space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">XP Awarded</span>
                                <span className="text-2xl font-black text-orange-500 flex items-center gap-1.5">
                                    <Trophy size={20} className="text-orange-400" />
                                    +{result.xp_awarded || 0}
                                </span>
                            </div>

                            {result.xp_breakdown && (
                                <div className="pt-3 border-t border-gray-700 space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold">
                                        <span className="text-gray-400 uppercase tracking-widest">Base Reward</span>
                                        <span className="text-gray-200">{result.xp_breakdown.base} XP</span>
                                    </div>
                                    {result.xp_breakdown.tierMultiplier > 1 && (
                                        <div className="flex justify-between text-[9px] font-bold">
                                            <span className="text-indigo-400 uppercase tracking-widest">Premium x{result.xp_breakdown.tierMultiplier}</span>
                                            <span className="text-indigo-300">+{Math.round(result.xp_breakdown.base * (result.xp_breakdown.tierMultiplier - 1))} XP</span>
                                        </div>
                                    )}
                                    {result.xp_breakdown.masteryMultiplier > 1 && (
                                        <div className="flex justify-between text-[9px] font-bold">
                                            <span className="text-emerald-400 uppercase tracking-widest">Mastery x{result.xp_breakdown.masteryMultiplier}</span>
                                            <span className="text-emerald-300">+{Math.round(result.xp_breakdown.base * (result.xp_breakdown.masteryMultiplier - 1))} XP</span>
                                        </div>
                                    )}
                                    {result.xp_breakdown.milestoneBonus > 0 && (
                                        <div className="flex justify-between text-[9px] font-bold">
                                            <span className="text-pink-400 uppercase tracking-widest">Milestone Bonus</span>
                                            <span className="text-pink-300">+{result.xp_breakdown.milestoneBonus} XP</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RADAR / DOMAIN SCORES */}
                    <div className="space-y-3">
                        {Object.entries(scores || {}).map(([key, val]) => (
                            key !== 'total' && typeof val === 'number' && (
                                <div key={key} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center transition-all hover:border-gray-600">
                                    <span className="flex items-center gap-3 font-bold text-gray-300 capitalize">
                                        <span className="opacity-50 text-indigo-400">•</span> {key.replace(/_/g, ' ')}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                                <div key={n} className={`h-1.5 w-3 rounded-full transition-all duration-500 ${n <= val ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-gray-700'}`}></div>
                                            ))}
                                        </div>
                                        <span className="font-mono font-bold text-indigo-400 w-8 text-right">{val}</span>
                                    </div>
                                </div>
                            )
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
                                    {(feedback.strengths || []).length > 0 ? (
                                        feedback.strengths.map((s, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-gray-300">
                                                <span className="text-green-500">✓</span> {s}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="flex gap-2 text-sm text-gray-400 italic">
                                            <span className="text-green-500">✓</span> Good effort demonstrated
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-orange-400 font-bold uppercase text-xs mb-3">🚀 Areas for Improvement</h4>
                                <ul className="space-y-2">
                                    {(feedback.weaknesses || []).length > 0 ? (
                                        feedback.weaknesses.map((w, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-gray-300">
                                                <span className="text-orange-500">⚠</span> {w}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="flex gap-2 text-sm text-gray-400 italic">
                                            <span className="text-orange-500">⚠</span> Keep practicing for improvement
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-900/20 p-4 rounded-xl border border-blue-800/50">
                            <h4 className="text-blue-400 font-bold text-sm mb-1">💡 Pro Tip</h4>
                            <p className="text-sm text-gray-300">{feedback.improvement_advice}</p>
                        </div>
                    </div>

                    {/* Miss Janie's Grammar Diagnostic Loop */}
                    {result.grammar_diagnostics && result.grammar_diagnostics.length > 0 && (
                        <div className="bg-amber-900/10 rounded-2xl p-6 border border-amber-500/30 relative overflow-hidden group">
                             <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
                             
                             <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                                    <GraduationCap size={24} className="text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-amber-200">
                                        {englishTutor?.name || activeAgent?.name || "Miss Janie"}'s Grammar Diagnostic
                                    </h3>
                                    <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={10} className="animate-pulse" />
                                        Targeted Micro-Labs to fix your mark-leaks
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                {result.grammar_diagnostics.slice(0, 2).map(tag => {
                                    const info = GRAMMAR_MAPPING[tag];
                                    if (!info) return null;
                                    return (
                                        <div 
                                            key={tag}
                                            onClick={() => navigate(`/lab?topic=${info.lab_id}&level=5`, { 
                                                state: { 
                                                    topic: info.lab_id,
                                                    isGrammarLab: true,
                                                    xp: 50
                                                } 
                                            })}
                                            className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 hover:border-amber-500/50 hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-between group/card"
                                        >
                                            <div className="flex flex-col flex-1 pr-4">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${info.track === 'Elite' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {info.track} Track
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-black text-gray-100 group-hover/card:text-amber-400 transition-colors">
                                                    {info.title}
                                                </h4>
                                                <p className="text-[10px] font-medium text-gray-400 mt-2 italic leading-relaxed line-clamp-2">
                                                    "{info.janie_message}"
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl group-hover/card:bg-amber-500 group-hover/card:text-white transition-all text-amber-500 flex items-center justify-center shrink-0">
                                                <Play size={16} fill="currentColor" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
