import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Compass, Info, Award, TrendingUp, X, BookOpen, PenTool, Headphones, Mic, ChevronRight, Trophy, Lock } from 'lucide-react';
import MasteryRadar from './MasteryRadar';
import { getUserMastery, getMasteryHistory } from '../../services/masteryService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMockGate } from '../../hooks/useMockGate';
import { getSkillName, getSkillDesc, getSkillsByPaper } from '../../constants/microSkills';

const MasteryModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [selectedPaper, setSelectedPaper] = useState('Overview');
    const [showGlossary, setShowGlossary] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { englishUnlocked } = useMockGate(user?.uid);
    useEffect(() => {
        if (isOpen && user?.uid) {
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
    }, [isOpen, user?.uid]);

    const PAPERS = [
        { id: 'Overview', name: t('mastery.overview'), icon: Compass, color: 'text-cyan-400' },
        { id: 'Reading', name: t('mastery.reading'), icon: BookOpen, color: 'text-blue-400' },
        { id: 'Writing', name: t('mastery.writing'), icon: PenTool, color: 'text-rose-400' },
        { id: 'Listening', name: t('mastery.listening'), icon: Headphones, color: 'text-amber-400' },
        { id: 'Speaking', name: t('mastery.speaking'), icon: Mic, color: 'text-emerald-400' }
    ];

    // Filter skills based on selected paper
    const getFilteredSkills = () => {
        const skillsObj = masteryData?.microSkills || {};
        if (selectedPaper === 'Overview') {
            const papers = ['reading', 'writing', 'listening', 'speaking'];
            const averages = {};
            papers.forEach(p => {
                const paperSkills = Object.entries(skillsObj)
                    .filter(([key]) => key.toLowerCase().startsWith(p))
                    .map(([, val]) => val.level || val);

                const translatedPaperName = t(`mastery.${p}`);
                if (paperSkills.length > 0) {
                    averages[translatedPaperName] =
                        paperSkills.reduce((a, b) => a + b, 0) / paperSkills.length;
                } else {
                    averages[translatedPaperName] = 0; // Always show all 4 papers
                }
            });
            return averages;
        }

        const paperPrefix = selectedPaper.toLowerCase();
        const filtered = {};

        // iterate over ALL defined skills for this paper, not just what the user has progress in
        const allSkillIds = getSkillsByPaper(paperPrefix);

        allSkillIds.forEach(skillId => {
            const translatedName = getSkillName(skillId, language);
            const val = skillsObj[skillId];

            // If user has progress, use it. Otherwise 0.
            let level = 0;
            if (val) {
                level = (typeof val === 'object' ? val.level : val) || 0;
            }

            filtered[translatedName] = level * 14.28; // Scale 0-7 to 0-100%
        });

        return filtered;
    };

    const handleStartSkillChat = (skillId) => {
        const skillName = getSkillName(skillId, language);
        const message = `I want to work on my "${skillName}" skills. Can you suggest a study plan or some practice labs?`;

        // Custom event or context update to trigger chat
        // For now, we'll use a window event that Dashboard.jsx or Sidebar.jsx can listen to
        const event = new CustomEvent('start-ai-chat', {
            detail: { message, skillId }
        });
        window.dispatchEvent(event);
        onClose(); // Close modal to show chat
    };

    const displayData = getFilteredSkills();
    const strengths = masteryData?.microSkills || {};
    const previousData = historyData.length > 0 ? historyData[0].microSkills : null;

    // REFINED LOGIC: Data-driven suggestions for English
    const getWeaknessSuggestions = () => {
        if (!masteryData?.microSkills) return [];

        const allSkills = Object.entries(masteryData.microSkills)
            .map(([skillId, data]) => ({
                skillId,
                level: typeof data === 'object' ? (data.level || 0) : (data || 0),
                name: getSkillName(skillId, language)
            }))
            .filter(s => s.level < 5.5) // Focus on skills below Level 5*
            .sort((a, b) => a.level - b.level); // Weakest first

        return allSkills.slice(0, 3).map(s => {
            let advice = "";
            if (s.level < 2) {
                advice = language === 'en'
                    ? `Focus on the core mechanics of ${s.name}. Stability is key for passing the threshold.`
                    : `專注於 ${s.name} 的核心技巧。穩定性是達標的關鍵。`;
            } else if (s.level < 4) {
                advice = language === 'en'
                    ? `Develop your complexity in ${s.name}. Consistent practice will push you toward Level 4.`
                    : `提升 ${s.name} 的複雜度。持續練習將助你達到 4 級。`;
            } else {
                advice = language === 'en'
                    ? `Refine your nuances in ${s.name}. Attention to detail is what defines a Level 5* student.`
                    : `磨練 ${s.name} 的細節。對細節的把握是 5* 級學生的特徵。`;
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
        if (!previousData || Object.keys(strengths).length === 0) return null;
        let topSkill = null;
        let maxGrowth = -Infinity;

        Object.entries(strengths).forEach(([id, currentVal]) => {
            const prevVal = previousData[id];
            if (prevVal !== undefined) {
                const current = currentVal.level || currentVal;
                const prev = prevVal.level || prevVal;
                const growth = current - prev;
                if (growth > maxGrowth) {
                    maxGrowth = growth;
                    topSkill = id;
                }
            }
        });

        if (!topSkill || maxGrowth <= 0) return null;
        return {
            name: getSkillName(topSkill, language),
            value: `+${Math.round(maxGrowth * 14.28)}% ${t('mastery.since_last_check')}`
        };
    };

    // Calculate Peak Performance
    const getPeakPerformance = () => {
        if (Object.keys(strengths).length === 0) return null;
        let peakSkill = null;
        let maxLevel = -Infinity;

        Object.entries(strengths).forEach(([id, val]) => {
            const level = val.level || val;
            if (level > maxLevel) {
                maxLevel = level;
                peakSkill = id;
            }
        });

        if (!peakSkill) return null;
        const levelData = strengths[peakSkill];
        const level = typeof levelData === 'object' ? (levelData.level || 0) : (levelData || 0);

        return {
            name: getSkillName(peakSkill, language),
            value: `${t('mastery.level_prefix')}${t(`mastery.level_labels.${Math.floor(Number(level))}`)}`
        };
    };

    const topGrowth = getTopGrowth() || { name: '---', value: t('mastery.complete_more_labs') };
    const peakPerf = getPeakPerformance() || { name: '---', value: t('mastery.complete_more_labs') };

    // Map skill IDs for glossary
    const glossarySkills = selectedPaper === 'Overview'
        ? []
        : getSkillsByPaper(selectedPaper.toLowerCase());

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="bg-white border border-slate-200 text-slate-900 shadow-2xl p-8 rounded-[2.5rem] relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-50 rounded-2xl">
                                    <Compass className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-3xl font-black tracking-tight text-slate-900">
                                        {t('mastery.title')}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-slate-500 font-medium text-sm">
                                        {t('mastery.description')}
                                    </Dialog.Description>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex flex-wrap gap-2.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                {PAPERS.map(paper => (
                                    <button
                                        key={paper.id}
                                        onClick={() => {
                                            setSelectedPaper(paper.id);
                                            setShowGlossary(false);
                                        }}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 ${selectedPaper === paper.id
                                            ? 'bg-white shadow-md shadow-cyan-100/50 text-cyan-600 ring-1 ring-slate-200'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <paper.icon className={`w-4 h-4 ${selectedPaper === paper.id ? 'text-cyan-600' : 'text-slate-400'}`} />
                                        <span className="text-sm font-bold">{paper.name}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedPaper !== 'Overview' && (
                                <button
                                    onClick={() => setShowGlossary(!showGlossary)}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-all ${showGlossary
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
                                        }`}
                                >
                                    <Info className={`w-4 h-4 ${showGlossary ? 'text-amber-600' : 'text-slate-400'}`} />
                                    <span className="text-sm font-bold">{t('mastery.skill_glossary')}</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                {selectedPaper === 'Overview' && (
                                    <div className="p-6 bg-gradient-to-br from-cyan-50 to-white rounded-3xl border border-cyan-100 shadow-xl shadow-cyan-500/5 transition-all animate-in fade-in slide-in-from-left-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-1.5 bg-cyan-600 rounded-lg">
                                                <Trophy className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-[11px] font-black text-cyan-900/60 uppercase tracking-[0.2em]">{t('mastery.overall_level')}</span>
                                        </div>
                                        <p className="text-6xl font-black text-cyan-600 tracking-tighter">
                                            {t(`mastery.level_labels.${Math.floor(Number(masteryData?.level || 0))}`)}
                                        </p>
                                        {englishUnlocked ? (
                                            <p className="text-xs text-slate-400 mt-2 font-bold flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-cyan-600 text-white rounded-md text-[10px]">HKDSE</span>
                                                Estimated Grade
                                            </p>
                                        ) : (
                                            <div className="flex items-center gap-1.5 mt-2 text-slate-300 text-xs font-bold">
                                                <Lock className="w-3.5 h-3.5" />
                                                <span>Unlock DSE Grade via Mock Papers</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('mastery.top_growth')}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{topGrowth.name}</p>
                                    <p className="text-xs font-bold text-emerald-600 mt-1">{topGrowth.value}</p>
                                </div>

                                <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('mastery.peak_performance')}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{peakPerf.name}</p>
                                    <p className="text-xs font-bold text-amber-600 mt-1">{peakPerf.value}</p>
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">{t('mastery.improvement_plan')}</h4>
                                    <div className="space-y-3">
                                        {weaknesses.length > 0 ? weaknesses.map((w) => (
                                            <button
                                                key={w.skillId}
                                                onClick={() => handleStartSkillChat(w.skillId)}
                                                className="w-full text-left p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/5 transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <span className="text-sm font-black text-slate-900 group-hover:text-cyan-600 subtitle-caps truncate uppercase tracking-tight">{getSkillName(w.skillId, language)}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold whitespace-nowrap border border-rose-100">
                                                        Priority
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                                                    {w.recommendedAction}
                                                </p>
                                            </button>
                                        )) : (
                                            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                                <p className="text-sm text-slate-300 font-bold">{t('mastery.no_plan')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-slate-50/40 rounded-[2rem] border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[520px]">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[80px] pointer-events-none" />
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />
                                
                                {loading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-slate-400">{t('mastery.loading')}</p>
                                    </div>
                                ) : showGlossary ? (
                                    <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300 z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-amber-50 rounded-xl">
                                                <Info className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{t('mastery.skill_glossary')}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                            {glossarySkills.map(skillId => (
                                                <div key={skillId} className="p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 group hover:border-cyan-300 transition-all shadow-sm">
                                                    <h5 className="text-sm font-black text-cyan-600 flex items-center gap-2 mb-2">
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 transition-transform group-hover:translate-x-0.5" />
                                                        {getSkillName(skillId, language)}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 font-medium leading-normal">
                                                        {getSkillDesc(skillId, language)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <MasteryRadar
                                            data={displayData}
                                            historicalData={selectedPaper === 'Overview' ? null : previousData}
                                            isOverview={selectedPaper === 'Overview'}
                                            theme="light"
                                        />
                                        <div className="flex gap-8 mt-8 text-[11px] font-black uppercase tracking-widest z-10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-cyan-50" />
                                                <span className="text-slate-900">{t('mastery.current')}</span>
                                            </div>
                                            {previousData && (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-3 h-3 rounded-full bg-slate-300 ring-4 ring-slate-50" />
                                                    <span className="text-slate-400">{t('mastery.baseline')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
                                <Info className="w-4 h-4 text-cyan-300" />
                                <span>{t('mastery.footer_info')}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-slate-200"
                            >
                                {t('mastery.close')}
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

export default MasteryModal;
