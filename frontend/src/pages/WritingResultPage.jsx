import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, ArrowLeft, Star, BarChart3, 
    BookOpen, Sparkles, MessageSquare, 
    ChevronRight, Target, Info, Zap, 
    CheckCircle2, AlertCircle, X, Layers, GraduationCap, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import WritingHighlighter from '../components/writing/WritingHighlighter';
import { getLocalizedValue } from '../utils/writingUtils';
import { GRAMMAR_MAPPING } from '../constants/grammarMapping';

const WritingResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const isChinese = language?.startsWith('zh');
    
    // Diagnostic version tag for verification
    useEffect(() => {
        console.log("%c Ace-it Writing Studio v1.2 - Loaded ", "background: #1e293b; color: #818cf8; font-weight: bold; padding: 4px; border-radius: 4px;");
    }, []);

    const getLocalizedValueLocal = (data, field) => getLocalizedValue(data, field, isChinese);
    
    const { resultId } = useParams();
    const [results, setResults] = useState(state?.results || null);
    const [questData, setQuestData] = useState(state?.questData || null);
    const [studentWork, setStudentWork] = useState(state?.studentWork || null);
    const [isFetching, setIsFetching] = useState(false);

    const [selectedExemplar, setSelectedExemplar] = useState(null);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const [hoveredHotspot, setHoveredHotspot] = useState(null);
    const [exemplars, setExemplars] = useState([]);
    const [isLoadingExemplars, setIsLoadingExemplars] = useState(false);
    const [isChineseMode, setIsChineseMode] = useState(isChinese);

    // Data Normalization Layer
    const normalizedResults = React.useMemo(() => {
        if (!results) return null;
        
        // Helper to find key case-insensitively
        const getCI = (obj, key) => {
            if (!obj) return undefined;
            if (obj[key] !== undefined) return obj[key];
            const lowerKey = key.toLowerCase();
            const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
            return foundKey ? obj[foundKey] : undefined;
        };

        const data = results.data || results;
        
        // Normalize Pillar Scores to always be lowercase keys
        const rawPillars = getCI(data, 'pillar_scores') || getCI(data, 'pillarScores') || {};
        const normalizedPillars = {};
        Object.keys(rawPillars).forEach(k => {
            normalizedPillars[k.toLowerCase()] = rawPillars[k];
        });

        return {
            ...data,
            predicted_level: getCI(data, 'predicted_level') || getCI(data, 'predictedLevel') || "4",
            overall_score: getCI(data, 'overall_score') || getCI(data, 'overallScore') || 4,
            pillar_scores: normalizedPillars,
            examiner_summary: getCI(data, 'examiner_summary') || getCI(data, 'examinerSummary') || "",
            improvement_goal: getCI(data, 'improvement_goal') || getCI(data, 'improvementGoal') || "",
            exemplar_comparison: getCI(data, 'exemplar_comparison') || getCI(data, 'exemplarComparison') || null,
            model_answer_5_star: getCI(data, 'model_answer_5_star') || getCI(data, 'modelAnswer5Star') || getCI(data, 'modelAnswer') || "",
            high_score_tips: getCI(data, 'high_score_tips') || getCI(data, 'highScoreTips') || [],
            grammar_diagnostics: getCI(data, 'grammar_diagnostics') || getCI(data, 'grammarDiagnostics') || []
        };
    }, [results]);

    // Fetch Result by ID if passed in URL (Review Mode)
    useEffect(() => {
        if (!results && resultId && user) {
            const fetchResult = async () => {
                setIsFetching(true);
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/results/${resultId}?uid=${user.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setQuestData({ genre: data.textType || data.module });
                        setStudentWork(data.content);
                    } else {
                        console.error("[WritingResult] Failed to fetch historical result");
                        navigate('/dashboard');
                    }
                } catch (err) {
                    console.error("[WritingResult] Error fetching historical result:", err);
                    navigate('/dashboard');
                } finally {
                    setIsFetching(false);
                }
            };
            fetchResult();
        } else if (!results && !resultId) {
            navigate('/dashboard');
        }
    }, [resultId, results, user, navigate]);

    useEffect(() => {
        if (!results) return;

        const fetchExemplars = async () => {
            setIsLoadingExemplars(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const genre = questData?.genre || questData?.id?.split('_')[0] || results.textType;
                const res = await fetch(`${API_URL}/api/writing/exemplars?genre=${genre}`);
                const data = await res.json();
                setExemplars(data);
            } catch (err) {
                console.error("[WritingResult] Exemplar fetch error:", err);
            } finally {
                setIsLoadingExemplars(false);
            }
        };

        fetchExemplars();
    }, [results, questData]);

    if (isFetching) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Retrieving Past Performance...</p>
            </div>
        </div>
    );

    if (!results || !normalizedResults) return null;

    const pillarScores = normalizedResults.pillar_scores || {};
    const predictedLevel = normalizedResults.predicted_level || "4";
    const overallScore = normalizedResults.overall_score || 4;



    const getLevelColor = (lvl) => {
        if (lvl.includes('5**')) return 'bg-rose-600';
        if (lvl.includes('5*')) return 'bg-rose-500';
        if (lvl.includes('5')) return 'bg-indigo-600';
        if (lvl.includes('4')) return 'bg-emerald-600';
        return 'bg-slate-600';
    };
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-100">
            {/* Header: High Fidelity Alignment */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-50 sticky top-0 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } })}
                        className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h1 className="font-black text-slate-900 tracking-tight text-lg">{t('writing_result.dashboard_title')}</h1>
                            <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[9px] font-black uppercase tracking-widest">
                                {t('writing_result.mission_completed')}
                            </span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                             <Trophy size={10} className="text-amber-500" /> {t('writing_result.topic_label')}: {isChinese ? (questData?.title_zh || questData?.title) : (questData?.title_en || questData?.title)}
                             <span className="text-slate-200">|</span>
                             <span className="flex items-center gap-1 text-slate-500">
                                 <Star size={10} className="text-rose-500 fill-current" /> {questData?.genre || "Writing"}
                             </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={async () => {
                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                            const genre = questData?.genre || questData?.id?.split('_')[0];
                            try {
                                const res = await fetch(`${API_URL}/api/writing/format/${encodeURIComponent(genre)}`);
                                const topics = await res.json();
                                const currentIndex = topics.findIndex(t => t.id === questData.id || t.title === questData.title);
                                if (currentIndex !== -1 && topics[currentIndex + 1]) {
                                    const nextQuest = topics[currentIndex + 1];
                                    navigate('/writing/quest', { state: { questData: nextQuest } });
                                } else {
                                    // Fallback to English Roadmap
                                    navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } });
                                }
                            } catch (err) {
                                navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } });
                            }
                        }}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
                    >
                        <ChevronRight size={14} /> {t('writing_result.try_next')}
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Row 1: Grading Overview & C-L-O Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Predicted Level & Rewards (1/3) */}
                    <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[80px] opacity-20 transition-all group-hover:opacity-30 ${getLevelColor(predictedLevel)}`} />
                        
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t('writing_result.final_assessment')}</h3>
                        
                        <div className="relative mb-6">
                            <div className={`text-9xl font-black italic tracking-tighter ${predictedLevel.includes('5') ? 'text-slate-900' : 'text-slate-600'}`}>
                                {predictedLevel}
                            </div>
                            <div className="absolute -bottom-2 -right-4 px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-2xl flex flex-col items-center min-w-[100px] border border-slate-700">
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">+{normalizedResults.xp_awarded || results.xp_awarded || 0} XP</span>
                                
                                {(normalizedResults.xp_breakdown || results.xp_breakdown) && (
                                    <div className="w-full pt-1.5 border-t border-slate-700 mt-1.5 space-y-0.5 text-left">
                                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span>Base:</span>
                                            <span>{(normalizedResults.xp_breakdown || results.xp_breakdown).base}</span>
                                        </div>
                                        {(normalizedResults.xp_breakdown || results.xp_breakdown).tierMultiplier > 1 && (
                                            <div className="flex justify-between text-[9px] text-indigo-400 font-bold uppercase tracking-widest">
                                                <span>Premium:</span>
                                                <span>x{(normalizedResults.xp_breakdown || results.xp_breakdown).tierMultiplier}</span>
                                            </div>
                                        )}
                                        {(normalizedResults.xp_breakdown || results.xp_breakdown).masteryMultiplier > 1 && (
                                            <div className="flex justify-between text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                                                <span>Mastery:</span>
                                                <span>x{(normalizedResults.xp_breakdown || results.xp_breakdown).masteryMultiplier}</span>
                                            </div>
                                        )}
                                        {(normalizedResults.xp_breakdown || results.xp_breakdown).milestoneBonus > 0 && (
                                            <div className="flex justify-between text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                                                <span>Bonus:</span>
                                                <span>+{(normalizedResults.xp_breakdown || results.xp_breakdown).milestoneBonus}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                            <Star size={14} className="text-rose-500 fill-current" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('writing_result.dse_calibrated')}</span>
                        </div>
                    </div>

                    {/* C-L-O Triad Breakdown (2/3) */}
                    <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white relative flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <BarChart3 size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">{t('writing_result.clo_title')}</h3>
                                <p className="text-xs font-bold text-slate-400">{t('writing_result.clo_subtitle')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { id: 'content', label: t('writing_result.content'), icon: BookOpen, color: 'text-rose-500', bar: 'bg-rose-500' },
                                { id: 'language', label: t('writing_result.language'), icon: Sparkles, color: 'text-indigo-500', bar: 'bg-indigo-500' },
                                { id: 'organization', label: t('writing_result.organization'), icon: Layers, color: 'text-emerald-500', bar: 'bg-emerald-500' }
                            ].map((pillar) => (
                                <div key={pillar.id} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <pillar.icon size={14} className={pillar.color} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{pillar.label}</span>
                                        </div>
                                        <span className="text-2xl font-black italic text-white">{pillarScores[pillar.id]?.score || 0}<span className="text-xs text-slate-500 not-italic ml-0.5">/7</span></span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((pillarScores[pillar.id]?.score || 0) / 7) * 100}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className={`h-full ${pillar.bar}`}
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-slate-300 leading-normal">
                                        {getLocalizedValueLocal(pillarScores[pillar.id], 'feedback')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Full-Width Examiner Focus */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-12 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <MessageSquare size={160} className="text-indigo-600" />
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                        <MessageSquare size={24} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">{t('writing_result.examiner_verdict')}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('writing_result.pro_eval_subtitle')}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-3 top-0 text-6xl text-indigo-100 font-serif leading-none">“</div>
                                    <p className="text-lg font-bold text-slate-600 leading-relaxed italic pl-6 pt-2">
                                        {getLocalizedValueLocal(normalizedResults, 'examiner_summary')}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-80 space-y-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('writing_result.primary_goal')}</span>
                                </div>
                                <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 shadow-sm">
                                    <p className="text-xs font-black text-rose-900 leading-relaxed italic">
                                        {getLocalizedValueLocal(normalizedResults, 'improvement_goal')}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                                        <Info size={12} /> {isChinese ? '留意下方粉色標註' : 'Focus on the pink highlights below'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* High Score Strategies Section */}
                    {normalizedResults.high_score_tips && normalizedResults.high_score_tips.length > 0 && (
                        <div className="lg:col-span-12 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                             <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                                    <Zap size={24} className="text-amber-500 fill-current" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">{isChinese ? 'DSE 奪分策略' : 'High-Score Strategies'}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isChinese ? '精英考官的秘訣、DSE 必殺技及常見誤區' : 'Expert Secrets, DSE Tricks & Marker Favorites'}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {normalizedResults.high_score_tips.map((tip, idx) => (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:border-amber-200 transition-all">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                                                {idx + 1}
                                            </span>
                                            <h5 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-amber-600 transition-colors">
                                                {getLocalizedValueLocal(tip, 'title')}
                                            </h5>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                            {getLocalizedValueLocal(tip, 'description')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Miss Janie's Grammar Diagnostic Loop */}
                    {normalizedResults.grammar_diagnostics && normalizedResults.grammar_diagnostics.length > 0 && (
                        <div className="lg:col-span-12 bg-amber-50 rounded-[2.5rem] p-10 border-2 border-amber-200 shadow-sm relative overflow-hidden group">
                             {/* Decorative Background Elements */}
                             <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-300/20 transition-all duration-700" />
                             
                             <div className="flex items-center gap-4 mb-10 relative z-10">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={32} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-amber-900">
                                        {isChinese ? 'Miss Janie 的語法診斷' : "Miss Janie's Grammar Diagnostic"}
                                    </h3>
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={12} className="animate-pulse" />
                                        {isChinese ? '針對你的寫作漏洞，推薦以下微技能練習' : 'Targeted Micro-Labs to fix your mark-leaks'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                {normalizedResults.grammar_diagnostics.slice(0, 2).map(tag => {
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
                                            className="bg-white p-7 rounded-[2rem] border border-amber-100 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group/card"
                                        >
                                            <div className="flex flex-col flex-1 pr-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${info.track === 'Elite' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {info.track} Track
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black text-slate-800 group-hover/card:text-amber-600 transition-colors leading-tight">
                                                    {isChinese ? info.title_zh : info.title}
                                                </h4>
                                                <p className="text-sm font-bold text-slate-400 mt-3 italic leading-relaxed">
                                                    "{isChinese ? info.janie_message_zh : info.janie_message}"
                                                </p>
                                            </div>
                                            <div className="w-14 h-14 bg-amber-50 rounded-2xl group-hover/card:bg-amber-600 group-hover/card:text-white transition-all text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                                                <Play size={24} fill="currentColor" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Row 3: Elite Analysis Comparison Center (Full Width) */}
                <div className="bg-indigo-900 rounded-[3rem] shadow-2xl overflow-hidden text-white flex flex-col">
                    <div className="p-10 border-b border-white/10 flex items-center justify-between bg-indigo-950/40">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                                <Sparkles size={32} className="text-indigo-300" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">
                                    {predictedLevel === '5**' ? t('writing_result.elite_refinement') : (isChinese ? 'Level 5** 升級分析' : 'Level 5** Upgrade Analysis')}
                                </h3>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">
                                    {predictedLevel === '5**' 
                                        ? (isChinese ? '將你的傑作與其他專業寫作手法進行對比' : 'Comparing your masterwork with alternative professional approaches')
                                        : (isChinese ? `將你的 Level ${predictedLevel} 草稿提升至 DSE 精英水平` : `Upgrading your Level ${predictedLevel} draft to DSE Elite Standard`)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-widest">
                            <Info size={14} /> {isChinese ? '點擊標註查看分析' : 'Click highlights for analysis'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
                        {/* Student Original Answer */}
                        <div className="p-12 flex flex-col group">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('writing_result.your_answer')}</h5>
                                    <div className="w-10 h-1 bg-indigo-100 rounded-full mt-1" />
                                </div>
                            </div>
                            <div className="text-slate-800 font-medium text-xl leading-[1.8] font-serif pr-6 whitespace-pre-wrap">
                                <WritingHighlighter 
                                    text={studentWork?.content || normalizedResults.exemplar_comparison?.original_paragraph || ""}
                                    hotspots={normalizedResults.exemplar_comparison?.hotspots}
                                    isChinese={isChinese}
                                    t={t}
                                    matchField="original_phrase"
                                    activeHotspot={activeHotspot}
                                    onHighlightClick={setActiveHotspot}
                                />
                            </div>
                        </div>

                        {/* Elite Master Version */}
                        <div className="p-12 flex flex-col bg-slate-50/30 relative group">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                                        {predictedLevel === '5**' ? t('writing_result.master_version') : `DSE Level 5** ${isChinese ? '標準' : 'Standard'}`}
                                    </h5>
                                    <div className="w-10 h-1 bg-emerald-100 rounded-full mt-1" />
                                </div>
                            </div>
                            <div className="text-slate-800 font-bold text-xl leading-[1.8] font-serif pr-6 whitespace-pre-wrap">
                                <WritingHighlighter 
                                    text={normalizedResults?.model_answer_5_star || normalizedResults.exemplar_comparison?.upgraded_paragraph || ""}
                                    hotspots={normalizedResults.exemplar_comparison?.hotspots}
                                    isChinese={isChinese}
                                    t={t}
                                    matchField="improved_phrase"
                                    activeHotspot={activeHotspot}
                                    onHighlightClick={setActiveHotspot}
                                />
                            </div>
                            {/* Floating Insight Panel */}
                            <AnimatePresence mode="wait">
                                {activeHotspot !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 100 }}
                                        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100]"
                                    >
                                        <div className="bg-slate-900 border-2 border-indigo-500/30 text-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8 backdrop-blur-xl relative overflow-hidden">
                                            {/* Glow effect */}
                                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                                            
                                            <div className="flex items-center justify-between mb-6 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                                        <Zap size={20} className="text-amber-500 fill-current" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-[0.15em] text-indigo-400">{t('writing_result.insight_title')}</h5>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{t('writing_result.expert_recommendation')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Language Toggle */}
                                                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                                        <button 
                                                            onClick={() => setIsChineseMode(false)}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${!isChineseMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                        >
                                                            EN
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsChineseMode(true)}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${isChineseMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                        >
                                                            中
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => setActiveHotspot(null)}
                                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                                        aria-label="Close insight"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-5 relative z-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-2 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20 whitespace-nowrap mt-1">{t('writing_result.original_tag')}</span>
                                                        <p className="text-sm font-bold text-slate-300 italic leading-relaxed">
                                                            "{normalizedResults.exemplar_comparison?.hotspots[activeHotspot]?.original_phrase || normalizedResults.exemplar_comparison?.hotspots[activeHotspot]?.phrase || "Original text"}"
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 whitespace-nowrap mt-1">{t('writing_result.elite_tag')}</span>
                                                        <p className="text-sm font-black text-white leading-relaxed">
                                                            "{normalizedResults.exemplar_comparison?.hotspots[activeHotspot]?.improved_phrase || 'Refined phrasing'}"
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-sm font-bold leading-relaxed text-slate-400">
                                                        {(() => {
                                                            const h = normalizedResults.exemplar_comparison?.hotspots[activeHotspot];
                                                            const expl = h?.explanation;
                                                            if (typeof expl === 'object') return isChineseMode ? expl.zh || expl.en : expl.en || expl.zh;
                                                            return isChineseMode ? h?.explanation_zh || expl : expl;
                                                        })() || (isChineseMode ? "我們推薦這種轉述，因為它能更好地展現 DSE 要求的精準度與語言豐富度。" : "We recommend this phrasing for better high-tier DSE alignment.") }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                {/* Final Actions */}
                <div className="flex items-center justify-between pt-10 border-t border-slate-200">
                    <div className="flex items-center gap-3 text-slate-400">
                        <AlertCircle size={20} />
                        <p className="text-sm font-bold italic">This evaluation is generated using the Ace-it High Fidelity Scoring Engine.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.print()}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                        >
                            {t('writing_result.export_pdf')}
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } })}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl"
                        >
                            {(() => {
                                const val = t('back_to_roadmap');
                                if (val === 'back_to_roadmap' || !val) {
                                    return isChinese ? '返回發展導航' : 'Back to Roadmap';
                                }
                                return val;
                            })()}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WritingResultPage;
