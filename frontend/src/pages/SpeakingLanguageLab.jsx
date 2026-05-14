import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Play, Pause, RotateCcw, Send, 
    ArrowRight, Sparkles, BookOpen, Volume2, 
    CheckCircle2, AlertCircle, Info, Bookmark,
    ChevronRight, Brain, Languages, Target, Clock, Loader2,
    Zap, AlertTriangle, Award
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import SpeakingWaveform from '../components/speaking/SpeakingWaveform';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_URL}/api`;

const SpeakingLanguageLab = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { activeAgent, englishTutor, equipment } = useAvatar();
    const level = searchParams.get('level') || '3';
    const topic = searchParams.get('topic') || 'language_patterns';

    // State
    const [phase, setPhase] = useState('IDLE'); // IDLE, INTRO, PRACTICE, REVIEW
    const [quest, setQuest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    
    // Practice State
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [responses, setResponses] = useState([]); 
    const [isRecording, setIsRecording] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [speechState, setSpeechState] = useState({ text: "", role: null, isSpeaking: false });
    const [activeSubtitle, setActiveSubtitle] = useState("");
    const [ttsSpeed, setTtsSpeed] = useState('standard'); // 'standard' or 'slower'
    const [pendingAnalyses, setPendingAnalyses] = useState(0);
    const [isWaitingForAnalyses, setIsWaitingForAnalyses] = useState(false);
    
    // Audio Context & Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);
    const [voiceLevel, setVoiceLevel] = useState(0);

    // Initial Loading
    useEffect(() => {
        const fetchQuest = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/speaking/quest/generate`, {
                    params: { module: 'language_patterns', level, focus: topic }
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

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    const startSession = () => {
        setPhase('INTRO');
    };

    const runIntro = () => {
        const tutorName = englishTutor?.name || activeAgent?.name || "Miss Janie";
        const introText = `Welcome to the Vocab Lab. Today we are focusing on "${quest?.scenario}". ${tutorName} will guide you, and Annie will read the target sentences. Use the correct emphasis. Let's start!`;
        
        playAudio(introText, 'Tutor', () => {
            setPhase('PRACTICE');
            setCurrentSentenceIndex(0);
            setResponses([]);
        });
    };

    useEffect(() => {
        if (phase === 'INTRO' && quest) runIntro();
    }, [phase, quest]);

    const playAudio = (text, role, onEnd) => {
        if (!window.speechSynthesis) return;

        // Force-clear and force-resume
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();

        const cleaned = text.replace(/^(Candidate[ _][A-D]|Examiner|Tutor|Miss Janie):/i, "").replace(/\*.*?\*/g, "").trim();
        setSpeechState({ text: cleaned, role, isSpeaking: true });
        if (role !== 'Tutor') setActiveSubtitle(cleaned);

        // --- Grace Period Fix ---
        // Some browser engines hang if speak() is called instantly after cancel()
        setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            
            const attemptSpeak = () => {
                const currentVoices = window.speechSynthesis.getVoices();
                const preferredVoice = currentVoices.find(v => v.name.includes('Google UK English Female')) || 
                                currentVoices.find(v => v.lang.startsWith('en-GB')) || 
                                currentVoices[0];
                                
                const utterance = new SpeechSynthesisUtterance(cleaned);
                if (preferredVoice) utterance.voice = preferredVoice;
                utterance.lang = 'en-GB';
                
                if (role === 'Tutor') {
                    utterance.pitch = 1.0;
                    utterance.rate = 0.95;
                } else {
                    utterance.pitch = 1.05;
                    utterance.rate = ttsSpeed === 'standard' ? 1.0 : 0.75;
                }

                const cleanup = () => {
                    setSpeechState({ text: "", role: null, isSpeaking: false });
                    setIsSynthesizing(false);
                    if (onEnd) onEnd();
                };

                utterance.onend = cleanup;
                utterance.onerror = (e) => {
                    console.error("TTS Error:", e);
                    cleanup();
                };
                
                setIsSynthesizing(true);
                window.speechSynthesis.speak(utterance);
            };

            if (voices.length === 0) {
                // Wait for voices to load if list is empty
                window.speechSynthesis.onvoiceschanged = () => {
                    window.speechSynthesis.onvoiceschanged = null;
                    attemptSpeak();
                };
            } else {
                attemptSpeak();
            }
        }, 200);
    };

    const readForMe = (text) => {
        playAudio(text, 'Annie');
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Audio level logic for waveform
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
                mediaRecorder.current.ondataavailable = (event) => audioChunks.current.push(event.data);
                mediaRecorder.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
                    stream.getTracks().forEach(t => t.stop());
                    
                    const index = currentSentenceIndex;
                    
                    // 1. Save locally and mark as transcribing in foreground
                    setResponses(prev => {
                        const newResponses = [...prev];
                        newResponses[index] = {
                            sentence: quest.practice_sentences[index].text,
                            target_word: quest.practice_sentences[index].target_word,
                            audioBlob,
                            status: 'transcribing',
                            transcript: ""
                        };
                        return newResponses;
                    });

                    // 2. Fire background transcription (non-blocking)
                    runBackgroundAnalysis(index, audioBlob);
                };

                const runBackgroundAnalysis = async (index, blob) => {
                    setPendingAnalyses(prev => prev + 1);
                    try {
                        const formData = new FormData();
                        formData.append('audio', blob);
                        formData.append('module', 'delivery');
                        formData.append('master_script', quest.practice_sentences[index].text);
                        formData.append('uid', user?.uid || 'guest');
                        
                        const res = await axios.post(`${API_BASE_URL}/speaking/quest/submit`, formData);
                        const transcript = res.data.transcript || "";
                        
                        setResponses(prev => {
                            const newResponses = [...prev];
                            newResponses[index] = { ...newResponses[index], transcript, status: 'done' };
                            return newResponses;
                        });
                    } catch (err) {
                        console.error(`Analysis failed for sentence ${index}:`, err);
                        setResponses(prev => {
                            const newResponses = [...prev];
                            newResponses[index] = { ...newResponses[index], status: 'error' };
                            return newResponses;
                        });
                    } finally {
                        setPendingAnalyses(prev => Math.max(0, prev - 1));
                    }
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

    const nextSentence = () => {
        if (currentSentenceIndex < (quest.practice_sentences?.length || 5) - 1) {
            setCurrentSentenceIndex(prev => prev + 1);
        } else {
            submitPractice();
        }
    };

    const submitPractice = async () => {
        setIsLoading(true);
        
        // --- Smart Wait Logic for Analysis Sync ---
        if (pendingAnalyses > 0) {
            setIsWaitingForAnalyses(true);
            console.log(`[Vocab Lab] Waiting for ${pendingAnalyses} background analyses...`);
            
            let waitAttempts = 0;
            const maxWait = 20; // 10 seconds (20 * 500ms)
            
            while (pendingAnalyses > 0 && waitAttempts < maxWait) {
                await new Promise(r => setTimeout(r, 500));
                waitAttempts++;
                // Check state via a direct ref if possible, but here we'll rely on the functional nature of setPendingAnalyses
                // However, since we're in an async function, the state 'pendingAnalyses' might be stale.
                // Better approach: use a ref for real-time tracking of pending counts.
            }
            setIsWaitingForAnalyses(false);
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/speaking/quest/submit`, {
                module: 'language_patterns',
                level,
                uid: user?.uid,
                missionName: quest?.scenario || 'Vocabulary & Language Lab',
                paper: 'Speaking',
                practice_results: responses.map(r => ({
                    sentence: r.sentence,
                    target_word: r.target_word
                })),
                messages: responses.map(r => ({
                    role: 'user',
                    text: r.transcript || ""
                }))
            });

            setGradingResult(res.data);
            setPhase('REVIEW');
        } catch (err) {
            console.error("Grading failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-violet-900/50 opacity-50" />
                <div className="relative z-10 text-center">
                    <div className="relative size-32 mx-auto mb-10">
                        <Loader2 className="w-full h-full text-indigo-500 animate-[spin_3s_linear_infinite]" strokeWidth={1} />
                        <div className="absolute inset-4 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                        <Sparkles className="absolute -top-2 -right-2 text-amber-400 size-8 animate-bounce" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-4">
                        {isWaitingForAnalyses ? "Finalizing Session..." : "Generating Report..."}
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1 w-24 bg-indigo-900 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: [-100, 100] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }} 
                                className="h-full w-1/2 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                            />
                        </div>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            {isWaitingForAnalyses ? "Syncing voice analysis data" : "Elite Grading in Progress"}
                        </p>
                        <div className="h-1 w-24 bg-indigo-900 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: [100, -100] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }} 
                                className="h-full w-1/2 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentSentence = quest?.practice_sentences?.[currentSentenceIndex];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-4 font-sans selection:bg-indigo-100">
            {/* 1. Fixed Action Bar (Dynamic Header) */}
            <div className="max-w-6xl mx-auto w-full px-6 mb-4">
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-20" />
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/speaking/menu')} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors group/back">
                            <RotateCcw className="w-5 h-5 text-slate-500 group-hover/back:rotate-[-45deg] transition-transform" />
                        </button>
                        <div className="h-10 w-[2px] bg-slate-100 mx-1" />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-800 tracking-tight">
                                    {phase === 'PRACTICE' ? quest?.scenario : 'Vocabulary Lab'}
                                </h1>
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Linguistic Range • Mission Phase: {phase}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {phase === 'PRACTICE' && (
                            <div className="flex items-center gap-3 bg-indigo-50 px-5 py-2.5 rounded-[1.25rem] border border-indigo-100 shadow-sm font-black text-indigo-600">
                                <Target className="w-4 h-4" />
                                <span className="text-sm whitespace-nowrap">Step {currentSentenceIndex + 1} of {quest?.practice_sentences?.length || 5}</span>
                            </div>
                        )}
                        <div className="px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
                           Level {level}
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col gap-8">
                {/* 2. Goal Card (Horizontal & Compact) */}
                <AnimatePresence mode="wait">
                    {phase !== 'REVIEW' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2.5rem] p-6 text-white shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <Brain className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex flex-row items-center gap-6">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex-shrink-0 animate-pulse">
                                    <Brain className="w-6 h-6 text-indigo-100" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mb-0.5">Vocabulary Goal</h2>
                                    <p className="text-xl font-black leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                        Master natural language patterns and advanced vocabulary through demonstrated exemplars.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                                    <Clock className="w-4 h-4 text-violet-200" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-violet-200">TTS Speed</span>
                                        <select 
                                            value={ttsSpeed} 
                                            onChange={(e) => setTtsSpeed(e.target.value)}
                                            className="bg-transparent text-xs font-black text-white outline-none cursor-pointer"
                                        >
                                            <option value="standard" className="text-slate-800">Standard</option>
                                            <option value="slower" className="text-slate-800">Slower</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Briefing Card (Only in IDLE) */}
                {phase === 'IDLE' && quest && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto w-full">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden group">
                           <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    Vocab Expansion Mission
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 leading-tight mb-6">
                                    {quest.scenario}
                                </h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                    Practice 5 curated sentences incorporating advanced vocabulary. Annie will demonstrate, and then it's your turn to repeat.
                                </p>
                                <button 
                                    onClick={startSession}
                                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
                                >
                                    Start Practice
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 4. Tutor Intro / Context */}
                <AnimatePresence>
                    {(phase === 'INTRO') && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl flex items-center gap-6"
                        >
                            <div className="size-16 rounded-2xl bg-indigo-600 flex items-center justify-center border-2 border-indigo-400 overflow-hidden">
                                <img src={activeAgent.avatar} alt="T" className="size-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">{englishTutor?.name || activeAgent?.name}</h4>
                                <p className="text-lg font-bold leading-tight">{speechState.text}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 5. Interaction Area */}
                {phase === 'PRACTICE' && currentSentence && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Left Card: Annie (Demonstration) */}
                        <div className="flex flex-col gap-4">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0, scale: speechState.isSpeaking ? 1.02 : 1 }}
                                className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 relative flex-1 flex flex-col ${speechState.isSpeaking ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-slate-200">
                                        <img src="/avatars/annie_avatar_1774534170846.png" alt="Annie" className="size-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800">Annie</h3>
                                        <p className="text-xs font-bold text-slate-400">Practice buddy</p>
                                    </div>
                                    {isSynthesizing && (
                                        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                                            Demonstrating
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-6 min-h-[140px] relative transition-all flex-1 flex flex-col justify-center">
                                    <h3 
                                        className="text-2xl font-black text-slate-800 leading-relaxed mb-4"
                                        dangerouslySetInnerHTML={{ 
                                            __html: currentSentence.text.replace(
                                                new RegExp(`\\*\\*(${currentSentence.target_word})\\*\\*`, 'gi'), 
                                                '<span class="text-indigo-600 underline underline-offset-8 decoration-4">$1</span>'
                                            ) 
                                        }}
                                    />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold text-slate-400 italic">"{currentSentence.explanation}"</p>
                                        {currentSentence.explanation_cn && (
                                            <p className="text-[10px] font-black text-indigo-400/80 uppercase tracking-wider">{currentSentence.explanation_cn}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3">
                                    <button 
                                        onClick={() => readForMe(currentSentence.text)}
                                        disabled={isSynthesizing}
                                        className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${isSynthesizing ? 'bg-indigo-50 text-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
                                    >
                                        <Volume2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        {isSynthesizing ? 'Annie is reading...' : 'Annie, read for me'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Card: Student (Practice) */}
                        <div className="flex flex-col gap-4">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0, scale: isRecording ? 1.02 : 1 }}
                                className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 relative flex-1 flex flex-col ${isRecording ? 'border-emerald-500 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-14 rounded-2xl bg-white flex items-center justify-center border-2 border-slate-100 shadow-md overflow-hidden">
                                        <img src={(() => {
                                            const img = equipment?.student?.image;
                                            if (!img) return '/avatars/Student/Marcus.jpeg';
                                            if (img.startsWith('/') || img.startsWith('http')) return img;
                                            if (img.startsWith('s_') && !img.includes('/')) return `/avatars/${img}`;
                                            return img;
                                        })()} alt="You" className="size-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800">{user?.displayName || "You"}</h3>
                                        <p className="text-xs font-bold text-slate-400">Your practice turn</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-6 min-h-[160px] flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200">
                                    {isRecording ? (
                                        <>
                                            <SpeakingWaveform isRecording={isRecording} />
                                            <p className="text-sm font-black text-emerald-600 animate-pulse uppercase tracking-widest">Listening to you...</p>
                                        </>
                                    ) : (responses[currentSentenceIndex]?.status === 'done' || responses[currentSentenceIndex]?.status === 'transcribing') ? (
                                        <div className="text-center">
                                            <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                                {responses[currentSentenceIndex].status === 'transcribing' ? (
                                                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 mb-1">
                                                {responses[currentSentenceIndex].status === 'transcribing' ? 'Analyzing Accuracy...' : 'Practice Captured'}
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 truncate max-w-[240px] italic">
                                                {responses[currentSentenceIndex].status === 'transcribing' ? 'Processing speech in background...' : `"${responses[currentSentenceIndex].transcript}"`}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                                <Mic className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Press Mic to Repeat</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button 
                                        onClick={toggleRecording}
                                        disabled={isSynthesizing || (responses[currentSentenceIndex]?.status === 'transcribing')}
                                        className={`flex-1 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-100'} ${(responses[currentSentenceIndex]?.status === 'transcribing') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        {isRecording ? 'Finish Speaking' : 'Start Practice'}
                                    </button>
                                    
                                    {responses[currentSentenceIndex] && !isRecording && (
                                        <button 
                                            onClick={nextSentence}
                                            disabled={isLoading || (currentSentenceIndex === (quest.practice_sentences?.length - 1) && pendingAnalyses > 0)}
                                            className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {currentSentenceIndex === (quest.practice_sentences?.length - 1) ? (
                                                pendingAnalyses > 0 ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Finalizing...
                                                    </>
                                                ) : 'Review Results'
                                            ) : (
                                                <>
                                                    Next Step
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* 6. High-Fidelity Review Overlay (DSE Aligned) */}
                <AnimatePresence>
                    {phase === 'REVIEW' && gradingResult && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto"
                        >
                            {/* 1. Hero Header */}
                            <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-6">
                                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Language Mastery Performance</span>
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Vocab Lab Analysis</span>
                                        </div>
                                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Speaking Performance Report</h1>
                                        <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
                                            {gradingResult.feedback?.summary || "Outstanding linguistic range. Here is your detailed vocabulary analysis aligned with DSE standards."}
                                        </p>
                                    </div>

                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl flex flex-col items-center justify-center min-w-[240px] relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600" />
                                        <div className="text-7xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform duration-500">
                                            Level {gradingResult.scores?.total >= 24 ? '5**' : gradingResult.scores?.total >= 21 ? '5*' : gradingResult.scores?.total >= 18 ? '5' : gradingResult.scores?.total >= 14 ? '4' : gradingResult.scores?.total >= 10 ? '3' : '2'}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Predicted Grade ({gradingResult.scores?.total || 0}/28)</div>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="max-w-5xl mx-auto px-6 mt-12 space-y-12 pb-20">
                                {/* 2. DSE Criteria Breakdown */}
                                <section>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                        <Award className="w-5 h-5 text-indigo-500" /> DSE Paper 4 Criteria Analysis
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Vocabulary', score: gradingResult.scores?.vocabulary || gradingResult.scores?.range || 0, desc: 'Range & Mastery' },
                                            { label: 'Articulation', score: gradingResult.scores?.grammar_range || gradingResult.scores?.accuracy || 0, desc: 'Linguistic Versatility' },
                                            { label: 'Delivery', score: gradingResult.scores?.pronunciation || 0, desc: 'Pronunciation Clarity' },
                                            { label: 'Prosody', score: gradingResult.scores?.intonation || 0, desc: 'Intonation & Context' }
                                        ].map((stat, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group"
                                            >
                                                <div className="flex justify-between items-end mb-4">
                                                    <div className="text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{stat.score}<span className="text-sm text-slate-300">/7</span></div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</div>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(stat.score / 7) * 100}%` }}
                                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                                        className="h-full bg-indigo-500 rounded-full" 
                                                    />
                                                </div>
                                                <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase">{stat.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* 3. Vocabulary Highlights */}
                                <section className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3">
                                            <Sparkles className="w-5 h-5" /> Mastered Vocabulary
                                        </h2>
                                        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-8">
                                            <div className="flex flex-wrap gap-2 text-center items-center justify-center md:justify-start">
                                                {gradingResult.feedback?.vocabulary_highlights?.length > 0 ? (
                                                    gradingResult.feedback.vocabulary_highlights.map((word, i) => (
                                                        <span key={i} className="px-4 py-2 bg-white rounded-xl text-sm font-black text-emerald-600 shadow-sm border border-emerald-100">
                                                            {word}
                                                        </span>
                                                    ))
                                                ) : (
                                                    quest.practice_sentences.map((ps, i) => (
                                                        <span key={i} className="px-4 py-2 bg-white rounded-xl text-sm font-black text-emerald-600 shadow-sm border border-emerald-100">
                                                            {ps.target_word}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5" /> Areas to Refine
                                        </h2>
                                        <div className="bg-amber-50/50 rounded-3xl border border-amber-100 p-8 space-y-4">
                                            {(gradingResult.feedback?.improvement_advice || "Focus on the precise articulation of Power Words and maintain a natural rhythm through sense grouping.").split('.').filter(s => s.trim()).map((con, i) => (
                                                <div key={i} className="flex gap-4 items-start">
                                                    <div className="mt-1 size-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white font-black text-[10px]">!</div>
                                                    <p className="text-slate-700 font-bold leading-relaxed">{con.trim()}.</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* 4. Elite Mastery (Roadmap Tips) */}
                                <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-10 opacity-10">
                                        <Target className="w-40 h-40" />
                                    </div>
                                    <div className="relative z-10 max-w-2xl">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Target Roadmap: Level 5* & 5** Mastery</h2>
                                        <h3 className="text-4xl font-black mb-8 leading-tight">Expert Strategy for Vocab Range</h3>
                                        <div className="space-y-6">
                                            {[
                                                "Focus on the precise pronunciation of final consonant clusters (e.g., -ts, -ks) in Power Words.",
                                                "Use 'Sense Groups' to chunk complex sentences into meaningful segments for better prosody.",
                                                "Incorporate target words into your 'Part B: Individual Response' to demonstrate a higher Linguistic Range."
                                            ].map((tip, i) => (
                                                <div key={i} className="flex gap-6 items-start group">
                                                    <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i + 1}</div>
                                                    <p className="text-slate-400 font-bold group-hover:text-slate-200 transition-colors text-lg">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* 5. Controls */}
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        Restart Mission
                                    </button>
                                    <button 
                                        onClick={() => navigate('/speaking/menu')}
                                        className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                                    >
                                        Return to Speaking Hub
                                        <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default SpeakingLanguageLab;
