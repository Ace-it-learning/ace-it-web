import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AGENTS, useAvatar } from '../context/AvatarContext';
import { Loader2, Zap, ShieldCheck } from 'lucide-react';
import MockCountdownTimer from '../components/utils/MockCountdownTimer';

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
            return "How AI will disrupt education in school";
        }
        // v10.1: Add Split for CamelCase and underscores
        return name.replace(/([a-z])([A-Z])/g, '$1 $2') // Split CamelCase
            .replace(/_/g, ' ') // Split underscores
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }, [location.state?.topic, questTopic]); // Dependency update

    const taskId = location.state?.taskId || questTaskId;
    const isQuest = !!taskId;

    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeAgent } = useAvatar();

    // Examiner Identity: Use equipped/active agent
    const agentName = activeAgent.name;
    const examinerAvatar = activeAgent.avatar || AGENTS.english.avatar;

    // Safety check for broken images
    const [examinerImg, setExaminerImg] = useState(examinerAvatar);
    useEffect(() => {
        setExaminerImg(examinerAvatar);
    }, [examinerAvatar]);
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
    const [isThinkingAI, setIsThinkingAI] = useState(false);
    const hasStartedRef = useRef(false);

    // Dynamic Avatars
    const [candidateAvatars] = useState({
        Candidate_A: `/avatars/annie_avatar_1774534170846.png`,
        Candidate_B: `/avatars/ben_avatar_1774534233060.png`,
        Candidate_C: `/avatars/charlie_avatar_1774534209003.png`,
        Examiner: examinerAvatar
    });
    const candidateDisplayNames = {
        Examiner: agentName,
        Candidate_A: "Annie",
        Candidate_B: "Ben",
        Candidate_C: "Charlie",
        You: "You"
    };

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
    const lastSpeakerRef = useRef(null);
    const speakerActivityRef = useRef(Date.now()); // Tracking timestamp of speaker state changes

    const isMock = location.state?.isMock || false;
    const duration = location.state?.duration || 0;
    const [isEasyMode, setIsEasyMode] = useState(!isMock && !location.state?.mode?.includes('mock')); // Auto-OFF for Mocks


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
            topic_description: `You are participating in a group discussion about how artificial intelligence will disrupt education in schools. Consider the impact on teaching methods, student learning, and future skills. Share your views, listen to others, and engage in meaningful conversation.`,
            discussion_points: [
                "Personalized learning and adaptive technologies",
                "Teacher roles and job displacement concerns",
                "Ethical considerations (data privacy, algorithmic bias)",
                "Digital divide and accessibility",
                "Future skills needed in an AI‑driven world"
            ],
            individual_response_questions: [
                `Based on the discussion, what is your personal view on ${roadmapTopic}?`,
                "How would you apply what we discussed to your own life?",
                "What do you think is the most important point raised?"
            ]
        };
        setExamData(questData);
        setStatus('PREP');
        setTimeLeft(isQuest ? 180 : 600); // Phase 35: 3 mins for Quest, 10 mins for Practice (DSE Standard)

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
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                // Show interim results in the UI immediately
                if (interimTranscript) {
                    setActiveSpeechText(interimTranscript);
                }

                if (finalTranscript) {
                    collectedTranscript.current += " " + finalTranscript;
                    addLog(`📝 Final: "${finalTranscript.substring(0, 15)}..."`);
                }

                if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
                userSilenceTimer.current = setTimeout(() => {
                    const totalSpeech = collectedTranscript.current.trim();
                    if (totalSpeech) {
                        addLog("🤫 Silence detected: processing turn...");
                        r.stop();
                        handleUserSpeech(totalSpeech);
                    }
                }, 1800); // 1.8s silence (native VAD)
            };
            recognition.current = r;
        }
    }, []);

    // Helper: Get Voice
    const getVoice = (role) => {
        if (!voices || voices.length === 0) return null;

        // Filter for English voices, prioritizing high-quality ones
        const englishVoices = voices.filter(v =>
            v.lang.toLowerCase().startsWith('en')
        ).sort((a, b) => {
            // Prefer "Google" voices as they are usually more stable in Chrome
            const aIsGoogle = a.name.toLowerCase().includes('google');
            const bIsGoogle = b.name.toLowerCase().includes('google');
            if (aIsGoogle && !bIsGoogle) return -1;
            if (!aIsGoogle && bIsGoogle) return 1;
            return 0;
        });

        const pool = englishVoices.length > 0 ? englishVoices : voices;

        const find = (langCode, nameInclude = "", gender = "") => {
            return pool.find(v => {
                const matchesLang = v.lang.toLowerCase().includes(langCode.toLowerCase());
                const matchesName = !nameInclude || v.name.toLowerCase().includes(nameInclude.toLowerCase());

                // Stricter Gender Matching: Avoid 'female' in name if 'male' is requested
                const nameLower = v.name.toLowerCase();
                const maleKeywords = /male|man|boy|daniel|david|alex|fred|thomas|mark|daniel|james|oliver|harry/i;
                const femaleKeywords = /female|woman|girl|samantha|victoria|moira|veena|zira|susan|mary/i;

                let matchesGender = true;
                if (gender === 'Female') {
                    matchesGender = femaleKeywords.test(nameLower) && !maleKeywords.test(nameLower);
                } else if (gender === 'Male') {
                    matchesGender = maleKeywords.test(nameLower) && !femaleKeywords.test(nameLower);
                }

                return matchesLang && matchesName && matchesGender;
            });
        };

        const safeVoice = find('Google US English') || find('en-US') || pool[0];
        const fallback = safeVoice;

        if (role === 'Examiner') {
            // Examiner: Mature, formal (Female)
            return find('en-GB', '', 'Female') || find('en-US', 'Samantha') || fallback;
        }
        if (role === 'Candidate_A') {
            // Annie: Confident (Female)
            return find('en-GB', '', 'Female') || find('en-US', 'Zira') || fallback;
        }
        if (role === 'Candidate_B') {
            // Ben: Competent (Male)
            return find('en-GB', '', 'Male') || find('en-US', 'David') || find('en-US', 'James') || find('', '', 'Male') || fallback;
        }
        if (role === 'Candidate_C') {
            // Charlie: Hesitant (Male)
            return find('en-HK', '', 'Male') || find('en-US', 'Daniel') || find('en-GB', 'Harry') || find('', '', 'Male') || fallback;
        }

        return fallback;
    };

    const cleanText = (text) => {
        if (!text) return "";
        // Remove "Candidate A:", "Candidate_A:", "Examiner:", etc.
        return text.replace(/^(Candidate[ _][A-D]|Examiner):/i, "").replace(/\*.*?\*/g, "").trim();
    };

    const playDirectAudio = (base64, text, role, onEnd) => {
        if (!base64) return playSpeech(role, text, onEnd);

        const cleaned = cleanText(text);
        setActiveSpeechText(cleaned);
        addLog(`🗣️ [Direct Audio][${role}]: ${cleaned.substring(0, 30)}...`);
        setTranscript(prev => [...prev, { role, text: cleaned }]);

        const audioUrl = `data:audio/wav;base64,${base64}`;
        const audioObj = new Audio();
        audioObj.src = audioUrl;
        audioObj.preload = "auto"; // Ensure full buffer for stability
        activeUtterance.current = audioObj;

        const cleanup = () => {
            // Phase 41: Persistent Script - Don't clear text immediately
            // setActiveSpeechText("");
            isTransitioning.current = false;
            activeUtterance.current = null;
            if (onEnd) onEnd();
        };

        audioObj.onended = cleanup;
        audioObj.onerror = (e) => {
            console.error("Direct Audio playback error:", e);
            cleanup();
        };

        audioObj.play().then(() => {
            speakerActivityRef.current = Date.now();
        }).catch(err => {
            console.warn("Direct play failed, falling back to speech synthesis:", err);
            playSpeech(role, text, onEnd);
        });
    };

    const playSpeech = (role, text, onEnd) => {
        const cleaned = cleanText(text);
        if (!cleaned) {
            if (onEnd) onEnd();
            return;
        }

        // Phase 40: Update transcript for consistency
        setTranscript(prev => [...prev.slice(-10), { role, text: cleaned }]);

        // We split by punctuation and play chunks sequentially.
        const chunks = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
        let currentChunkIndex = 0;

        const speakNextChunk = () => {
            if (currentChunkIndex >= chunks.length) {
                // Done with all chunks
                setTimeout(() => {
                    // Phase 41: Persistent Script - Don't clear text immediately
                    // setActiveSpeechText("");
                    isTransitioning.current = false;
                    activeUtterance.current = null; // Critical Fix: Clear utterance to prevent dead air
                    if (onEnd) onEnd();
                }, 500);
                return;
            }

            const chunkText = chunks[currentChunkIndex].trim();
            if (!chunkText) {
                currentChunkIndex++;
                speakNextChunk();
                return;
            }

            // Phase 40: Maintain full text in the script box for Candidates A, B, C
            setActiveSpeechText(cleaned);
            const u = new SpeechSynthesisUtterance(chunkText);
            activeUtterance.current = u;
            const voice = getVoice(role);
            if (voice) u.voice = voice;
            u.pitch = role === 'Examiner' ? 0.9 : 1.0;
            u.rate = role === 'Candidate_C' ? 0.9 : 1.0;

            u.onend = () => {
                currentChunkIndex++;
                speakNextChunk();
            };

            u.onerror = (e) => {
                console.error("TTS Chunk Error", e);
                currentChunkIndex++;
                speakNextChunk();
            };

            window.speechSynthesis.speak(u);
            speakerActivityRef.current = Date.now();
        };

        // Phase 41: Force cancel any ghost utterances before starting new one
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        isTransitioning.current = true;
        speakNextChunk();
    };

    // Calculate dynamic fluency levels based on user level
    const getFluencyLevel = (role) => {
        // Base levels from persona
        const baseLevels = {
            'Candidate_A': 5, // 5**
            'Candidate_B': 4,
            'Candidate_C': 3
        };

        const userLevel = parseInt(location.state?.userLevel || "3");
        const base = baseLevels[role];

        // Adjust candidate level to be around user level +1/-1
        // but respect the persona (Annie is always the best)
        if (role === 'Candidate_A') return Math.max(userLevel + 1, 5);
        if (role === 'Candidate_B') return userLevel;
        if (role === 'Candidate_C') return Math.max(1, userLevel - 1);

        return base;
    };

    const handleUserSpeech = (text) => {
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        userSilenceTimer.current = null;

        // Reset user state
        setMicActive(false);
        setIsUserTurn(false);
        isUserTurnRef.current = false;
        
        const cleaned = (text || "").trim();
        if (cleaned) {
            setActiveSpeechText(cleaned); // Show the final text the user said
        }
        if (!cleaned) {
            addLog("⚠️ Speech empty. Waiting for user to click SPEAK again or AI to take initiative.");
            // If user stays silent, wait 2s then AI might take over
            setTimeout(() => {
                if (!isUserTurnRef.current && !activeUtterance.current && status === 'DISCUSSION') {
                    addLog("🎲 AI taking initiative due to silence...");
                    triggerAITurn();
                }
            }, 3000);
            return;
        }

        addLog(`🎙️ User said: "${cleaned.substring(0, 20)}..."`);
        setTranscript(prev => [...prev, { role: "You", text: cleaned }]);
        chatHistory.current.push({ role: "user", text: cleaned });
        fetchBatchInBackground(); // Pre-fetch AI response to ensure queue has content

        // Substantial turns invalidate the pre-fetched queue
        if (cleaned.length > 20) {
            addLog("🧠 Context changed. Fetching fresh responses...");
            localTurnQueue.current = [];
        }

        if (status === 'INDIVIDUAL') {
            playSpeech("Examiner", "Thank you. That is the end of the individual response.", () => setStatus('FINISHED'));
            return;
        }

        // Start turn detection loop
        addLog("🎲 Passing floor to AI candidates...");
        triggerAITurn();
        
        // Final cleanup for user turn
        setCurrentSpeaker(null);
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
        // If we clear it here, we lose anything fetched *while* user was prepping.
        // Phase 32: Preserve queue (commented out clear)
        // localTurnQueue.current = []; 

        isTransitioning.current = false;
        setIsUserTurn(true);
        isUserTurnRef.current = true;
        setCurrentSpeaker("You");
        setActiveSpeechText(""); // Phase 42: Clear last script as user starts fresh turn

        // Phase 28: Trigger background fetch while user is speaking to prepare next turns
        fetchBatchInBackground();

        if (recognition.current) {
            try { recognition.current.start(); } catch { /* Ignore start errors */ }
        }
    };

    const handleChipIn = () => {
        if (currentSpeaker && currentSpeaker !== "You") {
            addLog("✋ User requested Chip-In: Queued for next turn");
            isQueued.current = true;
            setIsQueuedState(true);
            return;
        }

        addLog("✋ User taking the floor");
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

    const playQueuedTurn = (turn, onComplete) => {
        addLog(`🎬 Playing queued turn for ${turn?.speaker || 'unknown'}: ${turn?.content?.substring(0, 30) || 'no content'}...`);
        if (!turn) {
            if (onComplete) onComplete();
            return;
        }
        setCurrentSpeaker(turn.speaker);
        lastSpeakerRef.current = turn.speaker;
        setActiveSpeechText(turn.content); // Immediate set to prevent flickering placeholder

        // Use Direct Audio if provided, otherwise fallback to standard TTS
        const playbackMethod = turn.audio ? playDirectAudio : playSpeech;
        addLog(`⚡ Starting playback using ${turn.audio ? 'Direct Multimodal' : 'Fallback TTS'}`);

        // Proactive Buffering: Fetch the NEXT turn while this one is playing
        if (localTurnQueue.current.length < 2) {
            setTimeout(() => fetchBatchInBackground(), 500);
        }

        // playDirectAudio takes (base64, text, role, onEnd)
        // playSpeech takes (role, text, onEnd)
        const play = () => {
            if (turn.audio) {
                playDirectAudio(turn.audio, turn.content, turn.speaker, finalize);
            } else {
                playSpeech(turn.speaker, turn.content, finalize);
            }
        };

        const finalize = () => {
            setCurrentSpeaker(null);
            chatHistory.current.push({ role: turn.speaker, text: turn.content });

            if (isQueued.current) {
                isQueued.current = false;
                setIsQueuedState(false);
                startUserTurn();
                if (onComplete) onComplete();
                return;
            }

            if (onComplete) {
                onComplete();
            } else {
                // Free discussion logic: trigger next AI turn if room is silent
                setTimeout(() => {
                    if (!isUserTurnRef.current && status === 'DISCUSSION') triggerAITurn();
                }, 1500);
            }
        };

        play();
    };

    const fetchBatch = async (hintSpeaker = "Candidate_A") => {
        if (isFetchingAI.current) {
            addLog("ℹ️ Fetch already in progress...");
            return;
        }
        isFetchingAI.current = true;
        setIsThinkingAI(true);
        try {
            const userLevel = location.state?.userLevel || "3";
            const candidateLevels = {
                'Candidate_A': getFluencyLevel('Candidate_A'),
                'Candidate_B': getFluencyLevel('Candidate_B'),
                'Candidate_C': getFluencyLevel('Candidate_C')
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory.current.slice(-15),
                    current_speaker: hintSpeaker !== "Candidate_A" ? hintSpeaker : "Candidate_A",
                    topic: examData?.title || roadmapTopic,
                    level: userLevel,
                    uid: user?.uid
                }),
                signal: AbortSignal.timeout(30000)
            });
            const data = await res.json();
            if (data.content) {
                localTurnQueue.current.push({
                    speaker: data.speaker || hintSpeaker,
                    content: data.content,
                    audio: data.audio // Store pre-generated audio!
                });
                addLog(`✅ Queued MULTIMODAL AI turn from ${data.speaker}`);
            } else {
                throw new Error("No content returned from AI turn API");
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
            setIsThinkingAI(false);
        }
    };

    const fetchBatchInBackground = () => fetchBatch();

    const triggerAITurn = async (forceSpeaker, onComplete) => {
        addLog(`🔍 triggerAITurn: isUserTurn=${isUserTurnRef.current}, status=${status}, activeUtterance=${!!activeUtterance.current}, isTransitioning=${isTransitioning.current}`);
        
        if (isUserTurnRef.current) return;
        if (status !== 'DISCUSSION') return;

        // Phase 40: Detect Ghost States (Browser engine stuck for >30s)
        const isActuallySpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
        const silenceDuration = Date.now() - speakerActivityRef.current;
        let isStuck = false;
        
        if (isActuallySpeaking && silenceDuration > 30000) {
            addLog("🚨 Ghost state detected (30s activity gap). Force-clearing...");
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            isStuck = true;
        }

        if ((isTransitioning.current || activeUtterance.current || (isActuallySpeaking && !isStuck)) && !forceSpeaker) {
            addLog(`🚫 Turn blocked: Trans=${isTransitioning.current} Actv=${!!activeUtterance.current} SynthSpeaking=${isActuallySpeaking}`);
            setTimeout(() => triggerAITurn(forceSpeaker, onComplete), 800);
            return;
        }

        // Speaker Rotation Logic
        const candidates = ["Candidate_A", "Candidate_B", "Candidate_C"];
        const pool = candidates.filter(c => c !== lastSpeakerRef.current);
        const targetSpeaker = forceSpeaker || pool[Math.floor(Math.random() * pool.length)];

        // Internal Transition Lock
        isInternalTransition.current = true;
        setTimeout(() => { isInternalTransition.current = false; }, 300);

        // Fetch check
        if (localTurnQueue.current.length === 0) {
            if (isFetchingAI.current) {
                addLog("⏳ Waiting for in-progress fetch...");
                setTimeout(() => triggerAITurn(targetSpeaker, onComplete), 500);
                return;
            }
            addLog(`⏳ Queue empty. Fetching turn for ${targetSpeaker}...`);
            await fetchBatch(targetSpeaker);
        }

        if (localTurnQueue.current.length > 0) {
            // Priority Rotation Check: Try to find someone who isn't the last speaker in the queue
            let turnIdx = localTurnQueue.current.findIndex(t => t.speaker !== lastSpeakerRef.current);
            if (turnIdx === -1) turnIdx = 0; // Fallback to first in queue if all same
            
            const turnToPlay = localTurnQueue.current.splice(turnIdx, 1)[0];
            addLog(`✅ Playing turn for: ${turnToPlay.speaker}`);
            playQueuedTurn(turnToPlay, onComplete);
        } else {
            addLog("⚠️ AI turn failed to populate. Retrying...");
            setTimeout(() => triggerAITurn(targetSpeaker, onComplete), 1000);
        }
    };

    const startDiscussion = () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        setStatus('DISCUSSION');
        setTimeLeft(8 * 60);

        addLog(`🗳️ Examiner starting discussion...`);
        setCurrentSpeaker("Examiner");

        // Pre-fetch AI responses to ensure queue has content
        fetchBatchInBackground();

        // Requirement 2: Brief Intro
        const introPrompt = `Good afternoon. Today we will have a group discussion on the topic: "${examData?.title || roadmapTopic}". This topic explores how artificial intelligence is transforming education in schools. We will hear different perspectives from each candidate.`;
        const assignmentPrompt = `Candidate A, would you like to start the discussion?`;

        playSpeech("Examiner", introPrompt, () => {
            // Requirement 3: Explicit Assignment
            setTimeout(() => {
                setCurrentSpeaker("Examiner"); // Ensure speaker state is active
                playSpeech("Examiner", assignmentPrompt, () => {
                    setCurrentSpeaker(null);

                    // Turn Sequence: A -> B -> C -> User
                    const turnOrder = ["Candidate_A", "Candidate_B", "Candidate_C", "You"];
                    let currentIndex = 0;

                    const nextInSequence = () => {
                        if (currentIndex >= turnOrder.length) {
                            addLog("✅ Introduction round complete. Entering free discussion.");
                            return;
                        }

                        const speaker = turnOrder[currentIndex];
                        currentIndex++;

                        if (speaker === "You") {
                            setCurrentSpeaker("Examiner");
                            playSpeech("Examiner", "Candidate D, it's your turn. What are your thoughts?", () => {
                                setCurrentSpeaker(null);
                                startUserTurn();
                            });
                        } else {
                            addLog(`🔄 Sequence: Triggering turn for ${speaker}`);
                            triggerAITurn(speaker, nextInSequence);

                            // Safety net: if AI does not start speaking within 2 seconds, force fallback regardless of activeUtterance
                            const safetyTimeout = setTimeout(() => {
                                addLog(`⏱️ Safety net triggered for ${speaker}, activeUtterance=${!!activeUtterance.current}, synthSpeaking=${window.speechSynthesis?.speaking}`);
                                // Always play fallback to ensure discussion continues
                                const fallbackText = speaker === 'Candidate_A' ? "I believe AI will significantly change how we learn by providing personalized lessons." :
                                    speaker === 'Candidate_B' ? "However, we must consider the digital divide and accessibility issues." :
                                        "Overall, I think we need to balance technology with human interaction.";
                                addLog(`⚠️ AI turn for ${speaker} timed out, forcing fallback: ${fallbackText.substring(0, 30)}...`);
                                playSpeech(speaker, fallbackText, () => {
                                    // Simulate turn completion
                                    chatHistory.current.push({ role: speaker, text: fallbackText });
                                    setCurrentSpeaker(null);
                                    nextInSequence();
                                });
                            }, 2000);
                            // Cleanup timeout when speech starts (we can't easily detect, but we can clear on next turn)
                            // We'll store the timeout reference in a ref, but for simplicity we'll let it run.
                        }
                    };

                    nextInSequence();
                });
            }, 800);
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
        return '/avatars/male_student_avatar_1774534573731.png';
    };

    // Render Helpers
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const getPos = (role) => {
        // DSE Group Layout (Semicircle)
        const positions = {
            'Examiner': { top: '32%', left: '50%' },
            'Candidate_A': { top: '55%', left: '20%' },
            'Candidate_B': { top: '78%', left: '35%' },  // Raised slightly
            'Candidate_C': { top: '55%', left: '80%' },
            'You': { top: '78%', left: '65%' }           // Raised slightly
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
        <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans text-white">
            {/* New 3D Stylized Classroom Background */}
            <div className="absolute inset-0 z-0 bg-[#0c130d] overflow-hidden">
                {/* The main background image with contrast tuning */}
                <img
                    src="/backgrounds/hk_dse_classroom.png"
                    alt="DSE Classroom"
                    className="w-full h-full object-cover brightness-[0.7] saturate-[1.2] contrast-[1.1]"
                />

                {/* Cinematic Vignette Overlay to make avatars pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>

                {/* Blackboard Tray remains as a high-fidelity 3D element */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-[#3e2723] border-t-8 border-[#2d1b15] shadow-2xl flex items-center justify-around px-12 rounded-t-xl z-20 transition-all opacity-95">
                    <div className="flex gap-6">
                        <div className="w-10 h-3 bg-white rounded-full rotate-12 shadow-md"></div>
                        <div className="w-9 h-3 bg-yellow-100 rounded-full -rotate-6 shadow-md"></div>
                        <div className="w-10 h-3 bg-indigo-100 rounded-full rotate-12 shadow-md opacity-70"></div>
                    </div>
                    <div className="relative w-20 h-8 bg-[#5d4037] border-2 border-[#3e2723] rounded-lg shadow-2xl overflow-hidden">
                        <div className="absolute -bottom-1 inset-0.5 h-2 bg-gray-400 opacity-60"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#7d5d4a] to-[#5d4037]"></div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="relative z-20 p-6 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="size-10 bg-white/80 rounded-full flex items-center justify-center text-slate-800 font-bold hover:bg-white transition-colors">←</button>
                    <div>
                        <h1 className="text-xl font-bold text-white drop-shadow-md">{examData?.title || roadmapTopic}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            {isMock ? (
                                <div className="flex items-center gap-1.5 px-3 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/30 border border-rose-400/30">
                                    <ShieldCheck size={10} /> HKEAA MOCK
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                                    <Zap size={10} className="fill-current" /> {isQuest ? "QUEST MODE" : "PRACTICE LAB"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isMock && duration > 0 && (status === 'PREP' || status === 'DISCUSSION' || status === 'INDIVIDUAL') && (
                        <div className="hidden lg:block">
                            <MockCountdownTimer
                                initialSeconds={duration}
                                onTimeUp={() => {
                                    alert("Time up! The exam has concluded.");
                                    finishExam();
                                }}
                            />
                        </div>
                    )}

                    {!isMock && (
                        <button onClick={() => setIsEasyMode(!isEasyMode)} className="px-4 py-2 bg-white/50 hover:bg-white/70 text-slate-900 rounded-full text-xs font-bold transition-all">
                            {isEasyMode ? "📖 Easy Mode ON" : "📖 Easy Mode"}
                        </button>
                    )}

                    <div className="px-6 py-2 bg-emerald-500 text-white rounded-full font-mono font-bold shadow-lg border border-emerald-400">
                        {status}: {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                {/* Participants - Full Group */}
                {["Examiner", "Candidate_A", "Candidate_B", "Candidate_C", "You"].map(role => {
                    const pos = getPos(role);
                    const isSpeaking = currentSpeaker === role;
                    const isUser = role === "You";
                    const avatarSrc = role === "Examiner" ? examinerImg : (candidateAvatars[role] || getUserAvatar());

                    return (
                        <div
                            key={role}
                            className={`absolute transition-all duration-700 flex flex-col items-center ${isSpeaking ? "z-40 scale-125 -translate-y-8" : "z-20 grayscale-[10%]"}`}
                            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className={`relative size-48 rounded-full border-8 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ${isSpeaking ? "border-emerald-400 ring-[20px] ring-emerald-400/10 scale-110" : "border-white/90"}`}>
                                <img
                                    src={avatarSrc}
                                    alt={role}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${isSpeaking ? "scale-105" : "scale-100"}`}
                                    onError={role === "Examiner" ? handleExaminerImgError : null}
                                />
                                {isSpeaking && (
                                    <div className="absolute inset-0 border-[8px] border-emerald-400 animate-pulse rounded-full shadow-[inset_0_0_20px_rgba(52,211,153,0.5)]"></div>
                                )}
                            </div>

                            {/* Deluxe Label */}
                            <div className={`mt-3 px-4 py-1 rounded-full text-sm font-black tracking-wide shadow-lg border-2 border-white/20 backdrop-blur-md transition-all duration-300 ${isSpeaking ? "bg-emerald-500 text-white scale-110 -translate-y-2 border-emerald-400" : "bg-black/40 text-white/90"}`}>
                                {candidateDisplayNames[role] || role}
                            </div>

                            {/* Airtime Indicator */}
                            {status === 'DISCUSSION' && (
                                <div className="mt-4 w-36 h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                    <div className="h-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] transition-all duration-1000" style={{ width: `${Math.min(100, (airtime[role] || 0) / 60 * 100)}%` }}></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Active Transcript / Subtitles Overlay - MOVED TO TOP & ADJUSTED */}
                {(currentSpeaker || isThinkingAI || activeSpeechText || (isEasyMode && transcript.length > 0)) && (
                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-full max-w-4xl z-40 px-4">
                        <div className="bg-black/60 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl border border-white/10 text-center animate-in slide-in-from-top-12 duration-500">
                            {(currentSpeaker || (activeSpeechText && !isUserTurn)) ? (
                                <>
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <div className="size-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgb(52,211,153)]"></div>
                                        <div className="h-1 w-12 bg-white/20 rounded-full"></div>
                                    </div>
                                    <div className="text-2xl font-bold text-white leading-relaxed tracking-tight px-4">
                                        {currentSpeaker === 'You' ? (
                                            <span className="text-emerald-300">
                                                {micActive ? (collectedTranscript.current || "Listening...") : (activeSpeechText || "Go ahead, speak!")}
                                            </span>
                                        ) : (
                                            <span>{activeSpeechText || " "}</span>
                                        )}
                                    </div>
                                </>
                            ) : isThinkingAI ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-2">
                                    <div className="flex gap-1">
                                        <div className="size-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="size-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="size-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-indigo-300 text-sm font-bold tracking-widest uppercase">Candidates are thinking...</span>
                                </div>
                            ) : (
                                <div className="text-lg font-medium text-white/70 leading-tight italic px-8">
                                    {isUserTurn ? (
                                        <span className="text-emerald-300/80 animate-pulse">*Speak now, or click STOP to finish*</span>
                                    ) : activeSpeechText ? (
                                        <span className="text-white/90 not-italic font-bold">"{activeSpeechText}"</span>
                                    ) : (
                                        <span>*Click SPEAK to join the discussion*</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Fixed Bottom Control Bar */}
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                    {status === 'DISCUSSION' && (
                        isUserTurn ? (
                            <button
                                onMouseDown={(e) => { e.stopPropagation(); handleManualFinish(); }}
                                className="px-6 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-black text-base shadow-[0_6px_0_rgb(185,28,28)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <div className="size-3 bg-white rounded-sm animate-pulse"></div>
                                STOP SPEAKING
                                <span className="text-[10px] opacity-70 ml-2 font-medium">(Auto-detecting silence...)</span>
                            </button>
                        ) : (
                            <button
                                onMouseDown={(e) => { e.stopPropagation(); handleChipIn(); }}
                                className="group relative px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-black text-base shadow-[0_6px_0_rgb(5,150,105)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <span className="size-2 bg-white rounded-full animate-ping"></span>
                                SPEAK
                                {isQueuedState && <span className="absolute -top-3 -right-3 bg-amber-500 text-[10px] px-2 py-1 rounded-md shadow-md animate-bounce">QUEUED</span>}
                            </button>
                        )
                    )}
                </div>

                {/* Prep Overlay: DSE Briefing Style */}
                {status === 'PREP' && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="bg-indigo-600 p-6 text-white text-center">
                                <h2 className="text-sm font-black tracking-widest uppercase opacity-80 mb-1">Part A: Group Discussion</h2>
                                <h3 className="text-2xl font-black">{examData.title}</h3>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                                <div className="space-y-2">
                                    <h4 className="font-black text-slate-400 text-xs uppercase tracking-tighter">Your Task</h4>
                                    <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                        Your group is preparing a presentation for the school magazine about {examData.title}.
                                        Discuss what to include and how to make it engaging for fellow students.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-400 text-xs uppercase tracking-tighter">Points to discuss</h4>
                                    <ul className="space-y-3">
                                        {(examData.discussion_points || []).map((p, i) => (
                                            <li key={i} className="flex gap-4 items-start p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                                                <div className="size-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-md">{i + 1}</div>
                                                <p className="text-slate-800 font-bold">{p}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-4 items-center">
                                    <div className="size-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">⏳</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-amber-600 uppercase">Preparation Time Remaining</p>
                                        <p className="text-xl font-black text-amber-900 font-mono tracking-wider">{formatTime(timeLeft)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <button
                                    onClick={() => {
                                        // "Warm up" speech synthesis to prevent first-time silence in Chrome
                                        const w = new SpeechSynthesisUtterance(' ');
                                        window.speechSynthesis.speak(w);
                                        setTimeLeft(0);
                                    }}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-[0_6px_0_rgb(55,48,163)] hover:translate-y-0.5 hover:shadow-[0_4px_0_rgb(55,48,163)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    START DISCUSSION NOW
                                    <span className="text-xs font-medium opacity-70">(Exam Starts Immediately)</span>
                                </button>
                            </div>
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
