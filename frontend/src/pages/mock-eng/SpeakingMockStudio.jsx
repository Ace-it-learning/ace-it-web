import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import { 
    MessageCircle, ChevronRight, Clock, ShieldCheck, ArrowLeft,
    CheckCircle2, Mic, MicOff, Play, Users, User, Info, AlertCircle, Award, PenTool
} from 'lucide-react';
import { LoadingPage, GradingOverlay } from '../../components/shared';
import UpgradeModal from '../../components/common/UpgradeModal';
import MockCountdownTimer from '../../components/utils/MockCountdownTimer';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { isCheatEnabled } from '../../utils/devAccess';
import { useAzureSpeechRecognition } from '../../hooks/useAzureSpeechRecognition';

const SpeakingMockStudio = () => {
    const { paperId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile } = useAuth();
    const { equipment, englishTutor } = useAvatar();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const tier = profile?.subscription_tier || 'free';

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
    // Exam mode: hide subtitles by default; dev cheat toggle
    const [showSubtitles, setShowSubtitles] = useState(false);
    const cheatKeyPresses = useRef([]);
    
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
    const isCheatMode = isCheatEnabled(user, profile);
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
            // Fetch Lock: Prevent double-fetches from StrictMode
            if (window._isFetchingMockSpeaking === paperId) return;
            window._isFetchingMockSpeaking = paperId;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/english/mock/${paperId}?uid=${user?.uid || 'guest'}`);
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
            } finally {
                // Keep the lock for 2 seconds to bridge the StrictMode gap
                setTimeout(() => { window._isFetchingMockSpeaking = null; }, 2000);
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

    // Azure Speech Recognition Hook
    const {
        isListening: azureIsListening,
        isConnected: azureIsConnected,
        interimTranscript: azureInterimTranscript,
        startListening: startAzureListening,
        stopListening: stopAzureListening,
        resetTranscript: resetAzureTranscript
    } = useAzureSpeechRecognition({
        silenceThresholdMs: 1200,
        onPartial: (text) => {
            setActiveSpeechText(text);
            // Auto silence detection: 8s for exam mode (more time to think)
            if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
            userSilenceTimer.current = setTimeout(() => {
                if (isUserTurn && text.trim()) {
                    stopAzureListening();
                    handleUserSpeech(text.trim());
                }
            }, 8000);
        },
        onFinal: (text) => {
            addLog(`📝 Final: "${text.substring(0, 30)}..."`);
            handleUserSpeech(text);
        },
        onError: (err) => {
            console.error('[SpeakingMockStudio] Azure STT error:', err);
            addLog(`⚠️ STT Error: ${err.message}`);
        }
    });

    // Sync mic active state with Azure listening state
    useEffect(() => {
        setIsRecording(azureIsListening);
    }, [azureIsListening]);

    // Show interim results in UI
    useEffect(() => {
        if (azureInterimTranscript) {
            setActiveSpeechText(azureInterimTranscript);
        }
    }, [azureInterimTranscript]);

    // Dev cheat: triple-press Ctrl+Shift+S within 2s to toggle subtitles
    useEffect(() => {
        if (!isCheatMode) return;
        const handler = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                const now = Date.now();
                cheatKeyPresses.current = cheatKeyPresses.current.filter(t => now - t < 2000);
                cheatKeyPresses.current.push(now);
                if (cheatKeyPresses.current.length >= 3) {
                    cheatKeyPresses.current = [];
                    setShowSubtitles(prev => {
                        const next = !prev;
                        addLog(next ? "🎯 DEV CHEAT: Subtitles ON" : "🎯 DEV CHEAT: Subtitles OFF");
                        return next;
                    });
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isCheatMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAzureListening();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // TTS Helpers
    const getVoice = (role) => {
        if (!voices || voices.length === 0) return null;

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

        const englishVoices = sortedVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
        const pool = englishVoices.length > 0 ? englishVoices : sortedVoices;

        const getVoiceGender = (v) => {
            if (v.gender) return v.gender.toLowerCase();
            const name = v.name.toLowerCase();
            const maleNames = ['david', 'guy', 'alex', 'daniel', 'james', 'oliver', 'harry', 'mark', 'peter', 'george', 'john', 'paul', 'richard', 'tom', 'sam', 'ben', 'matt', 'eric', 'frank'];
            const femaleNames = ['samantha', 'victoria', 'moira', 'zira', 'susan', 'mary', 'aria', 'lisa', 'serena', 'emma', 'anna', 'jenny', 'sonia', 'libby', 'mia', 'hazel', 'helen', 'catherine'];
            if (maleNames.some(n => name.includes(n))) return 'male';
            if (femaleNames.some(n => name.includes(n))) return 'female';
            if (name.includes('male') && !name.includes('female')) return 'male';
            if (name.includes('female')) return 'female';
            return null;
        };

        const findVoice = (preferredNames, gender) => {
            for (const name of preferredNames) {
                const match = pool.find(v => {
                    const nameMatch = v.name.toLowerCase().includes(name.toLowerCase());
                    const vGender = getVoiceGender(v);
                    const genderMatch = !gender || !vGender || vGender === gender.toLowerCase();
                    return nameMatch && genderMatch;
                });
                if (match) return match;
            }
            if (gender) {
                const genderMatch = pool.find(v => getVoiceGender(v) === gender.toLowerCase());
                if (genderMatch) return genderMatch;
            }
            return pool[0];
        };

        if (role === 'Examiner') {
            return findVoice(['Jenny', 'Natasha', 'Aria', 'Sonia', 'Libby', 'Emma'], 'Female');
        }
        if (role === 'Candidate_A') {
            return findVoice(['Sonia', 'Libby', 'Hazel', 'Olivia', 'Mia', 'Emma'], 'Female');
        }
        if (role === 'Candidate_B') {
            return findVoice(['Ryan', 'Guy', 'Davis', 'Tony', 'Eric', 'Daniel'], 'Male');
        }
        if (role === 'Candidate_C') {
            return findVoice(['Brandon', 'Christopher', 'Eric', 'Davis', 'Tony'], 'Male');
        }
        return pool[0];
    };

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
        const cleaned = text.replace(/^(Candidate[ _][A-D]|Examiner):/i, "").trim();
        if (!cleaned) { if (onEnd) onEnd(); return; }

        setTranscript(prev => [...prev.slice(-10), { role, text: cleaned }]);
        if (showSubtitles) setActiveSubtitle(cleaned);

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
                const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                activeUtterance.current = { abort: () => audio.pause() };
                audio.onended = () => {
                    activeUtterance.current = null;
                    isTransitioning.current = false;
                    setActiveSubtitle("");
                    if (onEnd) onEnd();
                };
                audio.onerror = () => playBrowserTTS(role, cleaned, onEnd);
                isTransitioning.current = true;
                await audio.play();
                return;
            }
        } catch (e) {
            addLog(`⚠️ Azure TTS failed: ${e.message}. Using browser fallback.`);
        }
        playBrowserTTS(role, cleaned, onEnd);
    };

    const playIntroTurn = async (speaker, onComplete) => {
        addLog(`🎬 Intro: Fetching turn for ${speaker}...`);
        setCurrentSpeaker(speaker);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const levelMap = { 'Candidate_A': '6', 'Candidate_B': '3', 'Candidate_C': '4' };
            const enrichedTopic = `${mockData?.topic_description || ''}\n[SYSTEM: Candidate Personas: A(${mockData?.candidates?.A}), B(${mockData?.candidates?.B}), C(${mockData?.candidates?.C})]`;
            const res = await fetch(`${API_URL}/api/speaking/interaction/turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory.current.slice(-10),
                    current_speaker: speaker,
                    topic: enrichedTopic,
                    level: levelMap[speaker] || '5',
                    uid: user?.uid,
                    audioOutput: false
                }),
                signal: AbortSignal.timeout(15000)
            });
            if (!res.ok) throw new Error(`Server ${res.status}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (data.content) {
                chatHistory.current.push({ role: speaker, content: data.content });
                lastSpeakerRef.current = speaker;
                addLog(`✅ Intro: ${speaker} says: "${data.content.substring(0, 40)}..."`);
                playSpeech(speaker, data.content, () => {
                    setCurrentSpeaker(null);
                    if (onComplete) onComplete();
                });
            } else throw new Error('Empty content');
        } catch (e) {
            addLog(`⚠️ Intro fetch for ${speaker} failed: ${e.message}. Using fallback.`);
            const topicName = mockData?.title || "this topic";
            const fallbacks = {
                'Candidate_A': `I believe there are both positive and negative aspects to consider regarding ${topicName}.`,
                'Candidate_B': `That's a valid point. However, we must also consider how ${topicName} affects different groups.`,
                'Candidate_C': `I agree. I think ${topicName} is something we need to discuss more openly.`
            };
            const fb = fallbacks[speaker] || fallbacks['Candidate_A'];
            chatHistory.current.push({ role: speaker, content: fb });
            lastSpeakerRef.current = speaker;
            playSpeech(speaker, fb, () => {
                setCurrentSpeaker(null);
                if (onComplete) onComplete();
            });
        }
    };

    const handleUserSpeech = (text) => {
        if (userSilenceTimer.current) clearTimeout(userSilenceTimer.current);
        setIsRecording(false);
        setIsUserTurn(false);
        isTransitioning.current = false;
        activeUtterance.current = null;
        const cleaned = (text || "").trim();
        if (cleaned) {
            setActiveSpeechText(cleaned);
            setTranscript(prev => [...prev, { role: "You", text: cleaned }]);
            
            if (statusRef.current === 'INDIVIDUAL') {
                setIndividualResponse(cleaned);
                playSpeech("Examiner", "Thank you, that concludes the Speaking Mock Examination.", () => {
                    handleSubmit(cleaned);
                });
                return;
            }

            chatHistory.current.push({ role: "Candidate_D", content: cleaned });
            
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
        
        resetAzureTranscript();
        collectedTranscript.current = "";
        startAzureListening();
        addLog("🎙️ Azure STT listening started...");
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
        if (loopId !== null && loopId !== activeTurnLoopId.current) return;
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
            
            if (statusRef.current !== 'DISCUSSION' || (loopId !== null && loopId !== activeTurnLoopId.current)) {
                isTurnInProgressRef.current = false;
                setCurrentSpeaker(null);
                return;
            }

            if (localTurnQueue.current.length > 0) {
                turnToPlay = localTurnQueue.current.shift();
            }
        }

        if (turnToPlay) {
            setCurrentSpeaker(turnToPlay.speaker);
            lastSpeakerRef.current = turnToPlay.speaker;
            chatHistory.current.push({ role: turnToPlay.speaker, content: turnToPlay.content });
            
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
        if (chatHistory.current.length > 0) return;
        updatePhase('DISCUSSION');
        setCurrentSpeaker('Examiner');
        
        const introText = `Good afternoon. We are here to discuss ${mockData?.title}. Candidate A, would you like to start?`;
        chatHistory.current.push({ role: "Examiner", content: introText });
        
        playSpeech("Examiner", introText, () => {
            setCurrentSpeaker(null);
            playIntroTurn("Candidate_A", () => {
                playIntroTurn("Candidate_B", () => {
                    playIntroTurn("Candidate_C", () => {
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
        activeTurnLoopId.current += 1;
        isTurnInProgressRef.current = false;
        localTurnQueue.current = [];
        
        updatePhase('INDIVIDUAL');
        // Stop all AI speech immediately
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (activeUtterance.current?.abort) activeUtterance.current.abort();
        activeUtterance.current = null;
        isTransitioning.current = false;
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
        if (tier === 'free') {
            setShowUpgradeModal(true);
            return;
        }
        setIsSubmitting(true);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognition.current) try { recognition.current.stop(); } catch(e){}

        // Progress Simulation
        const progressInterval = setInterval(() => {
            // Speaking mock navigates away on success, so we don't need complex progress state
        }, 1500);
        
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

            clearInterval(progressInterval);
            if (res.ok) {
                const result = await res.json();
                navigate(`/mock-exam-eng/speaking/results/${result.id}`, { state: { result, mockData } });
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error("Submission error:", error);
            // Show error and allow user to retry or return to library
            setIsSubmitting(false);
            alert("Assessment processing failed. Please try again or return to the library.");
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
                            isCheatMode && (
                                <button onClick={startIndividualResponse} className="bg-white/10 hover:bg-white/20 px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                                    Skip to Part B
                                </button>
                            )
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

                        {/* Subtitle / Speech Display — hidden in exam mode, dev cheat toggleable */}
                        {showSubtitles && (
                            <div className="absolute top-20 text-center max-w-2xl w-full">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">DEV MODE</span>
                                </div>
                                <p className="text-lg font-medium text-slate-300 min-h-[3rem] italic">
                                    {activeSubtitle || activeSpeechText || (isUserTurn ? "Waiting for your response..." : "")}
                                </p>
                            </div>
                        )}

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
                                            {pos === 'You' ? <img src={equipment?.student?.image || user?.photoURL || '/avatars/male_student_avatar_1774534573731.png'} alt="You" className="w-full h-full object-cover rounded-[2.5rem]" /> : <img src={englishTutor?.avatar || "/avatars/Miss_Janie.jpg"} className="w-full h-full object-cover rounded-[2.5rem]" alt={englishTutor?.name || "Janie"} />}
                                            {isActive && (
                                                <div className="absolute -top-4 -right-4 size-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 animate-bounce">
                                                    <Mic size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-black/40 px-3 py-1 rounded-full">{pos === 'You' ? 'Candidate D (You)' : `${englishTutor?.name || "Miss Janie"} (Examiner)`}</span>
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

                <AnimatePresence>
                    {isSubmitting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
                        >
                            <div className="relative mb-12">
                                <div className="size-32 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BrainCircuit size={48} className="text-white animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Pedagogical Analysis in Progress</h2>
                            <p className="text-indigo-200 text-sm font-medium max-w-md leading-relaxed">
                                {englishTutor?.name || "Miss Janie"} is evaluating your responses against the <span className="text-white font-bold">HKEAA Marking Rubric</span> and cross-referencing textual evidence...
                            </p>
                            <div className="mt-8 w-full max-w-sm space-y-4">
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '92%' }}
                                        className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                                    <span>Syncing Rubric</span>
                                    <span>92%</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <UpgradeModal 
                    isOpen={showUpgradeModal} 
                    onClose={() => setShowUpgradeModal(false)}
                    title="Pro / Premium Required"
                    message="Please subscribe to a Pro or Premium plan to submit Mock Exams and receive AI evaluation with grade prediction."
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
                
                <div className="mt-12">
                    <button 
                        onClick={() => navigate('/mock-exam-eng')}
                        className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Return to Library
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return null;
};

export default SpeakingMockStudio;
