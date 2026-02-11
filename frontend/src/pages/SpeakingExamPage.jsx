import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAvatar, AGENTS } from '../context/AvatarContext';

const SpeakingExamPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeAgentId } = useAvatar();

    const [examData, setExamData] = useState(null);
    const [status, setStatus] = useState('PREP'); // PREP, DISCUSSION, INDIVIDUAL, FINISHED
    const [timeLeft, setTimeLeft] = useState(600); // 10 min prep
    const [transcript, setTranscript] = useState([]);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);
    const [isUserTurn, setIsUserTurn] = useState(false);
    const [micActive, setMicActive] = useState(false);
    const [error, setError] = useState(null);
    const [isQueuedState, setIsQueuedState] = useState(false);
    const isQueued = useRef(false);
    const isUserTurnRef = useRef(false); // To prevent stale closures in timeouts

    // Dynamic Avatars
    const [candidateAvatars, setCandidateAvatars] = useState({
        Candidate_A: `https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&backgroundColor=b6e3f4`,
        Candidate_B: `https://api.dicebear.com/7.x/avataaars/svg?seed=Ben&backgroundColor=c0aede`,
        Candidate_C: `https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=ffdfbf`,
        Examiner: AGENTS['english'].avatar // Use "Miss Janie" as Examiner
    });

    // Refs
    const synth = useRef(window.speechSynthesis);
    const recognition = useRef(null);
    const chatHistory = useRef([]);
    const [voices, setVoices] = useState([]);

    const activeUtterance = useRef(null);
    const isFetchingAI = useRef(false);
    const isTransitioning = useRef(false); // NEW: Lock to prevent overlapping turn triggers
    const userSilenceTimer = useRef(null);
    const collectedTranscript = useRef(""); // To hold partial results in continuous mode
    const localTurnQueue = useRef([]); // PREFETCH: Holds next 2-3 turns locally

    // 0. Load Voices (Robust)
    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            console.log(`[Speaking] Voices Loaded: ${vs.length}`);
            vs.forEach(v => console.log(`- ${v.name} (${v.lang}) [${v.localService ? 'Local' : 'Remote'}]`));
            setVoices(vs);
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        loadVoices();

        // CHROME FIX: speechSynthesis "falls asleep" after 15s. 
        // We keep it alive by calling resume() periodically.
        const resumeInterval = setInterval(() => {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }, 10000);

        return () => {
            clearInterval(resumeInterval);
            window.speechSynthesis.cancel();
        };
    }, []);

    const [isEasyMode, setIsEasyMode] = useState(false); // Easy Mode: Show Transcript

    const [debugLogs, setDebugLogs] = useState([]);

    const addLog = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 5));
    };

    // Helper to clean text (Remove "Candidate A:", markdown, actions *nod*)
    const cleanText = (text) => {
        if (!text) return "";
        return text
            .replace(/^(Candidate [A-C]|Examiner):/i, "") // Remove label
            .replace(/\*.*?\*/g, "") // Remove *actions*
            .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // Remove emojis
            .trim();
    };

    // Moving functions here will cause more issues if they use variables not yet defined.
    // I will use a single chunk to move them to the top of the component.


    // --- 1. Load Data ---
    useEffect(() => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/speaking/exam/${examId}`;
        console.log("Fetching Speaking Exam:", url);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load exam: ${res.status} ${res.statusText}`);
                return res.json();
            })
            .then(data => {
                setExamData(data);
                setStatus('PREP');
            })
            .catch(err => {
                console.error("Load Error:", err);
                setError(err.message);
            });
    }, [examId]);

    // 0. Load Voices (Robust)
    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            console.log(`[Speaking] Voices Loaded: ${vs.length}`);
            vs.forEach(v => console.log(`- ${v.name} (${v.lang}) [${v.localService ? 'Local' : 'Remote'}]`));
            setVoices(vs);
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        loadVoices();

        // CHROME FIX: speechSynthesis "falls asleep" after 15s. 
        // We keep it alive by calling resume() periodically.
        const resumeInterval = setInterval(() => {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }, 10000);

        return () => {
            clearInterval(resumeInterval);
            window.speechSynthesis.cancel();
        };
    }, []);

    // 4. WATCHER: Silence Guard (Deadlock Prevention)
    useEffect(() => {
        if (status !== 'DISCUSSION') return;

        // If no one is speaking (currentSpeaker is null) and not user turn, and mic not active
        // Wait 2s, then poke AI.
        const watchdog = setInterval(() => {
            const now = Date.now();
            const lastActivity = window.lastSpeakingActivity || now;
            const silenceDuration = now - lastActivity;

            // Scenario A: Total Silence (No speaker, no user) -> Dead Air
            if (!currentSpeaker && !isUserTurn && !micActive && !isQueued.current && !activeUtterance.current) {
                // If AI is currently thinking (Fetching), give it more time (12s) before declaring it stuck
                // If AI is NOT thinking, then it's true dead air (2s)
                // STRICT RULE: AI Candidate can't interrupt user or other AI. 
                // We REMOVED the aggressive watchdog that was restarting flow too early.
                // We only check for Total System Hang (e.g. 15s dead silence)
                const hangThreshold = 15000;

                if (silenceDuration > hangThreshold) {
                    addLog(`🚨 System Hang Guard: Restarting flow (${hangThreshold / 1000}s)...`);
                    const pick = ["Candidate_A", "Candidate_B", "Candidate_C"][Math.floor(Math.random() * 3)];
                    // FORCE UNLOCK (Only if we exceeded the threshold)
                    isFetchingAI.current = false;
                    triggerAITurn(pick);
                    window.lastSpeakingActivity = Date.now();
                }
            }

            // Scenario B: Stuck Speaker (Speaker set, but no progress)
            else if (currentSpeaker && !isUserTurn) {
                // Scenario B.1: User is stuck as active speaker but not speaking (Bug Fix)
                if (currentSpeaker === 'You') {
                    if (silenceDuration > 5000) {
                        addLog("🚨 Silence Guard: Clear stuck user speaker state");
                        setCurrentSpeaker(null);
                        window.lastSpeakingActivity = Date.now();
                    }
                    return;
                }

                // Scenario B.2: AI is stuck (Original logic)
                if (isFetchingAI.current) return;
                const stuckThreshold = activeUtterance.current ? 10000 : 5000;
                if (silenceDuration > stuckThreshold) {
                    addLog(`🚨 Stuck Guard: Recovering from frozen turn (${currentSpeaker})...`);
                    window.speechSynthesis.cancel();
                    activeUtterance.current = null;
                    setCurrentSpeaker(null);
                    const alternates = ["Candidate_A", "Candidate_B", "Candidate_C"].filter(c => c !== currentSpeaker);
                    const pick = alternates[Math.floor(Math.random() * alternates.length)];
                    triggerAITurn(pick);
                    window.lastSpeakingActivity = Date.now();
                }
            }
        }, 1000);

        return () => clearInterval(watchdog);
    }, [status, currentSpeaker, isUserTurn, micActive]);

    // 2. Timer
    useEffect(() => {
        if (timeLeft > 0 && status !== 'FINISHED') {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            if (status === 'PREP') startDiscussion();
            if (status === 'DISCUSSION') {
                endDiscussion(); // Auto-end when time is up
            }
        }
    }, [timeLeft, status]);

    // 3. Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const r = new window.webkitSpeechRecognition();
            r.continuous = true; // CHANGED: Keep listening during pauses
            r.interimResults = true; // IMPROVEMENT: Better responsiveness
            r.lang = 'en-HK'; // OPTIMIZATION: Better for Hong Kong accent, falls back to US if needed

            r.onstart = () => {
                setMicActive(true);
                collectedTranscript.current = "";
                addLog("🎙️ Listening (Continuous)...");
            };
            r.onend = () => {
                setMicActive(false);
                addLog("🎙️ Mic Off");
            };
            r.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    collectedTranscript.current += (collectedTranscript.current ? " " : "") + finalTranscript;
                    addLog(`📝 Interim: "${finalTranscript.substring(0, 15)}..."`);
                }

                // Reset 1-second silence buffer (Strict Rule)
                if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
                userSilenceTimer.current = setTimeout(() => {
                    if (collectedTranscript.current.trim()) {
                        r.stop();
                        handleUserSpeech(collectedTranscript.current.trim());
                    }
                }, 1000);
            };
            recognition.current = r;
        } else {
            console.warn("Browser not supported. Use Chrome.");
        }
    }, [examData]);

    // Helper to find best voice (Simulating HK students and different levels)
    const getVoice = (role) => {
        if (!voices || voices.length === 0) return null;

        // CRITICAL: Filter for English voices only to avoid Cantonese/Mandarin engines
        const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        const pool = englishVoices.length > 0 ? englishVoices : voices;

        const find = (lang, namePart) => pool.find(v =>
            v.lang.toLowerCase().includes(lang.toLowerCase()) &&
            (!namePart || v.name.toLowerCase().includes(namePart.toLowerCase()))
        );

        // STABILITY FIX: Prioritize Google US English for everyone first to prove audio works
        const safeVoice = find('Google US English') || find('en-US');

        if (role === 'Examiner') {
            return find('en-GB') || safeVoice || pool[0];
        }

        // Candidates: Try HK > GB > US > Any English
        const hkVoice = find('en-HK') || find('Hong Kong') || find('yue');
        const gbVoice = find('en-GB');

        // If specific regional voice missing, FALLBACK TO SAFE VOICE immediately
        const fallback = safeVoice || pool.find(v => v.lang.startsWith('en')) || pool[0];

        if (role === 'Candidate_A') return find('en-GB', 'Female') || hkVoice || gbVoice || fallback;
        if (role === 'Candidate_B') return find('en-GB', 'Male') || hkVoice || gbVoice || fallback;
        if (role === 'Candidate_C') return find('en-US', 'Female') || hkVoice || gbVoice || fallback;

        return fallback;
    };

    const playSpeech = (role, text, onEnd) => {
        const cleaned = cleanText(text);
        addLog(`🗣️ [${role}]: ${cleaned.substring(0, 30)}...`);
        setTranscript(prev => [...prev, { role, text }]);

        if (!cleaned || cleaned.length === 0) {
            addLog("⚠️ Empty text, skipping...");
            setTimeout(onEnd, 1000);
            return;
        }

        window.speechSynthesis.cancel();

        const u = new SpeechSynthesisUtterance(cleaned);
        activeUtterance.current = u;
        // CRITICAL FIX: Prevent Chrome GC by holding global reference
        window[`tts_${role}`] = u;

        const voice = getVoice(role);
        if (voice) {
            u.voice = voice;
            addLog(`🎙️ Voice: ${voice.name}`);
        } else {
            addLog("⚠️ No voice found, using default");
        }

        u.pitch = 1.0;
        u.rate = 1.0;

        let hasFinished = false;
        isTransitioning.current = false; // Reset lock for NEW utterance

        const safeOnEnd = (isError = false, errorDetail = null) => {
            if (hasFinished) return;

            // If we are transitioning already, ignore further calls (prevents double triggers)
            if (isTransitioning.current) return;

            // CRITICAL: If audio was interrupted by a new playSpeech call, 
            // do NOT advance the turn. The new call will handle it.
            if (isError && errorDetail === 'interrupted') {
                addLog(`🚫 Interrupted: ${role} (Stopping cascade)`);
                hasFinished = true; // Still mark as done so watchdog clears
                return;
            }

            isTransitioning.current = true; // LOCK
            hasFinished = true;
            if (activeUtterance.current === u) {
                activeUtterance.current = null;
            }
            window.lastSpeakingActivity = Date.now(); // Reset Silence Timer
            addLog(`✅ Turn finished: ${role}`);

            // REDUCED COOLDOWN: 1000ms Delay before Next Turn (Strict 1s Gap)
            // This provides a strictly observed 1s gap between turns.
            addLog(`⏳ Cooldown (1.0s)...`);
            setTimeout(() => {
                isTransitioning.current = false; // UNLOCK
                if (onEnd) onEnd();
            }, 1000);
        };

        u.onend = () => safeOnEnd(false);
        u.onerror = (e) => {
            addLog(`❌ TTS [${role}]: ${e.error}`);
            if (e.error !== 'interrupted') {
                console.error(`SpeechSynthesis Error [${role}]:`, e);
            }
            safeOnEnd(true, e.error);
        };
        u.onboundary = () => {
            window.lastSpeakingActivity = Date.now(); // Keep-alive on every word
        };

        // NEW: Activity Watchdog (Replaces Estimated Timeout)
        // Checks if audio is truly stuck (no boundary events for 5s) instead of guessing duration.
        const audioWatchdog = setInterval(() => {
            if (hasFinished) {
                clearInterval(audioWatchdog);
                return;
            }

            const timeSinceActivity = Date.now() - (window.lastSpeakingActivity || 0);

            // If audio hasn't fired an event for 10 seconds (Relaxed from 5s), assume it died
            if (timeSinceActivity > 10000) {
                addLog(`⏰ Audio Stuck Watchdog: Force-Next (${timeSinceActivity}ms silent)`);
                clearInterval(audioWatchdog);
                safeOnEnd();
            }
        }, 1000);

        // Update activity timestamp
        window.lastSpeakingActivity = Date.now();
        window.speechSynthesis.resume();
        // Force cancel any previous speech to prevent overlap "fighting"
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    };

    const handleUserSpeech = (text) => {
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        userSilenceTimer.current = null;

        addLog(`🎙️ User said: "${text.substring(0, 20)}..."`);
        setTranscript(prev => [...prev, { role: "You", text }]);
        const speechObj = { role: "user", text };
        chatHistory.current.push(speechObj);
        localTurnQueue.current = []; // NEW: Clear pre-generated turns so AI reacts to what user just said

        setCurrentSpeaker(null); // IMPORTANT: Reset emerald ring so Silence Guard can wake up
        setIsUserTurn(false);
        isUserTurnRef.current = false;

        if (status === 'INDIVIDUAL') {
            playSpeech("Examiner", "Thank you. That is the end of the speaking test. You may now check your results.", () => {
                setStatus('FINISHED');
            });
            return;
        }

        // Hand back to AI
        addLog("⏳ Handing back to AI in 0.5s...");
        setTimeout(() => {
            if (!isUserTurnRef.current && !isQueued.current) {
                const nexts = ["Candidate_A", "Candidate_B", "Candidate_C"];
                const pick = nexts[Math.floor(Math.random() * nexts.length)];
                triggerAITurn(pick);
            }
        }, 500);
    };

    const startUserTurn = () => {
        localTurnQueue.current = []; // IMPORTANT: Clear future AI turns when user speaks
        isTransitioning.current = false; // Force unlock in case user interrupted during a transition
        setIsUserTurn(true);
        isUserTurnRef.current = true;
        setCurrentSpeaker("You");
        if (recognition.current) {
            try {
                recognition.current.start();
            } catch (e) {
                console.warn("Recognition already started");
            }
        }
    };

    const playQueuedTurn = (turn) => {
        const { speaker, content } = turn;
        setCurrentSpeaker(speaker);

        playSpeech(speaker, content, () => {
            setCurrentSpeaker(null);
            chatHistory.current.push({ role: speaker, text: content });

            if (isQueued.current) {
                addLog("🎯 Starting queued user turn");
                isQueued.current = false;
                setIsQueuedState(false);
                startUserTurn();
                return;
            }

            // Loop back to next AI turn
            setTimeout(() => {
                if (!isUserTurnRef.current && status === 'DISCUSSION') {
                    triggerAITurn();
                }
            }, 1000); // 1.0s gap between AI turns for natural feel
        });
    };

    const fetchBatch = async (hintSpeaker = "Candidate_A") => {
        if (isFetchingAI.current) return;
        isFetchingAI.current = true;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory.current.slice(-15),
                    currentSpeaker: hintSpeaker, // Just a hint for start of batch
                    topic: examData.title,
                    context: examData,
                    uid: user?.uid
                }),
                signal: AbortSignal.timeout(15000)
            });

            if (!res.ok) throw new Error("Batch fetch failed");
            const data = await res.json();
            if (data.turns && Array.isArray(data.turns)) {
                // Add new turns to queue
                localTurnQueue.current = [...localTurnQueue.current, ...data.turns];
                addLog(`📦 Received batch of ${data.turns.length} turns`);
            }
        } catch (err) {
            addLog(`❌ Batch Fail: ${err.message}`);
        } finally {
            isFetchingAI.current = false;
            // AUTO-RESTART: If we just finished a fetch (e.g. background prefetch) 
            // and the room is silent, trigger a turn so the system doesn't stay idle.
            // FIX: Use ref to check for active speech (prevents stale closure issues)
            if (status === 'DISCUSSION' && !isUserTurnRef.current && !activeUtterance.current) {
                if (localTurnQueue.current.length > 0) {
                    addLog("♻️ Auto-starting turn after fetch");
                    triggerAITurn();
                }
            }
        }
    };

    const fetchBatchInBackground = () => {
        if (isFetchingAI.current) return;
        addLog("🛰️ Prefetching next batch in background...");
        fetchBatch();
    };

    const triggerAITurn = async (forceSpeaker) => {
        if (isUserTurnRef.current || status !== 'DISCUSSION') return;
        // FIX: Check activeUtterance to prevent interrupting current speaker
        if (isFetchingAI.current || isTransitioning.current || activeUtterance.current) return;

        // 1. Process local queue if it has items
        if (localTurnQueue.current.length > 0) {
            const nextTurn = localTurnQueue.current.shift();

            // Prefetch Logic: If queue is getting low (1 left), fetch more in background
            if (localTurnQueue.current.length <= 1) {
                fetchBatchInBackground();
            }

            playQueuedTurn(nextTurn);
            return;
        }

        // 2. Queue is empty, need to fetch fresh batch (Blocker)
        addLog("⏳ Fetching new batch...");
        await fetchBatch(forceSpeaker);

        // After fetching, if we have turns, play the first one
        if (localTurnQueue.current.length > 0) {
            const first = localTurnQueue.current.shift();
            playQueuedTurn(first);
        }
    };


    const startIndividualResponse = () => {
        // Pick a question from the mock data
        const questions = examData.individual_response_questions || ["How do you think this issue affects students in Hong Kong?"];
        const question = questions[Math.floor(Math.random() * questions.length)];

        playSpeech("Examiner", question, () => {
            setCurrentSpeaker("You");
            setIsUserTurn(true);
            isUserTurnRef.current = true; // Set ref for user turn
            if (recognition.current) {
                recognition.current.start();
            }
        });
    };

    const startDiscussion = () => {
        setStatus('DISCUSSION');
        setTimeLeft(8 * 60); // 8 mins

        // LATENCY FIX: Pre-fetch Candidate A's turn IMMEDIATELY in background
        // This runs in parallel while Examiner speaks, eliminating the wait time.
        fetchBatchInBackground();

        playSpeech("Examiner", "Good afternoon. We are here to discuss " + examData.title + ". Candidate A, please begin.", () => {
            if (isQueued.current) {
                isQueued.current = false;
                setIsQueuedState(false);
                startUserTurn();
            } else {
                triggerAITurn("Candidate_A");
            }
        });
    };

    const endDiscussion = () => {
        // Instead of finishing, move to Part B
        setStatus('INDIVIDUAL');
        setTimeLeft(60); // 1 minute for Part B response

        playSpeech("Examiner", "Thank you. That is the end of the group discussion. Candidate D, I have a question for you.", () => {
            startIndividualResponse();
        });
    };

    const finishExam = async () => {
        setStatus('FINISHED');
        synth.current.cancel();

        // Grade logic
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        try {
            navigate('/speaking/result', { state: { loading: true } }); // Optimistic nav

            const res = await fetch(`${API_URL}/api/speaking/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: examData.title,
                    context: examData,
                    transcript: chatHistory.current // Full history
                }),
                signal: AbortSignal.timeout(60000) // 60s Timeout
            });

            if (res.ok) {
                const result = await res.json();
                navigate('/speaking/result', { state: { result, examData } });
            } else {
                alert("Grading failed. Please check console.");
            }

        } catch (e) {
            console.error("Grading failed:", e);
            alert("Grading Request Timed Out (Back-end busy). Please try again.");
            // Reset navigation state if possible or just let them retry
            navigate('/speaking/result', { state: { error: e.message } });
        }
    };

    // Fetch User Stats for Avatar consistency
    const [userGender, setUserGender] = useState(null);
    useEffect(() => {
        if (user) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            fetch(`${API_URL}/api/stats?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => setUserGender(data.gender))
                .catch(err => console.error("Stats fetch error:", err));
        }
    }, [user]);

    const getStudentAvatar = () => {
        const g = userGender?.toLowerCase();
        if (g === 'female') return '/avatars/student_female_1.jpg';
        return '/avatars/student_male_1.jpg';
    };

    if (error) return (
        <div className="p-10 text-center text-red-500 bg-red-50 h-screen flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-2">Error Loading Exam</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg">Go Back</button>
        </div>
    );

    if (!examData) return <div className="h-screen bg-orange-50 flex items-center justify-center text-primary font-bold animate-pulse">Loading Speaking Mock...</div>;

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Circular Positioning Logic (Angle in degrees)
    const getPos = (role) => {
        const positions = {
            'Examiner': { top: '15%', left: '50%' },
            'Candidate_A': { top: '35%', left: '15%' },
            'Candidate_B': { top: '35%', left: '85%' },
            'Candidate_C': { top: '75%', left: '25%' },
            'You': { top: '75%', left: '75%' }
        };
        return positions[role] || { top: '50%', left: '50%' };
    };

    return (
        <div className="h-screen w-full relative overflow-hidden flex flex-col">
            {/* 1. CLASSROOM BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0 bg-[#f8f1e5]">
                {/* Wall & Blackboard */}
                <div className="h-[40%] w-full bg-[#fdfaf5] border-b-8 border-[#d4a373] relative">
                    {/* Blackboard */}
                    <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[60%] h-[70%] bg-[#2d3a3a] border-[12px] border-[#5d4037] rounded shadow-2xl flex items-center justify-center p-8">
                        <div className="text-white/20 font-handwriting select-none transform -rotate-1 text-center">
                            <h2 className="text-3xl font-bold mb-2 opacity-40">HKDSE SPEAKING MOCK</h2>
                            <p className="text-xl opacity-30 italic">"Good luck, focus on fluency!"</p>
                        </div>
                    </div>
                </div>
                {/* Floor */}
                <div className="h-[60%] w-full bg-[#e7cfae]" style={{ backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.2) 0%, transparent 70%)' }}>
                    {/* Perspective lines could go here */}
                </div>
            </div>

            {/* 2. HEADER (Floating) */}
            <div className="relative z-20 p-6 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="size-10 bg-white/80 rounded-full flex items-center justify-center text-gray-800 shadow-sm hover:scale-105 transition-transform">←</button>
                    <h1 className="text-xl font-bold text-gray-800 drop-shadow-sm">{examData.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEasyMode(!isEasyMode)}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${isEasyMode ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white/50 text-gray-500 border-gray-200 hover:bg-white'}`}
                    >
                        {isEasyMode ? "📖 Easy Mode ON" : "📖 Easy Mode"}
                    </button>
                    <div className={`px-6 py-2 rounded-full font-mono text-xl font-black shadow-lg border-2 ${status === 'PREP' ? 'bg-amber-400 text-amber-950 border-amber-500/30' : 'bg-emerald-500 text-white border-emerald-600/30'}`}>
                        {status}: {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* 3. MAIN EXAM AREA (Table & Participants) */}
            <div className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">

                {/* ROUND WOODEN TABLE */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] rounded-[100%] border-[6px] border-[#5d4037] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-[#8d6e63]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 30% 30%, #a1887f 0%, #8d6e63 40%, #5d4037 100%)',
                        boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.2), 0 40px 80px -20px rgba(0,0,0,0.4)',
                        transform: 'translate(-50%, -40%)'
                    }}
                >
                    {/* Note on table? */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 bg-white/10 border border-white/5 rounded-sm opacity-20 pointer-events-none"></div>
                </div>

                {/* PARTICIPANTS */}
                {["Candidate_A", "Examiner", "Candidate_B", "Candidate_C", "You"].map(role => {
                    const pos = getPos(role);
                    const isSpeaking = currentSpeaker === role;
                    const isUser = role === "You";
                    const avatarSrc = isUser ? getStudentAvatar() : candidateAvatars[role];

                    return (
                        <div key={role}
                            className="absolute transition-all duration-500 flex flex-col items-center"
                            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                            <div className={`
                                relative size-32 rounded-full border-8 bg-white shadow-xl transition-all duration-300 overflow-hidden
                                ${isSpeaking ? "scale-110 ring-8 ring-emerald-400/30 border-emerald-400" : "border-white/80 grayscale-[20%]"}
                                ${isUser && micActive ? "border-red-500 ring-8 ring-red-500/30" : ""}
                            `}>
                                <img src={avatarSrc} alt={role} className="w-full h-full object-cover object-top" />

                                {/* Speaking indicator bar */}
                                {isSpeaking && (
                                    <div className="absolute bottom-0 left-0 w-full h-2 bg-emerald-500 animate-pulse"></div>
                                )}
                            </div>
                            <div className={`mt-3 px-4 py-1 rounded-full text-xs font-black shadow-md border ${isUser ? "bg-indigo-600 text-white border-indigo-400" : "bg-white text-gray-800 border-gray-200"}`}>
                                {isUser ? "YOU (Candidate D)" : role.replace('_', ' ')}
                            </div>
                        </div>
                    );
                })}

                {/* PREP OVERLAY */}
                {status === 'PREP' && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#f8f1e5]/60 backdrop-blur-sm">
                        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-100 p-8 transform animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl">📝</div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight">Preparation Time</h3>
                                    <p className="text-amber-600 font-bold">Read the situation carefully</p>
                                </div>
                            </div>

                            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50 mb-8 max-h-[30vh] overflow-y-auto custom-scrollbar">
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    {examData.topic_description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                                <strong className="text-indigo-600 text-xs uppercase tracking-widest block mb-1">Key Discussion Points</strong>
                                {examData.discussion_points?.map((point, i) => (
                                    <div key={i} className="flex gap-3 text-sm font-bold text-gray-600">
                                        <span className="text-indigo-400">•</span>
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    // STABILITY FIX 3: WARMUP
                                    // Play a silent sound on CLICK to unlock audio engine
                                    const warmup = new SpeechSynthesisUtterance(' ');
                                    warmup.volume = 0;
                                    window.speechSynthesis.speak(warmup);

                                    setTimeLeft(0);
                                }}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl shadow-[0_10px_20px_-5px_rgba(244,158,11,0.5)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Start Exam Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. CONTROLS (Floating Footer) */}
            <div className="relative z-30 p-8 flex justify-center gap-6">
                {(status === 'DISCUSSION' || status === 'FINISHED') && (
                    <>
                        {status === 'DISCUSSION' && (
                            <div className="flex gap-4">
                                {isUserTurn ? (
                                    <button
                                        onClick={handleManualFinish}
                                        className="flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-2xl shadow-2xl bg-emerald-500 text-white hover:bg-emerald-400 transform transition-all active:scale-95"
                                    >
                                        ✅ FINISH TURN
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleChipIn}
                                        disabled={isQueuedState || currentSpeaker === 'You'}
                                        className={`
                                            flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-2xl shadow-2xl transform transition-all active:scale-95
                                            ${isQueuedState ? 'bg-amber-500 text-white cursor-wait' :
                                                'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-1'
                                            }
                                        `}
                                    >
                                        {isQueuedState ? "⏳ QUEUED..." : "✋ CHIP IN"}
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={finishExam}
                            className={`
                                px-8 py-5 rounded-3xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95
                                ${status === 'FINISHED' ? 'bg-emerald-600 text-white text-2xl px-14 animate-bounce' : 'bg-red-600 text-white hover:bg-red-500 hover:shadow-red-500/40'}
                            `}
                        >
                            {status === 'FINISHED' ? "View Results 📝" : "End & Grade"}
                        </button>
                    </>
                )}
            </div>

            {/* EASY MODE TRANSCRIPT OVERLAY */}
            {isEasyMode && transcript.length > 0 && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40 pointer-events-none flex flex-col items-center gap-2">
                    {transcript.slice(-2).map((t, i) => (
                        <div key={i} className={`
                            px-6 py-3 rounded-2xl shadow-lg backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500
                            ${t.role === 'You' ? 'bg-indigo-600/90 text-white' : 'bg-white/90 text-gray-800'}
                         `}>
                            <span className="font-bold mr-2 text-xs uppercase opacity-70 block mb-1">{t.role.replace('_', ' ')}</span>
                            <p className="text-lg font-medium leading-relaxed max-w-prose text-center">
                                {t.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* CSS Overrides for custom fonts/scrollbar if needed */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .font-handwriting { font-family: 'Comic Sans MS', cursive, sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4a373; border-radius: 10px; }
            `}} />
            {/* DEBUG LOGGER */}
            <div className="fixed bottom-4 left-4 w-96 max-h-64 overflow-y-auto bg-black/80 text-green-400 font-mono text-xs p-2 rounded z-50 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                <h3 className="font-bold border-b border-green-500 mb-1">🛠️ DEBUG LOG</h3>
                {debugLogs.slice(-20).map((l, i) => (
                    <div key={i} className="mb-0.5">{l}</div>
                ))}
            </div>
        </div>
    );
};

export default SpeakingExamPage;
