import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ChevronRight, Trophy, Star, BarChart3, 
    BookOpen, Sparkles, Target, Info, ClipboardList, 
    PenTool, Layout, ShieldCheck, CheckCircle2, 
    AlertCircle, GraduationCap, Zap
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';

const ListeningMockResultPage = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { englishTutor } = useAvatar();
    // Reference englishTutor in JSX to avoid unused var warning
    const tutorName = englishTutor?.name || 'Miss Janie';
    const tutorAvatar = englishTutor?.avatar || '/avatars/Miss_Janie.jpg';
    
    const [result, setResult] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [activeResultPart, setActiveResultPart] = useState('A');

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
                    navigate('/achievements');
                }
            } catch (fetchErr) {
                console.error('[ListeningMockResult] Error:', fetchErr.message);
                navigate('/achievements');
            } finally {
                setIsFetching(false);
            }
        };
        fetchResult();
    }, [resultId, user, navigate]);

    if (isFetching) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Listening Report...</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const submissionResults = result || {};
    const level = submissionResults.level || '4';
    const percentage = submissionResults.percentage || 0;
    const skillScores = submissionResults.skillScores || {};
    const sectionalScores = submissionResults.sectionalScores || { A: { score: 0, possible: 0 }, B: { score: 0, possible: 0, domains: {} } };
    const writingEvaluation = submissionResults.results?.writingEvaluation || {};
    const userAnswers = result.userAnswers || {};
    const selectedSection = result.selectedSection;
    const detailedResults = submissionResults.results || {};

    const getLevelColor = (lvl) => {
        if (String(lvl).includes('5')) return 'bg-rose-500';
        if (String(lvl).includes('4')) return 'bg-emerald-500';
        if (String(lvl).includes('3')) return 'bg-amber-500';
        return 'bg-slate-500';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <button onClick={() => navigate('/achievements')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Achievements
                </button>
                <div className="text-right">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Listening Mock Report</p>
                    <p className="text-xs font-bold text-slate-600">{result.topic || 'Listening Mock'}</p>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-8 space-y-8">
                {/* Grade + Mastery Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 text-center flex flex-col items-center"
                    >
                        <div className="relative">
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className={`text-9xl font-black italic tracking-tighter ${level?.includes('5') ? 'text-rose-600' : 'text-indigo-600'}`}
                            >
                                {level}
                            </motion.div>
                        </div>
                        <div className="mt-8 space-y-1">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Composite Score</p>
                            <p className="text-2xl font-black text-slate-900">{Math.round(percentage)}%</p>
                        </div>
                        <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className={`h-full ${getLevelColor(level)}`}
                            />
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100 w-full">
                            <div className="flex items-center justify-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Zap size={16} fill="currentColor" /></div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">XP Gained</p>
                                    <p className="text-xl font-black text-emerald-600">+{submissionResults.xpAwarded || 0}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">HKEAA Mastery Breakdown</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(skillScores).map(([skill, data], idx) => (
                                <div key={skill} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{skill}</p>
                                            <p className="text-lg font-black text-slate-900">{Math.round((data.score / data.possible) * 100)}%</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400">{data.score} / {data.possible}</p>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.score / data.possible) * 100}%` }}
                                            transition={{ delay: 0.3 + (idx * 0.1) }}
                                            className={`h-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-rose-500' : idx === 2 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><BarChart3 size={20} /></div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Performance Summary</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Total: {submissionResults.totalScore} / {submissionResults.possibleScore}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Miss Janie's Verdict */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40"
                >
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                        <div className="shrink-0 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                                <img src={tutorAvatar} alt={tutorName} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Examiner</p>
                                <p className="text-lg font-black tracking-tight">{tutorName}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Overall Verdict</h3>
                                <p className="text-2xl font-medium leading-relaxed italic opacity-95">
                                    "{writingEvaluation.overall_feedback || "Excellent work on synthesising the Data File evidence. Focus on more sophisticated transitions to reach Level 5**."}"
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
                                    <Target size={14} className="text-rose-400" />
                                    <span>Primary Goal: {sectionalScores?.B?.score < 30 ? 'Evidence Synthesis' : 'Linguistic Flair'}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Accuracy: {sectionalScores?.A?.score ? Math.round((sectionalScores.A.score / sectionalScores.A.possible) * 100) : 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Part A / B Toggle */}
                <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-24 z-40">
                    <button 
                        onClick={() => setActiveResultPart('A')}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activeResultPart === 'A' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <ClipboardList size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Part A Analysis</span>
                    </button>
                    <button 
                        onClick={() => setActiveResultPart('B')}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activeResultPart === 'B' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <PenTool size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Part B Evaluation</span>
                    </button>
                </div>

                {/* Part A Content */}
                <AnimatePresence mode="wait">
                    {activeResultPart === 'A' ? (
                        <motion.div 
                            key="part-a" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                                <div className="bg-slate-900 px-10 py-6">
                                    <h4 className="font-black text-white uppercase tracking-widest text-sm">Part A: Data File Tasks</h4>
                                </div>
                                <div className="p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(detailedResults).filter(([k]) => k !== 'writingEvaluation').map(([qId, qAssessment], idx) => {
                                            const isCorrect = qAssessment?.status === 'correct';
                                            const studentAnswer = userAnswers.answers?.[qId] || '(Blank)';
                                            return (
                                                <div key={qId} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                                                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                            {qAssessment?.status || 'Incorrect'}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Answer</p>
                                                            <p className={`text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-slate-900'}`}>{studentAnswer}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Feedback</p>
                                                            <p className="text-xs font-bold text-indigo-600">{qAssessment?.feedback || 'No feedback'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="part-b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            {/* Pillar Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {Object.entries(sectionalScores?.B?.domains || {}).map(([domain, data], idx) => (
                                    <div key={domain} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg text-center space-y-4">
                                        <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${idx === 0 ? 'bg-indigo-100 text-indigo-600' : idx === 1 ? 'bg-rose-100 text-rose-600' : idx === 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {idx === 0 ? <ClipboardList size={24} /> : idx === 1 ? <Layout size={24} /> : idx === 2 ? <PenTool size={24} /> : <ShieldCheck size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{domain}</p>
                                            <p className="text-2xl font-black text-slate-900">{data?.score || 0}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{data?.feedback?.split('.')[0] || "Evaluation complete."}.</p>
                                    </div>
                                ))}
                            </div>

                            {/* Task Breakdown */}
                            {Object.entries(writingEvaluation.task_breakdown || {}).map(([taskId, data], idx) => {
                                const studentDraft = userAnswers.drafts?.[taskId] || "";
                                const modelAnswer = data.model_answer || "";
                                const taskNumber = selectedSection === 'B1' ? idx + 5 : idx + 8;
                                return (
                                    <div key={taskId} className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
                                        <div className="bg-slate-900 px-12 py-8 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl">{taskNumber}</div>
                                                <div>
                                                    <h4 className="text-xl font-black text-white tracking-tight">Task {taskNumber}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Synthesis Review</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2">
                                            <div className="p-12 border-r border-slate-100 bg-slate-50/30">
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                                                    <GraduationCap size={16} className="text-indigo-500" /> Candidate Response
                                                </h5>
                                                <p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {studentDraft || "No response recorded."}
                                                </p>
                                            </div>
                                            <div className="p-12 bg-white">
                                                <h5 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-8">
                                                    <Sparkles size={16} className="fill-current" /> Elite Master Version
                                                </h5>
                                                <p className="text-base font-medium text-slate-900 leading-relaxed whitespace-pre-wrap bg-rose-50/30 p-8 rounded-[2rem] border border-rose-100">
                                                    {modelAnswer || "Model answer not available."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-12 border-t border-slate-200">
                                            <div className="flex items-start gap-6">
                                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white overflow-hidden">
                                                    <img src={tutorAvatar} alt={tutorName} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-6 mb-4">
                                                        "{data.comments || "Your synthesis was clear."}"
                                                    </p>
                                                    {data.missed_points?.length > 0 && (
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Missed Evidence</h5>
                                                            <div className="flex flex-wrap gap-3">
                                                                {data.missed_points.map((p, pi) => (
                                                                    <span key={pi} className="px-4 py-2 bg-white border border-rose-100 text-rose-700 rounded-2xl text-[10px] font-bold">
                                                                        <AlertCircle size={12} className="inline mr-1" /> {p}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-12 flex justify-end">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl flex items-center gap-3"
                    >
                        Back to Dashboard <ChevronRight size={18} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ListeningMockResultPage;
