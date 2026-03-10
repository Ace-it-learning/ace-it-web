import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AGENTS } from '../context/AvatarContext';
import { Loader2 } from 'lucide-react';

const SpeakingInteractionPage = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Quest Mode parsing
    // const questLevel = searchParams.get('level'); // Unused
    const questTaskId = searchParams.get('taskId');
    const questTopic = searchParams.get('topic');
    const roadmapTopic = React.useMemo(() => {
        const name = location.state?.topic || questTopic || 'speaking_interaction_general';
        if (name === 'speaking_interaction_general') {
            const dseTopics = [
                "The impact of social media on teen mental health",
                "Whether Hong Kong should implement a four-day work week",
                "The pros and cons of artificial intelligence in education",
                "How to promote sustainable living among secondary students",
                "The importance of preserving local heritage in a globalized city"
            ];
            // Stable random selection for this session
            const index = Math.floor(Math.random() * dseTopics.length);
            return dseTopics[index];
        }
        return name.replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }, []); // Only run once on mount

    const taskId = location.state?.taskId || questTaskId;
    const isQuest = !!taskId;

    const navigate = useNavigate();
    const { user } = useAuth();
    // Examiner Avatar Fix: Use Miss Janie from Context/AGENTS
    const examinerAvatar = AGENTS.english.avatar;

    // Safety check for broken images - if the above fails, use a reliable fallback
    const [examinerImg, setExaminerImg] = useState(examinerAvatar);
    useEffect(() => {
        setExaminerImg(AGENTS.english.avatar);
    }, []);
    const handleExaminerImgError = () => {
        setExaminerImg('https://api.dicebear.com/7.x/avataaars/svg?seed=Examiner');
    };

    const [examData, setExamData] = useState(null);
    const [status, setStatus] = useState('PREP'); // PREP, DISCUSSION, INDIVIDUAL, FINISHED
    const [timeLeft, setTimeLeft] = useState(600); // 10 min prep
    const [transcript, setTranscript] = useState([]);
    const [currentSpeaker, setCurrentSpeaker] = useState(null);
    const [isUserTurn, setIsUserTurn] = useState(false);
    const [micActive, setMicActive] = useState(false);
    const [error] = useState(null); // setError unused
    const [isQueuedState, setIsQueuedState] = useState(false);
    const isQueued = useRef(false);
    const isUserTurnRef = useRef(false);

    // Quest: Airtime Tracking
    const [airtime, setAirtime] = useState({ 'You': 0, 'Candidate_A': 0, 'Candidate_B': 0, 'Candidate_C': 0 });
    const [gradingResult, setGradingResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeSpeechText, setActiveSpeechText] = useState("");
    const hasStartedRef = useRef(false);

    // Dynamic Avatars
    const [candidateAvatars] = useState({
        Candidate_A: `https://api.dicebear.com/7.x/avataaars/svg?seed=Annie&backgroundColor=b6e3f4`,
        Candidate_B: `https://api.dicebear.com/7.x/avataaars/svg?seed=Ben&backgroundColor=c0aede`,
        Candidate_C: `https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=ffdfbf`,
        Examiner: examinerAvatar
    });

    // Refs
    const synth = useRef(window.speechSynthesis);
    const recognition = useRef(null);
    const chatHistory = useRef([]);
    const [voices, setVoices] = useState([]);
    const [debugLogs, setDebugLogs] = useState([]);

    // Phase 33: Filler Phrases for Latency Masking
    const FILLERS = {
        "Examiner": ["That is an interesting perspective.", "Thank you for sharing that.", "I see your point.", "Right."],
        "Candidate_A": ["That's a good point.", "I see what you mean.", "True.", "I agree with that."],
        "Candidate_B": ["That's a good point.", "I see what you mean.", "True.", "Harris makes a good point."],
        "Candidate_C": ["That's a good point.", "I see what you mean.", "True.", "I agree with you."]
    };
    const activeUtterance = useRef(null);
    const isFetchingAI = useRef(false);
    const isTransitioning = useRef(false);
    const userSilenceTimer = useRef(null);
    const collectedTranscript = useRef("");
    const localTurnQueue = useRef([]);
    const lastAirtimeUpdate = useRef(Date.now());
    const isInternalTransition = useRef(false); // Locking ref to prevent race conditions

    const [isEasyMode, setIsEasyMode] = useState(!location.state?.mode?.includes('mock')); // Auto-ON for Practice


    const addLog = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 5));
    };

    // Initialize Quest Data
    useEffect(() => {
        console.log("[SpeakingInteraction] Initializing with topic:", roadmapTopic);
        // In a real app, you might fetch specific details from an API, but for Quest/Roadmap check if we need to mock
        // or if we just construct it.
        const questData = {
            id: `quest_${taskId || Date.now()}`,
            title: roadmapTopic,
            topic_description: `You are participating in a group discussion about "${roadmapTopic}". Share your views, listen to others, and engage in meaningful conversation. This is your chance to practice interactive speaking skills in a realistic HKDSE format.`,
            discussion_points: [
                "What are the main issues or benefits?",
                "How does this affect students in Hong Kong?",
                "What solutions or improvements can you suggest?"
            ],
            individual_response_questions: [
                `Based on the discussion, what is your personal view on ${roadmapTopic}?`,
                "How would you apply what we discussed to your own life?",
                "What do you think is the most important point raised?"
            ]
        };
        setExamData(questData);
        setStatus('PREP');

        // Reset airtime
        setAirtime({ 'You': 0, 'Candidate_A': 0, 'Candidate_B': 0, 'Candidate_C': 0 });

        // Phase 19: Pre-fetch first batch during PREP phase to reduce latency
        // Pass a "pre-warmed" hint to avoid the null examData crash
        fetchBatch("Candidate_A");
    }, [roadmapTopic, taskId]);

    // Airtime Ticker
    useEffect(() => {
        if (status !== 'DISCUSSION') return;
        const interval = setInterval(() => {
            const now = Date.now();
            const delta = (now - lastAirtimeUpdate.current) / 1000;
            lastAirtimeUpdate.current = now;

            if (currentSpeaker) {
                setAirtime(prev => ({
                    ...prev,
                    [currentSpeaker]: (prev[currentSpeaker] || 0) + delta
                }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [status, currentSpeaker]); // Removed airtime dependency to avoid jitter

    // Phase 22: Context Preservation
    // Ensure roadmapTopic is stable
    useEffect(() => {
        if (!roadmapTopic) console.warn("⚠️ Roadmap Topic is missing!");
    }, [roadmapTopic]);


    // 0. Load Voices
    useEffect(() => {
        const loadVoices = () => {
            // Safe check for window.speechSynthesis
            if (!window.speechSynthesis) return;
            const vs = window.speechSynthesis.getVoices();
            console.log(`[Speaking] Voices Loaded: ${vs.length}`);
            setVoices(vs);
        };

        if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();

        // Keep-alive for Chrome
        const resumeInterval = setInterval(() => {
            if (window.speechSynthesis) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 10000);
        return () => {
            clearInterval(resumeInterval);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    // 4. Watchdog
    useEffect(() => {
        if (status !== 'DISCUSSION') return;
        const watchdog = setInterval(() => {
            const now = Date.now();
            const lastActivity = window.lastSpeakingActivity || now;
            const silenceDuration = now - lastActivity;

            // Dead Air Detection
            if (!currentSpeaker && !isUserTurn && !micActive && !isQueued.current && !activeUtterance.current) {
                const hangThreshold = 10000; // Reduced from 15s to 10s for better pace
                if (silenceDuration > hangThreshold) {
                    addLog(`🚨 System Hang Guard: Restarting flow...`);
                    const pick = ["Candidate_A", "Candidate_B", "Candidate_C"][Math.floor(Math.random() * 3)];
                    isFetchingAI.current = false;
                    triggerAITurn(pick);
                    window.lastSpeakingActivity = Date.now();
                }
            }
            // User Silence / Proactive Examiner Prompt
            else if (isUserTurn && !micActive && !activeUtterance.current) {
                const idleThreshold = 12000; // 12 seconds silence
                if (silenceDuration > idleThreshold) {
                    addLog(`💡 Proactive Prompt: Examiner asking for opinion`);
                    setCurrentSpeaker("Examiner");
                    setIsUserTurn(false);
                    isUserTurnRef.current = false;
                    const prompts = [
                        "Candidate D, what are your thoughts on this point?",
                        "Do you have anything to add, Candidate D?",
                        "I'd like to hear your perspective on this, Candidate D.",
                        "What do you think about the points raised so far?"
                    ];
                    const p = prompts[Math.floor(Math.random() * prompts.length)];
                    playSpeech("Examiner", p, () => {
                        setCurrentSpeaker(null);
                        startUserTurn();
                    });
                    window.lastSpeakingActivity = Date.now();
                }
            }
            // Stuck Speaker Detection
            else if (currentSpeaker && !isUserTurn) {
                const synthSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;

                // Phase 31: Phantom Utterance Detection
                // Logic thinks someone is speaking, but browser engine is idle
                if (activeUtterance.current && !synthSpeaking && silenceDuration > 5000) {
                    addLog(`🚨 Phantom utterance detected for ${currentSpeaker}. Clearing...`);
                    activeUtterance.current = null;
                    isTransitioning.current = false;
                }

                if (currentSpeaker === 'You') {
                    if (silenceDuration > 5000) {
                        setCurrentSpeaker(null);
                        window.lastSpeakingActivity = Date.now();
                    }
                } else {
                    // Phase 30: Increase threshold to 45s for long DSE turns
                    const stuckThreshold = activeUtterance.current ? 45000 : 8000;
                    if (silenceDuration > stuckThreshold && !isFetchingAI.current) {
                        addLog(`🚨 Speaker Stuck Guard (45s): Force-ending ${currentSpeaker}`);
                        setCurrentSpeaker(null);
                        activeUtterance.current = null;
                        isTransitioning.current = false;
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        window.lastSpeakingActivity = Date.now();
                    }
                }
            }
            // Phase 31: Stuck Queue Guard
            // No speaker, no mic, but items in queue and no active transition/fetch
            else if (!currentSpeaker && !isUserTurn && !micActive && !isFetchingAI.current && localTurnQueue.current.length > 0 && !activeUtterance.current && !isInternalTransition.current) {
                if (silenceDuration > 3000) {
                    addLog("🚨 Stuck queue recovery: Forcing triggerAITurn...");
                    triggerAITurn();
                    window.lastSpeakingActivity = Date.now();
                }
            }
        }, 1000);
        return () => clearInterval(watchdog);
    }, [status, currentSpeaker, isUserTurn, micActive]);

    // Timer
    useEffect(() => {
        if (timeLeft > 0 && status !== 'FINISHED') {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            if (status === 'PREP') startDiscussion();
            if (status === 'DISCUSSION') endDiscussion();
        }
    }, [timeLeft, status]);

    // Speech Rec
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const r = new window.webkitSpeechRecognition();
            r.continuous = true;
            r.interimResults = true;
            r.lang = 'en-HK';
            r.onstart = () => {
                setMicActive(true);
                collectedTranscript.current = "";
                addLog("🎙️ Listening...");
            };
            r.onend = () => setMicActive(false);
            r.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                if (finalTranscript) {
                    collectedTranscript.current += " " + finalTranscript;
                    addLog(`📝 Interim: "${finalTranscript.substring(0, 15)}..."`);
                }
                if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
                userSilenceTimer.current = setTimeout(() => {
                    if (collectedTranscript.current.trim()) {
                        r.stop();
                        handleUserSpeech(collectedTranscript.current.trim());
                    }
                }, 1000);
            };
            recognition.current = r;
        }
    }, []);

    // Helper: Get Voice
    const getVoice = (role) => {
        if (!voices || voices.length === 0) return null;
        const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        const pool = englishVoices.length > 0 ? englishVoices : voices;
        const find = (lang, namePart) => pool.find(v => v.lang.toLowerCase().includes(lang.toLowerCase()) && (!namePart || v.name.toLowerCase().includes(namePart.toLowerCase())));
        const safeVoice = find('Google US English') || find('en-US');

        if (role === 'Examiner') return find('en-GB') || safeVoice;
        const hkVoice = find('en-HK') || find('Hong Kong');
        const gbVoice = find('en-GB');
        const fallback = safeVoice || pool[0];

        if (role === 'Candidate_A') return find('en-GB', 'Female') || hkVoice || gbVoice || fallback;
        if (role === 'Candidate_B') return find('en-GB', 'Male') || hkVoice || gbVoice || fallback;
        if (role === 'Candidate_C') return find('en-US', 'Female') || hkVoice || gbVoice || fallback;
        return fallback;
    };

    const cleanText = (text) => {
        if (!text) return "";
        // Remove "Candidate A:", "Candidate_A:", "Examiner:", etc.
        return text.replace(/^(Candidate[ _][A-D]|Examiner):/i, "").replace(/\*.*?\*/g, "").trim();
    };

    const playSpeech = (role, text, onEnd) => {
        const cleaned = cleanText(text);
        setActiveSpeechText(cleaned); // Show text IMMEDIATELY to avoid the "..." delay
        addLog(`🗣️ [${role}]: ${cleaned.substring(0, 30)}...`);
        setTranscript(prev => [...prev, { role, text }]);

        if (!cleaned) {
            setActiveSpeechText("");
            setTimeout(onEnd, 1000);
            return;
        }

        if (window.speechSynthesis) window.speechSynthesis.cancel();

        const u = new SpeechSynthesisUtterance(cleaned);
        activeUtterance.current = u;
        window[`tts_${role}`] = u; // Global ref

        const voice = getVoice(role);
        if (voice) u.voice = voice;
        u.pitch = 1.0;
        u.rate = 1.0; // Normal Speed

        let hasFinished = false;
        isTransitioning.current = false;

        const safeOnEnd = () => {
            if (hasFinished) return;
            hasFinished = true;
            setActiveSpeechText(""); // Clear subtitles when speech ends
            if (activeUtterance.current === u) activeUtterance.current = null;
            window.lastSpeakingActivity = Date.now();

            // Phase 22: Chunking Safeguard - Clear the global ref
            window[`tts_${role}`] = null;

            setTimeout(() => {
                const turnTimeGap = 300; // Reduced from 1000 to improve flow
                isTransitioning.current = false;
                if (onEnd) onEnd();
            }, turnTimeGap);
        };

        u.onend = () => safeOnEnd();
        u.onerror = (e) => {
            console.error("TTS Error", e);
            if (e.error === 'interrupted') return; // Ignore intentional interrupts
            safeOnEnd();
        };
        u.onboundary = () => {
            window.lastSpeakingActivity = Date.now(); // Alive signal
            // CHROME FIX: Resume simply to keep the engine awake
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        };

        // Phase 30: Heartbeat to keep activity alive during long turns
        const heartbeat = setInterval(() => {
            if (activeUtterance.current === u) {
                window.lastSpeakingActivity = Date.now();
            } else {
                clearInterval(heartbeat);
            }
        }, 2000);

        window.lastSpeakingActivity = Date.now();
        if (window.speechSynthesis) {
            window.speechSynthesis.resume(); // Wake up
            window.speechSynthesis.cancel(); // Clear queue
            window.speechSynthesis.speak(u);
        } else {
            safeOnEnd();
        }
    };

    const handleUserSpeech = (text) => {
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        userSilenceTimer.current = null;

        // Phase 26 Fix: Ensure state is reset even if speech recognition returns empty or crashes
        setCurrentSpeaker(null);
        setIsUserTurn(false);
        isUserTurnRef.current = false;

        const cleaned = (text || "").trim();
        if (!cleaned) {
            addLog("⚠️ Speech empty or cancelled.");
            // Force AI to pick up if user stays silent
            setTimeout(() => {
                if (!isUserTurnRef.current && status === 'DISCUSSION') triggerAITurn();
            }, 1000);
            return;
        }

        addLog(`🎙️ User said: "${cleaned.substring(0, 20)}..."`);
        setTranscript(prev => [...prev, { role: "You", text: cleaned }]);
        chatHistory.current.push({ role: "user", text: cleaned });
        // Phase 28: DO NOT clear localTurnQueue immediately to preserve pre-fetched turns for speed
        if (localTurnQueue.current.length > 3) localTurnQueue.current = [];

        if (status === 'INDIVIDUAL') {
            playSpeech("Examiner", "Thank you. That is the end.", () => setStatus('FINISHED'));
            return;
        }

        // Phase 33: Smart Context & Fillers
        // If user says something substantial (> 15 chars), invalidate queue to address NEW context.
        // If trivial ("Yeah", "Okay"), keep queue for speed.
        if (cleaned.length > 15) {
            addLog("🧠 Substantial turn detected: Invalidating queue for new context...");
            localTurnQueue.current = []; // Clear stale turns

            // Pick next speaker for filler
            const pick = ["Candidate_A", "Candidate_B", "Candidate_C", "Examiner"][Math.floor(Math.random() * 4)];
            const fillerList = FILLERS[pick] || FILLERS["Candidate_A"];
            const filler = fillerList[Math.floor(Math.random() * fillerList.length)];

            // Start fetching REAL response in background
            fetchBatchInBackground(pick);

            // Play filler immediately to mask latency
            playSpeech(pick, filler, () => {
                // When filler ends, trigger the real turn (which should be arriving)
                triggerAITurn(pick);
            });
            return; // Skip the standard timeout flow
        }

        // Phase 29/32: Immediate handoff to AI (Standard Flow)
        setTimeout(() => {
            if (!isUserTurnRef.current && !isQueued.current) {
                const pick = ["Candidate_A", "Candidate_B", "Candidate_C"][Math.floor(Math.random() * 3)];
                triggerAITurn(pick);
            }
        }, 100); // Reduced from 500ms to 100ms
    };

    const startUserTurn = () => {
        // Ensure examiner's intro is in history if this is the start
        if (chatHistory.current.length === 0 && examData) {
            const intro = `Good afternoon. We are here to discuss ${examData.title || roadmapTopic}. What are your thoughts on this?`;
            chatHistory.current.push({ role: "Examiner", text: intro });
            setTranscript([{ role: "Examiner", text: intro }]);
        }

        localTurnQueue.current = []; // Phase 32: Cleared ONLY on start, but allow background fills
        // Actually, we WANT to preserve if it was just filled by background fetch? 
        // No, startUserTurn means user is talking NOW, so previous queue is likely stale unless it's the response to THIS turn.
        // Wait, the plan said "Remove localTurnQueue.current = [] from startUserTurn".
        // Let's comment it out to preserve pre-fetched, but we must ensure we don't play stale responses.
        // However, standard flow is: User speaks -> Fetch happens -> Response logic picks from queue.
        // If we clear it here, we lose anything fetched *while* user was prepping.
        // Phase 32: Preserve queue (commented out clear)
        // localTurnQueue.current = []; 

        isTransitioning.current = false;
        setIsUserTurn(true);
        isUserTurnRef.current = true;
        setCurrentSpeaker("You");

        // Phase 28: Trigger background fetch while user is speaking to prepare next turns
        fetchBatchInBackground();

        if (recognition.current) {
            try { recognition.current.start(); } catch { /* Ignore start errors */ }
        }
    };

    const handleChipIn = () => {
        addLog("✋ User requested Chip-In: Interrupting immediately");
        // Phase 32: Interruption is now allowed at ANY time
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        startUserTurn();
    };

    const handleManualFinish = () => {
        addLog("⏹️ Manual finish triggered");
        if (recognition.current) {
            try {
                recognition.current.stop();
            } catch (e) {
                console.warn("Recognition stop failed", e);
            }
        }
        // Force process whatever we have
        handleUserSpeech(collectedTranscript.current);
    };

    const playQueuedTurn = (turn) => {
        const { speaker, content } = turn;
        setCurrentSpeaker(speaker);
        playSpeech(speaker, content, () => {
            setCurrentSpeaker(null);
            chatHistory.current.push({ role: speaker, text: content });
            if (isQueued.current) {
                isQueued.current = false;
                setIsQueuedState(false);
                startUserTurn();
                return;
            }
            setTimeout(() => {
                if (!isUserTurnRef.current && status === 'DISCUSSION') triggerAITurn();
            }, 1000);
        });
    };

    const fetchBatch = async (hintSpeaker = "Candidate_A") => {
        if (isFetchingAI.current) {
            addLog("ℹ️ Fetch already in progress...");
            return;
        }
        isFetchingAI.current = true;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory.current.slice(-15),
                    currentSpeaker: hintSpeaker,
                    topic: examData?.title || roadmapTopic, // Fallback to roadmapTopic if examData is null
                    context: examData,
                    uid: user?.uid
                }),
                signal: AbortSignal.timeout(30000)
            });
            const data = await res.json();
            if (data.turns && Array.isArray(data.turns) && data.turns.length > 0) {
                localTurnQueue.current = [...localTurnQueue.current, ...data.turns];
                addLog(`✅ Queued ${data.turns.length} AI turns`);
            } else {
                throw new Error("Empty turns returned from API");
            }
        } catch (e) {
            console.error("Fetch Batch Error:", e);
            addLog("❌ Failed to fetch turns. Using Fail-Safe.");
            // Phase 34: Fail-Safe Response to prevent hang
            localTurnQueue.current.push({
                speaker: hintSpeaker || "Examiner",
                content: "That is a complex issue. Let's move on to the next point."
            });
        }
        finally {
            isFetchingAI.current = false;
            // Phase 22: Force Trigger if queue populated and room is silent
            if (status === 'DISCUSSION' && !isUserTurnRef.current && !activeUtterance.current && localTurnQueue.current.length > 0) {
                addLog("🚀 Auto-triggering after fetch...");
                triggerAITurn();
            }
        }
    };

    const fetchBatchInBackground = () => fetchBatch();

    const triggerAITurn = async (forceSpeaker) => {
        if (isUserTurnRef.current || status !== 'DISCUSSION') return;

        // Phase 30: Strengthen guards with direct browser check
        const isActuallySpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
        if (isTransitioning.current || activeUtterance.current || isActuallySpeaking || isInternalTransition.current) {
            addLog(`🚫 Turn blocked: Trans=${isTransitioning.current} Actv=${!!activeUtterance.current} SynthSpeaking=${isActuallySpeaking} InternalLock=${isInternalTransition.current}`);
            return;
        }

        isInternalTransition.current = true;
        setTimeout(() => { isInternalTransition.current = false; }, 200); // Phase 32: Short lock reduced to 200ms

        if (localTurnQueue.current.length > 0) {
            const next = localTurnQueue.current.shift();
            if (localTurnQueue.current.length <= 1) fetchBatchInBackground();
            playQueuedTurn(next);
            return;
        }

        // If no turns, fetch then play
        addLog("⏳ Fetching AI turns...");
        await fetchBatch(forceSpeaker);

        // Re-check after fetch - if we are still ready to play, do it
        if (!isUserTurnRef.current && !isTransitioning.current && !activeUtterance.current && localTurnQueue.current.length > 0) {
            addLog(`✅ Playing fetched turn for: ${localTurnQueue.current[0].speaker}`);
            playQueuedTurn(localTurnQueue.current.shift());
        } else {
            addLog("⚠️ Still waiting for turns (Polling)...");
            // Phase 34: Polling Loop - Retry even if fetching, to catch when it finishes
            if (!isUserTurnRef.current && !activeUtterance.current && status === 'DISCUSSION') {
                setTimeout(() => triggerAITurn(forceSpeaker), 500);
            }
        }
    };

    const startDiscussion = () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        setStatus('DISCUSSION');
        setTimeLeft(8 * 60);
        setCurrentSpeaker("Examiner");
        playSpeech("Examiner", `Good afternoon. We are here to discuss ${examData?.title || roadmapTopic}. What are your thoughts on this?`, () => {
            setCurrentSpeaker(null);
            startUserTurn();
        });
    };

    const endDiscussion = () => {
        setStatus('INDIVIDUAL');
        setTimeLeft(60);
        playSpeech("Examiner", "Thank you. Candidate D, I have a question for you.", () => {
            const qs = examData.individual_response_questions || [];
            const q = qs[0] || "What is your view?";
            playSpeech("Examiner", q, () => {
                startUserTurn();
            });
        });
    };

    const finishExam = async () => {
        setStatus('FINISHED');
        if (synth.current) synth.current.cancel();

        // Quest Logic: Inline Grading
        if (isQuest) {
            setIsSubmitting(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/speaking/quest/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        module: 'interaction',
                        taskId,
                        transcript: chatHistory.current,
                        userId: user?.uid,
                        level: "3",
                        quest_id: examData.id
                    })
                });
                const result = await res.json();
                setGradingResult(result);
            } catch (e) {
                console.error(e);
                alert("Submission failed");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            navigate('/speaking/result', { state: { loading: true } });
            // ... Mock grading logic similar to SpeakingExamPage
        }
    };

    const getUserAvatar = () => {
        // In real app, fetch from stats or user profile
        return '/avatars/student_male_1.jpg';
    };

    // Render Helpers
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const getPos = (role) => {
        // Square Table Layout (1-on-1)
        const positions = {
            'Examiner': { top: '50%', left: '25%' }, // Left side
            'You': { top: '50%', left: '75%' }      // Right side
        };
        return positions[role] || { top: '50%', left: '50%' };
    };

    if (error) return <div>Error: {error}</div>;
    if (!examData) return (
        <div className="h-screen bg-indigo-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-indigo-600 font-bold animate-pulse">Generating Interaction Quest...</p>
        </div>
    );

    return (
        <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans">
            {/* Blackboard Background */}
            <div className="absolute inset-0 z-0 bg-[#1e2f23] overflow-hidden">
                {/* Chalkboard Texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
                {/* Wooden Frame */}
                <div className="absolute inset-4 border-[16px] border-[#5d4037] rounded-lg shadow-2xl"></div>
                {/* Subtle Dust/Smudges */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10"></div>

                {/* Chalk Dust Effect at bottom */}
                <div className="absolute bottom-12 left-1/4 right-1/4 h-1 bg-white/10 blur-sm rounded-full"></div>

                {/* Blackboard Tray (粉刷/粉筆架) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#3e2723] border-t-4 border-[#2d1b15] shadow-xl flex items-center justify-around px-12 rounded-b-lg">
                    {/* Chalk Pieces (粉筆) */}
                    <div className="flex gap-4">
                        <div className="w-8 h-2 bg-white rounded-full rotate-12 shadow-sm"></div>
                        <div className="w-7 h-2 bg-yellow-100 rounded-full -rotate-6 shadow-sm"></div>
                        <div className="w-8 h-2 bg-blue-100 rounded-full rotate-45 shadow-sm"></div>
                    </div>
                    {/* Board Eraser (粉刷) */}
                    <div className="relative w-16 h-6 bg-[#5d4037] border-2 border-[#3e2723] rounded shadow-lg group">
                        {/* Eraser Bristles (Brush part) */}
                        <div className="absolute -bottom-1 inset-0.5 h-1 bg-gray-400 opacity-50 blur-[1px]"></div>
                        {/* Eraser Top Handle */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#7d5d4a] to-[#5d4037]"></div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="relative z-20 p-6 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="size-10 bg-white/80 rounded-full flex items-center justify-center">←</button>
                    <h1 className="text-xl font-bold">{examData.title}</h1>
                    {isQuest && <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Quest Mode</span>}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsEasyMode(!isEasyMode)} className="px-4 py-2 bg-white/50 rounded-full text-sm font-bold">
                        {isEasyMode ? "📖 Easy Mode ON" : "📖 Easy Mode"}
                    </button>
                    <div className="px-6 py-2 bg-emerald-500 text-white rounded-full font-mono font-bold shadow-lg">
                        {status}: {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                {/* 3D Realistic Table */}
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] z-0">
                    {/* Shadow underneath */}
                    <div className="absolute inset-x-8 bottom-[-20px] h-10 bg-black/20 blur-xl rounded-[100%]"></div>

                    {/* Table Surface (Wood/Glass Mix) */}
                    <div className="relative w-full h-full rounded-[60px] bg-gradient-to-b from-[#7d5d4a] via-[#5d4037] to-[#3e2723] border-[4px] border-[#8d6e63]/30 shadow-2xl overflow-hidden group">
                        {/* Realistic Grain Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern-with-twigs.png')]"></div>

                        {/* Glossy Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>

                        {/* Central Glass Inset for High-Tech feel */}
                        <div className="absolute inset-12 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-[2px] shadow-inner"></div>
                    </div>

                    {/* Table Edge/Rim */}
                    <div className="absolute inset-0 -z-10 translate-y-4 w-full h-full rounded-[60px] bg-[#2d1b15] shadow-2xl"></div>
                </div>

                {/* Participants - Only Examiner and You */}
                {["Examiner", "You"].map(role => {
                    const pos = getPos(role);
                    const isSpeaking = currentSpeaker === role;
                    const isUser = role === "You";
                    const avatarSrc = role === "Examiner" ? examinerImg : getUserAvatar();

                    return (
                        <div key={role} className={`absolute transition-all duration-500 flex flex-col items-center ${isSpeaking ? "z-30 scale-110" : "z-20 grayscale-[20%]"}`} style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}>
                            <div className={`relative size-44 rounded-full border-8 bg-white shadow-2xl overflow-hidden transition-all duration-300 ${isSpeaking ? "border-emerald-400 ring-[12px] ring-emerald-400/20" : "border-white/80"}`}>
                                <img
                                    src={avatarSrc}
                                    alt={role}
                                    className="w-full h-full object-cover"
                                    onError={role === "Examiner" ? handleExaminerImgError : null}
                                />
                                {isSpeaking && (
                                    <div className="absolute inset-0 border-[6px] border-emerald-400 animate-pulse rounded-full"></div>
                                )}
                            </div>

                            {/* User Controls - Repositioned below avatar */}
                            {isUser && status === 'DISCUSSION' && (
                                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 min-w-[200px] z-[100]">
                                    {isUserTurn ? (
                                        <button
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                handleManualFinish();
                                            }}
                                            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-black text-base shadow-[0_6px_0_rgb(185,28,28)] active:translate-y-1 active:shadow-none transition-all animate-in zoom-in-95 cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <div className="size-3 bg-white rounded-sm animate-pulse"></div>
                                            STOP SPEAKING
                                        </button>
                                    ) : (
                                        <button
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                handleChipIn();
                                            }}
                                            className="group relative w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-black text-base shadow-[0_6px_0_rgb(5,150,105)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span className="size-2 bg-white rounded-full animate-ping"></span>
                                            SPEAK
                                            {isQueuedState && <span className="absolute -top-3 -right-3 bg-amber-500 text-[10px] px-2 py-1 rounded-md shadow-md animate-bounce">QUEUED</span>}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Airtime Bar */}
                            {status === 'DISCUSSION' && (
                                <div className="mt-4 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min(100, (airtime[role] || 0) / 60 * 100)}%` }}></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Active Transcript / Subtitles Overlay - MOVED TO TOP */}
                {(currentSpeaker || (isEasyMode && transcript.length > 0)) && (
                    <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-full max-w-4xl z-40 px-4">
                        <div className="bg-black/60 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl border border-white/10 text-center animate-in slide-in-from-top-12 duration-500">
                            {currentSpeaker ? (
                                <>
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <div className="size-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgb(52,211,153)]"></div>
                                        <div className="h-1 w-12 bg-white/20 rounded-full"></div>
                                    </div>
                                    <div className="text-2xl font-bold text-white leading-relaxed tracking-tight px-4">
                                        {currentSpeaker === 'You' ? (
                                            <span className="text-emerald-300">
                                                {micActive ? (collectedTranscript.current || "Listening...") : "Go ahead, speak!"}
                                            </span>
                                        ) : (
                                            <span>{activeSpeechText || (isFetchingAI.current ? "*Miss Janie is thinking...*" : "")}</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Idle Hint or Easy Mode History
                                <div className="text-lg font-medium text-white/70 leading-tight italic px-8">
                                    {isUserTurn ? (
                                        <span className="text-emerald-300/80 animate-pulse">*Speak now, or click STOP to finish*</span>
                                    ) : (isFetchingAI.current || localTurnQueue.current.length > 0) ? (
                                        <span className="text-white/50 animate-pulse">*Miss Janie is thinking...*</span>
                                    ) : (
                                        <span>*Click SPEAK to join the discussion*</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Prep Overlay */}
                {status === 'PREP' && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
                            <h2 className="text-2xl font-bold mb-4">Preparation Time</h2>
                            <p className="mb-6">{examData.topic_description}</p>
                            <button onClick={() => {
                                const w = new SpeechSynthesisUtterance(' ');
                                window.speechSynthesis.speak(w);
                                setTimeLeft(0);
                            }} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform">
                                Start Discussion Now
                            </button>
                        </div>
                    </div>
                )}    {/* Grading Result Overlay (Quest) */}
                {status === 'FINISHED' && isQuest && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full">
                            <h2 className="text-3xl font-bold mb-4">Quest Completed! 🎉</h2>
                            {isSubmitting ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <p className="text-indigo-600 font-bold animate-pulse">Analyzing Interaction...</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-center mb-6">
                                        <div className="text-6xl font-black text-emerald-500 mb-2 flex flex-col items-center">
                                            <div>{gradingResult?.scores?.total || 0} <span className="text-2xl opacity-50">/ 28</span></div>
                                            {gradingResult?.xp_awarded > 0 && (
                                                <div className="mt-2 px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-bold tracking-widest uppercase animate-in slide-in-from-bottom-2">
                                                    +{gradingResult.xp_awarded} XP Earned
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-6">
                                            {Object.entries(gradingResult?.scores || {}).map(([key, val]) => (
                                                key !== 'total' && (
                                                    <div key={key} className="bg-slate-50 rounded p-2 text-center border border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{key.replace('_', ' ')}</p>
                                                        <p className="text-lg font-black text-slate-700 leading-none">{val}/7</p>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        <div className="p-4 bg-indigo-50 rounded-xl text-sm border-l-4 border-indigo-500">
                                            <p className="font-bold text-indigo-900 mb-1">Expert Feedback</p>
                                            <p className="text-indigo-800">{gradingResult?.feedback?.summary}</p>
                                        </div>
                                        {gradingResult?.feedback?.improvement_advice && (
                                            <div className="p-4 bg-amber-50 rounded-xl text-sm border-l-4 border-amber-500">
                                                <p className="font-bold text-amber-900 mb-1">Advice</p>
                                                <p className="text-amber-800">{gradingResult?.feedback?.improvement_advice}</p>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:scale-[1.02] transition-transform">Return to Dashboard</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SpeakingInteractionPage;
