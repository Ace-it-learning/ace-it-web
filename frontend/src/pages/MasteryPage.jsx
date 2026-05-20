import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Compass, Info, Award, TrendingUp, ChevronRight, 
    Trophy, Zap, Lock, ArrowLeft, Sparkles,
    BookOpen, Headphones, PenTool, MessageSquare, Check, X
} from 'lucide-react';
import MasteryRadar from '../components/dashboard/MasteryRadar';
import { getUserMastery, getMasteryHistory } from '../services/masteryService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSkillName, getSkillDesc, getPaperBySkill, MICRO_SKILLS, getSkillsByPaper } from '../constants/microSkills';
import { useMockGate } from '../hooks/useMockGate';

const MasteryPage = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('mock'); // 'mock' or 'practice'
    const [selectedPaper, setSelectedPaper] = useState('Reading');
    const [showGlossary, setShowGlossary] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const { englishUnlocked, completedTypes, loading: gateLoading } = useMockGate(user?.uid);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            const fetchData = async () => {
                setLoading(true);
                const [skills, history] = await Promise.all([
                    getUserMastery(user.uid),
                    getMasteryHistory(user.uid)
                ]);
                setMasteryData(skills);
                setHistoryData(history);
                setLoading(false);
            };
            fetchData();
        }
    }, [user?.uid]);

    const PAPERS = [
        { id: 'Reading', name: t('mastery.reading'), icon: BookOpen },
        { id: 'Writing', name: t('mastery.writing'), icon: PenTool },
        { id: 'Listening', name: t('mastery.listening'), icon: Headphones },
        { id: 'Speaking', name: t('mastery.speaking'), icon: MessageSquare }
    ];

    const getNormalizedSkillEntries = () => {
        const skillsObj = masteryData?.microSkills || {};
        const resolvePaper = (skillId) => {
            const mapped = getPaperBySkill(skillId);
            if (mapped) return mapped;
            const lower = String(skillId || '').toLowerCase();
            if (lower.startsWith('reading_')) return 'reading';
            if (lower.startsWith('writing_')) return 'writing';
            if (lower.startsWith('listening_')) return 'listening';
            if (lower.startsWith('speaking_')) return 'speaking';
            return null;
        };
        // Exclude pseudo-skills that are quest trackers, not real micro-skills
        const isPseudoSkill = (skillId) => {
            const id = String(skillId || '').toLowerCase();
            return id === 'writing_quest' || id === 'listening_quest';
        };
        // For each paper, only show the HKEAA pillar skills on the radar.
        // Granular skills are tracked internally but not displayed as separate axes.
        const isGranularSkill = (skillId) => {
            const id = String(skillId || '');
            const writingPillars = ['writing_content', 'writing_language', 'writing_organization'];
            const listeningPillars = ['listening_part_a', 'listening_content', 'listening_language', 'listening_organization'];
            const speakingPillars = ['speaking_delivery', 'speaking_strategies', 'speaking_language', 'speaking_organization'];
            const allPillars = [...writingPillars, ...listeningPillars, ...speakingPillars];
            if (id.startsWith('writing_') || id.startsWith('listening_') || id.startsWith('speaking_')) {
                return !allPillars.includes(id);
            }
            return false;
        };
        return Object.entries(skillsObj)
            .map(([skillId, raw]) => {
                const level = typeof raw === 'object' ? Number(raw.level || 0) : Number(raw || 0);
                const attempts = typeof raw === 'object' ? Number(raw.totalAttempts || raw.practiceCount || 0) : 0;
                const paper = resolvePaper(skillId);
                return {
                    skillId,
                    level,
                    attempts,
                    paper,
                    name: getSkillName(skillId, language),
                    raw
                };
            })
            .filter((s) => s.paper && Number.isFinite(s.level) && !isPseudoSkill(s.skillId) && !isGranularSkill(s.skillId));
    };

    const getFilteredSkills = () => {
        const skillsObj = masteryData?.microSkills || {};
        const normalized = getNormalizedSkillEntries();
        
        if (viewMode === 'mock') {
            const averages = {
                [t('mastery.reading')]: 1,
                [t('mastery.writing')]: 1,
                [t('mastery.listening')]: 1,
                [t('mastery.speaking')]: 1
            };
            
            const paperSum = { reading: 0, writing: 0, listening: 0, speaking: 0 };
            const paperCount = { reading: 0, writing: 0, listening: 0, speaking: 0 };

            normalized.forEach(({ paper, level }) => {
                if (paper && paperSum.hasOwnProperty(paper) && level > 0) {
                    paperSum[paper] += level;
                    paperCount[paper] += 1;
                }
            });

            Object.keys(paperSum).forEach(paper => {
                const avg = paperCount[paper] > 0 ? (paperSum[paper] / paperCount[paper]) : 1;
                averages[t(`mastery.${paper}`)] = avg;
            });
            
            return averages;
        }
        
        const filtered = {};
        const paperID = selectedPaper.toLowerCase();
        
        // 1. Pre-populate with all skills for this paper from taxonomy, defaulting to Level 1
        const allSkillIds = getSkillsByPaper(paperID)
            .filter(id => id !== 'writing_quest' && id !== 'listening_quest');
        allSkillIds.forEach((skillId) => {
            const name = getSkillName(skillId, language);
            filtered[name] = 14.28; // Level 1 baseline on 0-100 scale (7 levels = 14.28 each)
        });

        // 2. Overwrite with actual user data if it exists (including fallback-prefixed skills)
        //    Only overwrite if level > 0 to preserve the Level 1 default for unassessed skills
        normalized
            .filter((s) => s.paper === paperID && s.level > 0)
            .forEach((s) => {
                if (s.name) {
                    filtered[s.name] = s.level * 14.28;
                }
            });

        // 3. Keep taxonomy label continuity where IDs are known
        //    BUT do NOT overwrite with 0 if the skill has no data — preserve the Level 1 default
        Object.entries(MICRO_SKILLS).forEach(([skillId]) => {
            const paper = getPaperBySkill(skillId);
            if (paper === paperID && skillsObj[skillId]) {
                const name = getSkillName(skillId, language);
                const data = skillsObj[skillId];
                const level = typeof data === 'object' ? Number(data.level || 0) : Number(data || 0);
                // Only overwrite if there is actual data (level > 0); otherwise keep the Level 1 default
                if (level > 0) {
                    filtered[name] = level * 14.28;
                }
            }
        });
        return filtered;
    };

    const displayData = getFilteredSkills();
    const strengths = masteryData?.microSkills || {};
    const previousDataRaw = historyData.length > 0 ? historyData[0].microSkills : null;

    const getProcessedHistory = () => {
        if (!previousDataRaw) return null;
        const processed = {};
        
        if (viewMode === 'mock') {
            ['Reading', 'Writing', 'Listening', 'Speaking'].forEach(paper => {
                const pID = paper.toLowerCase();
                const paperSkills = Object.keys(previousDataRaw).filter(s => {
                    const lower = s.toLowerCase();
                    return lower.startsWith(pID) && lower !== 'writing_quest' && lower !== 'listening_quest';
                });
                const vals = paperSkills.map(s => typeof previousDataRaw[s] === 'object' ? (previousDataRaw[s].level || 0) : (previousDataRaw[s] || 0)).filter(v => v > 0);
                const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 1;
                processed[t(`mastery.${paper.toLowerCase()}`)] = avg;
            });
        } else {
            const paperID = selectedPaper.toLowerCase();
            Object.entries(previousDataRaw).forEach(([skillId, data]) => {
                const lower = skillId.toLowerCase();
                if (lower.startsWith(paperID) && lower !== 'writing_quest' && lower !== 'listening_quest') {
                    const name = getSkillName(skillId, language);
                    const level = typeof data === 'object' ? (data.level || 0) : (data || 0);
                    processed[name] = level * 14.28;
                }
            });
        }
        return processed;
    };

    const previousData = getProcessedHistory();

    const getWeaknessSuggestions = () => {
        const allSkills = getNormalizedSkillEntries()
            .filter((s) => s.level > 0 && s.level < 5.5)
            .sort((a, b) => a.level - b.level);
        return allSkills.slice(0, 3).map(s => {
            let advice = "";
            if (s.level < 2) {
                advice = language === 'en' ? `Focus on core mechanics in ${s.name}. Stability is key.` : `鞏固 ${s.name} 的基本功，穩定性是達標關鍵。`;
            } else if (s.level < 4) {
                advice = language === 'en' ? `Develop complexity in ${s.name}. Level 4 is within reach.` : `提升 ${s.name} 的複雜度，你快將達到第 4 級。`;
            } else {
                advice = language === 'en' ? `Refine nuances in ${s.name}. Small details unlock Level 5*.` : `精煉 ${s.name} 的細節，這將助你奪取 5* 或以上。`;
            }
            return { ...s, recommendedAction: advice };
        });
    };

    const weaknesses = getWeaknessSuggestions();

    const getTopGrowth = () => {
        if (!previousDataRaw || Object.keys(strengths).length === 0) return null;
        const normalized = getNormalizedSkillEntries();
        let topSkillId = null;
        let maxGrowth = -Infinity;
        normalized.forEach(({ skillId, level }) => {
            const prev = previousDataRaw[skillId];
            if (prev) {
                const prevLevel = typeof prev === 'object' ? (prev.level || 0) : (prev || 0);
                const growth = level - prevLevel;
                if (growth > maxGrowth) {
                    maxGrowth = growth;
                    topSkillId = skillId;
                }
            }
        });
        if (!topSkillId || maxGrowth <= 0) return null;
        return { name: getSkillName(topSkillId, language), value: `+${Math.round((maxGrowth / 7) * 100)}% Growth` };
    };

    const getPeakPerf = () => {
        if (Object.keys(strengths).length === 0) return null;
        const normalized = getNormalizedSkillEntries().filter((s) => s.level > 0);
        if (normalized.length === 0) return null;
        let peakId = null;
        let maxLevel = -Infinity;
        normalized.forEach(({ skillId, level }) => {
            if (level > maxLevel) {
                maxLevel = level;
                peakId = skillId;
            }
        });
        if (!peakId) return null;
        const level = maxLevel;
        return { name: getSkillName(peakId, language), value: `${t('mastery.level_prefix')}${t(`mastery.level_labels.${Math.floor(level)}`)}` };
    };

    const topGrowth = getTopGrowth() || { name: '---', value: t('mastery.keep_practicing') };
    const peakPerf = getPeakPerf() || { name: '---', value: t('mastery.keep_practicing') };
    const glossarySkills = viewMode === 'practice' ? getSkillsByPaper(selectedPaper) : [];

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-[#00aeef] font-black uppercase tracking-widest text-xs">
                            <Sparkles className="w-4 h-4" /> {t('mastery.overview')}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            {t('mastery.title')}
                        </h1>
                        <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
                            {t('mastery.description')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                        {/* Level 1 Navigation */}
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                            {[
                                { id: 'mock', name: t('mastery.mock_exam_tab'), icon: Compass },
                                { id: 'practice', name: t('mastery.practice_analysis_tab'), icon: TrendingUp }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setViewMode(tab.id);
                                        setShowGlossary(false);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === tab.id
                                        ? 'bg-[#00aeef] text-white shadow-lg shadow-cyan-200'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        {/* Level 2 Navigation (Only for Practice) */}
                        {viewMode === 'practice' && (
                            <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar animate-in slide-in-from-top-2 duration-300">
                                {PAPERS.map(paper => (
                                    <button
                                        key={paper.id}
                                        onClick={() => {
                                            setSelectedPaper(paper.id);
                                            setShowGlossary(false);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${selectedPaper === paper.id
                                            ? 'bg-white text-[#00aeef] shadow-sm'
                                            : 'text-slate-400 hover:text-slate-500'
                                        }`}
                                    >
                                        <paper.icon className="w-3.5 h-3.5" />
                                        {paper.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        {viewMode === 'mock' && (
                            <div className={`p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500 ${englishUnlocked ? 'bg-gradient-to-br from-[#00aeef] to-blue-600 shadow-cyan-200 text-white' : 'bg-white border border-slate-100 shadow-sm text-slate-900'}`}>
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-2 rounded-xl backdrop-blur-md ${englishUnlocked ? 'bg-white/20' : 'bg-slate-100'}`}>
                                            {englishUnlocked ? <Trophy className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-[0.2em] italic ${englishUnlocked ? 'text-cyan-100' : 'text-slate-400'}`}>
                                            {englishUnlocked ? t('mastery.overall_level') : t('mastery.prediction_locked')}
                                        </span>
                                    </div>

                                    {englishUnlocked ? (
                                        <>
                                            <p className="text-7xl font-black tracking-tighter mb-4">
                                                {t(`mastery.level_labels.${Math.round(masteryData?.overall_level || 1)}`)}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-white text-[#00aeef] rounded-full text-[10px] font-black uppercase">HKDSE</span>
                                                <span className="text-xs font-bold text-cyan-100 opacity-80">{t('mastery.estimated_grade')}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-slate-400 mb-4 leading-relaxed">
                                                {t('mastery.prediction_description')}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'reading', label: 'Reading', icon: BookOpen },
                                                    { id: 'writing', label: 'Writing', icon: PenTool },
                                                    { id: 'listening', label: 'Listening', icon: Headphones },
                                                    { id: 'speaking', label: 'Speaking', icon: MessageSquare }
                                                ].map(paper => {
                                                    const isDone = completedTypes.includes(paper.id);
                                                    return (
                                                        <div key={paper.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${isDone ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                            {isDone ? <Check className="w-3.5 h-3.5 text-cyan-500" /> : <X className="w-3.5 h-3.5" />}
                                                            <span className="text-[10px] font-black uppercase tracking-wider">{paper.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button 
                                                onClick={() => navigate('/mock-exam')}
                                                className="w-full mt-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                                            >
                                                {t('mastery.go_to_mock_center')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('mastery.top_growth')}</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mb-1">{topGrowth.name}</p>
                                <p className="text-sm font-bold text-emerald-600">{topGrowth.value}</p>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-50 rounded-xl">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('mastery.peak_performance')}</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mb-1">{peakPerf.name}</p>
                                <p className="text-sm font-bold text-amber-600">{peakPerf.value}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-[#00aeef]" />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('mastery.improvement_plan')}</h3>
                            </div>
                            <div className="space-y-4">
                                {weaknesses.length > 0 ? weaknesses.map((w, idx) => (
                                    <div key={idx} className="w-full text-left p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-[#00aeef] hover:shadow-xl hover:shadow-cyan-500/5 transition-all">
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <span className="text-sm font-black text-slate-900 group-hover:text-[#00aeef] transition-colors uppercase tracking-tight">{w.name}</span>
                                            <span className="text-[9px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-black uppercase border border-rose-100 whitespace-nowrap">Priority</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{w.recommendedAction}</p>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center">
                                        <p className="text-sm text-slate-400 font-bold">{t('mastery.no_plan')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[600px] flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                        {viewMode === 'practice' && (
                            <div className="relative z-20 flex justify-end mb-4">
                                <button
                                    onClick={() => setShowGlossary(!showGlossary)}
                                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${showGlossary
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 shadow-sm'
                                    }`}
                                >
                                    <Info className="w-4 h-4" />
                                    <span>{t('mastery.skill_glossary')}</span>
                                </button>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {loading ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-lg font-black text-slate-400 tracking-widest uppercase">Analyzing Mastery...</p>
                                </div>
                            ) : showGlossary ? (
                                <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-amber-50 rounded-2xl">
                                            <Info className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">{t('mastery.skill_glossary')}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar">
                                        {glossarySkills.map(skillId => (
                                            <div key={skillId} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200/60 group hover:bg-white hover:border-cyan-300 transition-all shadow-sm">
                                                <h5 className="text-sm font-black text-cyan-600 flex items-center gap-2 mb-2">
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 transition-transform" />
                                                    {getSkillName(skillId, language)}
                                                </h5>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                                    {getSkillDesc(skillId, language)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-full min-h-[500px] h-[500px] relative z-10">
                                        <MasteryRadar
                                            data={displayData}
                                            historicalData={viewMode === 'mock' ? null : previousData}
                                            rawSkills={masteryData?.microSkills}
                                            isOverview={viewMode === 'mock'}
                                            theme="light"
                                            color="#00aeef"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 mt-12 text-[11px] font-black uppercase tracking-[0.2em] z-10 p-5 bg-slate-50/50 border border-slate-100 rounded-3xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full bg-[#00aeef] ring-4 ring-cyan-50 shadow-sm shadow-cyan-200" />
                                            <span className="text-slate-900">
                                                {viewMode === 'mock' 
                                                    ? t('mastery.mock_data_label') 
                                                    : t('mastery.practice_data_label', { category: t(`mastery.${selectedPaper.toLowerCase()}`) })
                                                }
                                            </span>
                                        </div>
                                        {previousData && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-slate-50 shadow-sm" />
                                                <span className="text-slate-400">{t('mastery.baseline')}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all hover:bg-black hover:scale-[1.02] shadow-2xl shadow-slate-300 active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:translate-x-[-4px]" />
                        {t('common.back_to_dashboard')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MasteryPage;
