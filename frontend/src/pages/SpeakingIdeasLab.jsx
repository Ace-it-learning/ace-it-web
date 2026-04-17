import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { 
    Mic, Play, Square, Volume2, Loader2, ArrowRight, 
    Zap, Sparkles, MessageSquare, Brain, Target, 
    Info, ChevronRight, CheckCircle2, Clock, User, 
    AlertTriangle, RotateCcw, Network, Map, ListChecks 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeakingWaveform from '../components/speaking/SpeakingWaveform';
import IdeasMindMap from '../components/speaking/IdeasMindMap';

const FILLERS = [
    "That's a very logical point. Looking at the mind map, how would you expand on that?",
    "I see your point. Which specific branch of our brainstorm does that connect to?",
    "Interesting perspective! Can you provide some evidence to support that idea?",
    "Right. Thinking about the overall structure, how does this point link back to your main argument?",
    "Good start! Let's try to add more depth to that explanation using the mind map."
];

const SpeakingIdeasLab = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeAgent, equipment } = useAvatar();

    // 1. Module & Content Selection
    const topicId = searchParams.get('topic') || 'd_1';
    const level = searchParams.get('level') || '3';
    
    const [isLoading, setIsLoading] = useState(true);
    const [questData, setQuestData] = useState(null);
    const [phase, setPhase] = useState('IDLE'); // IDLE, INTRO, DISCUSSION, OUTRO, REVIEW
    
    // Discussion State
    const [turnIndex, setTurnIndex] = useState(0);
    const [chatHistory, setChatHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [isAITurn, setIsAITurn] = useState(false);
    
    // Interaction States
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [speechState, setSpeechState] = useState({ 
        text: "", 
        role: null, 
        isSpeaking: false 
    });
    const [structureFeedback, setStructureFeedback] = useState([]); // PEEL Tracking

    // Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);
    const audioRef = useRef(null);
    const timerRef = useRef(null);
    const recognition = useRef(null);
    const finalTranscriptRef = useRef("");
    const silenceTimerRef = useRef(null);
    const isFetchingRef = useRef({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const getStudentAvatar = () => {
        if (equipment?.student?.image) {
            if (equipment.student.image.startsWith('s_') && !equipment.student.image.includes('/')) {
                return `/avatars/${equipment.student.image}`;
            }
            return equipment.student.image;
        }
        return '/avatars/student_male_1.jpg';
    };

    // Helper: Format Time
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // 2. Initial Setup
    useEffect(() => {
        const fetchQuest = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/speaking/quest/generate?module=ideas_organisation&level=${level}&focus=${topicId}&uid=${user?.uid || 'guest'}`);
                if (!res.ok) throw new Error('Generation failed');
                const data = await res.json();
                setQuestData(data);
            } catch (err) {
                console.error('Quest load error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuest();

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                let interim = '';
                let final = finalTranscriptRef.current;
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                    else interim += event.results[i][0].transcript;
                }
                finalTranscriptRef.current = final;
                setInterimTranscript(final + interim);
                
                // Real-time PEEL detection
                const markers = {
                    'Point': ['believe', 'think', 'opinion', 'firstly', 'point'],
                    'Evidence': ['example', 'instance', 'support', 'fact', 'case'],
                    'Explanation': ['because', 'reason', 'meaning', 'leads to', 'result'],
                    'Link': ['thus', 'consequently', 'therefore', 'overall', 'summary', 'conclusion']
                };
                const currentText = (final + interim).toLowerCase();
                const detected = [];
                Object.entries(markers).forEach(([key, list]) => {
                    if (list.some(m => currentText.includes(m))) detected.push(key);
                });
                setStructureFeedback(prev => [...new Set([...prev, ...detected])]);

                // Silence detection: reset timer on every result
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    console.log("🤫 Silence detected, stopping recording...");
                    stopRecording();
                }, 2500); // 2.5 seconds threshold
            };
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (recognition.current) recognition.current.stop();
            stopAllAudio();
        };
    }, []);

    // 3. Phase Control
    useEffect(() => {
        if (phase === 'DISCUSSION' && !timerRef.current) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        setPhase('OUTRO');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'INTRO') runIntro();
        else if (phase === 'OUTRO') runOutro();
    }, [phase]);

    // 4. Core Logic Functions
    const stopAllAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setSpeechState({ text: "", role: null, isSpeaking: false });
    };

    const playAudio = (text, role, onEnd) => {
        stopAllAudio();
        const cleaned = text.replace(/^(Candidate[ _][A-D]|Examiner|Tutor):/i, "").replace(/\*.*?\*/g, "").trim();
        setSpeechState({ text: cleaned, role, isSpeaking: true });
        
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = 'en-GB'; // British English Accent
        
        utterance.onend = () => {
            setSpeechState(prev => ({ ...prev, isSpeaking: false }));
            if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utterance);
    };

    const runIntro = () => {
        setIsAITurn(true);
        const introText = `Hello! I'm ${activeAgent.name}. Today we're working on Ideas and Organisation. Your topic is "${questData?.title || 'this discussion'}". Use the Mind Map on the left to brainstorm points before you speak. Let's start!`;
        playAudio(introText, 'Tutor', () => {
            setPhase('DISCUSSION');
            setChatHistory([{ speaker: 'Annie', text: questData?.starting_question || "What are your initial thoughts on this topic?" }]);
            setIsAITurn(false);
        });
    };

    const runOutro = () => {
        setIsAITurn(true);
        const outroText = "Time is up! You've done a great job organising your ideas today. Let's take a look at your structural analysis.";
        playAudio(outroText, 'Tutor', () => {
            endSession();
        });
    };

    const startRecording = async () => {
        if (isAITurn) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Audio Context for Waveform
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            const source = audioContext.current.createMediaStreamSource(stream);
            source.connect(analyser.current);
            
            const updateVoiceLevel = () => {
                const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
                analyser.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                setVoiceLevel(avg);
                animationFrame.current = requestAnimationFrame(updateVoiceLevel);
            };
            updateVoiceLevel();

            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            finalTranscriptRef.current = "";
            setInterimTranscript("");
            
            mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
                if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
                setVoiceLevel(0);
                stream.getTracks().forEach(t => t.stop());
                handleSubmission(finalTranscriptRef.current || interimTranscript);
            };

            mediaRecorder.current.start();
            if (recognition.current) recognition.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic error:", err);
        }
    };

    const stopRecording = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            if (recognition.current) recognition.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmission = async (text) => {
        if (!text.trim()) return;
        setIsSubmitting(true);
        setChatHistory(prev => [...prev, { speaker: 'Student', text }]);

        try {
            const res = await fetch(`${API_URL}/api/speaking/flow/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory,
                    user_response: text,
                    level
                })
            });
            const data = await res.json();
            setIsAITurn(true);
            setChatHistory(prev => [...prev, { speaker: 'Annie', text: data.question }]);
            playAudio(data.question, 'Annie', () => {
                setIsAITurn(false);
                setIsSubmitting(false);
            });
        } catch (err) {
            console.error("Response error:", err);
            const filler = FILLERS[Math.floor(Math.random() * FILLERS.length)];
            setChatHistory(prev => [...prev, { speaker: 'Annie', text: filler }]);
            setIsAITurn(true);
            playAudio(filler, 'Annie', () => {
                setIsAITurn(false);
                setIsSubmitting(false);
            });
        }
    };

    const endSession = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/speaking/quest/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module: 'ideas_organisation',
                    level,
                    messages: chatHistory,
                    organisation_data: JSON.stringify({ 
                        mind_map: questData.mind_map, 
                        guidance: questData.guidance 
                    }),
                    uid: user?.uid
                })
            });
            const data = await res.json();
            setGradingResult(data);
            setPhase('REVIEW');
        } catch (err) {
            console.error("Grading error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !questData) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest animate-pulse">Synchronizing Ideas Lab...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 pb-20">
            <main className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col gap-8">
                {/* 1. Header Info (Standardized Layout) */}
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm mt-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                {phase === 'IDLE' || phase === 'INTRO' ? 'Ideas & Organisation' : questData?.scenario}
                            </h1>
                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                                {phase === 'DISCUSSION' ? `Turn ${chatHistory.length} • Ideas Lab` : 'Pedagogical Lab'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className={`text-sm font-black ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        {phase === 'IDLE' && (
                            <button 
                                onClick={() => setPhase('INTRO')}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Start Discussion
                            </button>
                        )}
                        {phase !== 'IDLE' && phase !== 'REVIEW' && (
                            <button 
                                onClick={() => setPhase('OUTRO')}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Finish
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Goal Card (Horizontal & Premium) */}
                <AnimatePresence mode="wait">
                    {phase !== 'REVIEW' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-6 text-white shadow-2xl overflow-hidden relative"
                        >
                            <div className="relative z-10 flex flex-row items-center gap-6">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex-shrink-0">
                                    <Brain className="w-6 h-6 text-emerald-100" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-0.5">Organisation Goal</h2>
                                    <p className="text-xl font-black leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                        Use brainstorming mind map to maximise coherence.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tutor Overlay (Integrated in content flow) */}
                <AnimatePresence>
                    {(phase === 'INTRO' || phase === 'OUTRO') && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl flex items-center gap-6"
                        >
                            <div className="size-16 rounded-2xl bg-indigo-600 flex items-center justify-center border-2 border-indigo-400 overflow-hidden shadow-xl">
                                <img src={activeAgent.avatar} alt="T" className="size-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">{activeAgent.name}</h4>
                                <p className="text-lg font-bold leading-tight">{speechState.text}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {phase === 'DISCUSSION' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12 text-slate-800">
                        {/* Mind Map Area */}
                        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                            <IdeasMindMap data={questData.mind_map} />
                            
                            <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
                                <h4 className="font-black uppercase tracking-widest text-[11px] text-emerald-700 mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Live P.E.E.L Tracking
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Point', 'Evidence', 'Explanation', 'Link'].map((part) => (
                                        <div key={part} className={`px-4 py-4 rounded-2xl border flex items-center justify-between transition-all ${structureFeedback.includes(part) ? 'bg-white border-emerald-300 shadow-sm' : 'bg-white/40 border-slate-100 opacity-60'}`}>
                                            <span className={`text-xs font-black uppercase tracking-widest ${structureFeedback.includes(part) ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                {part}
                                            </span>
                                            <div className={`size-5 rounded-full flex items-center justify-center ${structureFeedback.includes(part) ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Discussion Area */}
                        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Annie */}
                                <motion.div 
                                    animate={{ scale: speechState.isSpeaking && speechState.role !== 'Tutor' ? 1.02 : 1 }}
                                    className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 relative flex-1 ${speechState.isSpeaking && speechState.role !== 'Tutor' ? 'border-emerald-600 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="size-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                                            <img src="/avatars/annie_avatar_1774534170846.png" className="size-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-sm">Annie</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discussion Partner</p>
                                        </div>
                                    </div>
                                    <div className="min-h-[140px] bg-slate-50 rounded-3xl p-6">
                                        <p className={`text-base font-bold leading-relaxed ${!speechState.isSpeaking ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                                            {(speechState.isSpeaking && speechState.role !== 'Tutor') ? speechState.text : (chatHistory.filter(m => m.speaker === 'Annie').pop()?.text || "Listening...") }
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Student */}
                                <motion.div 
                                    className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 relative flex-1 ${!isAITurn ? 'border-emerald-500 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="size-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xl">
                                            <img src={getStudentAvatar()} className="size-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-sm">{user?.displayName || "You"}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate A</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 rounded-3xl p-6 min-h-[140px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200">
                                            {isRecording ? (
                                                <div className="w-full flex flex-col items-center gap-6">
                                                    <SpeakingWaveform isRecording={isRecording} voiceLevel={voiceLevel} />
                                                    <div className="w-full px-4 py-2 bg-white/50 rounded-xl border border-emerald-100 text-center text-xs font-bold text-slate-600 truncate">
                                                        {interimTranscript || "Listening..."}
                                                    </div>
                                                    <button 
                                                        onClick={stopRecording}
                                                        className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm"
                                                    >
                                                        <Square className="w-3 h-3 fill-current" />
                                                        Stop Speaking
                                                    </button>
                                                </div>
                                            ) : isSubmitting ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Analysing structure...</span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={startRecording}
                                                    disabled={isAITurn}
                                                    className={`size-16 rounded-full flex items-center justify-center shadow-xl transition-all ${!isAITurn ? 'bg-emerald-500 text-white shadow-emerald-100 hover:scale-110 active:scale-90 animate-infinite-pulse' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                                >
                                                    <Mic className="size-6" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Session Log */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm max-h-[260px] overflow-y-auto overflow-x-hidden">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-emerald-500" /> Live Discussion Log
                                </h4>
                                <div className="space-y-4">
                                    {chatHistory.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-xs font-bold italic text-slate-400">Discussion log will appear here...</p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex gap-3 ${msg.speaker === 'Student' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`px-5 py-4 rounded-2xl text-sm max-w-[85%] ${msg.speaker === 'Student' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-700 font-bold'}`}>
                                                <p className="leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Review Page */}
                <AnimatePresence>
                    {phase === 'REVIEW' && gradingResult && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md p-6 flex items-center justify-center">
                            <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                                <div className="p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12 text-slate-800">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-widest">
                                                <div className="px-4 py-1.5 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-100">Criterion D Mastery</div>
                                                <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full">Grade 5** Target</div>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-4">Ideas & Organisation Report</h2>
                                            <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-xl">
                                                {gradingResult.feedback?.summary}
                                            </p>
                                        </div>
                                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center min-w-[220px] relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
                                            <div className="text-7xl font-black text-emerald-600 mb-1 group-hover:scale-110 transition-transform duration-500">{gradingResult.scores?.total || 0}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Marks / 28</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                                        {[
                                            { label: 'Development', score: gradingResult.scores?.development },
                                            { label: 'Relevance', score: gradingResult.scores?.relevance },
                                            { label: 'Signposting', score: gradingResult.scores?.signposting },
                                            { label: 'Organisation', score: gradingResult.scores?.organisation }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 flex flex-col hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-50 transition-all group">
                                                <div className="flex justify-between items-end mb-4">
                                                    <div className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{stat.score}<span className="text-sm text-slate-300">/7</span></div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</div>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(stat.score / 7) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-emerald-500 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] mb-12 relative overflow-hidden shadow-2xl">
                                        <Sparkles className="absolute top-0 right-0 p-10 w-40 h-40 opacity-10" />
                                        <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-emerald-400 mb-6 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> Strategic PEEL Analysis
                                        </h4>
                                        <p className="text-2xl font-black leading-tight italic opacity-95 text-slate-100 max-w-2xl">
                                            "{gradingResult.feedback?.peel_analysis || "Focus on linking your explanation back to the main point more consistently."}"
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={() => window.location.reload()} className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-sm">
                                            Restart Drill
                                        </button>
                                        <button onClick={() => navigate('/speaking/menu')} className="flex-1 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 group">
                                            Return to Hub
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
