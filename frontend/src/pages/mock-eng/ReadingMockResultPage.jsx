import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, X as XIcon, Clock, ShieldCheck, AlertCircle, 
    Zap, Trophy, Target, BrainCircuit
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';

const ReadingMockResultPage = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { englishTutor } = useAvatar();
    
    const [result, setResult] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isMarkingSchemeOpen, setIsMarkingSchemeOpen] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            if (!resultId || !user) return;
            setIsFetching(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/results/${resultId}?uid=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setResult(data);
                } else {
                    console.error('[ReadingMockResult] Failed to fetch result');
                    navigate('/achievements');
                }
            } catch (fetchErr) {
                console.error('[ReadingMockResult] Error:', fetchErr);
                navigate('/achievements');
            } finally {
                setIsFetching(false);
            }
        };
        fetchResult();
    }, [resultId, user, navigate]);

    const assessmentResults = useMemo(() => result || {}, [result]);
    const mockData = useMemo(() => result?.mockSnapshot || {}, [result]);
    const selectedSection = result?.selectedSection;
    // userAnswers available for future detailed review expansion
    // const userAnswers = result?.userAnswers || {};

    const percentage = assessmentResults?.percentage || 0;
    const level = String(assessmentResults?.level || '1');
    const sectional = useMemo(() => ({
        A: assessmentResults?.sectionalScores?.A || { score: 0, possible: 0 },
        B: assessmentResults?.sectionalScores?.B || { score: 0, possible: 0 }
    }), [assessmentResults]);
    const analytics = useMemo(() => assessmentResults?.analytics || {}, [assessmentResults]);
    const skillScores = useMemo(() => assessmentResults?.skillScores || {}, [assessmentResults]);

    const formatSecs = (s) => {
        if (typeof s !== 'number' || isNaN(s)) return '0m 0s';
        return `${Math.floor(s / 60)}m ${s % 60}s`;
    };

    const getTacticalVerdict = useMemo(() => {
        const analysis = {
            holistic: "",
            time: { status: 'neutral', comment: "" },
            skills: { status: 'neutral', comment: "" },
            nextSteps: []
        };

        if (level.includes('5')) {
            analysis.holistic = "Exceptional performance. You demonstrate the 'Global Native' proficiency level required for top-tier university entrance.";
        } else if (level === '4') {
            analysis.holistic = "Competent performance. You have a solid grasp of the passage but are losing marks on nuanced inference and precise extraction.";
        } else {
            analysis.holistic = "Developing proficiency. Focus on literal comprehension and basic reference skills before tackling complex interpretation.";
        }

        const aTime = analytics.sectionTimes?.A || 0;
        const bTime = analytics.sectionTimes?.B || 0;
        const totalTime = aTime + bTime;

        if (aTime > 45 * 60) {
            analysis.time.status = 'warning';
            analysis.time.comment = `Pacing Issue: You spent ${Math.floor(aTime/60)}m on Part A. In a high-stakes DSE environment, this leaves insufficient time for the complex 'deep reading' required for Part B2.`;
            analysis.nextSteps.push("Practice 'Skimming for Gist' in Part A to cut your time down to 40 mins.");
        } else if (totalTime < 30 * 60 && percentage < 80) {
            analysis.time.status = 'caution';
            analysis.time.comment = "Rush Detected: You finished very early but missed several 'careless' marks. Professional examiners look for precision over speed.";
            analysis.nextSteps.push("Use the extra time to verify 'Linked Justification' in T/F/NG questions.");
        } else {
            analysis.time.status = 'success';
            analysis.time.comment = "Optimal Pacing: Your distribution between A and B reflects a mature exam strategy.";
        }

        let lowestSkill = { label: '', pct: 100 };
        Object.entries(skillScores).forEach(([label, stats]) => {
            const pct = stats.possible > 0 ? (stats.score / stats.possible) * 100 : 100;
            if (pct < lowestSkill.pct) lowestSkill = { label, pct };
        });

        if (lowestSkill.label && lowestSkill.pct < 70) {
            analysis.skills.status = 'warning';
            analysis.skills.comment = `Skill Gap: '${lowestSkill.label}' is your primary point leakage. This skill requires you to look beyond the text for authorial intent.`;
            analysis.nextSteps.push(`Review the 'Examiner's Note' for all ${lowestSkill.label} questions in this paper.`);
        } else {
            analysis.skills.status = 'success';
            analysis.skills.comment = "Balanced Skillset: No major weak points detected across micro-skill categories.";
        }

        if (selectedSection === 'B1' && level === '4' && percentage >= 80) {
            analysis.nextSteps.push("You've maxed out Part B1. Your next mock MUST be Part B2 to unlock the Level 5 range.");
        }

        if (mockData?.meta?.topic?.toLowerCase().includes('hustle culture') && selectedSection === 'B2') {
            const b2Score = sectional.B.score;
            const b2Possible = sectional.B.possible;
            const b2Pct = b2Possible > 0 ? (b2Score / b2Possible) * 100 : 0;
            if (b2Pct < 50) {
                analysis.directorNote = "Part B2 was based on Byung-Chul Han's philosophy. It's normal to find this level of abstract language challenging. Let's focus on identifying his 'Keywords' like self-exploitation and hyper-attention next time.";
            }
        }

        return analysis;
    }, [level, percentage, analytics, skillScores, selectedSection, sectional, mockData]);

    if (isFetching) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f1f5f9]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Mock Report...</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col p-8 selection:bg-indigo-100">
            <nav className="max-w-7xl w-full mx-auto flex justify-between items-center mb-10">
                <button onClick={() => navigate('/achievements')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} />
                    Back to Achievements
                </button>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate Report</p>
                        <p className="text-base font-bold text-slate-700">{user?.displayName || 'Student'}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-500 shadow-sm">
                            {new Date(result.timestamp || Date.now()).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl w-full mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Grade Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white relative"
                    >
                        <div className="p-12">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Mock Score Report</h1>
                                    <p className="text-slate-400 font-medium">Standardized HKEAA Paper 1 Assessment</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className={`text-6xl font-black italic-none ${level.includes('5') ? 'text-indigo-600' : 'text-slate-900'} flex flex-col items-end`}>
                                        {level}
                                        {selectedSection === 'B1' && level === '4' && (
                                            <span className="mt-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-amber-100 shadow-sm">
                                                B1 Level Cap
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Awarded Grade</p>
                                    {assessmentResults.xpAwarded !== undefined && (
                                        <motion.div 
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-sm"
                                        >
                                            <Zap size={14} className="fill-amber-500 text-amber-500" />
                                            <span className="text-xs font-black uppercase tracking-tight">+{assessmentResults.xpAwarded} XP Earned</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">DSE Grade Boundary Scale</span>
                                    <span className="text-xs font-black text-slate-900">{Math.round(percentage)}% Accuracy</span>
                                </div>
                                <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Level 1</span>
                                    <span>Level 2</span>
                                    <span>Level 3</span>
                                    <span>Level 4</span>
                                    <span>Level 5</span>
                                    <span>5*</span>
                                    <span>5**</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Part A Score</p>
                                    <p className="text-3xl font-black text-slate-900">{sectional.A.score}<span className="text-lg text-slate-400">/{sectional.A.possible}</span></p>
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Part B Score</p>
                                    <p className="text-3xl font-black text-slate-900">{sectional.B.score}<span className="text-lg text-slate-400">/{sectional.B.possible}</span></p>
                                    {selectedSection && (
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{selectedSection}</p>
                                    )}
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Efficiency</p>
                                    <p className="text-3xl font-black text-slate-900">{formatSecs(analytics.sectionTimes?.A || 0)}</p>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Part A Duration</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Skill Mastery */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Target size={20} />
                            </div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Skill Mastery</h3>
                        </div>
                        <div className="space-y-5">
                            {Object.entries(skillScores).map(([skill, stats]) => {
                                const possible = stats?.possible || 0;
                                const score = stats?.score || 0;
                                const pct = possible > 0 ? (score / possible) * 100 : 0;
                                return (
                                    <div key={skill} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            <span>{skill}</span>
                                            <span className="text-slate-900">{Math.round(pct)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${pct > 75 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center italic-none">Top Performance Area</p>
                            <div className="flex justify-center">
                                {(() => {
                                    const entries = Object.entries(skillScores);
                                    const best = entries.length > 0 ? entries.sort((a,b) => ((b[1].score/b[1].possible)||0) - ((a[1].score/a[1].possible)||0))[0] : null;
                                    return (
                                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm">
                                            {best?.[0] || 'Standard Reading'}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>

                    {/* Miss Janie's Analysis */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-indigo-50 p-10 rounded-[3.5rem] border border-indigo-100 relative overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} alt={englishTutor?.name || "Janie"} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">{englishTutor?.name || "Miss Janie"}'s Analysis</h3>
                                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest italic-none">Pedagogical Specialist</p>
                            </div>
                        </div>
                        <div className="space-y-6 flex-1 relative z-10">
                            <div>
                                <p className="text-base font-bold text-slate-800 leading-relaxed italic">
                                    "{getTacticalVerdict.holistic}"
                                </p>
                            </div>
                            {getTacticalVerdict.directorNote && (
                                <div className="p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-200 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <BrainCircuit size={80} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Director's Note</p>
                                    <p className="text-sm font-bold leading-relaxed relative z-10">{getTacticalVerdict.directorNote}</p>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="p-5 bg-white/60 rounded-3xl border border-white/40 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <div className={`size-2.5 rounded-full ${getTacticalVerdict.time.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Time Strategy</span>
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-600 leading-relaxed">{getTacticalVerdict.time.comment}</p>
                                </div>
                                <div className="p-5 bg-white/60 rounded-3xl border border-white/40 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <div className={`size-2.5 rounded-full ${getTacticalVerdict.skills.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Skill Focus</span>
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-600 leading-relaxed">{getTacticalVerdict.skills.comment}</p>
                                </div>
                            </div>
                            <div className="pt-4">
                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Improvement Roadmap</p>
                                <ul className="space-y-3">
                                    {getTacticalVerdict.nextSteps.map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-snug">
                                            <div className="mt-1.5 size-1.5 bg-indigo-400 rounded-full shrink-0 shadow-sm" />
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex justify-center gap-6 pt-12 pb-20">
                    <button onClick={() => setIsMarkingSchemeOpen(true)} className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <ShieldCheck size={16} /> Marking Scheme
                    </button>
                </div>
            </main>

            {/* Marking Scheme Modal */}
            <AnimatePresence>
                {isMarkingSchemeOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsMarkingSchemeOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden border border-white/20"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 text-white rounded-2xl"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">HKEAA Marking Criteria</h2>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic-none">{mockData?.meta?.topic}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsMarkingSchemeOpen(false)} className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-colors shadow-sm">
                                    <XIcon size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900">
                                            <th className="py-4 px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest w-[120px]">Question</th>
                                            <th className="py-4 px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Correct Answer</th>
                                            <th className="py-4 px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest w-[35%]">Marking Logic</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            ...(mockData?.Part_A?.questions || []),
                                            ...(mockData?.Part_B1?.questions || []),
                                            ...(mockData?.Part_B2?.questions || [])
                                        ].map((q, idx) => (
                                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-6 px-4 align-top">
                                                    <span className="text-sm font-black text-slate-900">Q{idx + 1}</span>
                                                    <span className="text-[11px] font-black text-indigo-500 uppercase block">({q.marks} Marks)</span>
                                                </td>
                                                <td className="py-6 px-4 align-top text-sm font-bold text-slate-700">
                                                    {q.marking_scheme || "Refer to passage context."}
                                                </td>
                                                <td className="py-6 px-4 align-top border-l border-slate-50 bg-slate-50/30 text-[11px] text-slate-500">
                                                    {q.marking_logic?.notes || "Standard marking applies."}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReadingMockResultPage;
