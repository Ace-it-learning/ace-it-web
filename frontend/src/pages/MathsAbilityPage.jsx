import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Compass, Info, Award, TrendingUp, ChevronRight, 
    Trophy, Calculator, Shapes, BarChart3, Zap, Lock, 
    ArrowLeft, Sparkles, Check, X
} from 'lucide-react';
import MasteryRadar from '../components/dashboard/MasteryRadar';
import { getMathMastery, getMathHistory } from '../services/mathMasteryService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getMathSkillName, getMathSkillDesc, getSkillsByCategory, MATH_MICRO_SKILLS } from '../constants/mathMicroSkills';
import { useMockGate } from '../hooks/useMockGate';
import { calculateTier, getMasteryStats } from '../utils/masteryUtils';

const MathsAbilityPage = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('mock'); // 'mock' or 'practice'
    const [selectedCategory, setSelectedCategory] = useState({ id: 'algebra', name: t('math_ability.algebra'), icon: Calculator, color: 'text-blue-400' });
    const [showGlossary, setShowGlossary] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const { mathsUnlocked, completedTypes, loading: gateLoading } = useMockGate(user?.uid);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            const fetchData = async () => {
                setLoading(true);
                const [skills, history] = await Promise.all([
                    getMathMastery(user.uid),
                    getMathHistory(user.uid)
                ]);
                setMasteryData(skills);
                setHistoryData(history);
                setLoading(false);
            };
            fetchData();
        }
    }, [user?.uid]);

    // Categories parallel to Papers
    const CATEGORIES = [
        { id: 'algebra', name: t('math_ability.algebra'), icon: Calculator, color: 'text-blue-400' },
        { id: 'geometry', name: t('math_ability.geometry'), icon: Shapes, color: 'text-rose-400' },
        { id: 'data', name: t('math_ability.data_handling'), icon: BarChart3, color: 'text-emerald-400' }
    ];

    const getFilteredSkills = () => {
        const skillsObj = masteryData?.microSkills || {};
        if (viewMode === 'mock') {
            const categories = ['algebra', 'geometry', 'data'];
            const averages = {};
            categories.forEach(cat => {
                const catSkills = getSkillsByCategory(cat);
                const skillValues = catSkills.map(s => {
                    const sk = skillsObj[s];
                    return typeof sk === 'object' ? (sk.level || 1) : (sk || 1);
                });
                const translatedCatName = t(`math_ability.${cat}`);
                if (skillValues.length > 0) {
                    const sum = skillValues.reduce((a, b) => a + b, 0);
                    averages[translatedCatName] = sum / skillValues.length;
                } else {
                    averages[translatedCatName] = 1; // Default to Level 1
                }
            });
            return averages;
        }
        const targetSkills = getSkillsByCategory(selectedCategory.id);
        const filtered = {};

        // 1. Pre-populate with Category keys from taxonomy, defaulting to Level 1
        targetSkills.forEach(skillId => {
            const name = getMathSkillName(skillId, language);
            filtered[name] = 1 * 14.28; // Default Level 1 (scaled to 100)
        });

        // 2. Overwrite with actual user data if it exists
        targetSkills.forEach(skillId => {
            const val = skillsObj[skillId];
            if (val) {
                const name = getMathSkillName(skillId, language);
                const rawLevel = typeof val === 'object' ? (val.level || 1) : (val || 1);
                const cappedLevel = Math.min(rawLevel, 7);
                filtered[name] = cappedLevel * 14.28;
            }
        });
        return filtered;
    };

    const handleLearnSkill = (skillId) => {
        const skillsObj = masteryData?.microSkills || {};
        const currentLevel = skillsObj[skillId]?.level || 0;
        const recommendedLevel = calculateTier(currentLevel, true);
        const stats = getMasteryStats(currentLevel, false, true);
        navigate(`/maths/learn/${skillId}`, {
            state: { topic: skillId, level: recommendedLevel, xp: stats.xp }
        });
    };

    const displayData = getFilteredSkills();
    const strengths = masteryData?.microSkills || {};
    const previousDataRaw = historyData.length > 0 ? historyData[0].microSkills : null;

    const getProcessedHistory = () => {
        if (!previousDataRaw) return null;
        const processed = {};
        if (viewMode === 'mock') {
            ['algebra', 'geometry', 'data'].forEach(cat => {
                const catSkills = getSkillsByCategory(cat);
                const vals = catSkills.map(s => previousDataRaw[s]?.level || 0);
                const translatedCatName = t(`math_ability.${cat}`);
                const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
                processed[translatedCatName] = avg;
            });
        } else {
            const targetSkills = getSkillsByCategory(selectedCategory.id);
            targetSkills.forEach(skillId => {
                const name = getMathSkillName(skillId, language);
                const raw = previousDataRaw[skillId]?.level || 0;
                processed[name] = Math.min(raw, 7) * 14.28;
            });
        }
        return processed;
    };

    const previousData = getProcessedHistory();

    const getWeaknessSuggestions = () => {
        if (!masteryData?.microSkills) return [];
        const allSkills = Object.entries(masteryData.microSkills)
            .map(([skillId, data]) => ({
                skillId,
                level: data.level || 0,
                name: getMathSkillName(skillId, language)
            }))
            .filter(s => s.level < 5.5)
            .sort((a, b) => a.level - b.level);
        return allSkills.slice(0, 3).map(s => {
            let advice = "";
            if (s.level < 2) {
                advice = language === 'en' 
                    ? `Build your foundation in ${s.name}. Mastering the basics here is critical for DSE Section A.`
                    : `建立 ${s.name} 的基礎。這對 DSE 甲部題目至關重要。`;
            } else if (s.level < 4) {
                advice = language === 'en'
                    ? `Strengthen ${s.name} application. Focus on multi-step problems to reach Level 4 mastery.`
                    : `加強 ${s.name} 的應用。專注於多步運算題目以達到第 4 級水平。`;
            } else {
                advice = language === 'en'
                    ? `Polish ${s.name} for Section B. High accuracy here is key to unlocking Level 5 or above.`
                    : `精煉 ${s.name} 以應對乙部題目。高準確性是取得 5 級或以上成績的關鍵。`;
            }
            return { ...s, recommendedAction: advice };
        });
    };

    const weaknesses = getWeaknessSuggestions();

    const getTopGrowth = () => {
        if (!previousDataRaw || Object.keys(strengths).length === 0) return null;
        let topSkillId = null;
        let maxGrowth = -Infinity;
        Object.entries(strengths).forEach(([id, currentVal]) => {
            const prevVal = previousDataRaw[id];
            if (prevVal) {
                const growth = (currentVal.level || 0) - (prevVal.level || 0);
                if (growth > maxGrowth) {
                    maxGrowth = growth;
                    topSkillId = id;
                }
            }
        });
        if (!topSkillId || maxGrowth <= 0) return null;
        return {
            name: getMathSkillName(topSkillId, language),
            value: `+${Math.round((maxGrowth / 7) * 100)}% ${t('math_ability.since_last_check')}`
        };
    };

    const getPeakPerformance = () => {
        if (Object.keys(strengths).length === 0) return null;
        let peakSkillId = null;
        let maxLevel = -Infinity;
        Object.entries(strengths).forEach(([id, val]) => {
            const level = val.level || 0;
            if (level > maxLevel) {
                maxLevel = level;
                peakSkillId = id;
            }
        });
        if (!peakSkillId) return null;
        const level = strengths[peakSkillId].level || 1;
        const levelLabel = t(`math_ability.level_labels.${Math.floor(level)}`);
        return {
            name: getMathSkillName(peakSkillId, language),
            value: `${t('math_ability.level_prefix')}${levelLabel}`
        };
    };

    const topGrowth = getTopGrowth() || { name: '---', value: t('math_ability.complete_more_labs') };
    const peakPerf = getPeakPerformance() || { name: '---', value: t('math_ability.complete_more_labs') };
    const glossarySkills = viewMode === 'mock' ? [] : getSkillsByCategory(selectedCategory.id);

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-[#f15a24] font-black uppercase tracking-widest text-xs">
                            <Sparkles className="w-4 h-4" /> {t('math_ability.overview')}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            Math Ability <span className="text-[#f15a24]">Radar.</span>
                        </h1>
                        <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
                            {t('math_ability.description')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                        {/* Level 1 Navigation */}
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                            {[
                                { id: 'mock', name: t('math_ability.mock_exam_tab'), icon: Compass },
                                { id: 'practice', name: t('math_ability.practice_analysis_tab'), icon: TrendingUp }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setViewMode(tab.id);
                                        setShowGlossary(false);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${viewMode === tab.id
                                        ? 'bg-[#f15a24] text-white shadow-lg shadow-orange-200'
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
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setShowGlossary(false);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${selectedCategory.id === cat.id
                                            ? 'bg-white text-[#f15a24] shadow-sm'
                                            : 'text-slate-400 hover:text-slate-500'
                                        }`}
                                    >
                                        <cat.icon className="w-3.5 h-3.5" />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Stats & Recommendations */}
                    <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        {viewMode === 'mock' && (
                            <div className={`p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${mathsUnlocked ? 'bg-gradient-to-br from-[#f15a24] to-orange-700 shadow-orange-200' : 'bg-slate-800 shadow-slate-200'}`}>
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                            {mathsUnlocked ? <Trophy className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white/60" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-100 italic">
                                            {mathsUnlocked ? t('math_ability.overall_level') : t('mastery.prediction_locked')}
                                        </span>
                                    </div>

                                    {mathsUnlocked ? (
                                        <>
                                            <p className="text-7xl font-black tracking-tighter mb-4">
                                                {typeof (masteryData?.level) === 'number'
                                                    ? t(`math_ability.level_labels.${Math.floor(masteryData.level)}`)
                                                    : (masteryData?.level || '1')}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-white text-[#f15a24] rounded-full text-[10px] font-black uppercase">HKDSE</span>
                                                <span className="text-xs font-bold text-orange-100 opacity-80">{t('math_ability.estimated_grade')}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-slate-400 mb-4 leading-relaxed">
                                                Complete Paper 1 and Paper 2 Mock Exams to unlock your overall DSE grade prediction.
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'maths_p1', label: 'Paper 1', icon: Calculator },
                                                    { id: 'maths_p2', label: 'Paper 2', icon: BarChart3 }
                                                ].map(paper => {
                                                    const isDone = completedTypes.includes(paper.id);
                                                    return (
                                                        <div key={paper.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${isDone ? 'bg-orange-500/20 border-orange-500/30 text-orange-100' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                                            {isDone ? <Check className="w-3.5 h-3.5 text-orange-300" /> : <X className="w-3.5 h-3.5" />}
                                                            <span className="text-[10px] font-black uppercase tracking-wider">{paper.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button 
                                                onClick={() => navigate('/math-mock')}
                                                className="w-full mt-4 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-colors"
                                            >
                                                Go to Mock Center
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
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('math_ability.top_growth')}</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mb-1">{topGrowth.name}</p>
                                <p className="text-sm font-bold text-emerald-600">{topGrowth.value}</p>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-50 rounded-xl">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('math_ability.peak_performance')}</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 mb-1">{peakPerf.name}</p>
                                <p className="text-sm font-bold text-amber-600">{peakPerf.value}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-[#f15a24]" />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('math_ability.improvement_plan')}</h3>
                            </div>
                            <div className="space-y-4">
                                {weaknesses.length > 0 ? weaknesses.map((w, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleLearnSkill(w.skillId)}
                                        className="w-full text-left p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/5 transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <span className="text-sm font-black text-slate-900 group-hover:text-[#f15a24] transition-colors uppercase tracking-tight">{w.name}</span>
                                            <span className="text-[9px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-black uppercase border border-rose-100 whitespace-nowrap">Priority</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{w.recommendedAction}</p>
                                    </button>
                                )) : (
                                    <div className="py-12 text-center">
                                        <p className="text-sm text-slate-400 font-bold">{t('math_ability.no_plan')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visualization / Content */}
                    <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[600px] flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                        {/* Detail Controls */}
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
                                    <span>{t('math_ability.skill_glossary')}</span>
                                </button>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {loading ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-lg font-black text-slate-400 tracking-widest uppercase">Calculating Mastery...</p>
                                </div>
                            ) : showGlossary ? (
                                <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-amber-50 rounded-2xl">
                                            <Info className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900">{t('math_ability.skill_glossary')}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar">
                                        {glossarySkills.map(skillId => (
                                            <div key={skillId} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200/60 group hover:bg-white hover:border-indigo-300 transition-all shadow-sm">
                                                <h5 className="text-sm font-black text-indigo-600 flex items-center gap-2 mb-2">
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform" />
                                                    {getMathSkillName(skillId, language)}
                                                </h5>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                                    {getMathSkillDesc(skillId, language)}
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
                                            isOverview={viewMode === 'mock'}
                                            theme="light"
                                            color="#f15a24"
                                            rawSkills={masteryData?.microSkills}
                                    />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 mt-12 text-[11px] font-black uppercase tracking-[0.2em] z-10 p-5 bg-slate-50/50 border border-slate-100 rounded-3xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full bg-[#f15a24] ring-4 ring-orange-50 shadow-sm shadow-orange-200" />
                                            <span className="text-slate-900">
                                                {viewMode === 'mock' 
                                                    ? t('math_ability.mock_data_label') 
                                                    : t('math_ability.practice_data_label', { category: t(`math_ability.${selectedCategory.id}`) })
                                                }
                                            </span>
                                        </div>
                                        {previousDataRaw && viewMode === 'practice' && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-slate-50 shadow-sm" />
                                                <span className="text-slate-400">{t('math_ability.baseline')}</span>
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

export default MathsAbilityPage;
