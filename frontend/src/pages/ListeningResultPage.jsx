import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, ArrowLeft, Star, BarChart3, 
    BookOpen, Sparkles, MessageSquare, 
    ChevronRight, Target, Info, Zap, 
    CheckCircle2, AlertCircle, X, Layers, GraduationCap, Play,
    Headphones, ClipboardList, PenTool, Layout, ShieldCheck
} from 'lucide-react';
import WritingHighlighter from '../components/writing/WritingHighlighter';
import { useAvatar } from '../context/AvatarContext';

const ListeningResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { examId } = useParams();
    
    const [results, setResults] = useState(state?.results || null);
    const [mockData, setMockData] = useState(state?.mockData || null);
    const [selectedSection, setSelectedSection] = useState(state?.selectedSection || 'B2');
    const [isFetching, setIsFetching] = useState(false);
    const [activePart, setActivePart] = useState('A'); // 'A' or 'B'
    const { getAgentIdentity } = useAvatar();
    const englishTutor = getAgentIdentity('english');

    // Fetch result if missing (e.g. refresh)
    useEffect(() => {
        console.log("[ListeningResult] Initializing with state:", !!state, "examId:", examId);
        if (!results && examId) {
            fetchResult();
        }
    }, [examId]);

    const fetchResult = async () => {
        if (isFetching) return;
        setIsFetching(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/results/${examId}?uid=${localStorage.getItem('uid')}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
                // Try to find mock data too
                if (!mockData) {
                    const mockRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/english/mock/${data.paperId}`);
                    if (mockRes.ok) setMockData(await mockRes.json());
                }
            }
        } catch (e) {
            console.error("Failed to fetch result:", e);
        } finally {
            setIsFetching(false);
        }
    };

    const assessment = useMemo(() => {
        if (!results) return null;
        return results;
    }, [results]);

    const getLevelColor = (lvl) => {
        if (lvl?.includes('5**')) return 'bg-rose-600';
        if (lvl?.includes('5*')) return 'bg-rose-500';
        if (lvl?.includes('5')) return 'bg-indigo-600';
        if (lvl?.includes('4')) return 'bg-emerald-600';
        if (lvl?.includes('3')) return 'bg-amber-500';
        return 'bg-slate-600';
    };

    if (!assessment || !mockData) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Calibrating Results...</p>
                </div>
            </div>
        );
    }

    const { 
        sectionalScores = { A: { score: 0, possible: 0 }, B: { score: 0, possible: 0, domains: {} } }, 
        skillScores = {}, 
        level = "U", 
        percentage = 0, 
        xpAwarded = 0, 
        results: detailedResults = {} 
    } = assessment || {};

    const writingEvaluation = detailedResults?.writingEvaluation || {};

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100">
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
                            <h1 className="font-black text-slate-900 tracking-tight text-lg">Listening Assessment Report</h1>
                            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-black uppercase tracking-widest">
                                Mission Completed
                            </span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                             <Headphones size={10} className="text-indigo-500" /> {mockData.meta?.title || 'Paper 3 Mock'}
                             <span className="text-slate-200">|</span>
                             <span className="flex items-center gap-1 text-slate-500">
                                 <Star size={10} className="text-rose-500 fill-current" /> Section {selectedSection}
                             </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Simplified Header: Actions removed per request */}
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
                {/* Hero Section: Level & Mastery Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Level Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Predicted DSE Level</h3>
                        <div className="relative">
                            <motion.div 
                                initial={{ scale: 0.5, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className={`text-9xl font-black italic tracking-tighter ${level?.includes('5') ? 'text-rose-600' : 'text-indigo-600'}`}
                            >
                                {level}
                            </motion.div>
                            {level?.includes('5') && (
                                <div className="absolute -top-4 -right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                    <Sparkles size={20} fill="currentColor" />
                                </div>
                            )}
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

                        {/* Relocated XP Gained */}
                        <div className="mt-8 pt-8 border-t border-slate-100 w-full">
                            <div className="flex items-center justify-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">XP Gained</p>
                                    <p className="text-xl font-black text-emerald-600">+{xpAwarded || 0}</p>
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
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">HKEAA Mastery Breakdown</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <Info size={12} />
                                <span>Based on 2026 Marking Scheme</span>
                            </div>
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
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Performance Summary</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Your strongest pillar is <span className="font-bold text-indigo-600">{Object.keys(skillScores).length > 0 ? Object.keys(skillScores).reduce((a, b) => ((skillScores[a]?.score || 0) / (skillScores[a]?.possible || 1)) > ((skillScores[b]?.score || 0) / (skillScores[b]?.possible || 1)) ? a : b) : 'Pending Evaluation'}</span>.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                                <p className="text-2xl font-black text-slate-900">{assessment.totalScore} / {assessment.possibleScore}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Miss Janie's Verdict */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40"
                >
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                        <div className="shrink-0 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                                <img src={englishTutor.avatar} alt={englishTutor.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Examiner</p>
                                <p className="text-lg font-black tracking-tight">{englishTutor.name}</p>
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

                {/* Detail Toggle */}
                <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm sticky top-24 z-40">
                    <button 
                        onClick={() => setActivePart('A')}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activePart === 'A' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <ClipboardList size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Part A Analysis</span>
                    </button>
                    <button 
                        onClick={() => setActivePart('B')}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${activePart === 'B' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <PenTool size={18} />
                        <span className="font-black uppercase tracking-widest text-[11px]">Part B Evaluation</span>
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
                                {mockData.Part_A.tasks.map((task, tIdx) => (
                                    <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                                        <div className="bg-slate-900 px-10 py-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-white">{tIdx + 1}</div>
                                                <h4 className="font-black text-white uppercase tracking-widest text-sm">{task.id}</h4>
                                            </div>
                                            <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                                                Listening Focus
                                            </div>
                                        </div>
                                        <div className="p-10 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {task.questions.map((q, qIdx) => {
                                                    const assessment = detailedResults[q.id];
                                                    const isCorrect = assessment?.status === 'correct';
                                                    const isPartial = assessment?.status === 'partial';
                                                    
                                                    return (
                                                        <div key={q.id} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group transition-all hover:border-indigo-200">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                                                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-100 text-emerald-700' : (isPartial ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700')}`}>
                                                                    {assessment?.status || 'Incorrect'}
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-900 leading-relaxed">{q.label || q.text}</p>
                                                            
                                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Answer</p>
                                                                    <p className={`text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                                        {results.userAnswers.answers[q.id] || '(Blank)'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct Mark</p>
                                                                    <p className="text-xs font-black text-indigo-600">{q.answer || q.marking_scheme}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {(assessment?.feedback || assessment?.professionalAdvice) && (
                                                                <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 text-[10px] font-medium text-slate-500 italic leading-relaxed flex items-start gap-3">
                                                                    <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                                                        <img src={englishTutor.avatar} alt={englishTutor.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-indigo-600 not-italic mr-2">{englishTutor.name}:</span>
                                                                        {assessment.feedback || assessment.professionalAdvice}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="part-b"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                {/* Pillar Breakdown for Part B */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {Object.entries(sectionalScores?.B?.domains || {}).map(([domain, data], idx) => (
                                        <div key={domain} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg text-center space-y-4">
                                            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${idx === 0 ? 'bg-indigo-100 text-indigo-600' : idx === 1 ? 'bg-rose-100 text-rose-600' : idx === 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {idx === 0 ? <ClipboardList size={24} /> : idx === 1 ? <Layout size={24} /> : idx === 2 ? <PenTool size={24} /> : <ShieldCheck size={24} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{domain}</p>
                                                <p className="text-2xl font-black text-slate-900">{data?.score || 0} / {domain === 'appropriacy' ? 6 : (domain === 'content' ? 18 : 9)}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{data?.feedback?.split('.')[0] || "Evaluation complete."}.</p>
                                        </div>
                                    ))}
                                </div>

                                 {/* Task-by-Task 2-Column Comparison */}
                                {Object.entries(writingEvaluation.task_breakdown || {}).map(([taskId, data], idx) => {
                                    const taskData = (selectedSection === 'B1' ? mockData.Part_B?.Part_B1?.tasks : mockData.Part_B?.Part_B2?.tasks)?.find(t => t.id === taskId);
                                    if (!taskData) return null;
                                    
                                    const studentDraft = results?.userAnswers?.drafts?.[taskId] || "";
                                    const modelAnswer = data.model_answer || "";
                                    const taskNumber = selectedSection === 'B1' ? idx + 5 : idx + 8;

                                    return (
                                        <div key={taskId} className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden scroll-mt-24" id={`task-review-${taskId}`}>
                                            <div className="bg-slate-900 px-12 py-8 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-900/40">
                                                        {taskNumber}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-white tracking-tight">Task {taskNumber}: {taskData.type}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Synthesis Review & Evaluation</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="px-6 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                                                        <Target size={14} /> Tone: {taskData.tone || 'Formal'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                                {/* Student Answer */}
                                                <div className="p-12 border-r border-slate-100 bg-slate-50/30">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <GraduationCap size={16} className="text-indigo-500" /> Candidate Response
                                                        </h5>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Word Count: {studentDraft.trim().split(/\s+/).length}</span>
                                                    </div>
                                                    <div className="prose prose-slate max-w-none">
                                                        <p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
                                                            {studentDraft || "No response recorded for this task."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Model Answer (Elite Version) */}
                                                <div className="p-12 bg-white">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h5 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                                                            <Sparkles size={16} className="fill-current" /> Elite Master Version
                                                        </h5>
                                                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">
                                                            Level 5** Standard
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-rose max-w-none">
                                                        <p className="text-base font-medium text-slate-900 leading-relaxed whitespace-pre-wrap bg-rose-50/30 p-8 rounded-[2rem] border border-rose-100 shadow-sm selection:bg-rose-100">
                                                            {modelAnswer || "Model answer being generated..."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Miss Janie's Professional Feedback Section */}
                                            <div className="bg-slate-50 p-12 border-t border-slate-200">
                                                <div className="flex flex-col md:flex-row items-start gap-10">
                                                    <div className="shrink-0 flex flex-col items-center gap-3">
                                                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-900/20 border-4 border-white flex items-center justify-center text-white overflow-hidden">
                                                            <img src={englishTutor.avatar} alt={englishTutor.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Expert</p>
                                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{englishTutor.name}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-6">
                                                        <div>
                                                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                <Info size={14} className="text-indigo-500" /> Professional Feedback
                                                            </h5>
                                                            <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-6">
                                                                "{data.comments || "Your synthesis of the meeting minutes was clear. To improve, ensure all points from the Integrated Recording are explicitly linked to the candidate's core proposal."}"
                                                            </p>
                                                        </div>

                                                        {data.missed_points?.length > 0 && (
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Critical Missed Evidence</h5>
                                                                <div className="flex flex-wrap gap-3">
                                                                    {data.missed_points.map((p, pi) => (
                                                                        <span key={pi} className="px-5 py-2.5 bg-white border border-rose-100 text-rose-700 rounded-2xl text-[10px] font-bold flex items-center gap-3 shadow-sm hover:border-rose-300 transition-colors">
                                                                            <AlertCircle size={14} className="text-rose-500" /> {p}
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
                </div>

                {/* Footer Navigation */}
                <div className="pt-12 border-t border-slate-200 flex items-center justify-end">
                    <button 
                        onClick={() => navigate('/dashboard', { 
                            state: { 
                                mockCompleted: true,
                                type: 'Listening',
                                level: level,
                                score: `${Math.round(percentage)}%`,
                                improvements: writingEvaluation?.overall_feedback
                            } 
                        })}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center gap-3"
                    >
                        Back to Dashboard <ChevronRight size={18} />
                    </button>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                body { font-family: 'Outfit', sans-serif; }
                .prose p { margin-bottom: 1.5em; }
            ` }} />
        </div>
    );
};

export default ListeningResultPage;
