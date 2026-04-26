import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import { 
    MessageCircle, ChevronRight, Clock, ShieldCheck, ArrowLeft,
    CheckCircle2, Mic, MicOff, Play, Users, User, Info, AlertCircle, Award, PenTool
} from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import MockCountdownTimer from '../../components/utils/MockCountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';

const SpeakingMockStudio = () => {
    const { paperId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { equipment } = useAvatar();
    const [searchParams, setSearchParams] = useSearchParams();

    const [phase, setPhase] = useState(searchParams.get('phase') || 'LOADING'); 
    const [mockData, setMockData] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [noteCardText, setNoteCardText] = useState("");
    
    // Discussion State
    const [transcript, setTranscript] = useState([]);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);
    const [isUserTurn, setIsUserTurn] = useState(false);
    const [activeSubtitle, setActiveSubtitle] = useState("");
    const [activeSpeechText, setActiveSpeechText] = useState("");
    const [voices, setVoices] = useState([]);
    const [individualQuestion, setIndividualQuestion] = useState("");
    const [individualResponse, setIndividualResponse] = useState("");
    
    // Refs for Interaction Engine
    const chatHistory = useRef([]);
    const localTurnQueue = useRef([]);
    const recognition = useRef(null);
    const isFetchingRef = useRef({});
    const activeUtterance = useRef(null);
    const userSilenceTimer = useRef(null);
    const collectedTranscript = useRef("");
    const lastSpeakerRef = useRef(null);
    const isTurnInProgressRef = useRef(false);
    const activeTurnLoopId = useRef(0);
    const interactionIndexRef = useRef(0);
    const isTransitioning = useRef(false);
    const statusRef = useRef(phase);
    const isQueued = useRef(false);
    const [isQueuedState, setIsQueuedState] = useState(false);
    
    const [debugLogs, setDebugLogs] = useState([]);
    const addLog = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 5));
    };

    // Phase syncing
    const updatePhase = useCallback((newPhase) => {
        setPhase(newPhase);
        statusRef.current = newPhase;
        setSearchParams({ phase: newPhase });
    }, [setSearchParams]);

    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== phase) {
            setPhase(urlPhase);
            statusRef.current = urlPhase;
        }
    }, [searchParams, phase]);

    // Initial Fetch
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
    }, [paperId, navigate, updatePhase]);

    // Initialize Voices
    useEffect(() => {
        const loadVoices = () => {
            if (!window.speechSynthesis) return;
            setVoices(window.speechSynthesis.getVoices());
        };
        if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();
        
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const r = new window.webkitSpeechRecognition();
            r.continuous = true;
            r.interimResults = true;
            r.lang = 'en-HK';
            r.onstart = () => {
                setIsRecording(true);
                collectedTranscript.current = "";
                addLog("🎙️ Listening...");
            };
            r.onend = () => setIsRecording(false);
            r.onresult = (event) => {
                let finalTranscript = "";
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                    else interimTranscript += event.results[i][0].transcript;
                }
                if (interimTranscript) setActiveSpeechText(interimTranscript);
                if (finalTranscript) collectedTranscript.current += " " + finalTranscript;

                if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
                userSilenceTimer.current = setTimeout(() => {
                    const totalSpeech = collectedTranscript.current.trim();
                    if (totalSpeech) {
                        r.stop();
                        handleUserSpeech(totalSpeech);
                    }
                }, 1200);
            };
            recognition.current = r;
        }
        return () => {
            if (recognition.current) {
                try { recognition.current.stop(); } catch (e) {}
            }
        };
    }, [phase]);

    // TTS Helpers
    const getVoice = (role) => {
        const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        const pool = englishVoices.length > 0 ? englishVoices : voices;
        const find = (keywords) => pool.find(v => keywords.some(k => v.name.toLowerCase().includes(k.toLowerCase())));
        
        if (role === 'Examiner') return find(['google us english', 'samantha']) || pool[0];
        if (role === 'Candidate_A') return find(['google uk english female', 'victoria']) || pool[0];
        if (role === 'Candidate_B') return find(['google us english male', 'david', 'guy']) || pool[1] || pool[0];
        if (role === 'Candidate_C') return find(['en-hk', 'daniel']) || pool[2] || pool[0];
        return pool[0];
    };

    const playSpeech = (role, text, onEnd) => {
        const cleaned = text.replace(/^(Candidate[ _][A-D]|Examiner):/i, "").trim();
        if (!cleaned) { if (onEnd) onEnd(); return; }

        setTranscript(prev => [...prev.slice(-10), { role, text: cleaned }]);
        setActiveSubtitle(cleaned);
        
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        const u = new SpeechSynthesisUtterance(cleaned);
        activeUtterance.current = u;
        const voice = getVoice(role);
        if (voice) u.voice = voice;

        if (role === 'Candidate_A') { u.pitch = 1.1; u.rate = 1.0; }
        else if (role === 'Candidate_B') { u.pitch = 1.0; u.rate = 0.85; }
        else if (role === 'Candidate_C') { u.pitch = 0.9; u.rate = 0.92; }

        isTransitioning.current = true;
        u.onend = () => {
            activeUtterance.current = null;
            setActiveSubtitle("");
            isTransitioning.current = false;
            
            if (isQueued.current) {
                isQueued.current = false;
                setIsQueuedState(false);
                startUserTurn();
            } else if (onEnd) onEnd();
        };
        u.onerror = () => {
            activeUtterance.current = null;
            isTransitioning.current = false;
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(u);
    };

    const handleUserSpeech = (text) => {
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        setIsRecording(false);
        setIsUserTurn(false);
        isTransitioning.current = false;
        activeUtterance.current = null;
        isTurnInProgressRef.current = false;
        
        const cleaned = (text || "").trim();
        if (cleaned) {
            setActiveSpeechText(cleaned);
            setTranscript(prev => [...prev, { role: "You", text: cleaned }]);
            chatHistory.current.push({ role: "Candidate_D", content: cleaned });
            
            if (statusRef.current === 'INDIVIDUAL') {
                setIndividualResponse(cleaned);
                playSpeech("Examiner", "Thank you, that concludes the Speaking Mock Examination.", () => {
                    handleSubmit(cleaned);
                });
                return;
            }
            
            localTurnQueue.current = []; // Clear queue to get fresh AI response
            triggerAITurn();
        }
        setCurrentSpeaker(null);
    };

    const startUserTurn = () => {
        isTransitioning.current = false;
        setIsUserTurn(true);
        setCurrentSpeaker("You");
        setActiveSpeechText("");
        
        if (recognition.current) {
            try { recognition.current.start(); } catch {}
        }
    };

    const fetchBatch = async (hintSpeaker = "Candidate_A") => {
        if (isFetchingRef.current[hintSpeaker]) return;
        isFetchingRef.current[hintSpeaker] = true;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const historyToSent = [...chatHistory.current.slice(-10)];
            const enrichedTopic = `${mockData?.topic_description || ''}\n[SYSTEM: Candidate Personas: A(${mockData?.candidates?.A}), B(${mockData?.candidates?.B}), C(${mockData?.candidates?.C})]`;
            
            const levelMap = { 'Candidate_A': '6', 'Candidate_B': '3', 'Candidate_C': '4' };
            const candidateLevel = levelMap[hintSpeaker] || '5';

            const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: historyToSent,
                    current_speaker: hintSpeaker,
                    topic: enrichedTopic,
                    level: candidateLevel,
                    uid: user?.uid,
                    audioOutput: false
                }),
                signal: AbortSignal.timeout(15000)
            });
            const data = await res.json();
            if (data.content) {
                localTurnQueue.current.push({
                    speaker: data.speaker || hintSpeaker,
                    content: data.content
                });
            }
        } catch (e) {
            console.error("Fetch failed", e);
            // Fallback
            localTurnQueue.current.push({
                speaker: hintSpeaker,
                content: "I agree with what has been said. What does everyone else think?"
            });
        } finally {
            isFetchingRef.current[hintSpeaker] = false;
        }
    };

    const triggerAITurn = async (forceSpeaker, onComplete, loopId = null) => {
        if (isTurnInProgressRef.current && !onComplete) return;
        if (statusRef.current !== 'DISCUSSION') return;

        isTurnInProgressRef.current = true;
        let turnToPlay = null;

        if (localTurnQueue.current.length > 0) {
            if (!forceSpeaker) {
                const nonExaminerIdx = localTurnQueue.current.findIndex(t => t.speaker !== 'Examiner');
                if (nonExaminerIdx !== -1) {
                    turnToPlay = localTurnQueue.current.splice(nonExaminerIdx, 1)[0];
                }
            } else {
                const matchIdx = localTurnQueue.current.findIndex(t => t.speaker === forceSpeaker);
                if (matchIdx !== -1) turnToPlay = localTurnQueue.current.splice(matchIdx, 1)[0];
            }
        }

        if (!turnToPlay) {
            const target = forceSpeaker || ["Candidate_A", "Candidate_B", "Candidate_C"].filter(c => c !== lastSpeakerRef.current)[0];
            setCurrentSpeaker(target);
            setActiveSpeechText(`${target.replace('_', ' ')} is thinking...`);
            await fetchBatch(target);
            if (localTurnQueue.current.length > 0) {
                turnToPlay = localTurnQueue.current.shift();
            }
        }

        if (turnToPlay) {
            setCurrentSpeaker(turnToPlay.speaker);
            lastSpeakerRef.current = turnToPlay.speaker;
            chatHistory.current.push({ role: turnToPlay.speaker, text: turnToPlay.content });
            
            // Background pre-fetch next speaker
            const turnOrder = ["Candidate_A", "Candidate_B", "Candidate_C"];
            const currentIdx = turnOrder.indexOf(turnToPlay.speaker);
            if (currentIdx !== -1) {
                const nextTarget = turnOrder[(currentIdx + 1) % 3];
                setTimeout(() => fetchBatch(nextTarget), 500);
            }

            playSpeech(turnToPlay.speaker, turnToPlay.content, () => {
                setCurrentSpeaker(null);
                isTurnInProgressRef.current = false;
                if (onComplete) {
                    onComplete();
                } else {
                    setTimeout(() => {
                        if (!isUserTurn && statusRef.current === 'DISCUSSION') {
                            triggerAITurn(null, null, activeTurnLoopId.current);
                        }
                    }, 500);
                }
            });
        } else {
            isTurnInProgressRef.current = false;
            setTimeout(() => triggerAITurn(forceSpeaker, onComplete, loopId), 1000);
        }
    };

    // Watchdog
    useEffect(() => {
        if (phase !== 'DISCUSSION') return;
        const watchdog = setInterval(() => {
            if (!currentSpeaker && !isUserTurn && !isRecording && !activeUtterance.current) {
                if (localTurnQueue.current.length > 0 && !isTurnInProgressRef.current) {
                    addLog("Watchdog: Restarting loop...");
                    triggerAITurn();
                }
            }
        }, 5000);
        return () => clearInterval(watchdog);
    }, [phase, currentSpeaker, isUserTurn, isRecording]);

    const startDiscussionFlow = () => {
        if (chatHistory.current.length > 0) return; // Prevent double trigger
        updatePhase('DISCUSSION');
        setCurrentSpeaker('Examiner');
        
        playSpeech("Examiner", `Good afternoon. We are here to discuss ${mockData?.title}. Candidate A, would you like to start?`, () => {
            setCurrentSpeaker(null);
            triggerAITurn("Candidate_A", () => {
                triggerAITurn("Candidate_B", () => {
                    triggerAITurn("Candidate_C", () => {
                        setCurrentSpeaker("Examiner");
                        playSpeech("Examiner", "Candidate D, it's your turn. What are your thoughts?", () => {
                            setCurrentSpeaker(null);
                            startUserTurn();
                        });
                    });
                });
            });
        });
    };

    const startIndividualResponse = () => {
        updatePhase('INDIVIDUAL');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognition.current) try { recognition.current.stop(); } catch(e){}
        
        setCurrentSpeaker("Examiner");
        playSpeech("Examiner", "Thank you. That is the end of the group discussion. Candidate D, I have a question for you.", () => {
            const qs = mockData?.individual_response_questions || [];
            const q = qs[0] || "What is your view?";
            setIndividualQuestion(q);
            playSpeech("Examiner", q, () => {
                setCurrentSpeaker(null);
                startUserTurn();
            });
        });
    };

    const handleSubmit = async (finalResponse) => {
        setIsSubmitting(true);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognition.current) try { recognition.current.stop(); } catch(e){}
        
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/mock/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid || 'guest',
                    mockData: {
                        id: paperId,
                        title: mockData?.title,
                        discussion_points: mockData?.discussion_points
                    },
                    chatHistory: chatHistory.current,
                    individualQuestion: individualQuestion,
                    individualResponse: finalResponse || individualResponse
                })
            });

            if (res.ok) {
                const result = await res.json();
                navigate(`/mock-exam-eng/speaking/results/${result.id}`, { state: { result, mockData } });
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            console.error("Submission error:", error);
            // Fallback for demo if backend not ready
            setTimeout(() => {
                updatePhase('RESULTS');
                setIsSubmitting(false);
            }, 3000);
        }
    };

    if (phase === 'LOADING' || (!mockData && phase !== 'RESULTS')) return (
        <LoadingPage title="Calibrating Speaking Arena..." subtext="Configuring AI candidates and preparing examination material." />
    );

    if (phase === 'BRIEFING') return (
        <div className="h-screen bg-white flex items-center justify-center p-8 selection:bg-emerald-100">
            <div className="max-w-2xl w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">Speaking Paper Instructions</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Paper 4 | {mockData?.title}</p>
                    </div>
                </div>

                <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8 text-base text-slate-600 font-medium leading-relaxed">
                    <p>1. **Preparation**: You will be given **10 minutes** to prepare your notes on the digital note card.</p>
                    <p>2. **Group Discussion**: Participate in an **8-minute** group discussion with 3 AI candidates.</p>
                    <p>3. **Individual Response**: You will have **1 minute** to answer a specific follow-up question directly from the examiner.</p>
                    <p className="mt-6 text-sm italic text-slate-400 border-t border-slate-200 pt-4">Your pronunciation, fluency, and group interaction skills will be assessed against HKEAA Standards.</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => navigate('/mock-exam-eng', { state: { activeTab: 'speaking' } })} className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-lg">
                        Go Back
                    </button>
                    <button onClick={() => updatePhase('PREP')} className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 active:scale-95 transition-all text-lg">
                        Enter Preparation Room
                    </button>
                </div>
            </div>
        </div>
    );

    if (phase === 'PREP') return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
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
                        <MockCountdownTimer seconds={10 * 60} onTimeUp={startDiscussionFlow} />
                    </div>
                    <button onClick={startDiscussionFlow} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">
                        Start Discussion Now
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">
                            Examination Material
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{mockData?.title}</h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10 border-l-4 border-emerald-100 pl-6">{mockData?.topic_description}</p>
                        
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
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
                    </div>
                    
                    <div className="md:col-span-4 space-y-4 h-full">
                        <div className="bg-amber-50 h-full p-8 rounded-[3rem] border border-amber-200 flex flex-col shadow-inner">
                            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <PenTool size={14} /> Note Card
                            </h3>
                            <textarea 
                                value={noteCardText}
                                onChange={(e) => setNoteCardText(e.target.value)}
                                className="flex-1 bg-transparent border-none text-slate-800 placeholder-amber-600/40 focus:ring-0 resize-none font-medium text-sm leading-relaxed"
                                placeholder="Jot down your arguments, vocabulary, and points here. This will be visible during the discussion..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (phase === 'DISCUSSION' || phase === 'INDIVIDUAL') {
        const isDiscussion = phase === 'DISCUSSION';
        return (
            <div className="h-screen bg-slate-900 flex flex-col font-sans text-white overflow-hidden relative">
                {/* Examination Center Background */}
                <div className="absolute inset-0 z-0 bg-[#e0e0e0] overflow-hidden opacity-20 mix-blend-overlay">
                    <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Examination Hall" className="w-full h-full object-cover grayscale" />
                </div>
                
                <header className="bg-black/50 border-b border-white/5 px-8 py-4 flex items-center justify-between z-50 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="size-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Users size={24} />
                        </div>
                        <div>
                             <h1 className="text-lg font-black tracking-tight leading-none mb-1">Speaking Arena</h1>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 {isDiscussion ? 'Part A: Group Discussion' : 'Part B: Individual Response'}
                             </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 rounded-[1.25rem] px-6 py-3 border border-white/10">
                            <MockCountdownTimer seconds={isDiscussion ? 8 * 60 : 60} onTimeUp={isDiscussion ? startIndividualResponse : handleSubmit} />
                        </div>
                        {isDiscussion ? (
                            <button onClick={startIndividualResponse} className="bg-white/10 hover:bg-white/20 px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                                Skip to Part B
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                                Final Submission
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden z-10">
                    <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
                        {/* Live Indicator */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-rose-600/20 border border-rose-500 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <div className="size-2 bg-rose-500 rounded-full animate-pulse" /> Live Exam
                        </div>

                        {/* Subtitle / Speech Display */}
                        <div className="absolute top-20 text-center max-w-2xl w-full">
                            <p className="text-lg font-medium text-slate-300 min-h-[3rem] italic">
                                {activeSubtitle || activeSpeechText || (isUserTurn ? "Waiting for your response..." : "")}
                            </p>
                        </div>

                        {/* Candidates Grid */}
                        <div className="grid grid-cols-3 gap-8 w-full max-w-4xl place-items-center mt-20">
                            {['Candidate_A', 'Candidate_B', 'Candidate_C'].map((pos) => {
                                const isActive = currentSpeaker === pos;
                                const shortName = pos.split('_')[1];
                                return (
                                    <div key={pos} className="flex flex-col items-center gap-4 group">
                                        <div className={`size-32 rounded-full bg-slate-800 border-4 transition-all flex items-center justify-center relative ${isActive ? 'border-emerald-500 scale-110 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-slate-700'}`}>
                                            <img src={`/avatars/${shortName === 'A' ? 'annie_avatar_1774534170846' : shortName === 'B' ? 'ben_avatar_1774534233060' : 'charlie_avatar_1774534209003'}.png`} alt={`Candidate ${shortName}`} className="w-full h-full object-cover rounded-full" />
                                            {isActive && (
                                                <div className="absolute -top-3 -right-3 size-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 animate-pulse">
                                                    <Mic size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-black/40 px-3 py-1 rounded-full">Candidate {shortName}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Examiner & User */}
                        <div className="grid grid-cols-2 gap-32 w-full max-w-2xl place-items-center mt-12">
                            {['Examiner', 'You'].map((pos) => {
                                const isActive = currentSpeaker === pos;
                                return (
                                    <div key={pos} className="flex flex-col items-center gap-4 group">
                                        <div className={`size-40 rounded-[3rem] bg-slate-800 border-4 transition-all flex items-center justify-center relative ${isActive ? 'border-emerald-500 scale-110 shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'border-slate-700'}`}>
                                            {pos === 'You' ? <img src={equipment?.student?.image || user?.photoURL || '/avatars/male_student_avatar_1774534573731.png'} alt="You" className="w-full h-full object-cover rounded-[2.5rem]" /> : <img src="/avatars/Miss_Janie.jpg" className="w-full h-full object-cover rounded-[2.5rem]" alt="Janie" />}
                                            {isActive && (
                                                <div className="absolute -top-4 -right-4 size-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 animate-bounce">
                                                    <Mic size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-black/40 px-3 py-1 rounded-full">{pos === 'You' ? 'Candidate D (You)' : 'Miss Janie (Examiner)'}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="absolute bottom-10">
                            <button 
                                onClick={() => {
                                    if (isUserTurn || isRecording) handleUserSpeech(collectedTranscript.current);
                                    else {
                                        if (activeUtterance.current) {
                                            isQueued.current = true;
                                            setIsQueuedState(true);
                                        } else {
                                            startUserTurn();
                                        }
                                    }
                                }}
                                className={`size-20 rounded-full flex items-center justify-center transition-all ${isRecording || isUserTurn ? 'bg-rose-600 scale-110 shadow-rose-900/50 shadow-2xl' : isQueuedState ? 'bg-amber-500 scale-105 shadow-amber-900/40 shadow-xl' : 'bg-emerald-600 hover:scale-105 shadow-emerald-900/40 shadow-2xl'}`}
                            >
                                {isRecording || isUserTurn ? <MicOff size={28} /> : isQueuedState ? <Clock size={28} /> : <Mic size={28} />}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Note Card & Details */}
                    <div className="w-[400px] bg-black/40 border-l border-white/10 flex flex-col p-6">
                        <div className="bg-amber-50/10 border border-amber-500/30 rounded-[2rem] p-6 flex-1 flex flex-col">
                            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Your Note Card</h3>
                            <textarea 
                                value={noteCardText}
                                onChange={(e) => setNoteCardText(e.target.value)}
                                className="flex-1 w-full bg-transparent border-none text-slate-300 placeholder-slate-500 focus:ring-0 resize-none font-medium text-sm leading-relaxed"
                                placeholder="Jot down notes..."
                            />
                        </div>
                        
                        <div className="mt-6 bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Topic Summary</h3>
                            <h4 className="text-sm font-bold text-white mb-2">{mockData?.title}</h4>
                            <ul className="space-y-2">
                                {mockData?.discussion_points?.slice(0,2).map((p,i) => (
                                    <li key={i} className="text-[10px] text-slate-400 font-medium leading-tight border-l-2 border-emerald-500/50 pl-2">{p}</li>
                                ))}
                            </ul>
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
        <div className="h-screen bg-slate-50 flex items-center justify-center p-8 selection:bg-rose-100">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full text-center">
                <div className="inline-flex p-6 bg-emerald-100 text-emerald-600 rounded-[2.5rem] mb-8 shadow-xl shadow-emerald-900/10">
                    <CheckCircle2 size={64} className="animate-pulse" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Processing Assessment</h1>
                <p className="text-slate-500 mb-10 font-medium text-lg leading-relaxed px-8">We are redirecting you to your detailed performance report. Please wait a moment...</p>
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </motion.div>
        </div>
    );

    return null;
};

export default SpeakingMockStudio;
