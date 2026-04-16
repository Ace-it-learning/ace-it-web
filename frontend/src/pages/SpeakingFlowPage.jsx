import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Play, Pause, RotateCcw, Send, 
    ArrowRight, Sparkles, BookOpen, Volume2, 
    CheckCircle2, AlertCircle, Info, Bookmark,
    ChevronRight, Brain, Zap, Clock, Activity,
    Timer, MessageSquare
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_URL}/api`;

const SpeakingFlowPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const level = searchParams.get('level') || '3';
    const topic = searchParams.get('topic') || 'flow';

    // State
    const [phase, setPhase] = useState('IDLE'); // IDLE, DISCUSSION, REVIEW
    const [quest, setQuest] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    
    // Fluency Telemetry
    const [latency, setLatency] = useState(0);
    const [latencyHistory, setLatencyHistory] = useState([]);
    const [isAITyping, setIsAITyping] = useState(false);
    const latencyTimer = useRef(null);
    const startTime = useRef(null);

    // Audio Context
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Initial Loading
    useEffect(() => {
        const fetchQuest = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/speaking/quest/generate`, {
                    params: { module: 'flow', level, focus: topic, uid: user?.uid || 'guest' }
                });
                setQuest(res.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load quest:", err);
                setIsLoading(false);
            }
        };
        fetchQuest();
    }, [level, topic, user?.uid]);

    const startSession = () => {
        setPhase('DISCUSSION');
        setChatHistory([{ role: 'ai', text: quest.starting_question }]);
        startLatencyTracking();
    };

    const startLatencyTracking = () => {
        startTime.current = Date.now();
        setLatency(0);
        latencyTimer.current = setInterval(() => {
            const elapsed = (Date.now() - startTime.current) / 1000;
            setLatency(elapsed.toFixed(1));
        }, 100);
    };

    const stopLatencyTracking = () => {
        if (latencyTimer.current) {
            clearInterval(latencyTimer.current);
            latencyTimer.current = null;
        }
        const finalLatency = (Date.now() - startTime.current) / 1000;
        setLatencyHistory(prev => [...prev, finalLatency]);
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
                stopLatencyTracking();
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
            // Simplified student response logic for Flow Lab
            const studentText = "That is a very interesting question. Personally, I believe that we should focus more on renewable energy sources because fossil fuels are being depleted rapidly. This would ensure a cleaner future for our next generation.";
            
            setChatHistory(prev => [...prev, { role: 'user', text: studentText, latency: latency }]);
            
            setIsAITyping(true);
            const res = await axios.post(`${API_BASE_URL}/speaking/flow/respond`, {
                history: chatHistory,
                user_response: studentText,
                level,
                uid: user?.uid || 'guest'
            });

            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'ai', text: res.data.question }]);
                setIsAITyping(false);
                setIsLoading(false);
                startLatencyTracking();
            }, 1000);

        } catch (err) {
            console.error("Submission failed:", err);
            setIsLoading(false);
            setIsAITyping(false);
        }
    };

    const endSession = async () => {
        setIsLoading(true);
        stopLatencyTracking();
        try {
            const res = await axios.post(`${API_BASE_URL}/speaking/quest/submit`, {
                module: 'flow',
                level,
                messages: chatHistory,
                uid: user?.uid || 'guest'
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
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Initializing Fluency Lab...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-purple-100 pb-20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/speaking/menu')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <RotateCcw className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="h-6 w-[2px] bg-slate-100" />
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 block mb-0.5">Criterion C/Flow</span>
                            <h1 className="font-black text-slate-800 tracking-tight">Fluency & Spontaneity Lab</h1>
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
                                End Interview
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
                                <Activity size={240} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest mb-6">
                                    <Zap className="w-4 h-4" />
                                    Spontaneity Mission
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-6">
                                    {quest.scenario || "The Spontaneous Interview"}
                                </h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                    {quest.description || "In this session, we will focus on your ability to respond naturally and without long pauses. The AI will ask follow-up questions to test your speed."}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-3">
                                            <Timer className="w-4 h-4 text-purple-600" />
                                            Speed Goal
                                        </h4>
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Aim for a response latency of <span className="text-purple-600 font-bold">under 2.5 seconds</span>.
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-3">
                                            <MessageSquare className="w-4 h-4 text-purple-600" />
                                            Natural Flow
                                        </h4>
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Use discourse markers like "Well", "Actually", or "To be honest" to bridge thoughts.
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={startSession}
                                    className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-xl hover:bg-purple-700 transition-all shadow-2xl shadow-purple-100 flex items-center justify-center gap-3"
                                >
                                    Start Spontaneity Lab
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'DISCUSSION' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Interview Area */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
                                <div className="flex-1 space-y-8 overflow-y-auto mb-8 pr-2">
                                    {chatHistory.map((msg, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={i} 
                                            className={`flex gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'ai' ? 'bg-purple-600' : 'bg-slate-800'}`}>
                                                {msg.role === 'ai' ? <Brain className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                                            </div>
                                            <div className={`p-6 rounded-[2rem] max-w-[85%] ${msg.role === 'ai' ? 'bg-slate-50 text-slate-700 rounded-tl-sm' : 'bg-purple-600 text-white rounded-tr-sm shadow-xl shadow-purple-100'}`}>
                                                <p className="font-medium leading-relaxed">{msg.text}</p>
                                                {msg.latency && (
                                                    <div className="mt-3 flex items-center gap-2 opacity-60">
                                                        <Timer className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{msg.latency}s Latency</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isAITyping && (
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100 flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-[2rem] rounded-tl-sm">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-slate-400/30 animate-bounce" />
                                                    <div className="w-2 h-2 rounded-full bg-slate-400/30 animate-bounce [animation-delay:0.2s]" />
                                                    <div className="w-2 h-2 rounded-full bg-slate-400/30 animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                    <div className="flex items-center justify-between gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                    {isRecording ? 'Recording Live' : 'Ready to Respond'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 font-black leading-relaxed italic">
                                                {isRecording ? "Speak naturally... we're analyzing your flow." : "Press the mic and respond immediately!"}
                                            </p>
                                        </div>
                                        
                                        <button 
                                            onClick={toggleRecording}
                                            disabled={isAITyping}
                                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 scale-110 shadow-2xl shadow-rose-200' : 'bg-purple-600 hover:scale-105 shadow-2xl shadow-purple-100'} disabled:opacity-50`}
                                        >
                                            {isRecording ? <MicOff className="w-10 h-10 text-white" strokeWidth={3} /> : <Mic className="w-10 h-10 text-white" strokeWidth={3} />}
                                        </button>

                                        <div className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Side */}
                        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                                <Activity className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.03]" />
                                <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-widest text-xs mb-8">
                                    <Timer className="w-4 h-4 text-purple-600" />
                                    Real-time Telemetry
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between items-baseline mb-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Latency</span>
                                            <span className={`text-4xl font-black ${latency > 2.5 ? 'text-rose-500' : 'text-purple-600'}`}>
                                                {latency}s
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                            <motion.div 
                                                className={`h-full ${latency > 2.5 ? 'bg-rose-500' : 'bg-purple-600'}`}
                                                style={{ width: `${Math.min((latency / 5) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historical Flow</h4>
                                        <div className="flex items-end gap-2 h-16">
                                            {latencyHistory.map((l, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`flex-1 rounded-full ${l > 2.5 ? 'bg-rose-400' : 'bg-purple-400'}`}
                                                    style={{ height: `${Math.min((l / 5) * 100, 100)}%` }}
                                                />
                                            ))}
                                            {latencyHistory.length === 0 && (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">No data yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
                                <div className="inline-flex p-3 bg-amber-500 rounded-2xl mb-6">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-amber-500 mb-2">Did you know?</h4>
                                <p className="text-sm font-medium leading-relaxed opacity-80">
                                    In DSE, silence over 3 seconds is often interpreted as mental translation. Use "Well" to buy time!
                                </p>
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
                                                <div className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest">Flow Criterion Report</div>
                                                <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">Level {level}</div>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">Performance Report</h2>
                                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                                                {gradingResult.feedback?.summary}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-w-[200px] shadow-inner">
                                            <div className="text-5xl font-black text-purple-600 mb-2">{gradingResult.scores?.total || 0}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Marks / 28</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                        {[
                                            { label: 'Spontaneity', score: gradingResult.scores?.spontaneity },
                                            { label: 'Confidence', score: gradingResult.scores?.confidence },
                                            { label: 'Vocabulary', score: gradingResult.scores?.vocabulary },
                                            { label: 'Latency', score: gradingResult.scores?.latency_score }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col items-center group hover:border-purple-300 transition-all">
                                                <div className="text-2xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">{stat.score}/7</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-purple-50 border border-purple-100 p-8 rounded-[2.5rem] mb-12">
                                        <h4 className="flex items-center gap-2 font-black text-purple-700 uppercase tracking-widest text-xs mb-4">
                                            <Activity className="w-4 h-4" />
                                            Flow Highlights
                                        </h4>
                                        <p className="font-bold text-slate-700 leading-relaxed italic">
                                            "{gradingResult.feedback?.filler_usage}"
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
                                            className="flex-1 py-5 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-3"
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

export default SpeakingFlowPage;
