import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { Mic, Play, Square, Volume2, Loader2, ArrowRight, Zap, Sparkles, MessageSquare, Brain, Target, Info, ChevronRight, CheckCircle2, Clock, User, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeakingWaveform from '../components/speaking/SpeakingWaveform';
import { useAzureSpeechRecognition } from '../hooks/useAzureSpeechRecognition';
import { useAzureTTS } from '../hooks/useAzureTTS';

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
            const img = equipment.student.image;
            if (img.startsWith('/') || img.startsWith('http')) return img;
            if (img.startsWith('s_') && !img.includes('/')) {
                return `/avatars/${img}`;
            }
            return img;
        }
        return '/avatars/Student/Marcus.jpeg';
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
    const [currentSpeaker, setCurrentSpeaker] = useState('Candidate_A'); // Locked to Annie
    
    // Interaction States
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [speechState, setSpeechState] = useState({ 
        text: "", 
        role: null, 
        isSpeaking: false 
    });
    const [sttError, setSttError] = useState(null);

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
    const isFetchingRef = useRef({}); // Phase 48: Independent Fetching Status
    const localTurnQueue = useRef([]); // Phase 48: Pre-fetching buffer
    const isTurnInProgressRef = useRef(false); // Phase 48: Singleton guard
    const streamRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const { speak, stop } = useAzureTTS({ uid: user?.uid });

    // 2. Initial Setup
    useEffect(() => {
        const fetchQuest = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/speaking/quest/generate?module=interaction&level=${level}&focus=${topicId}&uid=${user?.uid || 'guest'}`, {
                    signal: AbortSignal.timeout(15000)
                });
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

        // Listen for tab close/navigation to kill ghost audio
        window.addEventListener('beforeunload', stopAllAudio);
        window.addEventListener('pagehide', stopAllAudio);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            window.removeEventListener('beforeunload', stopAllAudio);
            window.removeEventListener('pagehide', stopAllAudio);
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
        } else if (phase === 'DISCUSSION') {
            // Pre-connect Azure STT so recording starts instantly when user clicks mic
            prepareAzureSTT();
        }
    }, [phase]);

    // 4. Core Logic Functions
    const stopAllAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.src = "";
            audioRef.current.load();
            audioRef.current = null;
        }
        stop();
        setSpeechState({ text: "", role: null, isSpeaking: false });
    };

    const playDirectAudio = (base64, text, role, onEnd) => {
        playAudio(text, role, onEnd);
    };

    const playAudio = (text, role, onEnd) => {
        stop();
        const cleaned = text.replace(/^(Candidate[ _][A-D]|Examiner|Tutor):/i, "").replace(/\*.*?\*/g, "").trim();
        setSpeechState({ text: cleaned, role, isSpeaking: true });

        const voiceOpts = { onEnd };
        if (role === 'Tutor' || role === 'Examiner') {
            voiceOpts.pitch = 1.0;
            voiceOpts.rate = 0.9;
        } else {
            voiceOpts.pitch = 1.05;
            voiceOpts.rate = 1.0;
        }

        const cleanup = () => {
            setSpeechState({ text: "", role: null, isSpeaking: false });
        };

        speak(cleaned, role, voiceOpts).then(cleanup).catch(cleanup);
    };

    const fetchBatch = async (hintSpeaker = "Annie", userTranscript = null) => {
        if (isFetchingRef.current[hintSpeaker]) return;
        isFetchingRef.current[hintSpeaker] = true;

        // CRITICAL: If user just spoke, clear any stale pre-fetched turns
        // so Annie responds to the user's actual point, not a generic one
        if (userTranscript) {
            localTurnQueue.current = [];
            console.log(`🧹 Cleared stale pre-fetch queue — user spoke: "${userTranscript.substring(0, 40)}..."`);
        }

        try {
            // Include user's latest transcript in history for context
            const historyToUse = chatHistory.slice(-10);
            const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: historyToUse,
                    current_speaker: hintSpeaker,
                    topic: questData?.scenario || questData?.scenario_intro,
                    level: level,
                    uid: user?.uid || 'guest',
                    user_transcript: userTranscript,
                    user_name: user?.displayName || 'Student',
                    audioOutput: false,
                    mode: 'lab'
                }),
                signal: AbortSignal.timeout(15000)
            });

            const data = await res.json();
            if (data.content) {
                localTurnQueue.current.push({
                    speaker: data.speaker || hintSpeaker,
                    text: data.content
                });
                console.log(`✅ Queued turn for ${hintSpeaker}`);
            }
        } catch (e) {
            console.warn(`⚠️ Background fetch for ${hintSpeaker} Failed:`, e.message);
        } finally {
            isFetchingRef.current[hintSpeaker] = false;
        }
    };

    const runIntro = () => {
        const introText = `Good afternoon. We are here to discuss "${questData?.scenario || questData?.scenario_intro}". Annie, would you like to start?`;
        
        // Phase 48: Pre-fetch Annie's stimulus turn as Janie starts
        fetchBatch("Candidate_A");

        playAudio(introText, 'Tutor', () => {
            setPhase('DISCUSSION');
            setTurnIndex(1);
            triggerAITurn(true); 
        });
    };

    const runOutro = () => {
        // CRITICAL: Stop any ongoing Annie speech and clear her turn queue
        stopAllAudio();
        localTurnQueue.current = [];
        isTurnInProgressRef.current = false;
        setIsAITurn(false);
        
        const outroText = `Thank you everyone. That is all the time we have for today. Let's wrap up the discussion there.`;
        playAudio(outroText, 'Tutor', () => {
            setIsGrading(true);
            submitFinalSession();
        });
    };

    const triggerAITurn = async (isFirst = false, audioBlob = null, userTranscript = null, manualHistory = null) => {
        // BLOCK: Don't start new AI turns during OUTRO, REVIEW, or IDLE phases
        if (phase === 'OUTRO' || phase === 'REVIEW' || phase === 'IDLE') {
            console.log(`🚫 Blocked AI turn — phase is ${phase}`);
            return;
        }
        if (isTurnInProgressRef.current && !isFirst) return;
        isTurnInProgressRef.current = true;
        setIsAITurn(true);

        const target = 'Annie';
        let turnToPlay = null;

        // For first turn, ignore pre-fetched queue and use stimulus directly
        // Pre-fetched turns are generic responses, not the opening stimulus
        if (isFirst) {
            turnToPlay = { text: questData?.stimulus || "Let's start the discussion." };
            console.log("🎯 First turn: using stimulus");
        }
        // Phase 48: Fast-Path - Check for pre-fetched turn first (non-first turns only)
        else if (localTurnQueue.current.length > 0) {
            turnToPlay = localTurnQueue.current.shift();
            console.log("🎯 Playing turn from high-speed buffer");
        } 
        
        // Polling Recovery: If no turn ready yet, poll every 500ms (Max 10s)
        if (!turnToPlay && !isFirst) {
            let waitPoll = 0;
            while (!turnToPlay && waitPoll < 20) {
                if (!isFetchingRef.current[target]) {
                    console.log("⏳ Buffer empty. Starting rescue fetch...");
                    await fetchBatch(target, userTranscript);
                }
                await new Promise(r => setTimeout(r, 500));
                if (localTurnQueue.current.length > 0) {
                    turnToPlay = localTurnQueue.current.shift();
                    break;
                }
                waitPoll++;
            }
        }

        // Fallback responses if API fails - more natural and varied
        const fallbacks = [
            "Actually, I'd like to add that we should think about how this affects students from different backgrounds.",
            "From my perspective, there's another angle we haven't considered yet.",
            "That's worth thinking about, but what if we also looked at some real examples from other schools?",
            "I'm not entirely sure I agree - let me explain why. The issue is more complex than it first appears.",
            "One thing I'd add is that we need to balance different needs here.",
            "Building on that idea, perhaps we could think about the long-term benefits for everyone involved."
        ];
        const fallbackText = fallbacks[turnIndex % fallbacks.length];
        const turnText = turnToPlay?.text || fallbackText;

        // Instant Text Display
        const currentAILabel = 'Annie';
        setChatHistory(prev => [
            ...prev.filter(m => m.text !== "Processing speech..."), 
            { speaker: currentAILabel, text: turnText }
        ]);

        const onPlaybackEnd = () => {
            setIsAITurn(false);
            isTurnInProgressRef.current = false;
            if (!isFirst) {
                setTurnIndex(prev => prev + 1);
                if (turnIndex >= 7) {
                    setPhase('OUTRO');
                }
            }
        };

        playAudio(turnText, currentAILabel, onPlaybackEnd);
    };

    const handleUserRecordingFinished = async (blob, transcription = null) => {
        // Don't process if already handling
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        // Safety timeout: force reset isSubmitting after 20s max
        const safetyTimeout = setTimeout(() => {
            setIsSubmitting(false);
        }, 20000);
        
        try {
            // Get user's final transcript - already added to chatHistory by onFinal
            const userText = transcription || finalTranscriptRef.current || "";
            if (!userText.trim()) {
                setIsSubmitting(false);
                return;
            }
            
            // Use current chat history (which already includes the user's transcript from onFinal)
            // Filter out interim messages to avoid duplicates
            const nextHistory = chatHistory.filter(m => 
                m.text !== "Listening..." && 
                m.text !== "Processing speech..." &&
                !m.isInterim
            );

            // Pass the updated history directly to triggerAITurn to ENSURE context relevance
            await triggerAITurn(false, blob, userText, nextHistory);
        } catch (err) {
            console.error('Recording finish error:', err);
        } finally {
            clearTimeout(safetyTimeout);
            setIsSubmitting(false);
            setRecordedBlob(null);
            setInterimTranscript("");
            finalTranscriptRef.current = "";
        }
    };

    // Azure Speech Recognition Hook
    const {
        startListening: startAzureListening,
        stopListening: stopAzureListening,
        resetTranscript: resetAzureTranscript,
        prepare: prepareAzureSTT
    } = useAzureSpeechRecognition({
        silenceThresholdMs: 2000,
        onPartial: (text) => {
            setInterimTranscript(text);
        },
        onFinal: (text) => {
            finalTranscriptRef.current = text;
            // Replace interim message with final transcript
            setChatHistory(prev => {
                const filtered = prev.filter(m => 
                    m.text !== "Listening..." && 
                    m.text !== "Processing speech..." &&
                    !m.isInterim
                );
                return [...filtered, { speaker: 'Student', text: text, isInterim: false }];
            });
            // Trigger Annie's response when final transcript is ready
            if (text && text.trim()) {
                handleUserRecordingFinished(null, text);
            }
        },
        onError: (err) => {
            console.error('[SpeakingStrategiesLab] Azure STT error:', err);
            setSttError(err.message || 'Speech recognition failed. Please try again.');
            setIsRecording(false);
        }
    });

    const startRecording = async () => {
        if (isAITurn || phase !== 'DISCUSSION') return;
        
        // Clear any previous error
        setSttError(null);
        
        // Phase 48: Predictive Pre-fetching (Discussion Pattern)
        // Start 'thinking' as soon as the student opens the mic
        fetchBatch("Candidate_A");

        try {
            // Get microphone access for waveform visualization
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up waveform visualization
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            const source = audioContext.current.createMediaStreamSource(stream);
            source.connect(analyser.current);
            
            const updateVoiceLevel = () => {
                if (!isRecording) return;
                const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
                analyser.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                setVoiceLevel(avg);
                animationFrame.current = requestAnimationFrame(updateVoiceLevel);
            };
            updateVoiceLevel();

            // Store stream for cleanup
            streamRef.current = stream;
            
            // Reset and start Azure STT
            finalTranscriptRef.current = "";
            setInterimTranscript("");
            resetAzureTranscript();
            await startAzureListening();
            
            setIsRecording(true);
        } catch (err) {
            console.error('Record error:', err);
            setSttError('Microphone access failed. Please check permissions.');
        }
    };

    const stopRecording = () => {
        // Stop waveform animation
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        setVoiceLevel(0);
        
        // Stop Azure STT - this will trigger onFinal with the transcript
        stopAzureListening();
        
        // Clean up waveform stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
        }
        
        setIsRecording(false);
    };

    const submitFinalSession = async () => {
        setIsGrading(true);
        try {
            // Filter out interim messages and clean up chat history before submitting
            const cleanHistory = chatHistory.filter(m => 
                m.text !== "Listening..." && 
                m.text !== "Processing speech..." &&
                !m.isInterim
            );
            
            const formData = new FormData();
            formData.append('module', 'interaction');
            formData.append('quest_id', questData.template_id);
            formData.append('level', level);
            formData.append('uid', user?.uid || 'guest');
            formData.append('messages', JSON.stringify(cleanHistory));
            formData.append('mode', 'lab');

            formData.append('missionName', questData?.scenario || 'Group Discussion Strategy Lab');
            formData.append('paper', 'Speaking');

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
            setIsGrading(false);
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
                            <div className="text-7xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform duration-500">{getLevel(totalScore)}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Predicted DSE Grade ({totalScore}/28)</div>
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

    // Show grading overlay during OUTRO phase while waiting for results
    if (isGrading) {
        const agentName = activeAgent?.name || 'Miss Janie';
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Evaluating Your Session</h2>
                        <p className="text-slate-500 font-medium">{agentName} is reviewing your discussion performance...</p>
                    </div>
                    <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-indigo-600 rounded-full"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>
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
                        {phase === 'INTRO' && (
                            <button 
                                disabled={isAITurn}
                                onClick={async () => {
                                    // Skip tutor intro and jump straight to discussion + recording
                                    stopAllAudio();
                                    setPhase('DISCUSSION');
                                    setTurnIndex(1);
                                    // Pre-connect STT while setting up, then start recording
                                    await prepareAzureSTT();
                                    setTimeout(() => startRecording(), 50);
                                }}
                                className={`px-6 py-2.5 rounded-xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${isAITurn ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-white'}`}
                            >
                                <Mic className="w-4 h-4" />
                                Skip Intro & Start Speaking
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Goal Card (Horizontal & Compact) */}
                <AnimatePresence mode="wait">
                    {phase !== 'REVIEW' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] p-6 text-white shadow-2xl overflow-hidden relative"
                        >
                            <div className="relative z-10 flex flex-row items-center gap-6">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex-shrink-0">
                                    <Brain className="w-6 h-6 text-indigo-100" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mb-0.5">Pedagogical Goal</h2>
                                    <p className="text-xl font-black leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{questData?.strategy_goal}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tutor Overlay/Phase Indicator (Moved down) */}
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
                                <p className="text-lg font-bold leading-tight">{speechState.text}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left: Speaker A */}
                    <div className="flex flex-col gap-4">
                        <motion.div 
                            initial={false}
                            animate={{ scale: speechState.isSpeaking && speechState.role !== 'Tutor' ? 1.02 : 1 }}
                            className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 overflow-hidden relative flex-1 ${speechState.isSpeaking && speechState.role !== 'Tutor' ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 shadow-xl'}`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-slate-200">
                                    <img 
                                        src="/avatars/annie_avatar_1774534170846.png" 
                                        alt="Annie" 
                                        className="size-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800">
                                        {currentSpeaker === 'Candidate_A' ? 'Annie' : (currentSpeaker?.replace('_', ' ') || 'Annie')}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400">Practice buddy</p>
                                </div>
                                 {isAITurn && speechState.isSpeaking && speechState.role !== 'Tutor' && (
                                    <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                                        Speaking
                                    </div>
                                )}
                            </div>

                            <div className="min-h-[120px] bg-slate-50 rounded-3xl p-6 relative">
                                 <p className={`text-lg font-bold leading-relaxed transition-all duration-700 ${!speechState.isSpeaking ? 'text-slate-700' : 'text-slate-700'}`}>
                                    {(speechState.isSpeaking && speechState.role !== 'Tutor') 
                                        ? speechState.text 
                                        : (chatHistory.filter(m => m.speaker === 'Annie' || m.speaker === 'Candidate_A').pop()?.text || "Waiting to start...") 
                                    }
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
                                    <p className="text-xs font-bold text-slate-400">Interaction Partner (Student)</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 rounded-3xl p-6 min-h-[160px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 group hover:border-indigo-300 transition-colors">
                                    {isRecording ? (
                                        <>
                                            <div className="w-full">
                                                <SpeakingWaveform isRecording={isRecording} />
                                            </div>
                                            {/* Live transcript display — Azure STT */}
                                            <div className="w-full px-4 py-3 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Your Speech (Azure STT)</p>
                                                <p className="text-sm font-bold text-slate-800 leading-relaxed min-h-[1.5em]">
                                                    {interimTranscript ? (
                                                        <span className="text-emerald-700">{interimTranscript}</span>
                                                    ) : (
                                                        <span className="text-slate-400 animate-pulse">🎤 Listening... Speak clearly</span>
                                                    )}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={stopRecording}
                                                className="size-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-100 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Square className="fill-current w-6 h-6" />
                                            </button>
                                        </>
                                    ) : isSubmitting ? (
                                        <>
                                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                            <p className="text-xs font-black uppercase text-indigo-600 tracking-widest animate-pulse">Annie is thinking...</p>
                                            <p className="text-[10px] text-slate-400 font-medium">If this takes too long, Annie will respond with a general point</p>
                                        </>
                                    ) : (
                                        <>
                                            {sttError && (
                                                <div className="w-full px-4 py-3 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">Speech Recognition Error</p>
                                                    <p className="text-sm font-bold text-red-800 leading-relaxed">{sttError}</p>
                                                    <button 
                                                        onClick={() => setSttError(null)}
                                                        className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                            <button 
                                                disabled={isAITurn || phase !== 'DISCUSSION'}
                                                onClick={() => { setSttError(null); startRecording(); }}
                                                className={`size-16 flex items-center justify-center rounded-full shadow-xl transition-all ${!isAITurn && phase === 'DISCUSSION' ? 'bg-emerald-500 text-white shadow-emerald-100 hover:scale-110 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                            >
                                                <Mic className="w-8 h-8" />
                                            </button>
                                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                                                {isAITurn ? 'Annie is speaking' : (phase === 'DISCUSSION' ? 'Click to speak' : 'Press Start to begin')}
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
