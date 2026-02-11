import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Compass, Info, Award, TrendingUp, X, BookOpen, PenTool, Headphones, Mic, ChevronRight, Trophy } from 'lucide-react';
import MasteryRadar from './MasteryRadar';
import { getUserMastery, getMasteryHistory } from '../../services/masteryService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getSkillName, getSkillDesc, getSkillsByPaper } from '../../constants/microSkills';

const MasteryModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [selectedPaper, setSelectedPaper] = useState('Overview');
    const [showGlossary, setShowGlossary] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

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
        Object.entries(skillsObj)
            .filter(([key]) => key.toLowerCase().startsWith(paperPrefix))
            .forEach(([key, val]) => {
                const translatedName = getSkillName(key, language);
                filtered[translatedName] = (val.level || val) * 14.28;
            });

        // If specific paper has no skills data but we want to show empty radar
        if (Object.keys(filtered).length === 0 && selectedPaper !== 'Overview') {
            const defaultSkills = getSkillsByPaper(paperPrefix);
            defaultSkills.forEach(skillId => {
                filtered[getSkillName(skillId, language)] = 0;
            });
        }

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
    const weaknesses = masteryData?.weaknessPriority?.slice(0, 3) || [];

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
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-6 rounded-3xl relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <Compass className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                        {t('mastery.title')}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-slate-400 italic text-xs">
                                        {t('mastery.description')}
                                    </Dialog.Description>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex flex-wrap gap-2">
                                {PAPERS.map(paper => (
                                    <button
                                        key={paper.id}
                                        onClick={() => {
                                            setSelectedPaper(paper.id);
                                            setShowGlossary(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${selectedPaper === paper.id
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <paper.icon className={`w-3.5 h-3.5 ${selectedPaper === paper.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                                        <span className="text-xs font-medium">{paper.name}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedPaper !== 'Overview' && (
                                <button
                                    onClick={() => setShowGlossary(!showGlossary)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${showGlossary
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <Info className={`w-3.5 h-3.5 ${showGlossary ? 'text-amber-400' : 'text-slate-500'}`} />
                                    <span className="text-xs font-medium">{t('mastery.skill_glossary')}</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                {selectedPaper === 'Overview' && (
                                    <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/5 transition-all animate-in fade-in slide-in-from-left-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Trophy className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs font-bold text-cyan-100/80 uppercase tracking-widest">{t('mastery.overall_level')}</span>
                                        </div>
                                        <p className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                            {t(`mastery.level_labels.${Math.floor(Number(masteryData?.level || 0))}`)}
                                        </p>
                                        <p className="text-[10px] text-cyan-400/80 mt-1 font-medium italic">HKDSE Equivalent Grade</p>
                                    </div>
                                )}

                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-xs font-medium text-slate-300">{t('mastery.top_growth')}</span>
                                    </div>
                                    <p className="text-base font-bold text-white">{topGrowth.name}</p>
                                    <p className="text-[10px] text-slate-500">{topGrowth.value}</p>
                                </div>

                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="text-xs font-medium text-slate-300">{t('mastery.peak_performance')}</span>
                                    </div>
                                    <p className="text-base font-bold text-white">{peakPerf.name}</p>
                                    <p className="text-[10px] text-slate-500">{peakPerf.value}</p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('mastery.improvement_plan')}</h4>
                                    <div className="space-y-2">
                                        {weaknesses.length > 0 ? weaknesses.map((w) => (
                                            <button
                                                key={w.skillId}
                                                onClick={() => handleStartSkillChat(w.skillId)}
                                                className="w-full text-left p-2.5 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-1 hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{getSkillName(w.skillId, language)}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                                                        {t('mastery.priority_tag')}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-2">
                                                    {w.recommendedAction}
                                                </p>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl">
                                                <p className="text-xs text-slate-600">{t('mastery.no_plan')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-slate-950/50 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[480px]">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
                                {loading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-slate-400">{t('mastery.loading')}</p>
                                    </div>
                                ) : showGlossary ? (
                                    <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Info className="w-4 h-4 text-amber-400" />
                                            <h3 className="text-lg font-bold text-white">{t('mastery.skill_glossary')}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                            {glossarySkills.map(skillId => (
                                                <div key={skillId} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 group hover:border-cyan-500/30 transition-all">
                                                    <h5 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-1">
                                                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                                        {getSkillName(skillId, language)}
                                                    </h5>
                                                    <p className="text-[11px] text-slate-400 leading-tight">
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
                                        />
                                        <div className="flex gap-6 mt-4 text-[10px] font-medium uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                                <span className="text-slate-300">{t('mastery.current')}</span>
                                            </div>
                                            {previousData && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                                    <span className="text-slate-500">{t('mastery.baseline')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Info className="w-3 h-3" />
                                <span>{t('mastery.footer_info')}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all"
                            >
                                {t('mastery.close')}
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

export default MasteryModal;
