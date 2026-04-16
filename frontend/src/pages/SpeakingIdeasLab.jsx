import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Play, Pause, RotateCcw, Send, 
    ArrowRight, Sparkles, BookOpen, Volume2, 
    CheckCircle2, AlertCircle, Info, Bookmark,
    ChevronRight, Brain, Network, Map, 
    ListChecks, MessageSquareText
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_URL}/api`;

const SpeakingIdeasLab = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const level = searchParams.get('level') || '3';
    const topic = searchParams.get('topic') || 'ideas_organisation';

    // State
    const [phase, setPhase] = useState('IDLE'); // IDLE, DISCUSSION, REVIEW
    const [quest, setQuest] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    const [structureFeedback, setStructureFeedback] = useState([]); // Tracking PEEL
    
    // Audio Context
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Initial Loading
    useEffect(() => {
        const fetchQuest = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/speaking/quest/generate`, {
                    params: { module: 'ideas_organisation', level, focus: topic }
                });
                setQuest(res.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load quest:", err);
                setIsLoading(false);
            }
        };
        fetchQuest();
    }, [level, topic]);

    const startSession = () => {
        setPhase('DISCUSSION');
        setChatHistory([{ role: 'ai', text: quest.starting_question }]);
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder.current = new MediaRecorder(stream);
                audioChunks.current = [];

                mediaRecorder.current.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };

                mediaRecorder.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                    handleSubmission(audioBlob);
                };

                mediaRecorder.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Recording error:", err);
            }
        } else {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmission = async (audioBlob) => {
        setIsLoading(true);
        try {
            // Simplified student response logic for the lab
            const studentText = "Firstly, I believe that mobile phones can be a significant distraction during lunch. For instance, students might spend all their time playing games instead of talking to their peers. This leads to a decline in social skills. Thus, I think it's better to limit their use.";
            
            setChatHistory(prev => [...prev, { role: 'user', text: studentText }]);
            
            // Analyze for PEEL (Simplification)
            const markers = {
                'Point': ['believe', 'think', 'opinion'],
                'Evidence': ['for instance', 'example', 'specifically'],
                'Explanation': ['leads to', 'result', 'because'],
                'Link': ['thus', 'consequently', 'therefore', 'overall']
            };
            
            const detected = [];
            Object.entries(markers).forEach(([key, list]) => {
                if (list.some(m => studentText.toLowerCase().includes(m))) detected.push(key);
            });
            setStructureFeedback(detected);

            const res = await axios.post(`${API_BASE_URL}/speaking/flow/respond`, {
                history: chatHistory,
                user_response: studentText,
                level
            });

            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'ai', text: res.data.question }]);
                setIsLoading(false);
            }, 1000);

        } catch (err) {
            console.error("Submission failed:", err);
            setIsLoading(false);
        }
    };

    const endSession = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/speaking/quest/submit`, {
                module: 'ideas_organisation',
                level,
                messages: chatHistory,
                organisation_data: JSON.stringify({ mind_map: quest.mind_map, guidance: quest.guidance })
            });
            setGradingResult(res.data);
            setPhase('REVIEW');
        } catch (err) {
            console.error("Grading failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!quest && isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Preparing Organisation Lab...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 pb-20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/speaking/menu')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <RotateCcw className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="h-6 w-[2px] bg-slate-100" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-0.5">Criterion D</span>
                            <h1 className="font-black text-slate-800 tracking-tight">Ideas & Organisation Lab</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-wider">
                            Level {level}
                        </div>
                        {phase === 'DISCUSSION' && (
                            <button 
                                onClick={endSession}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Finish Session
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32">
                {phase === 'IDLE' && quest && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Network size={240} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest mb-6">
                                    <Map className="w-4 h-4" />
                                    Logic Mission
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-6">
                                    {quest.scenario}
                                </h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                    {quest.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-3">
                                            <ListChecks className="w-4 h-4 text-emerald-600" />
                                            Organisation Strategy
                                        </h4>
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Follow the <span className="text-emerald-600 font-bold">P.E.E.L</span> method to maximize your coherence marks.
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-3">
                                            <Sparkles className="w-4 h-4 text-emerald-600" />
                                            Mind Map Help
                                        </h4>
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Use the provided tree map to visualize your arguments before speaking.
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={startSession}
                                    className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3"
                                >
                                    Enter Organisation Lab
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'DISCUSSION' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Mind Map Side */}
                        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative">
                                <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-8">
                                    <Network className="w-4 h-4 text-emerald-600" />
                                    Dynamic Mind Map
                                </h3>
                                
                                <div className="relative flex flex-col items-center">
                                    {/* Center Node */}
                                    <div className="bg-emerald-600 text-white px-6 py-4 rounded-[1.8rem] font-black text-sm shadow-xl shadow-emerald-100 mb-12 relative z-10 text-center max-w-[180px]">
                                        {quest?.mind_map?.center_issue || "Main Topic"}
                                    </div>

                                    {/* Branches */}
                                    <div className="grid grid-cols-2 gap-4 w-full relative">
                                        {/* Connector Lines (Simplified) */}
                                        <div className="absolute top-[-48px] left-1/2 -ml-[2px] w-[4px] h-[48px] bg-slate-100" />
                                        <div className="absolute top-0 left-[25%] right-[25%] h-[2px] bg-slate-100" />

                                        {(quest?.mind_map?.branches || []).map((branch, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className="absolute top-0 w-[2px] h-4 bg-slate-100" />
                                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl w-full mb-3 text-center">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{branch.title}</span>
                                                </div>
                                                <div className="space-y-2 w-full">
                                                    {(branch.sub_points || []).map((point, j) => (
                                                        <div key={j} className="bg-white border border-slate-100 p-3 rounded-2xl text-[10px] font-bold text-slate-500 shadow-sm text-center">
                                                            {point}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-emerald-700 mb-4">P.E.E.L Mastery Tracker</h4>
                                <div className="space-y-3">
                                    {['Point', 'Evidence', 'Explanation', 'Link'].map((part) => (
                                        <div key={part} className="flex items-center justify-between">
                                            <span className={`text-xs font-black ${structureFeedback.includes(part) ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                {part}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${structureFeedback.includes(part) ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interview Side */}
                        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
                                <div className="flex-1 space-y-6 overflow-y-auto mb-8 pr-2">
                                    {chatHistory.map((msg, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={i} 
                                            className={`flex gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'ai' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                                                {msg.role === 'ai' ? <Brain className="w-6 h-6 text-white" /> : <MessageSquareText className="w-6 h-6 text-white" />}
                                            </div>
                                            <div className={`p-6 rounded-[2rem] max-w-[80%] ${msg.role === 'ai' ? 'bg-slate-50 text-slate-700 rounded-tl-sm shadow-sm' : 'bg-emerald-600 text-white rounded-tr-sm shadow-lg shadow-emerald-50'}`}>
                                                <p className="font-medium leading-relaxed">{msg.text}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-4 animate-pulse">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100" />
                                            <div className="bg-slate-50 p-6 rounded-[2rem] rounded-tl-sm w-48" />
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Task</p>
                                            <p className="text-sm font-black text-emerald-700 italic">Respond to the interviewer using evidence from the mind map.</p>
                                        </div>
                                        <button 
                                            onClick={toggleRecording}
                                            disabled={isLoading}
                                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-200' : 'bg-emerald-600 hover:scale-105 shadow-xl shadow-emerald-100'} disabled:opacity-50`}
                                        >
                                            {isRecording ? <MicOff className="w-8 h-8 text-white" strokeWidth={3} /> : <Mic className="w-8 h-8 text-white" strokeWidth={3} />}
                                        </button>
                                        <div className="flex-1 flex justify-end">
                                            {isRecording && (
                                                <div className="flex gap-1 items-center">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="w-1 bg-emerald-500 h-4 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Review Overlay */}
                <AnimatePresence>
                    {phase === 'REVIEW' && gradingResult && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm p-6 flex items-center justify-center"
                        >
                            <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                                <div className="p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                                <div className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-widest">Criterion D Report</div>
                                                <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">Level {level}</div>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">Structure Analytics</h2>
                                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                                                {gradingResult.feedback?.summary}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-w-[200px] shadow-inner">
                                            <div className="text-5xl font-black text-emerald-600 mb-2">{gradingResult.scores?.total || 0}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Marks / 28</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                        {[
                                            { label: 'Development', score: gradingResult.scores?.development },
                                            { label: 'Relevance', score: gradingResult.scores?.relevance },
                                            { label: 'Signposting', score: gradingResult.scores?.signposting },
                                            { label: 'Organisation', score: gradingResult.scores?.organisation }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col items-center group hover:border-emerald-300 transition-all">
                                                <div className="text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{stat.score}/7</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-900 text-white p-10 rounded-[3rem] mb-12 relative overflow-hidden">
                                        <Sparkles className="absolute top-0 right-0 p-8 w-32 h-32 opacity-10" />
                                        <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-emerald-400 mb-4">Strategic PEEL Analysis</h4>
                                        <p className="text-xl font-medium leading-relaxed italic opacity-90">
                                            "{gradingResult.feedback?.peel_analysis}"
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                                        >
                                            Restart Session
                                        </button>
                                        <button 
                                            onClick={() => navigate('/speaking/menu')}
                                            className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                                        >
                                            Return to Hub
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SpeakingIdeasLab;
