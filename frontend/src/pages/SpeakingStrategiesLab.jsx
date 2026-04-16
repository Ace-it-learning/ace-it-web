import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { Mic, Play, Square, Volume2, Loader2, ArrowRight, Zap, Sparkles, MessageSquare, Brain, Target, Info, ChevronRight, CheckCircle2, Clock, User, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeakingWaveform from '../components/speaking/SpeakingWaveform';

const FILLERS = [
    "Hmm, that's an interesting point. Let me think...",
    "Right, I see where you're coming from...",
    "That's a valid perspective. Actually, I believe...",
    "I haven't thought about it that way before. If we consider...",
    "Good point! Adding on to what you said...",
    "I agree with that. In fact, we should also look at..."
];

const SpeakingStrategiesLab = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeAgent, equipment } = useAvatar();
    // Robust Avatar Sync Helper
    const getStudentAvatar = () => {
        if (equipment?.student?.image) {
            // Ensure path starts with /avatars/ if it looks like a filename
            if (equipment.student.image.startsWith('s_') && !equipment.student.image.includes('/')) {
                return `/avatars/${equipment.student.image}`;
            }
            return equipment.student.image;
        }
        return '/avatars/student_male_1.jpg'; // DSE default
    };

    // 1. Module & Content Selection
    const topicId = searchParams.get('topic') || 'b_1';
    const level = searchParams.get('level') || '3';
    
    const [isLoading, setIsLoading] = useState(true);
    const [questData, setQuestData] = useState(null);
    const [phase, setPhase] = useState('IDLE'); // IDLE, INTRO, DISCUSSION, OUTRO, REVIEW
    
    // Discussion State
    const [turnIndex, setTurnIndex] = useState(0); // 0 to 8
    const [chatHistory, setChatHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const [isAITurn, setIsAITurn] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState('Candidate_A'); // Locked to Annie
    
    // Interaction States
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // For TTS
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [activeSpeechText, setActiveSpeechText] = useState("");

    // Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);
    const audioRef = useRef(null);
    const timerRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // 2. Initial Setup
    useEffect(() => {
        const fetchQuest = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/speaking/quest/generate?module=interaction&level=${level}&focus=${topicId}&uid=${user?.uid || 'guest'}`);
                if (!res.ok) throw new Error('Generation failed');
                const data = await res.json();
                const segment = data.segments?.[0];
                if (segment) {
                    setQuestData({
                        ...data,
                        stimulus: segment.stimulus,
                        strategy_goal: segment.strategy_goal,
                        power_phrases: segment.power_phrases || []
                    });
                }
            } catch (err) {
                console.error('Quest load error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuest();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopAllAudio();
        };
    }, [topicId, level]);

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
        if (phase === 'INTRO') {
            runIntro();
        } else if (phase === 'OUTRO') {
            runOutro();
        }
    }, [phase]);

    // 4. Core Logic Functions
    const stopAllAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    const playDirectAudio = (base64, text, role, onEnd) => {
        if (!base64) return playAudio(text, role, onEnd);
        
        setIsSpeaking(true);
        setActiveSpeechText(text);

        const audioUrl = `data:audio/wav;base64,${base64}`;
        const audioObj = new Audio();
        audioObj.src = audioUrl;
        audioObj.preload = "auto";
        audioRef.current = audioObj;

        const cleanup = () => {
            setIsSpeaking(false);
            setActiveSpeechText("");
            if (onEnd) {
                const cb = onEnd;
                onEnd = null;
                cb();
            }
        };

        audioObj.onended = cleanup;
        audioObj.onerror = (e) => {
            console.error("Direct Audio playback error:", e);
            cleanup();
        };

        const failSafe = setTimeout(() => {
            if (audioRef.current === audioObj && isSpeaking) {
                console.warn("Direct Audio fail-safe triggered");
                cleanup();
            }
        }, 60000);

        audioObj.play().catch(e => {
            console.error("Direct Playback blocked, falling back to synthesis:", e);
            playAudio(text, role, onEnd);
        });
    };

    const playAudio = async (text, role, onEnd) => {
        stopAllAudio();
        setIsSpeaking(true);
        setActiveSpeechText(text);

        try {
            const res = await fetch(`${API_URL}/api/lab/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    languageCode: 'en-GB',
                    gender: 'FEMALE',
                    premium: true // Force Premium Multimodal Speech
                })
            });

            if (!res.ok) throw new Error('TTS failed');
            const { audio } = await res.json();
            const audioUrl = `data:audio/wav;base64,${audio}`;
            const audioObj = new Audio();
            audioObj.src = audioUrl;
            audioObj.preload = "auto"; // Pre-buffer to prevent midway stalling
            audioRef.current = audioObj;
            
            const cleanup = () => {
                if (escapeHatch) clearTimeout(escapeHatch);
                setIsSpeaking(false);
                setActiveSpeechText("");
                if (onEnd) {
                    const cb = onEnd;
                    onEnd = null; // Prevent double trigger
                    cb();
                }
            };

            // HARD ESCAPE HATCH: If after 20 seconds we haven't finished, force proceed.
            // This prevents the lab from getting stuck if anything hangs.
            const escapeHatch = setTimeout(() => {
                console.warn("Speech Escape Hatch triggered - moving on.");
                cleanup();
            }, 20000);

            audioObj.onended = cleanup;
            audioObj.onerror = (e) => {
                console.error("Audio object error:", e);
                cleanup();
            };

            // Standard fail-safe (for long audio)
            const failSafe = setTimeout(() => {
                if (audioRef.current === audioObj && isSpeaking) {
                    console.warn("Audio fail-safe triggered");
                    cleanup();
                }
            }, 60000);

            try {
                await audioObj.play();
            } catch (playErr) {
                console.warn("Audio play() blocked/failed, falling back to local synthesis:", playErr);
                clearTimeout(failSafe);
                throw playErr; // Trigger catch block fallback
            }
        } catch (err) {
            console.error('TTS playback error - falling back to speechSynthesis:', err);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            
            const cleanup = () => {
                setIsSpeaking(false);
                setActiveSpeechText("");
                if (onEnd) {
                    const cb = onEnd;
                    onEnd = null;
                    cb();
                }
            };

            utterance.onend = cleanup;
            utterance.onerror = (e) => {
                console.error("SpeechSynthesis error:", e);
                cleanup();
            };

            // Force cleanup after a while if synthesis hangs
            setTimeout(cleanup, 15000);

            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } else {
                cleanup(); // No speech support, just move on
            }
        }
    };

    const runIntro = () => {
        const introText = `Good afternoon. We are here to discuss "${questData?.scenario}". Annie, would you like to start?`;
        playAudio(introText, 'Tutor', () => {
            setPhase('DISCUSSION');
            setTurnIndex(1);
            triggerAITurn(true); // First turn is the pre-written stimulus
        });
    };

    const runOutro = () => {
        const outroText = `Thank you everyone. That is all the time we have for today. Let's wrap up the discussion there.`;
        playAudio(outroText, 'Tutor', () => {
            submitFinalSession();
        });
    };

    const triggerAITurn = async (isFirst = false, audioBlob = null) => {
        setIsAITurn(true);
        let turnText = "";

        if (isFirst) {
            turnText = questData?.stimulus;
        } else {
            // Latency Masking: Show a filler phrase immediately while processing
            setIsThinking(true);
            const randomFiller = FILLERS[Math.floor(Math.random() * FILLERS.length)];
            setActiveSpeechText(randomFiller);

            // Fetch dynamic response from AI
            try {
                const formData = new FormData();
                formData.append('history', JSON.stringify(chatHistory));
                formData.append('current_speaker', currentSpeaker || 'Candidate_A');
                formData.append('topic', questData?.scenario);
                formData.append('level', level);
                if (audioBlob) {
                    formData.append('audio', audioBlob, 'turn.webm');
                }

                const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await res.json();
                setIsThinking(false);
                
                // If there was a user transcript returned, add it to history first
                if (data.user_transcript) {
                    setChatHistory(prev => [...prev, { speaker: 'Student', text: data.user_transcript }]);
                }
                
                turnText = data.content || "That's an interesting point. What do the rest of you think?";
                aiDirectAudio = data.audio; // Pre-load direct audio
                setIsThinking(false);
                
                // Persona Locking: Annie only, no rotation
                setCurrentSpeaker('Candidate_A');
            } catch (e) {
                console.error("AI Turn Error:", e);
                turnText = "I agree with that. We should also consider other options.";
            }
        }

        let aiDirectAudio = null; // Defined above for closure use
        if (false) {} // Placeholder to keep logic clean

        const currentAILabel = currentSpeaker || 'Candidate_A';
        playAudio(turnText, currentAILabel, () => {
            setChatHistory(prev => [...prev, { speaker: currentAILabel, text: turnText }]);
            setIsAITurn(false);
            
            if (!isFirst) {
                setTurnIndex(prev => prev + 1);
                if (turnIndex >= 7) {
                    setPhase('OUTRO');
                }
            }
        });
    };

    const handleUserRecordingFinished = async (blob) => {
        setIsSubmitting(true);
        try {
            await triggerAITurn(false, blob);
        } catch (err) {
            console.error('Recording finish error:', err);
        } finally {
            setIsSubmitting(false);
            setRecordedBlob(null);
        }
    };

    const startRecording = async () => {
        if (isAITurn || phase !== 'DISCUSSION') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
            mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
                if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
                setVoiceLevel(0);
                stream.getTracks().forEach(t => t.stop());
                
                // Transcribe and continue
                await handleUserRecordingFinished(blob);
            };
            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Record error:', err);
        }
    };


    const stopRecording = () => {
        if (mediaRecorder.current) mediaRecorder.current.stop();
        setIsRecording(false);
    };

    const submitFinalSession = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('module', 'interaction');
            formData.append('quest_id', questData.template_id);
            formData.append('level', level);
            formData.append('uid', user?.uid || 'guest');
            formData.append('messages', JSON.stringify(chatHistory));

            const res = await fetch(`${API_URL}/api/speaking/quest/submit`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            setGradingResult(data);
            setPhase('REVIEW');
        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (phase === 'REVIEW' && gradingResult) {
        const { scores, feedback } = gradingResult;
        const totalScore = scores?.total || 0;

        const getLevel = (s) => {
            if (s >= 26) return "5**";
            if (s >= 23) return "5*";
            if (s >= 20) return "5";
            if (s >= 16) return "4";
            if (s >= 12) return "3";
            if (s >= 8) return "2";
            return "1";
        };

        return (
            <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-y-auto">
                {/* 1. Hero Header */}
                <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-6">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Communication Performance</span>
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Quest Module: Strategies</span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Session Mastery Report</h1>
                            <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
                                {feedback?.summary || "Great effort! Here is your detailed interaction analysis."}
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center min-w-[220px] relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                            <div className="text-7xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform duration-500">Level {getLevel(totalScore)}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Predicted Grade ({totalScore}/28)</div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 mt-12 space-y-12">
                    {/* 2. Domain Breakdown */}
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                            <Target className="w-5 h-5 text-indigo-500" /> Domain Mastery Analysis
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Facilitation', score: scores?.facilitation, desc: 'Inviting others to speak' },
                                { label: 'Active Listening', score: scores?.listening, desc: 'Recasting & reacting' },
                                { label: 'Turn Taking', score: scores?.turn_taking, desc: 'Managing gap entries' },
                                { label: 'Bridging', score: scores?.bridging, desc: 'Connecting peer ideas' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{stat.score}<span className="text-sm text-slate-300">/7</span></div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stat.score / 7) * 100}%` }}
                                            transition={{ delay: 0.2, duration: 1 }}
                                            className="h-full bg-indigo-500 rounded-full" 
                                        />
                                    </div>
                                    <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase">{stat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Pros & Cons (Strategic Deep Dive) */}
                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3">
                                <Zap className="w-5 h-5" /> Communication Strengths
                            </h2>
                            <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-8 space-y-4">
                                {(feedback?.pros || ["Consistently interacted with peers", "Used appropriate opening/closing markers"]).map((pro, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 size-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                        <p className="text-slate-700 font-bold leading-relaxed">{pro}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5" /> Areas to Refine
                            </h2>
                            <div className="bg-amber-50/50 rounded-3xl border border-amber-100 p-8 space-y-4">
                                {(feedback?.cons || ["More bridging needed between Candidate B and C", "Increase frequency of body language indicators"]).map((con, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 size-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white font-black text-[10px]">!</div>
                                        <p className="text-slate-700 font-bold leading-relaxed">{con}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 4. Aim for Higher Score (Level 5 Roadmap) */}
                    <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Target className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Target Roadmap: Level 5* & 5** Mastery</h2>
                            <h3 className="text-4xl font-black mb-8 leading-tight">Expert Strategy for your next mission</h3>
                            <div className="space-y-6">
                                {(feedback?.roadmap_tips || ["Use advanced bridging markers like 'That is a compelling point, and it segments nicely into...'", "Explicitly invite the silent partner twice per discussion"]).map((tip, i) => (
                                    <div key={i} className="flex gap-6 items-start group">
                                        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i + 1}</div>
                                        <p className="text-slate-400 font-bold group-hover:text-slate-200 transition-colors text-lg">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 5. Discussion Transcript */}
                    <section className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                             <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Discussion Archive
                            </h4>
                        </div>
                        <div className="p-8 max-h-[500px] overflow-y-auto space-y-6">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.speaker === 'Student' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-2 px-2">{msg.speaker}</span>
                                    <div className={`max-w-[80%] px-6 py-4 rounded-[1.5rem] font-bold text-sm ${msg.speaker === 'Student' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 6. Final Actions */}
                    <section className="flex flex-col md:flex-row gap-4 pt-10">
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex-1 py-6 bg-white border-2 border-slate-200 text-slate-600 rounded-3xl font-black text-xl hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3"
                        >
                            <RotateCcw className="w-6 h-6" /> Restart Challenge
                        </button>
                        <button 
                            onClick={() => navigate('/speaking/menu')}
                            className="flex-1 py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group"
                        >
                            Continue to Roadmap
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </section>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold animate-pulse">Initializing Strategy Lab...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-4">
            <main className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col gap-8">
                {/* 1. Header Info (Non-floating) */}
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">{questData?.scenario}</h1>
                            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Turn {turnIndex} of 8 • Strategy Lab</p>
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
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Start Discussion
                            </button>
                        )}
                    </div>
                </div>

                {/* Tutor Overlay/Phase Indicator (Moved to Top) */}
                <AnimatePresence>
                    {(phase === 'INTRO' || phase === 'OUTRO') && (
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
                                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">{activeAgent.name}</h4>
                                <p className="text-lg font-bold leading-tight">{activeSpeechText}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Goal Card */}
                <AnimatePresence>
                    {phase !== 'REVIEW' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                                    <Brain className="w-8 h-8 text-indigo-100" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mb-1">Pedagogical Goal</h2>
                                    <p className="text-2xl font-black leading-tight max-w-2xl">{questData?.strategy_goal}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left: Speaker A */}
                    <div className="flex flex-col gap-4">
                        <motion.div 
                            initial={false}
                            animate={{ scale: isAITurn ? 1.02 : 1 }}
                            className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 overflow-hidden relative flex-1 ${isAITurn ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSpeaker || 'Candidate_A'}`} 
                                        alt={currentSpeaker} 
                                        className="size-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800">
                                        {currentSpeaker?.replace('_', ' ') || 'Candidate A'}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400">Current Partner</p>
                                </div>
                                {isAITurn && (
                                    <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
                                        {isThinking ? "Thinking..." : "Speaking"}
                                    </div>
                                )}
                            </div>

                            <div className="min-h-[120px] bg-slate-50 rounded-3xl p-6 relative">
                                <p className={`text-lg font-bold leading-relaxed transition-all duration-700 ${!isSpeaking && !activeSpeechText ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                                    {activeSpeechText || (chatHistory.filter(m => m.speaker === (currentSpeaker || 'Candidate_A')).pop()?.text || "Waiting to start...") }
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Response */}
                    <div className="flex flex-col gap-4">
                        <motion.div 
                            className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 relative flex-1 ${!isAITurn && phase === 'DISCUSSION' ? 'border-emerald-500 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-14 rounded-2xl bg-white flex items-center justify-center border-2 border-slate-100 shadow-xl overflow-hidden group">
                                    {equipment?.student?.image ? (
                                        <img 
                                            src={getStudentAvatar()} 
                                            alt="Chosen Avatar" 
                                            className="size-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            onError={(e) => { e.target.src = user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'; }}
                                        />
                                    ) : user?.photoURL ? (
                                        <img src={user.photoURL} alt="Y" className="size-full object-cover" />
                                    ) : (
                                        <div className="text-indigo-600 font-black text-xl">{user?.displayName?.charAt(0) || "Y"}</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800">{user?.displayName || "You"}</h3>
                                    <p className="text-xs font-bold text-slate-400">Student Identity (Candidate D)</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 rounded-3xl p-6 min-h-[160px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 group hover:border-indigo-300 transition-colors">
                                    {isRecording ? (
                                        <>
                                            <div className="w-full">
                                                <SpeakingWaveform isRecording={isRecording} />
                                            </div>
                                            <button 
                                                onClick={stopRecording}
                                                className="size-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-100 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Square className="fill-current w-6 h-6" />
                                            </button>
                                            <span className="text-[10px] font-black uppercase text-red-500 animate-pulse tracking-widest">Recording...</span>
                                        </>
                                    ) : isSubmitting ? (
                                        <>
                                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Processing response...</p>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                disabled={isAITurn || phase !== 'DISCUSSION'}
                                                onClick={startRecording}
                                                className={`size-16 flex items-center justify-center rounded-full shadow-xl transition-all ${!isAITurn && phase === 'DISCUSSION' ? 'bg-emerald-500 text-white shadow-emerald-100 hover:scale-110 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                            >
                                                <Mic className="w-8 h-8" />
                                            </button>
                                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                                                {isAITurn ? 'Waiting for Candidate A...' : (phase === 'DISCUSSION' ? 'Click to speak' : 'Press Start to begin')}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">Strategy Palette</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {questData?.power_phrases?.map((phrase, i) => (
                                            <div key={i} className="px-4 py-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-default shadow-sm italic">
                                                "{phrase}"
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Session Log (Small) */}
                {chatHistory.length > 0 && (
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm max-h-[300px] overflow-y-auto">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Live Discussion Log
                        </h4>
                        <div className="space-y-4">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.speaker === 'Student' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${msg.speaker === 'Student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                        <p className="text-[9px] font-black opacity-50 uppercase mb-1">{msg.speaker}</p>
                                        <p className="font-medium">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
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
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest">Criterion B Session Mastery</div>
                                                <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">Level {level}</div>
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">Performance Report</h2>
                                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                                {gradingResult.feedback?.summary}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-w-[200px] shadow-inner">
                                            <div className="text-5xl font-black text-indigo-600 mb-2">{gradingResult.scores?.total || 0}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Marks / 28</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                        {[
                                            { label: 'Facilitation', score: gradingResult.scores?.facilitation },
                                            { label: 'Listening', score: gradingResult.scores?.listening },
                                            { label: 'Turn Taking', score: gradingResult.scores?.turn_taking },
                                            { label: 'Bridging', score: gradingResult.scores?.bridging }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col items-center group hover:border-indigo-300 transition-all">
                                                <div className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{stat.score}/7</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                            </div>
                                        ))}
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
                                            className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
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

export default SpeakingStrategiesLab;
