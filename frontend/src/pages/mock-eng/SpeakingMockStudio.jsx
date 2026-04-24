import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    MessageCircle, 
    ChevronRight, 
    Clock, 
    ShieldCheck, 
    ArrowLeft,
    CheckCircle2,
    Mic,
    MicOff,
    Play,
    Users,
    User,
    Info,
    AlertCircle
} from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import MockCountdownTimer from '../../components/utils/MockCountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';

const SpeakingMockStudio = () => {
    const { paperId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [phase, setPhase] = useState(searchParams.get('phase') || 'LOADING'); // LOADING, BRIEFING, PREP, DISCUSSION, INDIVIDUAL, RESULTS
    const [mockData, setMockData] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Helper to update phase and URL
    const updatePhase = useCallback((newPhase) => {
        setPhase(newPhase);
        setSearchParams({ phase: newPhase });
    }, [setSearchParams]);

    // Sync phase with URL
    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== phase) {
            updatePhase(urlPhase);
        }
    }, [searchParams, phase, updatePhase]);

    // Discussion State
    const [chatHistory, setChatHistory] = useState([]);
    const [activeSpeaker, setActiveSpeaker] = useState(null); // 'A', 'B', 'C', 'User'

    useEffect(() => {
        const fetchMock = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/${paperId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMockData(data);
                    if (!searchParams.get('phase')) {
                        updatePhase('BRIEFING');
                    }
                } else { navigate('/mock-exam-eng'); }
            } catch (err) {
                console.error("Error fetching mock:", err);
                navigate('/mock-exam-eng');
            }
        };
        fetchMock();
    }, [paperId, navigate]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setTimeout(() => {
            updatePhase('RESULTS');
            setIsSubmitting(false);
        }, 2000);
    };

    if (phase === 'LOADING' || (!mockData && phase !== 'RESULTS')) return (
        <LoadingPage 
            title="Calibrating Speaking Arena..." 
            subtext="Configuring AI candidate nodes and setting up examination acoustics."
        />
    );

    if (phase === 'BRIEFING') return (
        <div className="h-screen bg-white flex items-center justify-center p-8 selection:bg-rose-100 italic-none">
            <div className="max-w-2xl w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">Speaking Paper Instructions</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Paper 4 | {mockData?.title}</p>
                    </div>
                </div>

                <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 text-slate-600 font-medium leading-relaxed font-sans">
                    <p>1. **Preparation**: You have **10 minutes** to prepare your notes.</p>
                    <p>2. **Group Discussion**: **8 minutes** with 3 other candidates (AI-Simulated).</p>
                    <p>3. **Individual Response**: **1 minute** to answer a follow-up question.</p>
                    <p>4. AI hints and transcription assistance are disabled.</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/mock-exam-eng', { state: { activeTab: 'speaking' } })}
                        className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => updatePhase('PREP')}
                        className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 active:scale-95 transition-all text-xs"
                    >
                        Enter Preparation Room
                    </button>
                </div>
            </div>
        </div>
    );

    if (phase === 'PREP') return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-100 italic-none overflow-hidden">
             <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/mock-exam-eng')} className="p-3 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-2xl transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                         <h1 className="text-lg font-black text-slate-800 tracking-tight">Preparation Room</h1>
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">10 Minutes Prep Time</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 rounded-[1.25rem] px-6 py-3 border border-white/10 shadow-xl">
                        <MockCountdownTimer initialSeconds={10 * 60} onTimeUp={() => updatePhase('DISCUSSION')} />
                    </div>
                    <button 
                        onClick={() => updatePhase('DISCUSSION')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95"
                    >
                        I'm Ready, Start Discussion
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-12">
                        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-200">
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">
                                 Mock Examination Material
                             </div>
                             <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{mockData?.title}</h2>
                             <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12 border-l-8 border-emerald-100 pl-8">{mockData?.topic_description}</p>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Discussion Points</h3>
                                     <ul className="space-y-4">
                                         {mockData?.discussion_points.map((p, i) => (
                                             <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-4">
                                                 <div className="size-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                                                 {p}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div className="space-y-4">
                                     <div className="bg-slate-900 text-white p-8 rounded-[2.5rem]">
                                         <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Note Taking Area</h3>
                                         <textarea 
                                            className="w-full h-48 bg-transparent border-none text-slate-300 placeholder-slate-600 focus:ring-0 resize-none font-medium text-sm leading-relaxed"
                                            placeholder="Prepare your points here... (Notes will NOT be graded)"
                                         />
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (phase === 'DISCUSSION' || phase === 'INDIVIDUAL') {
        return (
            <div className="h-screen bg-slate-900 flex flex-col font-sans selection:bg-rose-100 text-white italic-none overflow-hidden">
                {/* Exam Arena Header */}
                <header className="bg-black/50 border-b border-white/5 px-8 py-4 flex items-center justify-between z-50">
                    <div className="flex items-center gap-6">
                        <div className="size-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                            <Users size={24} />
                        </div>
                        <div>
                             <h1 className="text-lg font-black tracking-tight leading-none mb-1">speaking Arena</h1>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                 {phase === 'DISCUSSION' ? 'Part A: Group Discussion' : 'Part B: Individual Response'}
                             </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 rounded-[1.25rem] px-6 py-3 border border-white/10">
                            <MockCountdownTimer initialSeconds={phase === 'DISCUSSION' ? 8 * 60 : 60} onTimeUp={() => phase === 'DISCUSSION' ? updatePhase('INDIVIDUAL') : handleSubmit()} />
                        </div>
                         {phase === 'DISCUSSION' && (
                            <button 
                                onClick={() => updatePhase('INDIVIDUAL')}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                            >
                                Finish Discussion
                            </button>
                        )}
                        <button 
                            onClick={handleSubmit} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                        >
                            Final Submission
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Arena View */}
                    <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-rose-600/20 border border-rose-500 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <div className="size-2 bg-rose-500 rounded-full animate-pulse" /> Live Session
                        </div>

                        <div className="grid grid-cols-2 gap-12 w-full max-w-2xl place-items-center">
                            {['A', 'B', 'User', 'C'].map((pos) => {
                                const isActive = activeSpeaker === pos;
                                return (
                                    <div key={pos} className="flex flex-col items-center gap-4 group">
                                        <div className={`size-40 rounded-[3rem] bg-slate-800 border-4 transition-all flex items-center justify-center relative ${isActive ? 'border-emerald-500 scale-110 shadow-3xl shadow-emerald-500/20' : 'border-slate-700 group-hover:border-slate-600'}`}>
                                            {pos === 'User' ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <User size={64} className="text-slate-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">YOU</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users size={64} className="text-slate-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Candidate {pos}</span>
                                                </div>
                                            )}
                                            {isActive && (
                                                <div className="absolute -top-4 -right-4 size-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 animate-bounce">
                                                    <Mic size={18} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="mt-16 bg-slate-800/80 p-8 rounded-[3rem] border border-white/5 backdrop-blur-xl w-full max-w-lg">
                            <div className="flex items-center justify-between gap-12">
                                <div className="flex-1">
                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{isRecording ? 'Capturing Voice...' : 'Waiting to speak'}</h4>
                                    <p className="text-xs font-bold text-slate-300 leading-relaxed italic">{isRecording ? "Your logic and fluency are being evaluated." : "Press the mic to interject and contribute."}</p>
                                </div>
                                <button 
                                    onClick={() => { setIsRecording(!isRecording); setActiveSpeaker(isRecording ? null : 'User'); }}
                                    className={`size-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-600 scale-110 shadow-2xl shadow-rose-900/50' : 'bg-emerald-600 hover:scale-105 shadow-2xl shadow-emerald-900/40'}`}
                                >
                                    {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Exam Details */}
                    <div className="w-[450px] bg-black/30 border-l border-white/5 p-10 overflow-y-auto custom-scrollbar">
                         <div className="space-y-10">
                            <div>
                                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Exam Context</h3>
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5">
                                     <h4 className="text-sm font-black text-white mb-4 leading-tight">{mockData?.title}</h4>
                                     <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-6">{mockData?.topic_description}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Candidate Roles</h3>
                                <div className="space-y-4">
                                     {['A', 'B', 'C'].map(pos => (
                                         <div key={pos} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                             <div className="size-10 bg-slate-700 rounded-xl flex items-center justify-center text-xs font-black shrink-0">{pos}</div>
                                             <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">{mockData?.candidates[pos]}</p>
                                         </div>
                                     ))}
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
                <GradingOverlay 
                    isOpen={isSubmitting}
                    title="Analyzing Performance"
                    status="Evaluating fluency, pronunciation, and group interaction..."
                />
            </div>
        );
    }

    if (phase === 'RESULTS') return (
        <div className="h-screen bg-slate-50 flex items-center justify-center p-8 selection:bg-rose-100 italic-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full text-center">
                <div className="inline-flex p-6 bg-emerald-100 text-emerald-600 rounded-[2.5rem] mb-8 shadow-xl shadow-emerald-900/10">
                    <CheckCircle2 size={64} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Speaking Complete</h1>
                <p className="text-slate-500 mb-10 font-medium text-lg leading-relaxed px-8">Exam concluded. Your discussion flow, pronunciation, and individual response have been recorded for grading against DSE Criteria.</p>
                <button onClick={() => navigate('/mock-exam-eng')} className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest transition-all">Selection Hub</button>
            </motion.div>
        </div>
    );

    return null;
};

export default SpeakingMockStudio;
