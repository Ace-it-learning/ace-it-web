import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { Compass, Info, Award, TrendingUp, X, ChevronRight, Trophy, Calculator, Shapes, BarChart3, Zap, Lock } from 'lucide-react';
import MasteryRadar from './MasteryRadar';
import { getMathMastery, getMathHistory } from '../../services/mathMasteryService'; // New Service
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getMathSkillName, getMathSkillDesc, getSkillsByCategory } from '../../constants/mathMicroSkills';
import { useMockGate } from '../../hooks/useMockGate';
import { calculateTier, getMasteryStats, getMathMasteryPercentage } from '../../utils/masteryUtils';

const MathAbilityModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState({ id: 'Overview', name: t('math_ability.overview'), icon: Compass, color: 'text-cyan-400' });
    const [showGlossary, setShowGlossary] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const { mathsUnlocked } = useMockGate(user?.uid);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && user?.uid) {
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
    }, [isOpen, user?.uid]);

    // Categories parallel to Papers
    const CATEGORIES = [
        { id: 'Overview', name: t('math_ability.overview'), icon: Compass, color: 'text-cyan-400' },
        { id: 'algebra', name: t('math_ability.algebra'), icon: Calculator, color: 'text-blue-400' },
        { id: 'geometry', name: t('math_ability.geometry'), icon: Shapes, color: 'text-rose-400' },
        { id: 'data', name: t('math_ability.data_handling'), icon: BarChart3, color: 'text-emerald-400' }
    ];

    // Filter skills based on selected category
    const getFilteredSkills = () => {
        const skillsObj = masteryData?.microSkills || {};

        if (selectedCategory.id === 'Overview') {
            const categories = ['algebra', 'geometry', 'data'];
            const averages = {};

            categories.forEach(cat => {
                const catSkills = getSkillsByCategory(cat);
                const skillValues = catSkills.map(s => skillsObj[s]?.level || 0);
                const translatedCatName = t(`math_ability.${cat}`);

                if (skillValues.length > 0) {
                    // Use standardized linear percentage for consistency
                    averages[translatedCatName] = getMathMasteryPercentage(sum / skillValues.length);
                } else {
                    averages[translatedCatName] = 0;
                }
            });
            return averages;
        }

        // Specific Category
        const targetSkills = getSkillsByCategory(selectedCategory.id);
        const filtered = {};

        targetSkills.forEach(skillId => {
            const name = getMathSkillName(skillId, language);
            // Level is 0-7, Radar expects same scale for Overview=true
            // Wait, MasteryRadar calculates % if isOverview is false (fullMark 100)
            // But our Math levels are 0-7.
            // Let's pass raw 0-7 level and handle scaling in MasteryRadar?
            // Existing MasteryRadar logic: 
            // if isOverview (Overview tab): domain [0,7], tick labels 5**, etc.
            // else (Detail tabs): domain [0,100]
            // We should map 0-7 to 0-100 for detailed tabs? 
            // 7 = 100%, 1 = 14.28%

            // Logic match with existing MasteryModal:
            // "filtered[translatedName] = (val.level || val) * 14.28;"

            const rawLevel = skillsObj[skillId]?.level || 0;
            // Linear mapping (0-7 -> 0-100)
            filtered[name] = getMathMasteryPercentage(rawLevel);
        });

        return filtered;
    };

    const handleLearnSkill = (skillId) => {
        const skillsObj = masteryData?.microSkills || {};
        const currentLevel = skillsObj[skillId]?.level || 0;

        // Use shared logic for adaptive steering
        const recommendedLevel = calculateTier(currentLevel, true); // Cap at DSE in modal too
        const stats = getMasteryStats(currentLevel, false, true); // Cap at DSE for learning flow

        navigate(`/maths/learn/${skillId}`, {
            state: {
                topic: skillId,
                level: recommendedLevel,
                xp: stats.xp
            }
        });
        onClose();
    };

    const displayData = getFilteredSkills();
    const strengths = masteryData?.microSkills || {};
    // Extract previous data for Radar
    // We need to construct a similar object structure from historyData[0] (latest snapshot before current?)
    // Actually historyData[0] is usually the *latest* history entry. Ideally we want "baseline" which could be the first entry or the previous one.
    // Let's assume historyData[0] is the *previous* session snapshot.
    const previousDataRaw = historyData.length > 0 ? historyData[0].microSkills : null;

    // We need to process previousData same as current for the radar
    // But MasteryRadar expects 'historicalData' prop with same keys as 'data'
    // Let's preprocess historical data map
    const getProcessedHistory = () => {
        if (!previousDataRaw) return null;
        const processed = {};

        if (selectedCategory.id === 'Overview') {
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
                processed[name] = getMathMasteryPercentage(raw);
            });
        }
        return processed;
    };

    const previousData = getProcessedHistory();

    // REFINED LOGIC: Data-driven suggestions
    const getWeaknessSuggestions = () => {
        if (!masteryData?.microSkills) return [];

        const allSkills = Object.entries(masteryData.microSkills)
            .map(([skillId, data]) => ({
                skillId,
                level: data.level || 0,
                name: getMathSkillName(skillId, language)
            }))
            .filter(s => s.level < 5.5) // Focus on skills below Level 5*
            .sort((a, b) => a.level - b.level); // Weakest first

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

            return {
                ...s,
                recommendedAction: advice
            };
        });
    };

    const weaknesses = getWeaknessSuggestions();

    // Calculate Top Growth
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
        const pctGrowth = Math.round((maxGrowth / 7) * 100);
        return {
            name: getMathSkillName(topSkillId, language),
            value: `+${pctGrowth}% ${t('math_ability.since_last_check')}`
        };
    };

    // Calculate Peak Performance
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
        const level = strengths[peakSkillId].level;
        const levelLabel = typeof level === 'number'
            ? t(`math_ability.level_labels.${Math.floor(level)}`)
            : (level || '1');

        return {
            name: getMathSkillName(peakSkillId, language),
            value: `${t('math_ability.level_prefix')}${levelLabel}`
        };
    };

    const topGrowth = getTopGrowth() || { name: '---', value: t('math_ability.complete_more_labs') };
    const peakPerf = getPeakPerformance() || { name: '---', value: t('math_ability.complete_more_labs') };

    const glossarySkills = selectedCategory.id === 'Overview' ? [] : getSkillsByCategory(selectedCategory.id);

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="bg-white border border-slate-200 text-slate-900 shadow-2xl p-8 rounded-[2.5rem] relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <Compass className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-3xl font-black tracking-tight text-slate-900">
                                        {t('math_ability.title')}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-slate-500 font-medium text-sm">
                                        {t('math_ability.description')}
                                    </Dialog.Description>
                                </div>
                            </div>
                        </div>

                        {/* Navigation / Control Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex flex-wrap gap-2.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setShowGlossary(false);
                                        }}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 ${selectedCategory.id === cat.id
                                            ? 'bg-white shadow-md shadow-indigo-100/50 text-indigo-600 ring-1 ring-slate-200'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <cat.icon className={`w-4 h-4 ${selectedCategory.id === cat.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className="text-sm font-bold">{cat.name}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedCategory.id !== 'Overview' && (
                                <button
                                    onClick={() => setShowGlossary(!showGlossary)}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-all ${showGlossary
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
                                        }`}
                                >
                                    <Info className={`w-4 h-4 ${showGlossary ? 'text-amber-600' : 'text-slate-400'}`} />
                                    <span className="text-sm font-bold">{t('math_ability.skill_glossary')}</span>
                                </button>
                            )}
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Panel: Stats */}
                            <div className="space-y-4">
                                {selectedCategory.id === 'Overview' && (
                                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-500/5 transition-all animate-in fade-in slide-in-from-left-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-1.5 bg-indigo-600 rounded-lg">
                                                <Trophy className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-[11px] font-black text-indigo-900/60 uppercase tracking-[0.2em]">{t('math_ability.overall_level')}</span>
                                        </div>
                                        <p className="text-6xl font-black text-indigo-600 tracking-tighter">
                                            {mathsUnlocked
                                                ? (typeof (masteryData?.level) === 'number'
                                                    ? t(`math_ability.level_labels.${Math.floor(masteryData.level)}`)
                                                    : (masteryData?.level || '1'))
                                                : t('math_ability.not_available')}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2 font-bold flex items-center gap-2">
                                            {mathsUnlocked ? (
                                                <>
                                                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px]">HKDSE</span>
                                                    Estimated Grade
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-slate-300">
                                                    <Lock className="w-3.5 h-3.5" />
                                                    Complete Papers to unlock
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('math_ability.top_growth')}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{topGrowth.name}</p>
                                    <p className="text-xs font-bold text-emerald-600 mt-1">{topGrowth.value}</p>
                                </div>

                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('math_ability.peak_performance')}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{peakPerf.name}</p>
                                    <p className="text-xs font-bold text-amber-600 mt-1">{peakPerf.value}</p>
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">{t('math_ability.improvement_plan')}</h4>
                                    <div className="space-y-3">
                                        {weaknesses.length > 0 ? weaknesses.map((w) => (
                                            <button
                                                key={w.skillId}
                                                onClick={() => handleLearnSkill(w.skillId)}
                                                className="w-full text-left p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{getMathSkillName(w.skillId, language)}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold whitespace-nowrap border border-rose-100">
                                                        Priority
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                    {w.recommendedAction}
                                                </p>
                                            </button>
                                        )) : (
                                            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                                <p className="text-sm text-slate-300 font-bold">{t('math_ability.no_plan')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Radar / Glossary */}
                            <div className="md:col-span-2 bg-slate-50/40 rounded-[2rem] border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[520px]">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none" />
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/5 blur-[80px] pointer-events-none" />
                                
                                {loading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-slate-400">{t('math_ability.loading')}</p>
                                    </div>
                                ) : showGlossary ? (
                                    <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300 z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-amber-50 rounded-xl">
                                                <Info className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{t('math_ability.skill_glossary')}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                            {glossarySkills.map(skillId => (
                                                <div key={skillId} className="p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 group hover:border-indigo-300 transition-all shadow-sm">
                                                    <h5 className="text-sm font-black text-indigo-600 flex items-center gap-2 mb-2">
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                                                        {getMathSkillName(skillId, language)}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 font-medium leading-normal">
                                                        {getMathSkillDesc(skillId, language)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <MasteryRadar
                                            data={displayData}
                                            historicalData={selectedCategory.id === 'Overview' ? null : previousData}
                                            isOverview={selectedCategory.id === 'Overview'}
                                            theme="light"
                                        />
                                        <div className="flex gap-8 mt-8 text-[11px] font-black uppercase tracking-widest z-10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                                                <span className="text-slate-900">{t('math_ability.current')}</span>
                                            </div>
                                            {previousDataRaw && selectedCategory.id !== 'Overview' && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-3 h-3 rounded-full bg-slate-300 ring-4 ring-slate-50" />
                                                    <span className="text-slate-400">{t('math_ability.baseline')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
                                <Info className="w-4 h-4 text-indigo-300" />
                                <span>{t('math_ability.footer_info')}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-slate-200"
                            >
                                {t('math_ability.close')}
                            </button>
                        </div>

                        <Dialog.Close asChild>
                            <button
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors rounded-full p-2 bg-slate-50 hover:bg-slate-100 outline-none shadow-sm"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default MathAbilityModal;
