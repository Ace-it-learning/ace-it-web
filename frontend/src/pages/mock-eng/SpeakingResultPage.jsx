import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, ArrowLeft, Star, BarChart3, 
    BookOpen, Sparkles, MessageSquare, 
    ChevronRight, Target, Info, Zap, 
    CheckCircle2, AlertCircle, X, Layers, GraduationCap, Play,
    Mic, MessageCircle, ClipboardList, PenTool, Layout, ShieldCheck, Users, Clock
} from 'lucide-react';
import { useAvatar } from '../../context/AvatarContext';

const SpeakingResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { examId } = useParams();
    
    const [results, setResults] = useState(state?.result || null);
    const [mockData, setMockData] = useState(state?.mockData || null);
    const [isFetching, setIsFetching] = useState(false);
    const [activePart, setActivePart] = useState('A'); // 'A' (Discussion) or 'B' (Individual)
    const { getAgentIdentity } = useAvatar();
    const englishTutor = getAgentIdentity('english');

    useEffect(() => {
        if (!results && examId) {
            fetchResult();
        }
    }, [examId]);

    const fetchResult = async () => {
        if (isFetching) return;
        setIsFetching(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/results/${examId}?uid=${localStorage.getItem('uid')}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
                // Try to find mock data too
                if (!mockData) {
                    const mockRes = await fetch(`${API_URL}/api/english/mock/${data.paperId}`);
                    if (mockRes.ok) setMockData(await mockRes.json());
                }
            }
        } catch (e) {
            console.error("Failed to fetch result:", e);
        } finally {
            setIsFetching(false);
        }
    };

    const getLevelColor = (lvl) => {
        if (lvl?.includes('5**')) return 'bg-rose-600';
        if (lvl?.includes('5*')) return 'bg-rose-500';
        if (lvl?.includes('5')) return 'bg-indigo-600';
        if (lvl?.includes('4')) return 'bg-emerald-600';
        if (lvl?.includes('3')) return 'bg-amber-500';
        return 'bg-slate-600';
    };

    if (!results || (!mockData && !isFetching)) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Generating Speaking Report...</p>
                </div>
            </div>
        );
    }

    const assessment = results.results || {};
    const { domains = {}, overall_level = "U", total_score = 0, trigger_analysis = {}, miss_janie_verdict = {}, part_a_highlights = [], part_b_analysis = {} } = assessment;

    const domainScores = [
        { key: 'pronunciation_delivery', label: 'Pronunciation & Delivery', icon: Mic, color: 'bg-indigo-500', score: domains.pronunciation_delivery?.score || 0, feedback: domains.pronunciation_delivery?.feedback },
        { key: 'communication_strategies', label: 'Communication Strategies', icon: Users, color: 'bg-rose-500', score: domains.communication_strategies?.score || 0, feedback: domains.communication_strategies?.feedback },
        { key: 'vocabulary_language', label: 'Vocabulary & Language', icon: BookOpen, color: 'bg-emerald-500', score: domains.vocabulary_language?.score || 0, feedback: domains.vocabulary_language?.feedback },
        { key: 'ideas_organisation', label: 'Ideas & Organization', icon: Layout, color: 'bg-amber-500', score: domains.ideas_organisation?.score || 0, feedback: domains.ideas_organisation?.feedback }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-50 sticky top-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/mock-exam-eng')}
                        className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h1 className="font-black text-slate-900 tracking-tight text-lg">Speaking Assessment Report</h1>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-black uppercase tracking-widest">
                                Mission Completed
                            </span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                             <Mic size={10} className="text-emerald-500" /> {mockData?.title || 'Paper 4 Mock'}
                             <span className="text-slate-200">|</span>
                             <span className="flex items-center gap-1 text-slate-500 uppercase">
                                 HKEAA Standard Grading
                             </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
                {/* Hero Section: Level & Domain Mastery */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Level Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Predicted DSE Level</h3>
                        <div className="relative">
                            <motion.div 
                                initial={{ scale: 0.5, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className={`text-9xl font-black italic tracking-tighter ${overall_level?.includes('5') ? 'text-rose-600' : 'text-emerald-600'}`}
                            >
                                {overall_level}
                            </motion.div>
                            {overall_level?.includes('5') && (
                                <div className="absolute -top-4 -right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                    <Sparkles size={20} fill="currentColor" />
                                </div>
                            )}
                        </div>
                        <div className="mt-8 space-y-1">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Mark</p>
                            <p className="text-2xl font-black text-slate-900">{total_score} / 28</p>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-slate-100 w-full">
                            <div className="flex items-center justify-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">XP Gained</p>
                                    <p className="text-xl font-black text-emerald-600">+{results.xpAwarded || 0}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mastery Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Domain Performance</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <Info size={12} />
                                <span>HKDSE 0-7 Point Scale per Domain</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {domainScores.map((domain, idx) => (
                                <div key={domain.key} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${domain.color} text-white`}>
                                                <domain.icon size={14} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{domain.label}</p>
                                                <p className="text-lg font-black text-slate-900">{domain.score} <span className="text-xs text-slate-300 font-bold">/ 7</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(domain.score / 7) * 100}%` }}
                                            transition={{ delay: 0.3 + (idx * 0.1) }}
                                            className={`h-full ${domain.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between">
                            <div className="flex flex-wrap gap-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold ${trigger_analysis.transition_phrases ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    <CheckCircle2 size={12} /> Linker Phrases
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold ${trigger_analysis.counter_arguments ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    <ShieldCheck size={12} /> Counter-Arguments
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold ${trigger_analysis.individual_response_length >= 45 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    <Clock size={12} /> IR Pacing
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                                <p className="text-2xl font-black text-slate-900">{total_score} / 28</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Miss Janie's Verdict */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl"
                >
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                        <div className="shrink-0 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 bg-emerald-600 rounded-3xl border-4 border-white/10 flex items-center justify-center overflow-hidden">
                                <img src="/avatars/Miss_Janie.jpg" alt="Miss Janie" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Examiner</p>
                                <p className="text-lg font-black tracking-tight">Miss Janie</p>
                            </div>
                        </div>
                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Overall Verdict</h3>
                                <p className="text-2xl font-medium leading-relaxed italic opacity-95">
                                    "{miss_janie_verdict.summary || "Your interaction was constructive. Focus on more sophisticated transitions to reach Level 5**."}"
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                                <div>
                                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Key Strengths</h5>
                                    <ul className="space-y-3">
                                        {(miss_janie_verdict.pros || []).map((pro, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                                <div className="size-5 bg-emerald-500/20 text-emerald-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 size={12} />
                                                </div>
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Target for Improvement</h5>
                                    <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                                        {miss_janie_verdict.advice}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Detail Toggle */}
                <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-24 z-40">
                    <button 
                        onClick={() => setActivePart('A')}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activePart === 'A' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Users size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Part A: Group Interaction</span>
                    </button>
                    <button 
                        onClick={() => setActivePart('B')}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activePart === 'B' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <MessageCircle size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Part B: Individual Response</span>
                    </button>
                </div>

                {/* Detailed Analysis Content */}
                <div className="min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activePart === 'A' ? (
                            <motion.div 
                                key="part-a"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                                    <div className="bg-slate-900 px-10 py-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-white">A</div>
                                            <h4 className="font-black text-white uppercase tracking-widest text-sm">Interaction Highlights</h4>
                                        </div>
                                    </div>
                                    <div className="p-10 space-y-8">
                                        {(part_a_highlights || []).map((highlight, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row gap-8 pb-8 border-b border-slate-100 last:border-0">
                                                <div className="md:w-1/2 space-y-3">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <QuoteIcon className="size-3" /> Turn Record
                                                    </div>
                                                    <p className="text-base font-medium text-slate-800 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                                                        "{highlight.turn}"
                                                    </p>
                                                </div>
                                                <div className="md:w-1/2 space-y-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                        <Info size={12} /> Examiner Critique
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900 leading-relaxed">{highlight.critique}</p>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                                                        {highlight.impact}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {part_a_highlights.length === 0 && (
                                            <div className="text-center py-20">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest">No highlights recorded for this session.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="part-b"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                                    <div className="bg-slate-900 px-10 py-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center font-black text-white">B</div>
                                            <h4 className="font-black text-white uppercase tracking-widest text-sm">Individual Response Analysis</h4>
                                        </div>
                                    </div>
                                    <div className="p-12 space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluency & Flow</p>
                                                <p className="text-sm font-bold text-slate-900 leading-relaxed">{part_b_analysis.fluency}</p>
                                            </div>
                                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Relevance</p>
                                                <p className="text-sm font-bold text-slate-900 leading-relaxed">{part_b_analysis.relevance}</p>
                                            </div>
                                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The "Extend" Rule</p>
                                                <p className="text-sm font-bold text-slate-900 leading-relaxed">{part_b_analysis.elaboration}</p>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                            <h5 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Sophisticated Vocabulary Used</h5>
                                            <div className="flex flex-wrap gap-3">
                                                {(trigger_analysis.sophisticated_vocab || []).map((word, i) => (
                                                    <span key={i} className="px-4 py-2 bg-white text-emerald-700 rounded-xl text-xs font-black shadow-sm border border-emerald-100">
                                                        {word}
                                                    </span>
                                                ))}
                                                {(!trigger_analysis.sophisticated_vocab || trigger_analysis.sophisticated_vocab.length === 0) && (
                                                    <p className="text-emerald-600/60 text-xs italic">No low-frequency vocabulary detected. Aim for more precise collocations next time!</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="pt-12 border-t border-slate-200 flex items-center justify-end">
                    <button 
                        onClick={() => navigate('/mock-exam-eng', { 
                            state: { 
                                mockCompleted: true,
                                type: 'Speaking',
                                level: overall_level,
                                score: `${total_score}/28`
                            } 
                        })}
                        className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center gap-3"
                    >
                        Back to Exam Center <ChevronRight size={18} />
                    </button>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                body { font-family: 'Outfit', sans-serif; }
            ` }} />
        </div>
    );
};

const QuoteIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H5c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6"></path>
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-3c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h3c0 4-4 6-4 6"></path>
    </svg>
);

export default SpeakingResultPage;
