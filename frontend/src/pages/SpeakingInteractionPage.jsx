import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AGENTS, useAvatar } from '../context/AvatarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, ShieldCheck, Target, AlertTriangle, MessageSquare, RotateCcw, ArrowRight, CheckCircle2, Award, Clock } from 'lucide-react';
import MockCountdownTimer from '../components/utils/MockCountdownTimer';
import { useAzureSpeechRecognition } from '../hooks/useAzureSpeechRecognition';

const SpeakingInteractionPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Quest Mode parsing
    // const questLevel = searchParams.get('level'); // Unused
    const questTaskId = searchParams.get('taskId');
    const questTopic = searchParams.get('topic');
    const [displayTopic, setDisplayTopic] = useState("");
    const [isTopicLoading, setIsTopicLoading] = useState(true);

    useEffect(() => {
        const fetchTheme = async () => {
            // Priority: location.state.topic > URL query param > default
            const rawTopic = location.state?.topic || questTopic || 'speaking_interaction_general';
            
            if (rawTopic === 'speaking_weekly' || location.state?.isWeeklyQuest) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/lab/weekly/speaking`);
                    if (res.ok) {
                        const data = await res.json();
                        setDisplayTopic(data.universalTopicLong || data.title || "Weekly Special Discussion");
                        setIsTopicLoading(false);
                        return;
                    }
                } catch (e) { 
                    console.error("Failed to fetch weekly theme", e); 
                }
            }
            
            if (rawTopic === 'speaking_interaction_general') {
                setDisplayTopic("Social Trends and Youth Culture");
            } else {
                // URL decode first, then check if it's already a readable title
                const decoded = decodeURIComponent(rawTopic);
                
                // If the decoded topic contains spaces and looks like a real title, use it directly
                // Otherwise, apply the old formatting for legacy IDs like "disc_1"
                if (decoded.includes(' ') && decoded.length > 3) {
                    setDisplayTopic(decoded);
                } else {
                    const formatted = decoded.replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                    setDisplayTopic(formatted);
                }
            }
            setIsTopicLoading(false);
        };
        fetchTheme();
    }, [location.state?.topic, questTopic]);

    // Derived value for legacy compatibility if needed
    const roadmapTopic = displayTopic;

    const taskId = location.state?.taskId || questTaskId;
    const isQuest = !!taskId;

    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeAgent, englishTutor, equipment } = useAvatar();

    // Examiner Identity: Use equipped/active agent
    const agentName = englishTutor?.name || activeAgent?.name || "Miss Janie";
    const examinerAvatar = englishTutor?.avatar || activeAgent?.avatar || AGENTS.english.avatar;

    // Safety check for broken images
    const [examinerImg, setExaminerImg] = useState(examinerAvatar);
    useEffect(() => {
        setExaminerImg(examinerAvatar);
    }, [examinerAvatar]);
    const handleExaminerImgError = () => {
        setExaminerImg('https://api.dicebear.com/7.x/avataaars/svg?seed=Examiner');
    };

    const [examData, setExamData] = useState(null);
    const [status, setStatus] = useState(searchParams.get('phase') || 'PREP'); // PREP, DISCUSSION, INDIVIDUAL, FINISHED

    // Sync status with URL
    useEffect(() => {
        const urlPhase = searchParams.get('phase');
        if (urlPhase && urlPhase !== status) {
            setStatus(urlPhase);
        }
    }, [searchParams]);

    // Helper to update status and URL
    const updateStatus = (newStatus) => {
        setStatus(newStatus);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('phase', newStatus);
        setSearchParams(newParams);
    };
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

    // DSE Level Mapping
    const getDSELevel = (s) => {
        if (s >= 26) return "5**";
        if (s >= 23) return "5*";
        if (s >= 21) return "5";
        if (s >= 18) return "4";
        if (s >= 15) return "3";
        if (s >= 12) return "2";
        return "1";
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [activeSpeechText, setActiveSpeechText] = useState("");
    const [activeSubtitle, setActiveSubtitle] = useState(""); // [NEW] Dedicated AI subtitle state
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
        Candidate_A: "Candidate A: Annie",
        Candidate_B: "Candidate B: Ben",
        Candidate_C: "Candidate C: Charlie",
        You: "Candidate D: You"
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
    const lastPartialTranscript = useRef(""); // Track latest partial for manual stop fallback
    const localTurnQueue = useRef([]);
    const lastAirtimeUpdate = useRef(Date.now());
    const isInternalTransition = useRef(false); // Locking ref to prevent race conditions
    const lastSpeakerRef = useRef(null);
    const speakerActivityRef = useRef(Date.now()); // Tracking timestamp of speaker state changes
    const statusRef = useRef(status); // Phase 42: Sync status tracking
    const activeTurnLoopId = useRef(0); // Phase 43: Concurrency protection
    const interactionIndexRef = useRef(0); // [NEW] Track sequence (A, B, C, You) reliably
    const isTurnInProgressRef = useRef(false); // [NEW] Singleton turn guard
    const isFetchingRef = useRef({}); // [NEW] Track per-speaker fetching status
    const isProcessingUserSpeech = useRef(false); // Guard against double-processing user speech
    
    // Phase 49: Multimodal Assessment Logic
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const [prosodyLogs, setProsodyLogs] = useState([]);

    const isMock = location.state?.isMock || false;
    const duration = location.state?.duration || 0;
    const [isEasyMode, setIsEasyMode] = useState(!isMock && !location.state?.mode?.includes('mock')); // Auto-OFF for Mocks

    // Azure Speech Recognition Hook — MUST be declared before any useEffect that references it
    const {
        isListening: azureIsListening,
        isConnected: azureIsConnected,
        transcript: azureTranscript,
        interimTranscript: azureInterimTranscript,
        startListening: startAzureListening,
        stopListening: stopAzureListening,
        resetTranscript: resetAzureTranscript,
        prepare: prepareAzureSTT
    } = useAzureSpeechRecognition({
        silenceThresholdMs: 1200,
        onPartial: (text) => {
            setActiveSpeechText(text);
            lastPartialTranscript.current = text; // Track for manual stop fallback
            
            // Auto silence detection: if no new partial for 8s, treat as finished
            // This gives users time to pause between thoughts without interrupting
            if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
            userSilenceTimer.current = setTimeout(() => {
                if (isUserTurnRef.current && lastPartialTranscript.current.trim()) {
                    addLog("🔇 Silence detected — auto-finishing user turn");
                    stopAzureListening();
                    handleUserSpeech(lastPartialTranscript.current.trim());
                    lastPartialTranscript.current = "";
                }
            }, 8000);
        },
        onFinal: (text) => {
            addLog(`📝 Final: "${text.substring(0, 30)}..."`);
            if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
            userSilenceTimer.current = null;
            lastPartialTranscript.current = ""; // Clear partial since we have final
            handleUserSpeech(text);
        },
        onError: (err) => {
            console.error('[SpeakingInteraction] Azure STT error:', err);
            addLog(`⚠️ STT Error: ${err.message}`);
        }
    });

    const addLog = (msg) => {
        console.log(msg);
        setDebugLogs(prev => [msg, ...prev].slice(0, 5));
    };

    // Initialize Quest Data
    useEffect(() => {
        if (isTopicLoading || !displayTopic) return;
        console.log("[SpeakingInteraction] Initializing with topic:", displayTopic);
        
        const drill = location.state?.drill;
        const stimulus = drill?.stimulus || `What are your thoughts on ${roadmapTopic}?`;
        const scenario = drill?.scenario || `A group discussion about ${roadmapTopic}.`;
        
        const questData = {
            id: `quest_${taskId || Date.now()}`,
            title: roadmapTopic,
            topic_description: `You are participating in a group discussion about ${roadmapTopic}. ${scenario}`,
            discussion_points: [
                `The key aspects of ${roadmapTopic}`,
                "Different perspectives and viewpoints",
                "Potential benefits and concerns",
                "Personal experiences and examples",
                "Future implications and recommendations"
            ],
            individual_response_questions: [
                stimulus,
                `How would you apply what we discussed about ${roadmapTopic} to your own life?`,
                "What do you think is the most important point raised in the discussion?"
            ]
        };
        setExamData(questData);
        updateStatus('PREP');

        // Dynamic Timer based on Level (HKEAA Aligned)
        const levelCode = searchParams.get('level') || location.state?.level || '3';
        let discussionTime = 300; // Default 5 mins (DSE Standard)
        
        if (levelCode === 'Easy' || levelCode === '3' || parseInt(levelCode) <= 3) {
            discussionTime = 180; // 3 mins
        } else if (levelCode === 'Medium' || levelCode === '4') {
            discussionTime = 240; // 4 mins
        } else if (levelCode === 'DSE Standard' || levelCode === '5') {
            discussionTime = 300; // 5 mins
        } else if (levelCode === 'Elite' || levelCode === '6' || levelCode === '7') {
            discussionTime = 360; // 6 mins
        }

        setTimeLeft(isQuest ? discussionTime : 600); 

        // Reset airtime
        setAirtime({ 'You': 0, 'Candidate_A': 0, 'Candidate_B': 0, 'Candidate_C': 0 });

        // Phase 46: Instant Annie - Pre-fetch immediately on page load
        setTimeout(() => fetchBatch("Candidate_A"), 100);
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
            if (window.speechSynthesis) {
                console.log("[SpeakingInteraction] Page Leave: Cancelling all speech...");
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Phase 42: Sync statusRef with status state
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Pre-connect Azure STT during PREP phase to eliminate audio cropping when discussion starts
    useEffect(() => {
        if (status === 'PREP' || status === 'DISCUSSION') {
            prepareAzureSTT();
        }
    }, [status, prepareAzureSTT]);

    // 4. Watchdog
    useEffect(() => {
        if (status !== 'DISCUSSION') return;
    const watchdog = setInterval(() => {
        const now = Date.now();
        const lastActivity = window.lastSpeakingActivity || now;
        const silenceDuration = now - lastActivity;

        // Dead Air Detection
        if (!currentSpeaker && !isUserTurn && !micActive && !isQueued.current && !activeUtterance.current) {
            const hangThreshold = 10000; // 10s for better pace
            if (silenceDuration > hangThreshold && statusRef.current === 'DISCUSSION') {
                addLog(`🚨 System Hang Guard: FORCING lock reset...`);
                // Force Reset all locks
                isTurnInProgressRef.current = false;
                isTransitioning.current = false;
                isFetchingAI.current = false;
                window.speechSynthesis?.cancel();

                const pick = ["Candidate_A", "Candidate_B", "Candidate_C"][Math.floor(Math.random() * 3)];
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
                const stuckThreshold = activeUtterance.current ? 45000 : 15000; // Increased from 8s to 15s to be more patient
                if (silenceDuration > stuckThreshold && !isFetchingAI.current) {
                    addLog(`🚨 Speaker Stuck Guard (${stuckThreshold/1000}s): Force-ending ${currentSpeaker}`);
                    setCurrentSpeaker(null);
                    activeUtterance.current = null;
                    setActiveSubtitle(""); // Clear subtitle only on force reset
                    isTransitioning.current = false;
                    isTurnInProgressRef.current = false; // Phase 48: Reset lock to recover
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                    window.lastSpeakingActivity = Date.now();
                }
                }
            }
            // Phase 31 & 48: Stuck Queue or Empty Discussion Guard
            // If no activity for 8s and it's discussion time, force a new trigger
            else if (!isUserTurn && !micActive && !isFetchingAI.current && !activeUtterance.current && !isInternalTransition.current) {
                const idleThreshold = localTurnQueue.current.length > 0 ? 3000 : 8000;
                if (silenceDuration > idleThreshold && status === 'DISCUSSION') {
                    addLog(`🌀 Loop Recovery: Jumpstarting discussion after ${idleThreshold}ms idle...`);
                    isTurnInProgressRef.current = false; // Force clear
                    isTransitioning.current = false;
                    triggerAITurn(null, null, activeTurnLoopId.current);
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
            else if (status === 'DISCUSSION') endDiscussion();
            else if (status === 'INDIVIDUAL') concludeSession();
        }
    }, [timeLeft, status]);

    // Sync mic active state with Azure listening state
    useEffect(() => {
        setMicActive(azureIsListening);
    }, [azureIsListening]);

    // Show interim results in UI
    useEffect(() => {
        if (azureInterimTranscript) {
            setActiveSpeechText(azureInterimTranscript);
        }
    }, [azureInterimTranscript]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAzureListening();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper: Get Premium Browser Voice
    const getVoice = (role) => {
        if (!voices || voices.length === 0) return null;

        // Sort voices by quality: Natural > Neural > Google > others
        const sortedVoices = [...voices].sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const score = (name) => {
                let s = 0;
                if (name.includes('natural')) s += 100;
                if (name.includes('neural')) s += 80;
                if (name.includes('premium')) s += 60;
                if (name.includes('google')) s += 40;
                if (name.includes('microsoft')) s += 20;
                return s;
            };
            return score(bName) - score(aName);
        });

        // Filter to English voices only
        const englishVoices = sortedVoices.filter(v =>
            v.lang.toLowerCase().startsWith('en')
        );
        const pool = englishVoices.length > 0 ? englishVoices : sortedVoices;

        // Determine gender of a voice using multiple signals
        const getVoiceGender = (v) => {
            if (v.gender) return v.gender.toLowerCase();
            const name = v.name.toLowerCase();
            // Microsoft voices: "Microsoft David", "Microsoft Zira", etc.
            const maleNames = ['david', 'guy', 'alex', 'daniel', 'james', 'oliver', 'harry', 'mark', 'peter', 'george', 'john', 'paul', 'richard', 'tom', 'sam', 'ben', 'matt', 'eric', 'frank'];
            const femaleNames = ['samantha', 'victoria', 'moira', 'zira', 'susan', 'mary', 'aria', 'lisa', 'serena', 'emma', 'anna', 'jenny', 'sonia', 'libby', 'mia', 'hazel', 'helen', 'catherine'];
            if (maleNames.some(n => name.includes(n))) return 'male';
            if (femaleNames.some(n => name.includes(n))) return 'female';
            // Default: if name contains "male" or "female"
            if (name.includes('male') && !name.includes('female')) return 'male';
            if (name.includes('female')) return 'female';
            return null;
        };

        const findVoice = (preferredNames, gender) => {
            // First: try to match by preferred name + gender
            for (const name of preferredNames) {
                const match = pool.find(v => {
                    const nameMatch = v.name.toLowerCase().includes(name.toLowerCase());
                    const vGender = getVoiceGender(v);
                    const genderMatch = !gender || !vGender || vGender === gender.toLowerCase();
                    return nameMatch && genderMatch;
                });
                if (match) return match;
            }
            // Second: any voice with matching gender
            if (gender) {
                const genderMatch = pool.find(v => {
                    const vGender = getVoiceGender(v);
                    return vGender === gender.toLowerCase();
                });
                if (genderMatch) return genderMatch;
            }
            // Fallback: first available
            return pool[0];
        };

        if (role === 'Examiner') {
            // Miss Janie: Warm, authoritative female
            return findVoice(['Jenny', 'Natasha', 'Aria', 'Sonia', 'Libby', 'Emma'], 'Female');
        }
        if (role === 'Candidate_A') { // Annie: Spirited British female
            return findVoice(['Sonia', 'Libby', 'Hazel', 'Olivia', 'Mia', 'Emma'], 'Female');
        }
        if (role === 'Candidate_B') { // Ben: Neutral male
            return findVoice(['Ryan', 'Guy', 'Davis', 'Tony', 'Eric', 'Daniel'], 'Male');
        }
        if (role === 'Candidate_C') { // Charlie: Hesitant male
            return findVoice(['Brandon', 'Christopher', 'Eric', 'Davis', 'Tony'], 'Male');
        }

        return pool[0];
    };


    const cleanText = (text) => {
        if (!text) return "";
        return text
            .replace(/^(Candidate[ _][A-D]|Examiner):/i, "") // Clear prefixes
            .replace(/\*.*?\*/g, "") // Clear markdown italics
            .replace(/([A-Z][a-z]+)_([A-D])/g, "$1 $2") // Phase 48: Fix "Candidate_D" -> "Candidate D" for TTS
            .trim();
    };

    const playDirectAudio = (base64, text, role, onEnd) => {
        // Phase 47: Fast Path - Redirect to Browser TTS instantly to eliminate server rendering lag
        addLog(`⚡ Fast-path triggered for ${role}`);
        playSpeech(role, text, onEnd);
    };

    const userDisplayName = user?.displayName || user?.name || "Candidate D";

    const cleanAIText = (text) => {
        if (!text) return "";
        return text
            .replace(/{USER_LABEL}/g, userDisplayName)
            .replace(/{Student}/g, userDisplayName)
            .replace(/Candidate_D/g, userDisplayName)
            .replace(/{{[^{}]+}}/g, ""); // Remove any other curly-brace placeholders
    };

    // Fallback browser TTS when Azure is unavailable
    const playBrowserTTS = (role, text, onEnd) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let idx = 0;

        const voiceProfiles = {
            'Examiner': { pitch: 1.0, rate: 0.95 },
            'Candidate_A': { pitch: 1.08, rate: 1.02 },
            'Candidate_B': { pitch: 0.95, rate: 0.98 },
            'Candidate_C': { pitch: 0.88, rate: 0.92 }
        };
        const profile = voiceProfiles[role] || voiceProfiles['Examiner'];

        const speakNext = () => {
            if (idx >= sentences.length) {
                setTimeout(() => {
                    isTransitioning.current = false;
                    activeUtterance.current = null;
                    setActiveSubtitle("");
                    if (onEnd) onEnd();
                }, 100);
                return;
            }
            const s = sentences[idx++].trim();
            if (!s) { speakNext(); return; }

            const u = new SpeechSynthesisUtterance(s);
            activeUtterance.current = u;
            const voice = getVoice(role);
            if (voice) u.voice = voice;
            u.pitch = profile.pitch;
            u.rate = profile.rate;
            u.onend = speakNext;
            u.onerror = speakNext;
            window.speechSynthesis.speak(u);
        };

        if (window.speechSynthesis) window.speechSynthesis.cancel();
        isTransitioning.current = true;
        speakNext();
    };

    const playSpeech = async (role, text, onEnd) => {
        const cleaned = cleanText(cleanAIText(text));
        if (!cleaned) {
            if (onEnd) onEnd();
            return;
        }

        // Update transcript
        setTranscript(prev => [...prev.slice(-10), { role, text: cleaned }]);
        setActiveSubtitle(cleaned);

        // Try Azure Neural TTS first
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: cleaned, role, uid: user?.uid }),
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
            const data = await res.json();

            if (data.audio) {
                addLog(`🔊 Azure TTS: Playing ${role}`);
                const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                activeUtterance.current = { abort: () => audio.pause() };
                
                audio.onended = () => {
                    activeUtterance.current = null;
                    isTransitioning.current = false;
                    setActiveSubtitle("");
                    if (onEnd) onEnd();
                };
                audio.onerror = () => {
                    addLog(`⚠️ Azure TTS playback error, falling back to browser`);
                    playBrowserTTS(role, cleaned, onEnd);
                };

                isTransitioning.current = true;
                await audio.play();
                return;
            }
        } catch (e) {
            addLog(`⚠️ Azure TTS failed: ${e.message}. Using browser fallback.`);
        }

        // Fallback to browser TTS
        playBrowserTTS(role, cleaned, onEnd);
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

    const handleUserSpeech = async (text) => {
        // Guard against double-processing (silence timer + onFinal race)
        if (isProcessingUserSpeech.current) {
            addLog("🛡️ User speech already being processed, ignoring duplicate");
            return;
        }
        isProcessingUserSpeech.current = true;
        
        try {
            if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
            userSilenceTimer.current = null;

            // Phase 43: Hard reset of all transition flags to prevent "Stunned" AI
            addLog("🛑 User turn ended. Resetting speech flags...");
            setMicActive(false);
            setIsUserTurn(false);
            isUserTurnRef.current = false;
            isTransitioning.current = false; 
            activeUtterance.current = null;
            isTurnInProgressRef.current = false; // Phase 48: Essential reset to allow AI to continue
            // NOTE: Do NOT clear the queue here - pre-fetched responses are still valid
            // The queue is only cleared when context truly changes (substantial user input)
            
            const cleaned = (text || "").trim();
            if (!cleaned) {
                addLog("⚠️ Empty transcript, nothing to process");
                // Even with empty transcript, if there are queued turns, play them
                if (localTurnQueue.current.length > 0 && !isUserTurnRef.current) {
                    addLog("▶️ Empty transcript but queued turns exist — starting AI playback...");
                    triggerAITurn();
                }
                return;
            }
            
            setActiveSpeechText(cleaned);
            addLog(`🎙️ User said: "${cleaned.substring(0, 20)}..."`);
            setTranscript(prev => [...prev, { role: "You", text: cleaned }]);
            // Use consistent format for chatHistory: speaker + text for backend compatibility
            chatHistory.current.push({ speaker: "You", role: "user", text: cleaned });
            // Trim history to prevent memory leaks (keep last 20 turns)
            if (chatHistory.current.length > 20) {
                chatHistory.current = chatHistory.current.slice(-20);
            }
            
            // Mark user as the last speaker so AI candidates don't repeat
            lastSpeakerRef.current = "You";

            // ALWAYS clear stale queue when user speaks - their input changes the context
            localTurnQueue.current = [];
            addLog("🧠 User spoke - clearing stale queue for fresh context...");

            // Stop Recording and prepare multimodal fetch
            const hadActiveRecorder = mediaRecorder.current && mediaRecorder.current.state !== 'inactive';
            if (hadActiveRecorder) {
                const recorder = mediaRecorder.current;
                recorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                    addLog(`💾 Audio captured: ${audioBlob.size} bytes. Triggering multimodal fetch...`);
                    await fetchBatch("Candidate_A", audioBlob); // Target first AI with user audio
                    // Always trigger AI turn after fetch completes
                    if (!isUserTurnRef.current) {
                        addLog("▶️ Starting AI turn playback after multimodal fetch...");
                        triggerAITurn();
                    }
                    // Clear recorder ref after onstop fires
                    mediaRecorder.current = null;
                };
                recorder.stop();
            } else {
                // For text-only input, use BATCH generation for natural AI→AI flow
                // Batch generates ALL candidates' responses at once, so they reference each other
                // Show thinking indicator while fetching
                setActiveSpeechText("Candidates are thinking...");
                
                if (activeTurnLoopId.current > 0) {
                    addLog("🧠 Using batch generation for natural AI conversation flow...");
                    await fetchBatchTurns();
                } else {
                    // During intro, transition to free discussion after user speaks
                    addLog("🔄 Transitioning from intro to free discussion...");
                    activeTurnLoopId.current++;
                    await fetchBatchTurns();
                }
                // Always trigger AI turn after user speaks — triggerAITurn will fetch if queue is empty
                if (!isUserTurnRef.current) {
                    addLog("▶️ Starting AI turn playback...");
                    triggerAITurn();
                }
            }

            if (status === 'INDIVIDUAL') {
                const concludes = [
                    "Thank you for those insights. I see your point regarding the importance of collaboration.",
                    "Thank you. You've raised some interesting arguments in this discussion.",
                    "I see, that's a very valid thought about this topic."
                ];
                const c = concludes[Math.floor(Math.random() * concludes.length)];
                playSpeech("Examiner", c, () => {
                    concludeSession(); // Move to formal wrap-up
                });
                return;
            }

            // For intro phase (activeTurnLoopId === 0), triggerAITurn is called by the intro sequence
            // For free discussion (activeTurnLoopId > 0), triggerAITurn is called after batch fetch completes
            // No need to call triggerAITurn here - it's handled above
        } finally {
            // Final cleanup for user turn - ALWAYS reset the guard
            setCurrentSpeaker(null);
            isProcessingUserSpeech.current = false;
        }
    };

    const startUserTurn = () => {
        // Clear any pending silence timer from previous turn
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        userSilenceTimer.current = null;
        
        // Ensure examiner's intro is in history if this is the start
        if (chatHistory.current.length === 0 && examData) {
            const intro = `Good afternoon. We are here to discuss ${examData.title || roadmapTopic}. What are your thoughts on this?`;
            chatHistory.current.push({ speaker: "Examiner", role: "assistant", text: intro });
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

        // Note: Do NOT pre-fetch while user is speaking - we don't know what they'll say yet.
        // Pre-fetching with stale context creates repetitive responses.
        // Fetching happens AFTER user finishes speaking, in handleUserSpeech().

        // Start Azure STT listening
        resetAzureTranscript();
        collectedTranscript.current = "";
        lastPartialTranscript.current = "";
        startAzureListening();
        addLog("🎙️ Azure STT listening started...");

        // Start Multimodal Recording (for prosody analysis)
        // Stop any previous recorder to avoid leaking media streams
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            try { mediaRecorder.current.stop(); } catch (e) { /* ignore */ }
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            audioChunks.current = [];
            const mr = new MediaRecorder(stream);
            mr.ondataavailable = (e) => audioChunks.current.push(e.data);
            mr.onstop = () => {
                // Stop all tracks when recorder stops to release the mic
                stream.getTracks().forEach(t => t.stop());
            };
            mr.start();
            mediaRecorder.current = mr;
            addLog("🎙️ Multimodal recording started...");
        }).catch(e => console.warn("Mic access failed for recording", e));
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
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        userSilenceTimer.current = null;
        stopAzureListening();
        // Force process whatever we have — fallback chain: final > partial > collected
        const finalText = azureTranscript || lastPartialTranscript.current || collectedTranscript.current;
        if (finalText.trim()) {
            handleUserSpeech(finalText.trim());
            lastPartialTranscript.current = "";
        } else {
            addLog("⚠️ No transcript available on manual stop — resetting turn");
            // Reset user turn state so they can try again
            setMicActive(false);
            setIsUserTurn(false);
            isUserTurnRef.current = false;
            setCurrentSpeaker(null);
            isProcessingUserSpeech.current = false;
        }
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

        // Phase 48: Context Sync - Push to history IMMEDIATELY so background fetches (buffering) know what happened
        const cleanTurnEntry = { speaker: turn.speaker, role: "assistant", text: turn.content, audio: null };
        chatHistory.current.push(cleanTurnEntry);
        // Trim history to prevent memory leaks (keep last 20 turns)
        if (chatHistory.current.length > 20) {
            chatHistory.current = chatHistory.current.slice(-20);
        }
        setTranscript(prev => [...prev.slice(-15), { role: turn.speaker, text: turn.content }]);

        // Use Direct Audio if provided, otherwise fallback to standard TTS
        const playbackMethod = turn.audio ? playDirectAudio : playSpeech;
        addLog(`⚡ Starting playback using ${turn.audio ? 'Direct Multimodal' : 'Fallback TTS'}`);

        // Note: Removed early pre-fetching during speech. 
        // Pre-fetching while speaking creates race conditions and stale responses.
        // The finalize() callback handles pre-fetching AFTER the turn completes.

        // playDirectAudio takes (base64, text, role, onEnd)
        const finalize = () => {
            setCurrentSpeaker(null);
            setActiveSubtitle(""); // Clear subtitle explicitly when the FULL turn is done
            
            if (isQueued.current) {
                isQueued.current = false;
                setIsQueuedState(false);
                startUserTurn();
                if (onComplete) onComplete();
                return;
            }

            // Phase 46: Advanced Pre-fetching - Trigger NEXT speaker immediately
            // Only pre-fetch if queue is running low (batch mode generates 3 turns at once)
            if (localTurnQueue.current.length < 2 && activeTurnLoopId.current > 0) {
                addLog(`🧠 Queue running low (${localTurnQueue.current.length} turns). Fetching next batch...`);
                fetchBatchTurns();
            }

            // Phase 48: Integrated Completion Logic
            // Ensure flag is ALWAYS reset, then decide whether to trigger onComplete or auto-advance
            isTurnInProgressRef.current = false;

            if (onComplete) {
                onComplete();
            } else {
                // In free-flow discussion (Super-Fast Mode), trigger the next turn automatically
                setTimeout(() => {
                    if (!isUserTurnRef.current && statusRef.current === 'DISCUSSION') {
                        addLog(`🔄 Advancing free-flow interaction (Loop: ${activeTurnLoopId.current})`);
                        triggerAITurn(null, null, activeTurnLoopId.current);
                    }
                }, 100);
            }
        };

        const play = () => {
            if (turn.audio) {
                playDirectAudio(turn.audio, turn.content, turn.speaker, finalize);
            } else {
                playSpeech(turn.speaker, turn.content, finalize);
            }
        };

        play();
    };

    const fetchBatch = async (hintSpeaker = "Candidate_A", audioBlob = null) => {
        // Phase 46: Independent Fetching - Only block if THIS specific speaker is already fetching
        if (isFetchingRef.current[hintSpeaker]) {
            addLog(`ℹ️ Fetch for ${hintSpeaker} already active.`);
            return;
        }

        isFetchingRef.current[hintSpeaker] = true;
        setIsThinkingAI(true);
        try {
            const userLevel = location.state?.userLevel || "3";
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            const formData = new FormData();
            formData.append('history', JSON.stringify(chatHistory.current.slice(-10)));
            formData.append('current_speaker', hintSpeaker);
            formData.append('topic', examData?.title || roadmapTopic);
            formData.append('level', userLevel);
            formData.append('uid', user?.uid);
            formData.append('user_name', userDisplayName);
            formData.append('audioOutput', 'false');
            
            // Multimodal: Append audio if available
            if (audioBlob instanceof Blob) {
                formData.append('audio', audioBlob, 'turn.webm');
                addLog(`🎤 Multimodal pass: Sending ${audioBlob.size} bytes for prosody analysis...`);
            }

            const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                method: 'POST',
                body: formData, // Using FormData instead of JSON for audio support
                signal: AbortSignal.timeout(15000)
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error ${res.status}: ${errorText}`);
            }
            
            const data = await res.json();
            
            if (data.error) {
                throw new Error(`Backend error: ${data.error}`);
            }
            
            if (data.content) {
                localTurnQueue.current.push({
                    speaker: data.speaker || hintSpeaker,
                    content: data.content,
                    audio: data.audio
                });
                
                // Track Prosody Metrics
                if (data.prosody_metrics) {
                    setProsodyLogs(prev => [...prev.slice(-9), data.prosody_metrics]);
                    addLog(`📈 Prosody Analysis: ${data.prosody_metrics.vibe}`);
                }
                
                addLog(`✅ Queued turn for ${data.speaker}: "${data.content.substring(0, 40)}..."`);
            } else {
                throw new Error('AI returned empty content');
            }

        } catch (e) {
            addLog(`⚠️ Fetch for ${hintSpeaker} Failed: ${e.message}`);
            // Generic fallback responses that work for ANY topic - no hardcoded technology/education references
            const topicName = examData?.title || roadmapTopic || "this topic";
            const turnCount = chatHistory.current.length;
            
            const fallbackPools = {
                'Candidate_A': [
                    `I believe there are both positive and negative aspects to consider regarding ${topicName}. We should look at this from multiple angles.`,
                    `From my perspective, ${topicName} affects our daily lives more than people realize. Let me share why I think so.`,
                    `Actually, I have a different take on ${topicName}. While many people support it, I think we need to be more critical.`,
                    `One thing I'd add is that ${topicName} connects to broader social issues we shouldn't ignore.`,
                    `I see ${topicName} as something that requires careful thought — the benefits are clear, but so are the potential problems.`
                ],
                'Candidate_B': [
                    `That's a valid point. However, we must also consider how ${topicName} affects different groups in our society.`,
                    `Building on that, I think we should look at the practical challenges people face with ${topicName}.`,
                    `I agree to some extent, but let's not forget the economic implications of ${topicName}.`,
                    `From a practical standpoint, ${topicName} raises questions about responsibility and regulation.`,
                    `That's interesting, but have we considered the long-term consequences if this trend continues?`
                ],
                'Candidate_C': [
                    `I agree. I think ${topicName} is something we need to discuss more openly as a community.`,
                    `Um, I think ${topicName} has some merit, but maybe we should start with small changes first?`,
                    `Sorry to interrupt, but isn't there a concern about how ${topicName} might change our habits?`,
                    `I see what you mean. Perhaps we could find a middle ground that works for everyone.`,
                    `That's a good observation. I wonder how the older generation would feel about ${topicName}.`
                ]
            };
            
            const pool = fallbackPools[hintSpeaker] || fallbackPools['Candidate_A'];
            // Select based on turn count to cycle through variations
            const selectedFallback = pool[turnCount % pool.length];
            
            localTurnQueue.current.push({
                speaker: hintSpeaker,
                content: selectedFallback
            });
        }
        finally {
            isFetchingRef.current[hintSpeaker] = false;
            // Only stop "thinking" if NO one is fetching
            setIsThinkingAI(Object.values(isFetchingRef.current).some(v => v));
        }
    };


    // NEW: Fetch multiple AI turns at once for natural conversation flow
    const fetchBatchTurns = async () => {
        if (isFetchingRef.current['batch']) {
            addLog(`ℹ️ Batch fetch already active.`);
            return;
        }
        
        isFetchingRef.current['batch'] = true;
        setIsThinkingAI(true);
        
        try {
            const userLevel = location.state?.userLevel || "3";
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            const res = await fetch(`${API_URL}/api/speaking/interaction/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory.current.slice(-10),
                    topic: examData?.title || roadmapTopic,
                    level: userLevel,
                    uid: user?.uid,
                    user_name: userDisplayName
                }),
                signal: AbortSignal.timeout(15000)
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error ${res.status}: ${errorText}`);
            }
            
            const data = await res.json();
            
            if (data.error) {
                throw new Error(`Backend error: ${data.error}`);
            }
            
            if (data.turns && Array.isArray(data.turns) && data.turns.length > 0) {
                // Add all generated turns to the queue
                data.turns.forEach(turn => {
                    if (turn.content && turn.speaker) {
                        localTurnQueue.current.push({
                            speaker: turn.speaker,
                            content: turn.content,
                            audio: null
                        });
                        addLog(`✅ Batch-queued turn for ${turn.speaker}: "${turn.content.substring(0, 40)}..."`);
                    }
                });
                addLog(`🎯 Batch generation complete: ${data.turns.length} turns queued`);
            } else {
                throw new Error('Batch returned empty turns');
            }
            
        } catch (e) {
            addLog(`⚠️ Batch fetch failed: ${e.message}. Using fallback responses.`);
            // Add fallback responses directly to queue so triggerAITurn can play them
            const topicName = examData?.title || roadmapTopic || "this topic";
            const lastSpk = lastSpeakerRef.current;
            const candidates = ["Candidate_A", "Candidate_B", "Candidate_C"];
            const available = candidates.filter(c => c !== lastSpk);
            
            available.forEach((speaker, idx) => {
                const fallbacks = {
                    'Candidate_A': [
                        `I believe there are both positive and negative aspects to consider regarding ${topicName}.`,
                        `From my perspective, ${topicName} affects our daily lives more than people realize.`
                    ],
                    'Candidate_B': [
                        `That's a valid point. However, we must also consider how ${topicName} affects different groups.`,
                        `Building on that, I think we should look at the practical challenges people face with ${topicName}.`
                    ],
                    'Candidate_C': [
                        `I agree. I think ${topicName} is something we need to discuss more openly.`,
                        `Um, I think ${topicName} has some merit, but maybe we should start with small changes first?`
                    ]
                };
                const pool = fallbacks[speaker] || fallbacks['Candidate_A'];
                const content = pool[idx % pool.length];
                localTurnQueue.current.push({ speaker, content, audio: null });
                addLog(`✅ Fallback queued for ${speaker}`);
            });
        } finally {
            isFetchingRef.current['batch'] = false;
            setIsThinkingAI(Object.values(isFetchingRef.current).some(v => v));
        }
    };

    const triggerAITurn = async (forceSpeaker, onComplete, loopId = null) => {
        // Singleton Guard: If a turn is already in progress, abort this trigger
        if (isTurnInProgressRef.current && !onComplete) {
            addLog(`🚫 Turn rejected: Another turn is in progress.`);
            return;
        }

        const currentId = loopId === null ? activeTurnLoopId.current : loopId;
        if (loopId !== null && loopId < activeTurnLoopId.current) {
            addLog(`🛑 Aborting stale loop (Loop ${loopId} < current ${activeTurnLoopId.current})`);
            return;
        }

        addLog(`🔍 triggerAITurn [ID:${currentId}]: Speaker=${forceSpeaker || 'random'}, UserTurn=${isUserTurnRef.current}, status=${statusRef.current}`);
        
        if (isUserTurnRef.current || statusRef.current !== 'DISCUSSION') {
            addLog(`🚫 triggerAITurn blocked: userTurn=${isUserTurnRef.current}, status=${statusRef.current}`);
            return;
        }

        // Block if synthesis is speaking or any audio is playing
        const isActuallySpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
        const isAudioPlaying = activeUtterance.current !== null;
        if ((isTransitioning.current || isAudioPlaying || isActuallySpeaking) && !forceSpeaker) {
            setTimeout(() => {
                if (activeTurnLoopId.current === currentId) triggerAITurn(forceSpeaker, onComplete, currentId);
            }, 800);
            return;
        }

        isTurnInProgressRef.current = true;

        // Selection Logic: Strict Speaker Matching
        let turnToPlay = null;
        if (localTurnQueue.current.length > 0) {
            if (!forceSpeaker) {
                // Free flow: Pick a candidate who is NOT the last speaker and NOT the Examiner
                const validIdx = localTurnQueue.current.findIndex(t => 
                    t.speaker !== 'Examiner' && t.speaker !== lastSpeakerRef.current
                );
                if (validIdx !== -1) {
                    turnToPlay = localTurnQueue.current.splice(validIdx, 1)[0];
                    addLog(`🎯 Picking next candidate: ${turnToPlay.speaker} (last was ${lastSpeakerRef.current})`);
                } else {
                    // No valid candidate in queue - clear stale entries and fetch fresh
                    addLog(`🧹 Queue has only stale/examiner turns. Clearing and re-fetching...`);
                    localTurnQueue.current = [];
                }
            } else {
                // Try to find EXACT match for this speaker
                const matchIdx = localTurnQueue.current.findIndex(t => t.speaker === forceSpeaker);
                if (matchIdx !== -1) {
                    turnToPlay = localTurnQueue.current.splice(matchIdx, 1)[0];
                    addLog(`🎯 Exact match found for ${forceSpeaker}`);
                } else {
                    addLog(`🧹 Discarding mismatched queue turns for ${forceSpeaker}. Re-fetching...`);
                    localTurnQueue.current = []; // Clear queue to prevent stale responses
                }
            }
        }

        // Fetch if nothing found
        if (!turnToPlay) {
            // Round-robin target selection: pick the candidate who hasn't spoken longest
            let target;
            if (forceSpeaker) {
                target = forceSpeaker;
            } else {
                const candidates = ["Candidate_A", "Candidate_B", "Candidate_C"];
                // Filter out last speaker, then pick based on interaction index to ensure rotation
                const available = candidates.filter(c => c !== lastSpeakerRef.current);
                // Use interactionIndex to cycle through candidates fairly
                target = available[interactionIndexRef.current % available.length];
            }
            
            // Phase 45: Show 'Thinking' indicator for non-intro rounds to eliminate "dead air" feel
            if (activeTurnLoopId.current > 0) {
                const displayName = target.replace('_', ' ');
                setActiveSpeechText(`${displayName} is thinking...`);
                setCurrentSpeaker(target);
            }

            // Increment interaction index for fair round-robin rotation
            interactionIndexRef.current++;
            
            if (!isFetchingRef.current[target]) {
                addLog(`⏳ Fetching fresh turn for ${target}...`);
                await fetchBatch(target);
            } else {
                addLog(`⏳ Waiting for active fetch for ${target}...`);
                // Wait up to 3s for the active fetch to finish
                let waitPoll = 0;
                while (isFetchingRef.current[target] && waitPoll < 6) {
                    await new Promise(r => setTimeout(r, 500));
                    waitPoll++;
                }
            }
            
            // Try again after fetch
            if (localTurnQueue.current.length > 0) {
                const matchIdx = forceSpeaker ? localTurnQueue.current.findIndex(t => t.speaker === forceSpeaker) : 0;
                if (matchIdx !== -1) turnToPlay = localTurnQueue.current.splice(matchIdx, 1)[0];
            }
        }

        if (turnToPlay) {
            addLog(`✅ Playing turn: ${turnToPlay.speaker} (Loop ${currentId})`);
            playQueuedTurn(turnToPlay, onComplete); // Pass onComplete directly
        } else {
            isTurnInProgressRef.current = false;
            addLog(`⚠️ Still no turn ready. Retrying loop...`);
            setTimeout(() => {
                if (activeTurnLoopId.current === currentId) triggerAITurn(forceSpeaker, onComplete, currentId);
            }, 500); // Reduced delay for faster retry
        }
    };

    // Dedicated intro turn player — directly fetches and plays without queue complexity
    const playIntroTurn = async (speaker, onComplete) => {
        addLog(`🎬 Intro: Fetching turn for ${speaker}...`);
        setCurrentSpeaker(speaker);
        
        try {
            const userLevel = location.state?.userLevel || "3";
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            const formData = new FormData();
            formData.append('history', JSON.stringify(chatHistory.current.slice(-10)));
            formData.append('current_speaker', speaker);
            formData.append('topic', examData?.title || roadmapTopic);
            formData.append('level', userLevel);
            formData.append('uid', user?.uid);
            formData.append('user_name', userDisplayName);
            formData.append('audioOutput', 'false');
            
            const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(15000)
            });
            
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            if (data.content) {
                // Add to history
                chatHistory.current.push({ speaker, role: "assistant", text: data.content });
                if (chatHistory.current.length > 20) chatHistory.current = chatHistory.current.slice(-20);
                setTranscript(prev => [...prev.slice(-15), { role: speaker, text: data.content }]);
                
                addLog(`✅ Intro: ${speaker} says: "${data.content.substring(0, 40)}..."`);
                
                // Play directly
                lastSpeakerRef.current = speaker;
                playSpeech(speaker, data.content, () => {
                    setCurrentSpeaker(null);
                    if (onComplete) onComplete();
                });
            } else {
                throw new Error('Empty content');
            }
        } catch (e) {
            addLog(`⚠️ Intro fetch for ${speaker} failed: ${e.message}. Using fallback.`);
            const topicName = examData?.title || roadmapTopic || "this topic";
            const fallbacks = {
                'Candidate_A': `I believe there are both positive and negative aspects to consider regarding ${topicName}. We should look at this from multiple angles.`,
                'Candidate_B': `That's a valid point. However, we must also consider how ${topicName} affects different groups in our society.`,
                'Candidate_C': `I agree. I think ${topicName} is something we need to discuss more openly as a community.`
            };
            const fallbackText = fallbacks[speaker] || fallbacks['Candidate_A'];
            
            chatHistory.current.push({ speaker, role: "assistant", text: fallbackText });
            setTranscript(prev => [...prev.slice(-15), { role: speaker, text: fallbackText }]);
            lastSpeakerRef.current = speaker;
            
            playSpeech(speaker, fallbackText, () => {
                setCurrentSpeaker(null);
                if (onComplete) onComplete();
            });
        }
    };

    const startDiscussion = () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        updateStatus('DISCUSSION');
        statusRef.current = 'DISCUSSION';
        // Reset timeLeft to the discussion duration (it may be 0 if user clicked "Start Now")
        const levelCode = searchParams.get('level') || location.state?.level || '3';
        let discussionTime = 300; // Default 5 mins (DSE Standard)
        if (levelCode === 'Easy' || levelCode === '3' || parseInt(levelCode) <= 3) {
            discussionTime = 180; // 3 mins
        } else if (levelCode === 'Medium' || levelCode === '4') {
            discussionTime = 240; // 4 mins
        } else if (levelCode === 'DSE Standard' || levelCode === '5') {
            discussionTime = 300; // 5 mins
        } else if (levelCode === 'Elite' || levelCode === '6' || levelCode === '7') {
            discussionTime = 360; // 6 mins
        }
        setTimeLeft(isQuest ? discussionTime : 600);

        addLog(`🗳️ Examiner starting discussion...`);
        setCurrentSpeaker("Examiner");

        // Requirement 2: Brief Intro
        const introPrompt = `Good afternoon. Today we will have a group discussion on the topic: "${examData?.title || roadmapTopic}". We will hear different perspectives from each candidate.`;
        const assignmentPrompt = `Candidate A, would you like to start the discussion?`;

        playSpeech("Examiner", introPrompt, () => {
            setTimeout(() => {
                setCurrentSpeaker("Examiner");
                playSpeech("Examiner", assignmentPrompt, () => {
                    setCurrentSpeaker(null);
                    
                    // Turn Sequence: A -> B -> C -> User (using dedicated intro player)
                    playIntroTurn("Candidate_A", () => {
                        playIntroTurn("Candidate_B", () => {
                            playIntroTurn("Candidate_C", () => {
                                // After C speaks, Examiner asks user
                                setCurrentSpeaker("Examiner");
                                playSpeech("Examiner", "Candidate D, it's your turn. What are your thoughts?", () => {
                                    setCurrentSpeaker(null);
                                    startUserTurn();
                                    // After user speaks, handleUserSpeech will transition to free discussion
                                });
                            });
                        });
                    });
                });
            }, 800);
        });
    };

    const endDiscussion = () => {
        addLog("⏰ Time's up! Ending discussion and moving to individual response...");
        updateStatus('INDIVIDUAL');
        statusRef.current = 'INDIVIDUAL';
        setTimeLeft(30); // 30 seconds for individual response
        
        // CRITICAL: Stop all AI speech immediately
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        activeUtterance.current = null;
        isTransitioning.current = false;
        isTurnInProgressRef.current = false;
        
        // Clear any queued turns so candidates don't continue speaking
        localTurnQueue.current = [];
        
        // Stop any ongoing fetch
        Object.keys(isFetchingRef.current).forEach(k => isFetchingRef.current[k] = false);
        setIsThinkingAI(false);
        
        // Small delay to let the cancel take effect, then Examiner wraps up
        setTimeout(() => {
            setCurrentSpeaker("Examiner");
            playSpeech("Examiner", "Thank you everyone. That concludes the group discussion. Candidate D, I have a question for you.", () => {
                const qs = examData.individual_response_questions || [];
                const q = qs[0] || "What is your view?";
                playSpeech("Examiner", q, () => {
                    startUserTurn();
                });
            });
        }, 500);
    };

    const concludeSession = () => {
        addLog("🏁 Conclusion triggered. Miss Janie wrapping up...");
        
        // Stop all AI speech immediately
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        activeUtterance.current = null;
        isTransitioning.current = false;
        isTurnInProgressRef.current = false;
        localTurnQueue.current = [];
        
        setCurrentSpeaker("Examiner");
        const outroText = "Thank you very much. That is all the time we have for the discussion today. You may stop now.";
        
        playSpeech("Examiner", outroText, () => {
            setCurrentSpeaker(null);
            finishExam();
        });
    };

    const finishExam = async () => {
        if (isGrading) return;
        setIsGrading(true);
        addLog("🗳️ Submitting discussion for HKDSE Grading...");
        updateStatus('FINISHED');
        statusRef.current = 'FINISHED';
        if (synth.current) synth.current.cancel();

        // Quest Logic: Inline Grading
        if (isQuest) {
            setIsSubmitting(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                
                addLog(`🌐 Submitting to: ${API_URL}/api/speaking/quest/submit`);
                const res = await fetch(`${API_URL}/api/speaking/quest/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        module: 'interaction',
                        quest_id: taskId,
                        missionName: examData?.title || roadmapTopic || 'Group Discussion Quest',
                        paper: 'Speaking',
                        messages: chatHistory.current,
                        uid: user?.uid,
                        level: location.state?.userLevel || "3",
                        master_script: examData?.title || roadmapTopic,
                        prosody_metrics: prosodyLogs // PASS MULTIMODAL METRICS
                    })

                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Server responded with ${res.status}: ${errText}`);
                }

                const result = await res.json();
                setGradingResult(result);
                addLog("✅ Grading complete!");
            } catch (e) {
                console.error("Submission error:", e);
                addLog(`❌ Submission failed: ${e.message}`);
                alert(`Submission failed: ${e.message}`);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            navigate('/speaking/result', { state: { loading: true } });
            // ... Mock grading logic similar to SpeakingExamPage
        }
    };

    const getUserAvatar = () => {
        // Use equipped student avatar from AvatarContext, fallback to generic
        return equipment?.student?.image || '/avatars/male_student_avatar_1774534573731.png';
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
            <style>
                {`
                    @keyframes speaking-glow {
                        0%, 100% { box-shadow: 0 0 20px 5px rgba(52, 211, 153, 0.4), inset 0 0 15px rgba(52, 211, 153, 0.3); border-color: #34d399; }
                        50% { box-shadow: 0 0 50px 15px rgba(52, 211, 153, 0.7), inset 0 0 25px rgba(52, 211, 153, 0.5); border-color: #6ee7b7; }
                    }
                    .speaking-avatar {
                        animation: speaking-glow 2s infinite ease-in-out;
                    }
                `}
            </style>
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
                                    concludeSession();
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
                            <div className={`relative size-48 rounded-full border-8 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ${isSpeaking ? "speaking-avatar scale-110" : "border-white/90"}`}>
                                <img
                                    src={avatarSrc}
                                    alt={role}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${isSpeaking ? "scale-105" : "scale-100"}`}
                                    onError={role === "Examiner" ? handleExaminerImgError : null}
                                />
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
                                            <span>{activeSubtitle || activeSpeechText || " "}</span>
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
                                        Your group will discuss the topic: "{examData.title}".
                                        Share your views, listen to others, and engage in meaningful conversation.
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
                )}
                
                {/* High-Fidelity Review Phase (DSE Aligned) */}
                <AnimatePresence>
                    {status === 'FINISHED' && gradingResult && (
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
                                            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">DSE Interaction Mastery</span>
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Group Discussion Quest</span>
                                        </div>
                                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Speaking Performance Report</h1>
                                        <p className="text-slate-500 font-bold text-lg max-w-2xl leading-relaxed">
                                            {gradingResult.feedback?.summary || "Outstanding participation. Here is your detailed interaction analysis aligned with DSE Paper 4."}
                                        </p>
                                    </div>

                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl flex flex-col items-center justify-center min-w-[240px] relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600" />
                                        <div className="text-7xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform duration-500">Level {getDSELevel(gradingResult.scores?.total || 0)}</div>
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
                                            { label: 'Pronunciation', score: gradingResult.scores?.delivery, desc: 'Pronunciation' },
                                            { label: 'Communication Strategies', score: gradingResult.scores?.strategies, desc: 'Communication Strategies' },
                                            { label: 'Vocabulary', score: gradingResult.scores?.language, desc: 'Vocabulary' },
                                            { label: 'Organisation', score: gradingResult.scores?.organisation, desc: 'Ideas & Organisation' }
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

                                {/* 3. Pros & Cons */}
                                <section className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3">
                                            <Zap className="w-5 h-5" /> Communication Strengths
                                        </h2>
                                        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-8 space-y-4">
                                            {(gradingResult.feedback?.pros || ["Consistently interacted with peers", "Used appropriate opening/closing markers"]).map((pro, i) => (
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
                                            {(gradingResult.feedback?.cons || ["Elaborate more on points", "Increase bridging frequency"]).map((con, i) => (
                                                <div key={i} className="flex gap-4 items-start">
                                                    <div className="mt-1 size-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white font-black text-[10px]">!</div>
                                                    <p className="text-slate-700 font-bold leading-relaxed">{con}</p>
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
                                        <h3 className="text-4xl font-black mb-8 leading-tight">Expert Strategy for your next mission</h3>
                                        <div className="space-y-6">
                                            {(gradingResult.feedback?.roadmap_tips || ["Use advanced bridging markers", "Invite silent partners explicitly"]).map((tip, i) => (
                                                <div key={i} className="flex gap-6 items-start group">
                                                    <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i + 1}</div>
                                                    <p className="text-slate-400 font-bold group-hover:text-slate-200 transition-colors text-lg">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* 5. Integrated Transcript View */}
                                <section className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Final Discussion Archive
                                        </h4>
                                    </div>
                                    <div className="p-8 max-h-[500px] overflow-y-auto space-y-6">
                                        {chatHistory.current.map((msg, i) => {
                                            // Normalize: user messages use role='user', AI uses role='Candidate_X' or speaker
                                            const isUser = msg.role === 'user' || msg.speaker === 'You' || msg.speaker === 'Student' || msg.speaker === userDisplayName;
                                            const speakerName = isUser ? (userDisplayName || 'You') : (msg.speaker || msg.role || 'AI');
                                            return (
                                                <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-2 px-2">{speakerName}</span>
                                                    <div className={`max-w-[80%] px-6 py-4 rounded-[1.5rem] font-bold text-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* 6. Footer Actions */}
                                <section className="flex flex-col md:flex-row gap-4 pt-10">
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="flex-1 py-6 bg-white border-2 border-slate-200 text-slate-600 rounded-3xl font-black text-xl hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        <RotateCcw className="w-6 h-6" /> Restart Quest
                                    </button>
                                    <button 
                                        onClick={() => navigate('/dashboard')}
                                        className="flex-1 py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group"
                                    >
                                        Return to Hub
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

export default SpeakingInteractionPage;
