import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Compass, Info, Award, TrendingUp, X, ChevronRight, Trophy, Calculator, Shapes, BarChart3 } from 'lucide-react';
import MasteryRadar from './MasteryRadar';
import { getMathMastery, getMathHistory } from '../../services/mathMasteryService'; // New Service
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getMathSkillName, getMathSkillDesc, getSkillsByCategory } from '../../constants/mathMicroSkills';

const MathAbilityModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState({ id: 'Overview', name: t('math_ability.overview'), icon: Compass, color: 'text-cyan-400' });
    const [showGlossary, setShowGlossary] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
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
                    const sum = skillValues.reduce((a, b) => a + b, 0);
                    // Avoid division by zero, though unlikely with hardcoded categories
                    const count = skillValues.filter(v => v > 0).length || 1;
                    // Use simple average of all skills for category overview
                    averages[translatedCatName] = sum / skillValues.length;
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
            // Cap at 7
            const cappedLevel = Math.min(rawLevel, 7);
            filtered[name] = cappedLevel * 14.28;
        });

        return filtered;
    };

    const handleStartSkillChat = (skillId) => {
        const skillName = getMathSkillName(skillId, language);
        const message = `I want to improve on "${skillName}" in Mathematics. Can you give me some practice questions or explain the key concepts?`;

        const event = new CustomEvent('start-ai-chat', {
            detail: { message, skillId, agent: 'math' } // Specify agent!
        });
        window.dispatchEvent(event);
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
                processed[name] = Math.min(raw, 7) * 14.28;
            });
        }
        return processed;
    };

    const previousData = getProcessedHistory();

    const weaknesses = masteryData?.weaknessPriority || [];

    // Calculate Top Growth
    const getTopGrowth = () => {
        if (!previousDataRaw || Object.keys(strengths).length === 0) return null;
        let topSkillId = null;
        let maxGrowth = -Infinity;

        Object.entries(strengths).forEach(([id, currentVal]) => {
            const prevVal = previousDataRaw[id];
            if (prevVal) {
                const growth = currentVal.level - prevVal.level;
                if (growth > maxGrowth) {
                    maxGrowth = growth;
                    topSkillId = id;
                }
            }
        });

        if (!topSkillId || maxGrowth <= 0) return null;
        // Convert growth (0-7 scale) to percentage for display? Or keep as levels?
        // English version shows percentage increase.
        // Let's show Level increase e.g. "+1.5 Levels"
        // Or convert to %: (growth / 7) * 100
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
            if (val.level > maxLevel) {
                maxLevel = val.level;
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

    // Glossary skills
    const glossarySkills = selectedCategory.id === 'Overview'
        ? []
        : getSkillsByCategory(selectedCategory.id);

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-6 rounded-3xl relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Compass className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                                        {t('math_ability.title')}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-slate-400 italic text-xs">
                                        {t('math_ability.description')}
                                    </Dialog.Description>
                                </div>
                            </div>
                        </div>

                        {/* Navigation / Control Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setShowGlossary(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${selectedCategory.id === cat.id
                                            ? `bg-indigo-500/20 border-indigo-500/50 ${cat.color}` // Use category color if selected? Or uniform? Let's use uniform active style or dynamic
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            } ${selectedCategory.id === cat.id ? 'text-indigo-400' : ''}`}
                                    >
                                        <cat.icon className={`w-3.5 h-3.5 ${selectedCategory.id === cat.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                                        <span className="text-xs font-medium">{cat.name}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedCategory.id !== 'Overview' && (
                                <button
                                    onClick={() => setShowGlossary(!showGlossary)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${showGlossary
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <Info className={`w-3.5 h-3.5 ${showGlossary ? 'text-amber-400' : 'text-slate-500'}`} />
                                    <span className="text-xs font-medium">{t('math_ability.skill_glossary')}</span>
                                </button>
                            )}
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Panel: Stats */}
                            <div className="space-y-3">
                                {selectedCategory.id === 'Overview' && (
                                    <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/5 transition-all animate-in fade-in slide-in-from-left-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Trophy className="w-4 h-4 text-indigo-400" />
                                            <span className="text-xs font-bold text-indigo-100/80 uppercase tracking-widest">{t('math_ability.overall_level')}</span>
                                        </div>
                                        <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                            {typeof (masteryData?.level) === 'number'
                                                ? t(`math_ability.level_labels.${Math.floor(masteryData.level)}`)
                                                : (masteryData?.level || '1')}
                                        </p>
                                        <p className="text-[10px] text-indigo-400/80 mt-1 font-medium italic">HKDSE Equivalent Grade</p>
                                    </div>
                                )}

                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-xs font-medium text-slate-300">{t('math_ability.top_growth')}</span>
                                    </div>
                                    <p className="text-base font-bold text-white">{topGrowth.name}</p>
                                    <p className="text-[10px] text-slate-500">{topGrowth.value}</p>
                                </div>

                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-xs font-medium text-slate-300">{t('math_ability.peak_performance')}</span>
                                    </div>
                                    <p className="text-base font-bold text-white">{peakPerf.name}</p>
                                    <p className="text-[10px] text-slate-500">{peakPerf.value}</p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('math_ability.improvement_plan')}</h4>
                                    <div className="space-y-2">
                                        {weaknesses.length > 0 ? weaknesses.map((w) => (
                                            <button
                                                key={w.skillId}
                                                onClick={() => handleStartSkillChat(w.skillId)}
                                                className="w-full text-left p-2.5 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-1 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{getMathSkillName(w.skillId, language)}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                                                        {t('math_ability.priority_tag')}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-2">
                                                    {w.recommendedAction}
                                                </p>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl">
                                                <p className="text-xs text-slate-600">{t('math_ability.no_plan')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Radar / Glossary */}
                            <div className="md:col-span-2 bg-slate-950/50 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[480px]">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
                                {loading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-slate-400">{t('math_ability.loading')}</p>
                                    </div>
                                ) : showGlossary ? (
                                    <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Info className="w-4 h-4 text-amber-400" />
                                            <h3 className="text-lg font-bold text-white">{t('math_ability.skill_glossary')}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                            {glossarySkills.map(skillId => (
                                                <div key={skillId} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 group hover:border-indigo-500/30 transition-all">
                                                    <h5 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-1">
                                                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                                        {getMathSkillName(skillId, language)}
                                                    </h5>
                                                    <p className="text-[11px] text-slate-400 leading-tight">
                                                        {getMathSkillDesc(skillId, language)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* REUSING MASTERY RADAR */}
                                        <MasteryRadar
                                            data={displayData}
                                            historicalData={selectedCategory.id === 'Overview' ? null : previousData}
                                            isOverview={selectedCategory.id === 'Overview'}
                                        />
                                        <div className="flex gap-6 mt-4 text-[10px] font-medium uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                                                <span className="text-slate-300">{t('math_ability.current')}</span>
                                            </div>
                                            {previousDataRaw && selectedCategory.id !== 'Overview' && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                                    <span className="text-slate-500">{t('math_ability.baseline')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Info className="w-3 h-3" />
                                <span>{t('math_ability.footer_info')}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all"
                            >
                                {t('math_ability.close')}
                            </button>
                        </div>

                        <Dialog.Close asChild>
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-white/5 outline-none"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default MathAbilityModal;
