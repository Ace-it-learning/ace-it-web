import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { 
    BookOpen, 
    PenTool, 
    Headphones, 
    MessageCircle, 
    ChevronRight, 
    Clock, 
    Target, 
    ShieldCheck,
    AlertCircle,
    Info,
    ArrowLeft
} from 'lucide-react';

const MockLibraryEngPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [subTab, setSubTab] = useState(() => {
        const tab = location.state?.activeTab || 'reading';
        return ['reading', 'writing', 'listening', 'speaking'].includes(tab) ? tab : 'reading';
    });
    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showBriefing, setShowBriefing] = useState(null);
    const [inProgressMock, setInProgressMock] = useState(null);

    // Initial Tab Sync
    useEffect(() => {
        const tab = location.state?.activeTab;
        if (tab && ['reading', 'writing', 'listening', 'speaking'].includes(tab)) {
            setSubTab(tab);
        }
    }, [location.state?.activeTab]);

    useEffect(() => {
        const saved = localStorage.getItem(`last_mock_inprogress_${subTab}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!parsed) return;
                if (parsed && parsed.type && parsed.paperId) {
                    const fullSaveKey = parsed.type === 'listening' ? `ace-it-listening-${parsed.paperId}` : `mock_save_${parsed.paperId}`;
                    const fullSave = localStorage.getItem(fullSaveKey);
                    if (fullSave) {
                        setInProgressMock(parsed);
                    } else {
                        setInProgressMock(null);
                    }
                } else {
                    setInProgressMock(null);
                }
            } catch (err) { 
                console.error(err); 
                setInProgressMock(null);
            }
        } else {
            setInProgressMock(null);
        }
    }, [subTab]);

    const papersMeta = {
        reading: { icon: BookOpen, color: 'indigo', time: '1.5 hrs', parts: 'A + B1/B2' },
        writing: { icon: PenTool, color: 'rose', time: '2 hrs', parts: 'A + B (8 opts)' },
        listening: { icon: Headphones, color: 'amber', time: '2 hrs', parts: 'A + B1/B2' },
        speaking: { icon: MessageCircle, color: 'emerald', time: '20 mins', parts: 'Discussion + IR' }
    };

    useEffect(() => {
        let active = true;
        const fetchHeaders = async () => {
            setIsLoading(true);
            try {
                const paperCode = subTab === 'reading' ? 'p1' : 
                                 subTab === 'writing' ? 'p2' : 
                                 subTab === 'listening' ? 'p3' : 'p4';
                
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/headers/${paperCode}`);
                if (res.ok) {
                    const data = await res.json();
                    if (active) setPapers(data);
                }
            } catch (err) {
                console.error("Failed to fetch mock headers:", err);
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchHeaders();
        return () => { active = false; };
    }, [subTab]);

    const handleStartMock = (paper) => {
        const route = `/mock-exam-eng/${subTab}/${paper.id}`;
        navigate(route, {
            state: {
                isMock: true,
                paperId: paper.id,
                paperName: paper.name,
                autoStart: true
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-rose-100 italic-none">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 px-8 py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-rose-600" size={18} />
                                <span className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">HKEAA Standard Protocol</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">English Mock Studio</h1>
                            <p className="text-slate-500 mt-2 font-medium">Mission-Critical Exam Simulation. High Stakes. No Hints.</p>
                        </div>
                        <div className="hidden lg:flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                             {Object.entries(papersMeta).map(([key, meta]) => (
                                 <button
                                    key={key}
                                    onClick={() => setSubTab(key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                        subTab === key 
                                        ? `bg-white text-${meta.color}-600 shadow-sm border-b-2 border-${meta.color}-500` 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                 >
                                     <meta.icon size={14} />
                                     {key}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Resume Card (Sticky Alert) */}
                    {inProgressMock && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-5 rounded-[2.5rem] shadow-xl flex items-center justify-between border-b-4 mb-8 ${
                                inProgressMock.type === 'writing' 
                                ? 'bg-rose-600 shadow-rose-900/20 border-rose-800' 
                                : 'bg-indigo-600 shadow-indigo-900/20 border-indigo-800'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                                    {inProgressMock.type === 'writing' ? <PenTool size={24} className="animate-pulse" /> : 
                                     inProgressMock.type === 'listening' ? <Headphones size={24} className="animate-pulse" /> : 
                                     <Clock size={24} className="animate-pulse" />}
                                </div>
                                <div>
                                    <p className={`text-[11px] font-black uppercase tracking-widest ${
                                        inProgressMock.type === 'writing' ? 'text-rose-200' : 
                                        inProgressMock.type === 'listening' ? 'text-amber-200' : 'text-indigo-200'
                                    }`}>
                                        Active {inProgressMock.type?.toString()?.toUpperCase() || 'EXAM'} In Progress
                                    </p>
                                    <h3 className="text-lg font-black text-white">{inProgressMock.topic || 'Untitled Exam'}</h3>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem(`last_mock_inprogress_${subTab}`);
                                        const fullSaveKey = inProgressMock.type === 'listening' ? `ace-it-listening-${inProgressMock.paperId}` : `mock_save_${inProgressMock.paperId}`;
                                        localStorage.removeItem(fullSaveKey);
                                        setInProgressMock(null);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                        inProgressMock.type === 'writing' 
                                        ? 'bg-rose-700 hover:bg-rose-800 text-rose-300' 
                                        : inProgressMock.type === 'listening'
                                        ? 'bg-amber-700 hover:bg-amber-800 text-amber-300'
                                        : 'bg-indigo-700 hover:bg-indigo-800 text-indigo-300'
                                    }`}
                                >
                                    Discard
                                </button>
                                <button 
                                    onClick={() => navigate(`/mock-exam-eng/${inProgressMock.type}/${inProgressMock.paperId}`)}
                                    className={`px-6 py-2 bg-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 ${
                                        inProgressMock.type === 'writing' ? 'text-rose-600 shadow-rose-900/20' : 
                                        inProgressMock.type === 'listening' ? 'text-amber-600 shadow-amber-900/20' : 
                                        'text-indigo-600 shadow-indigo-900/20'
                                    }`}
                                >
                                    Resume Mission
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-rose-600">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-rose-900 uppercase">Strict Timing</h3>
                                <p className="text-xs text-rose-700 mt-1">Automatic submission when time expires. No pauses allowed.</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-amber-600">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-amber-900 uppercase">Training Wheels Off</h3>
                                <p className="text-xs text-amber-700 mt-1">AI Hints, Spark Notes, and scaffolds are hard-disabled.</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                <Target size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-indigo-900 uppercase">True Grading</h3>
                                <p className="text-xs text-indigo-700 mt-1">Evaluated using official HKEAA level descriptors (1-5**).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                        English {subTab === 'reading' ? 'Reading (Paper 1)' : 
                                 subTab === 'writing' ? 'Writing (Paper 2)' : 
                                 subTab === 'listening' ? 'Listening (Paper 3)' : 'Speaking (Paper 4)'}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        <Info size={12} />
                        Showing {papers.length} mock sets
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-slate-200 rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {papers.map((paper, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[2rem] border border-slate-200 p-8 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer relative overflow-hidden"
                                onClick={() => setShowBriefing(paper)}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    {React.createElement(papersMeta[subTab].icon, { size: 120 })}
                                </div>

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">
                                        Paper {subTab === 'reading' ? '1' : subTab === 'writing' ? '2' : subTab === 'listening' ? '3' : '4'}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                        {paper.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium mb-8">
                                        {paper.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time Limit</span>
                                                <span className="text-xs font-black text-slate-700">{papersMeta[subTab].time}</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-100" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Structure</span>
                                                <span className="text-xs font-black text-slate-700">{papersMeta[subTab].parts}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-lg">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Briefing Modal */}
            <AnimatePresence>
                {showBriefing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
                        >
                            <div className={`h-3 bg-${papersMeta[subTab].color}-500`} />
                            
                            <div className="p-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 bg-${papersMeta[subTab].color}-50 rounded-2xl text-${papersMeta[subTab].color}-600`}>
                                        {React.createElement(papersMeta[subTab].icon, { size: 24 })}
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-xl font-black text-slate-900 tracking-tight">{showBriefing?.name || 'Mock Exam'}</h1>
                                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white">
                                            {String(showBriefing?.type || 'PAPER').replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="mt-1 text-slate-400"><Clock size={18} /></div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Timer Rules</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">Once you start, the timer of {papersMeta[subTab].time} will begin. The simulation cannot be paused. If you exit, the exam will be automatically submitted.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="mt-1 text-slate-400"><AlertCircle size={18} /></div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Integrity Policy</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">All AI drafting assistance, vocabulary hints, and grammar checkers are disabled. You are expected to use only your internal knowledge.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setShowBriefing(null)}
                                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button 
                                        onClick={() => handleStartMock(showBriefing)}
                                        className={`flex-2 px-12 py-4 bg-${papersMeta[subTab].color}-600 hover:bg-${papersMeta[subTab].color}-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-${papersMeta[subTab].color}-900/20 active:scale-95`}
                                    >
                                        Enter Exam Arena
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MockLibraryEngPage;
