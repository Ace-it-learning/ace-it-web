import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Radio, Paperclip, Send, Volume2, VolumeX, Edit3, Type, Maximize2, Minimize2, X, MessageSquare, CircleX, Trophy, Lock, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from './Sidebar'; // Reusing cn utility
import EssayUploader from './EssayUploader';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { getAdditionalUserInfo, deleteUser } from 'firebase/auth'; // Import for Google Sign-In handling
import { db } from '../firebase';
import LaunchCard from './LaunchCard';
import AuthForm from './AuthForm';
import MasteryModal from './dashboard/MasteryModal';
import { getUserMastery, getMasteryHistory } from '../services/masteryService';
import { Compass } from 'lucide-react';
// RoadmapModal import removed - hoisted to Dashboard

const getSuggestionChips = (t) => ({
    guest: [
        { label: t('chat.start_mock'), value: "Start Mock Exam", emoji: "🚀" },
        { label: t('chat.what_is_ace_it'), value: "What is Ace It?", emoji: "🤔" },
        { label: t('chat.start_diagnostic'), value: "I want to start the diagnostic test", emoji: "📋" },
    ],
    member: [
        { label: t('chat.start_mock'), value: "Start Mock Exam", emoji: "🚀" },
        { label: t('chat.review_mistake'), value: "Review my last mistake", emoji: "🔄" },
        { label: t('chat.practice_vocab'), value: "Practice Vocabulary", emoji: "📖" },
    ]
});

const DISPOSABLE_DOMAINS = [
    "yopmail.com", "temp-mail.org", "guerrillamail.com", "10minutemail.com",
    "sharklasers.com", "mailinator.com", "throwawaymail.com", "getnada.com",
    "dispostable.com", "fakeinbox.com", "maildrop.cc"
];

// AuthForm removed - moved to separate file

const formatMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    const cleanContent = content.replace(/\n{3,}/g, '\n\n');
    return cleanContent.split(/\*\*(.*?)\*\*/g).map((part, index) =>
        index % 2 === 1 ? <strong key={index} className="font-bold">{part}</strong> : part
    );
};

const ChatInterface = ({ onOpenQuest }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { activeAgent, activeAgentId, avatarState, setAvatarState, studentState, setStudentState, isFocusMode, setIsFocusMode } = useAvatar();
    const { user, loginWithGoogle, logout, verifyEmail } = useAuth(); // Destructure all needed methods
    const { t, toggleLanguage, language } = useLanguage();

    // State definitions moved to top
    const [hasDiagnostic, setHasDiagnostic] = useState(false);


    // Dynamic Chips Logic based on User State
    const suggestionChips = (() => {
        if (!hasDiagnostic) {
            return [
                { label: t('chat.start_calibration'), value: "I want to start the diagnostic test", emoji: "⚡" },
                { label: t('chat.what_is_ace_it'), value: "What is Ace It?", emoji: "🤔" }
            ];
        } else {
            return [
                { label: t('chat.start_mock'), value: "Start Mock Exam", emoji: "🚀" },
                { label: "What should I focus on?", value: "Analyze my recent performance and tell me what to focus on today.", emoji: "🧠" }
            ];
        }
    })();
    // Note: I cannot change line 271 and 1038 in one chunk if they are far apart.
    // I will do two chunks.
    // Chunk 1: Update useLanguage destructuring.
    // Dynamic Chips Logic based on User State

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // { data: base64, type: mimeType, preview: url }
    // isQuestOpen removed - controlled by parent
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [showChips, setShowChips] = useState(false);
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [mockExams, setMockExams] = useState([]);

    const [writingExams, setWritingExams] = useState([]);
    const [listeningExams, setListeningExams] = useState([]);
    const [speakingExams, setSpeakingExams] = useState([]);
    const [examState, setExamState] = useState({
        isActive: false,
        paperId: null,
        currentQuestionId: 1,
        paperMetadata: null
    });
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [dynamicChips, setDynamicChips] = useState([]);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false); // New state for confirm modal
    const [gender, setGender] = useState(null);
    const [isNewStudent, setIsNewStudent] = useState(true); // Default to true until fetched
    const idleTimerRef = useRef(null);

    // Mastery Compass State
    const [isMasteryOpen, setIsMasteryOpen] = useState(false);
    const [masteryData, setMasteryData] = useState(null);
    const [masteryHistory, setMasteryHistory] = useState([]);

    const handleOpenMastery = async () => {
        if (!user) return;
        setIsMasteryOpen(true);
        try {
            const [data, history] = await Promise.all([
                getUserMastery(user.uid),
                getMasteryHistory(user.uid)
            ]);
            setMasteryData(data);
            setMasteryHistory(history);
        } catch (err) {
            console.error("Failed to load mastery data", err);
        }
    };


    const getStudentAvatar = () => {
        // if (user?.photoURL) return user.photoURL; // Disable photoURL to fix broken google link
        const g = gender?.toLowerCase();
        if (g === 'female') return '/avatars/student_female_1.jpg';
        return '/avatars/student_male_1.jpg';
    };

    const isProcessedRef = useRef(false);

    // Check for Post-Diagnostic, Post-Lab, or Post-Exam State
    useEffect(() => {
        if (!user || isProcessedRef.current) return;

        if (location.state?.diagnosticCompleted) {
            isProcessedRef.current = true;
            setHasDiagnostic(true);
            const criticalAreas = location.state.criticalAreas || [];
            const archetype = location.state.archetype || "Student";
            setDynamicChips(criticalAreas);
            handleSendMessage(`[SYSTEM: DIAGNOSTIC_JUST_COMPLETED: ${archetype}]`, true);
            window.history.replaceState({}, document.title);
        } else if (location.state?.labCompleted) {
            isProcessedRef.current = true;
            const { topic } = location.state;
            handleSendMessage(`[SYSTEM: LAB_COMPLETED: ${topic}]`, true);
            window.history.replaceState({}, document.title);
        } else if (location.state?.mockCompleted) {
            isProcessedRef.current = true;
            const { type, level, score, improvements } = location.state;
            let msg = `[SYSTEM: MOCK_COMPLETED: ${type.toUpperCase()} | Level: ${level} | Score: ${score}]`;
            if (improvements) msg += `\nImprovement Advice: ${improvements}`;
            handleSendMessage(msg, true);
            window.history.replaceState({}, document.title);
        } else if (location.state?.examCompleted) {
            isProcessedRef.current = true;
            const { examId } = location.state;
            handleSendMessage(`[SYSTEM: EXAM_JUST_COMPLETED: ${examId}]`, true);
            window.history.replaceState({}, document.title);
        } else if (location.state?.startPrompt) {
            isProcessedRef.current = true;
            handleSendMessage(location.state.startPrompt);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, user]);

    // Listen for events from MasteryModal
    useEffect(() => {
        const handleStartChat = (e) => {
            const { message } = e.detail;
            if (message) {
                handleSendMessage(message);
            }
        };

        window.addEventListener('start-ai-chat', handleStartChat);
        return () => window.removeEventListener('start-ai-chat', handleStartChat);
    }, []);

    // Idle Detection removed per USER request
    /*
    useEffect(() => {
        const resetIdleTimer = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
            // Only trigger if last message was from assistant and not a system response
            const lastMsg = messages[messages.length - 1];
            const isSystem = lastMsg?.isSystemResponse || lastMsg?.content?.includes('[SYSTEM:');
    
            if (lastMsg && lastMsg.role === 'assistant' && !isSystem) {
                idleTimerRef.current = setTimeout(() => {
                    console.log("[Idle] Student inactive for 60s. Checking in...");
                    handleSendMessage('[SYSTEM: STUDENT_IDLE]', true);
                }, 60000);
            }
        };
    
        resetIdleTimer();
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [messages]);
    */

    // Initial greeting or History restore
    useEffect(() => {
        const fetchHistory = async () => {
            // Fetch History and Profile together
            if (user) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                    // 1. Fetch Stats/Profile
                    const statsRes = await fetch(`${API_URL}/api/stats?uid=${user.uid}`);
                    const statsData = await statsRes.json();

                    if (statsData.gender) setGender(statsData.gender);
                    if (statsData.is_new_student !== undefined) setIsNewStudent(statsData.is_new_student);

                    // Use a local variable to avoid race conditions with state update
                    const currentHasDiagnostic = statsData.hasDiagnostic === true;
                    setHasDiagnostic(currentHasDiagnostic);

                    // 2. Fetch History
                    const historyRes = await fetch(`${API_URL}/api/history/${activeAgentId}?uid=${user.uid}`);
                    const history = await historyRes.json();

                    const visibleHistory = history.filter(m =>
                        !m.content.includes('[SYSTEM:') &&
                        !m.content.includes('[ACTIVATING_EXAM_MODE]')
                    );

                    if (visibleHistory.length > 0) {
                        setMessages(visibleHistory);
                        setShowChips(true);
                    } else {
                        // NO visible messages (new user or cleared history) -> Show Greeting
                        setMessages([{
                            role: 'assistant',
                            content: (activeAgentId === 'english' && !currentHasDiagnostic)
                                ? t('chat.greeting_new')
                                : t('chat.greeting_return').replace('{{agentName}}', activeAgent.name),
                            agentId: activeAgentId
                        }]);
                        setShowChips(true);
                    }
                } catch (err) {
                    console.error("fetchHistory failed", err);
                }
            } else {
                // GUEST MODE
                setMessages([{
                    role: 'assistant',
                    content: activeAgentId === 'english'
                        ? t('chat.greeting_new')
                        : t('chat.greeting_generic').replace('{{agentName}}', activeAgent.name),
                    agentId: activeAgentId
                }]);
                setShowChips(true);
            }
        };

        fetchHistory();
        setAvatarState('IDLE');
    }, [activeAgentId, setAvatarState, activeAgent.name, user]);


    // Helper to save messages to backend
    const saveMessageToBackend = async (msg) => {
        if (!user || !user.uid) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/api/history/${activeAgentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    role: msg.role,
                    content: msg.content
                })
            });
        } catch (err) {
            console.error("Failed to save message", err);
        }
    };

    // Fetch Mock Exams (Firestore for Reading, API for Writing)
    useEffect(() => {
        const fetchMocks = async () => {
            try {
                // Reading (Firestore) - Keep existing
                const { collection, getDocs, query, where } = await import('firebase/firestore');
                const { db } = await import('../firebase');
                const q = query(collection(db, 'mock_exams'), where('is_published', '==', true));
                const snap = await getDocs(q);
                setMockExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));

                // Writing (Backend API)
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/writing/exams`);
                if (res.ok) {
                    const data = await res.json();
                    setWritingExams(data);
                }

                // Listening (Backend API)
                const resL = await fetch(`${API_URL}/api/listening/exams`);
                if (resL.ok) {
                    const data = await resL.json();
                    setListeningExams(data);
                }

                // Speaking (Backend API)
                const resS = await fetch(`${API_URL}/api/speaking/exams`);
                if (resS.ok) {
                    const data = await resS.json();
                    setSpeakingExams(data);
                }
            } catch (err) {
                console.error("Error fetching mocks:", err);
            }
        };
        fetchMocks();
    }, []);

    // Voice Recording State (replaces speech-to-text)
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [voiceQuota, setVoiceQuota] = useState(null); // { used: 5, limit: 10, tier: 'normal' }
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true); // Default: Sound Off
    const isMutedRef = useRef(isMuted);

    // Chat Output Language Preference - Sync with UI Language
    // This is separate from the UI language (LanguageContext) but should start synchronized
    const [chatLanguage, setChatLanguage] = useState(() => {
        // Map 'zh' to 'zh-HK' for backend, 'en' stays 'en'
        return language === 'zh' ? 'zh-HK' : 'en';
    });

    // Sync ref with state
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    // Stop speaking immediately when muted
    useEffect(() => {
        if (isMuted) {
            window.speechSynthesis.cancel();
        }
    }, [isMuted]);

    // Auto-scroll to bottom
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        // Check for active_mock_list is removed to allow scrolling to see options as requested.
        // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, avatarState, isFocusMode]);

    // Focus Mode Keyboard Listener (Escape to exit)
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isFocusMode) {
                setIsFocusMode(false);
            }
        };
        window.addEventListener('keydown', handleEsc);

        // Body scroll lock
        if (isFocusMode) {
            document.body.style.overflow = 'hidden';
            // Scroll to bottom immediately on enter
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isFocusMode, setIsFocusMode]);

    // Text-to-Speech Function
    const speakText = (text, agentId = 'english') => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Voice Profiles
        const PROFILES = {
            english: { gender: 'female', lang: 'en-GB', rate: 1.0, pitch: 1.1 }, // Miss Janie: Adjusted speed
            math: { gender: 'male', lang: 'en-GB', rate: 1.05, pitch: 1.0 },
            chinese: { gender: 'female', lang: 'zh-HK', rate: 1.4, pitch: 1.0 }, // Faster Cantonese
            science: { gender: 'male', lang: 'en-GB', rate: 1.05, pitch: 1.0 },
            ace: { gender: 'male', lang: 'en-GB', rate: 1.0, pitch: 0.95 } // Ace Sir: Slightly deeper
        };

        const profile = PROFILES[agentId] || PROFILES.english;

        // Language Detection Override
        const isChinese = /[\u4e00-\u9fa5]/.test(text);
        const targetLang = isChinese ? 'zh-HK' : profile.lang;

        // Strip whitespace for Chinese (improves fluency)
        if (isChinese) {
            text = text.replace(/\s+/g, '');
        }

        let preferredVoice;

        if (targetLang === 'zh-HK') {
            // Cantonese Priority: Google -> Windows (Tracy) -> Mac (Sin-ji) -> Generic zh-HK -> Any zh (warn)
            preferredVoice = voices.find(v => v.name.includes("Google Cantonese")) ||
                voices.find(v => v.name.includes("Tracy")) ||
                voices.find(v => v.name.includes("Sin-ji")) ||
                voices.find(v => v.lang === "zh-HK") ||
                voices.find(v => v.lang === "zh-TW");
        } else {
            // English Gender Selection
            if (profile.gender === 'female') {
                preferredVoice = voices.find(v => v.name.includes("Google UK English Female")) ||
                    voices.find(v => v.name.includes("Microsoft Hazel")) || // Windows UK Female
                    voices.find(v => v.name.includes("Microsoft Susan")) || // Windows UK Female
                    voices.find(v => v.lang === 'en-GB' && v.name.includes('Female')) ||
                    voices.find(v => v.name.includes("Zira")) || // Windows US Female fallback
                    voices.find(v => v.name.includes("Female"));
            } else {
                preferredVoice = voices.find(v => v.name.includes("Google UK English Male")) ||
                    voices.find(v => v.name.includes("Microsoft George")) ||
                    voices.find(v => v.lang === 'en-GB' && v.name.includes('Male')) ||
                    voices.find(v => v.name.includes("Microsoft David")) || // Windows US Male fallback
                    voices.find(v => v.lang === 'en-GB');
            }
        }

        console.log(`[TTS] Text: "${text.substring(0, 15)}..." | Lang: ${targetLang} | Goal Gender: ${profile.gender}`);
        console.log(`[TTS] Voices Available: ${voices.length}. Selected: ${preferredVoice ? preferredVoice.name : 'System Default'}`);

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang;
        }

        // Apply Profile Settings
        utterance.rate = profile.rate;
        utterance.pitch = profile.pitch;

        window.speechSynthesis.speak(utterance);
    };

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition is not supported in this browser. Please use Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();

        // Cantonese-optimized settings
        recognition.lang = 'zh-HK'; // Cantonese (Hong Kong)
        recognition.interimResults = true; // Show partial results for better feedback
        recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
        recognition.continuous = false; // Stop after one utterance

        recognition.onstart = () => {
            setIsListening(true);
            console.log('[Speech] Recognition started - Language: zh-HK (Cantonese)');
        };

        recognition.onresult = (event) => {
            // Get the most recent result
            const last = event.results.length - 1;
            const result = event.results[last];

            if (result.isFinal) {
                // Use the best match (highest confidence)
                const transcript = result[0].transcript;
                const confidence = result[0].confidence;

                console.log(`[Speech] Final: "${transcript}" (Confidence: ${(confidence * 100).toFixed(1)}%)`);
                setInputValue(transcript);

                // Log alternatives for debugging
                if (result.length > 1) {
                    console.log('[Speech] Alternatives:',
                        Array.from(result).map((alt, i) =>
                            `${i + 1}. "${alt.transcript}" (${(alt.confidence * 100).toFixed(1)}%)`
                        ).join(', ')
                    );
                }
            } else {
                // Show interim results in console for feedback
                const interim = result[0].transcript;
                console.log(`[Speech] Interim: "${interim}"`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log('[Speech] Recognition ended');
        };

        recognition.onerror = (event) => {
            console.error('[Speech] Error:', event.error);
            setIsListening(false);

            // Provide user-friendly error messages
            let errorMsg = 'Speech recognition error: ';
            switch (event.error) {
                case 'no-speech':
                    errorMsg += 'No speech detected. Please try again and speak clearly.';
                    break;
                case 'audio-capture':
                    errorMsg += 'Microphone not accessible. Please check permissions.';
                    break;
                case 'not-allowed':
                    errorMsg += 'Microphone permission denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMsg += 'Network error. Speech recognition requires internet connection.';
                    break;
                default:
                    errorMsg += event.error;
            }

            // Show error to user
            alert(errorMsg);
        };

        recognition.start();
    };

    // NEW: Audio Recording Functions (replaces speech-to-text)
    const handleVoiceRecording = async () => {
        if (!user) {
            alert("Please sign in to use voice recording for pronunciation feedback.");
            return;
        }

        if (!isRecording) {
            await startRecording();
        } else {
            await stopRecording();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                }
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                console.log('[Voice] Recording stopped. Size:', (audioBlob.size / 1024).toFixed(2), 'KB');

                await handleAudioRecording(audioBlob, mediaRecorderRef.current.recordedDuration || recordingTime);

                audioChunksRef.current = [];
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);

            console.log('[Voice] Recording started');

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= 30) {
                        stopRecording();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

        } catch (error) {
            console.error('[Voice] Recording error:', error);

            let errorMsg = 'Could not start recording: ';
            if (error.name === 'NotAllowedError') {
                errorMsg += 'Microphone permission denied. Please allow microphone access.';
            } else if (error.name === 'NotFoundError') {
                errorMsg += 'No microphone found. Please connect a microphone.';
            } else {
                errorMsg += error.message;
            }

            alert(errorMsg);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.recordedDuration = recordingTime;
            mediaRecorderRef.current.stop();
        }

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }

        setIsRecording(false);
        setRecordingTime(0);
    };

    const handleAudioRecording = async (audioBlob, duration) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];

            console.log('[Voice] Starting backend request...');
            console.log('[Voice] Audio size:', (audioBlob.size / 1024).toFixed(2), 'KB');
            console.log('[Voice] Duration:', duration, 's');

            try {
                console.log('[Voice] Getting auth token...');
                const token = await user.getIdToken();
                console.log('[Voice] Token obtained, sending request...');

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        uid: user.uid,
                        audio: base64Audio,
                        audioType: 'audio/webm',
                        agentId: activeAgentId,
                        outputLanguage: chatLanguage,
                        history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
                    })
                });

                console.log('[Voice] Response status:', response.status);
                const data = await response.json();
                console.log('[Voice] Response data:', JSON.stringify(data, null, 2));

                if (data.text) {
                    console.log('[Voice] Adding message to chat');
                    setMessages(prev => [...prev, { role: 'assistant', content: data.text, agentId: activeAgentId }]);
                } else {
                    console.error('[Voice] No text in response. Full data:', data);
                    if (data.error) {
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            content: `Backend Error: ${data.error}\n${data.message || ''}`,
                            agentId: activeAgentId
                        }]);
                    }
                }
            } catch (error) {
                console.error('[Voice] Error details:', error);
                console.error('[Voice] Error stack:', error.stack);
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}`, agentId: activeAgentId }]);
            }
        };
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        // Restriction: Guest 1-upload limit
        if (!user) {
            const uploadedImages = messages.filter(m => m.role === 'user' && m.image).length;
            if (uploadedImages >= 1) {
                alert("Guest preview: You can only upload 1 handwriting sample per session. Sign up to upload more!");
                return;
            }
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // Compress Image Logic
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG

                setSelectedImage({
                    data: compressedDataUrl.split(',')[1],
                    type: 'image/jpeg',
                    preview: compressedDataUrl
                });
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async (overrideValue, isHidden = false) => {
        const textToSend = overrideValue || inputValue;
        if (!textToSend.trim() && !selectedImage) return;

        if (!isHidden) {
            if (textToSend.includes("[ACTIVATING_EXAM_MODE]")) {
                const paperId = textToSend.split("I want to study ")[1];

                // UX FIX: Show "Starting Exam..." instead of raw code
                const friendlyMessage = { role: 'user', content: `Start Mock Exam: ${paperId.split('_').slice(1).join(' ')}` };
                setMessages(prev => [...prev, friendlyMessage]);

                // Save raw command to backend for history consistency (optional, or save friendly)
                saveMessageToBackend({ role: 'user', content: textToSend });

                setMessages(prev => [...prev, { role: 'assistant', content: `Preparing your ${paperId} mock exam...` }]);
                setInputValue('');
                setTimeout(() => {
                    if (paperId.includes('Speaking')) {
                        console.log("Routing to Speaking Exam Page...");
                        navigate(`/speaking-exam/${paperId}`);
                    } else if (paperId.includes('Writing')) {
                        console.log("Routing to Writing Exam Page...");
                        navigate(`/writing/exam/${paperId}`);
                    } else if (paperId.includes('Listening')) {
                        console.log("Routing to Listening Exam Page...");
                        navigate(`/listening/exam/${paperId}`);
                    } else {
                        navigate(`/exam/${paperId}`);
                    }
                }, 1500);
                return;
            }
        }

        // --- REGULAR CHAT FLOW ---
        const userMsg = {
            role: 'user',
            content: textToSend,
            image: selectedImage ? { preview: selectedImage.preview } : null
        };

        // Only add to UI if NOT hidden
        if (!isHidden) {
            setMessages(prev => [...prev, userMsg]);
            saveMessageToBackend(userMsg);
        }
        const currentInput = textToSend;

        if (showChips) setShowChips(false);
        const currentImage = selectedImage;

        setInputValue('');
        setSelectedImage(null);
        setAvatarState('THINKING');
        setStudentState('TALKING');

        // Reset student to idle/listening after they "finish" speaking
        setTimeout(() => setStudentState('IDLE'), 2000);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Prepare history (exclude the very last user message which is being sent now, if it was already added to state? 
            // construct from 'messages' which doesn't have the new user msg yet? 
            // Wait, line 78 adds it to state: `setMessages(prev => [...prev, userMsg]);`
            // But state update is async. `messages` here is still the OLD value.
            // So `messages` is perfect as "history".

            // Prepare history (start from index 0 to include greeting context)
            const history = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model', // Gemini uses 'model'
                parts: [{ text: m.content }]
            }));

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid || 'guest',
                    message: currentInput,
                    image: currentImage ? { data: currentImage.data, mimeType: currentImage.type } : null,
                    history: history,
                    agentId: activeAgentId,
                    outputLanguage: chatLanguage // Pass preference to backend
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(errorData.error || `Server Error (${response.status}): ${response.statusText}`);
            }

            const data = await response.json();

            // Handling [FORCE_TTS] tag for Listening Mode
            let rawReply = data.reply || data.text;
            if (!rawReply) throw new Error("Backend failed to generate a reply.");

            // Type Safety: Ensure replyText is a string even if backend returns an object (e.g. from mock responses)
            let replyText = typeof rawReply === 'object' ? (rawReply.text || JSON.stringify(rawReply)) : String(rawReply);

            const forceTTS = replyText.includes('[FORCE_TTS]');
            const shouldClear = replyText.includes('[TRIGGER_CLEAR]');

            // Check for dynamic student state tag
            const studentStateMatch = replyText.match(/\[STUDENT_STATE:\s*(\w+)\]/);
            let aiSetStudentState = 'LISTENING';
            if (studentStateMatch) {
                aiSetStudentState = studentStateMatch[1].toUpperCase();
                replyText = replyText.replace(studentStateMatch[0], '');
            }

            if (replyText.includes('[REDIRECT_DIAGNOSTIC]')) {
                replyText = replyText.replace('[REDIRECT_DIAGNOSTIC]', '').trim();
                setTimeout(() => {
                    console.log("[Redirect] Heading to Diagnostic...");
                    navigate('/diagnostic', { state: { forceRestart: true } });
                }, 1000); // reduced delay
            }

            // Check for dynamic suggestions tag
            const suggestionsMatch = replyText.match(/\[SUGGESTIONS:\s*([^\]]+)\]/);
            if (suggestionsMatch) {
                const chips = suggestionsMatch[1].split(',').map(s => s.trim());
                setDynamicChips(chips);
                replyText = replyText.replace(suggestionsMatch[0], '');
            }

            // --- MOCK EXAM LISTING TAG ---
            // Regex Update: Handle optional backslashes (AI escaping)
            const mockListMatch = replyText.match(/\\?\[LIST_MOCKS:\s*([^\]]+)\]/);
            if (mockListMatch) {
                const paperType = mockListMatch[1].trim().toLowerCase();
                replyText = replyText.replace(mockListMatch[0], '');

                console.log("Detected Mock List Request for:", paperType);

                // Fetch mocks for this paper
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const endpoint = `/api/${paperType}/exams`;
                    console.log(`Fetching mocks from: ${API_URL}${endpoint}`);

                    fetch(`${API_URL}${endpoint}`)
                        .then(res => {
                            console.log("Mock API Status:", res.status);
                            return res.json();
                        })
                        .then(mocks => {
                            console.log("Mock API Response:", mocks);
                            if (Array.isArray(mocks) && mocks.length > 0) {
                                // OLD CHIP LOGIC REMOVED
                                // New Logic: Append In-Chat Message with Options
                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: `Here are the available ${paperType} mock exams:`,
                                    customComponent: 'active_mock_list',
                                    mocks: mocks,
                                    paperType: paperType
                                }]);

                            } else {
                                console.warn("No mocks found or invalid format:", mocks);
                            }
                        })
                        .catch(err => console.error("Mock fetch error context:", err));
                } catch (e) {
                    console.error("Listing mocks failed catch:", e);
                }
            }

            // Clean tags from display
            replyText = replyText.replace('[FORCE_TTS]', '')
                .replace('[TRIGGER_CLEAR]', '')
                .replace(/\[LIST_MOCKS:\s*([^\]]+)\]/g, '') // Safety double-clean
                .trim();

            const aiMsg = {
                role: 'assistant',
                content: replyText,
                agentId: activeAgentId,
                customComponent: data.customComponent || null,
                payload: data.payload || null,
                examType: data.examType || null,
                isSystemResponse: data.isSystemResponse || isHidden // Mark as system if backend says so or if it was a hidden trigger
            };

            if (shouldClear) {
                // Keep the refusal message but clear history for next turn
                setMessages([aiMsg]);
            } else {
                setMessages(prev => [...prev, aiMsg]);
                saveMessageToBackend(aiMsg);
            }




            // Check for Diagnostic Completion Signal (XP Award Trigger)
            if (data.reply && data.reply.includes('[SYSTEM: DIAGNOSTIC_JUST_COMPLETED]')) {
                console.log("ChatInterface: Diagnostic Just Completed! Triggering XP refresh...");
                // Add small delay to ensure DB write propagates
                setTimeout(() => {
                    const event = new Event('xp_update');
                    window.dispatchEvent(event);
                }, 1500);
            }

            // Check for Quest Completion Signal from AI (Legacy or New)
            // Or if we are in a "Guided Learning" session initiated from Roadmap
            const activeTaskId = location.state?.activeTaskId; // We need to ensure RoadmapWidget passes this!
            if (activeTaskId && (replyText.includes("Great job!") || replyText.includes("lesson complete"))) {
                console.log(`[ChatInterface] Potential Quest Completion for ${activeTaskId}`);
                // Call Backend
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/roadmap/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid, taskId: activeTaskId })
                }).then(res => {
                    if (res.ok) {
                        console.log("Quest Marked Complete!");
                        // Trigger UI Refresh
                        window.dispatchEvent(new Event('xp_update')); // Re-fetch XP and Roadmap
                    }
                });
            }

            // AUTO-LAUNCH LAB: Removed to respect "No Auto-Redirect" rule. 
            // Students must click the Launch Card or confirm via chat.

            setAvatarState('HAPPY'); // Success state
            setStudentState(aiSetStudentState);

            // Speak logic: Speak if NOT muted OR if FORCE_TTS is present
            if (!isMutedRef.current || forceTTS) {
                speakText(replyText, activeAgentId);
            }

            // Reset to IDLE after a few seconds (only if it was the default listening)
            // Reset to IDLE after a few seconds (only if it was the default listening)
            setTimeout(() => {
                setAvatarState('IDLE');
                if (aiSetStudentState === 'LISTENING') setStudentState('IDLE');

                if (messages.length > 0) {
                    setShowChips(true);
                }
            }, 3000);

        } catch (error) {
            console.error('Chat error:', error);
            setAvatarState('UPSET'); // Error state
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}. Please try again.`
            }]);
        } finally {
            // Safety valve: Ensure we never get stuck in "Thinking"
            if (avatarState === 'THINKING') {
                setAvatarState('IDLE');
            }
        }
    };

    // Ensure voices are loaded (Chrome quirk)
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEssayConfirm = (text) => {
        setIsUploaderOpen(false);
        handleSendMessage(`[REQUEST_GRADING] Please grade my essay: \n\n${text}`);
    };

    const handleExamTrigger = async (paperId) => {
        setAvatarState('THINKING');
        // The backend will now detect this trigger and fetch content directly from Firestore
        handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${paperId}`);
    };

    // --- CLEAR HISTORY ---
    const handleClearHistory = () => {
        setIsClearConfirmOpen(true); // Open Modal
    };

    const confirmClearHistory = async () => {
        setIsClearConfirmOpen(false);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/history/${activeAgentId}?uid=${user.uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setMessages([]); // Clear locally
                setDynamicChips([]); // Reset dynamic chips to empty so default suggestionChips are used
                setShowChips(true);
                // Trigger Smart Greeting (Local Translation)
                setMessages([{
                    role: 'assistant',
                    content: (activeAgentId === 'english' && !hasDiagnostic)
                        ? t('chat.greeting_new')
                        : t('chat.greeting_return').replace('{{agentName}}', activeAgent.name),
                    agentId: activeAgentId
                }]);
            } else {
                alert("Failed to clear history.");
            }
        } catch (e) {
            console.error("Clear history error:", e);
        }
    };

    const getPlaceholder = () => {
        if (selectedImage) return t('chat.add_desc');

        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            const text = (lastMsg.content || "").toLowerCase();

            // "What do you want to learn/start" scenarios
            if (text.includes('how can i help') ||
                text.includes('want to learn') ||
                text.includes('want to start') ||
                text.includes('what to focus on') ||
                text.includes('focus for today') ||
                text.includes("what's our focus") ||
                text.includes('anything specific') ||
                text.includes('let me know what') ||
                text.includes('ready for a quick')) {
                return t('chat.type_what_to_study');
            }

            // General questions implies waiting for answer
            if (text.includes('?')) {
                return t('chat.type_answer');
            }
        }

        return t('chat.type_message');
    };

    return (
        <section className={cn(
            "flex flex-col rounded-3xl glass-container shadow-2xl relative overflow-hidden transition-all duration-500",
            isFocusMode
                ? "fixed inset-0 z-[100] rounded-none shadow-none h-screen w-screen"
                : "lg:col-span-9 h-[80vh] min-h-[600px] w-full"
        )}>
            {(!user || (user && !user.emailVerified)) && (
                <div className="absolute inset-0 z-[200] bg-white/50 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
                        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl text-primary font-bold">🔒</span>
                        </div>

                        {!user ? (
                            <AuthForm />
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    We've sent a verification link to <span className="font-bold text-primary">{user.email}</span>.
                                    Please check your inbox (and spam folder) and click the link to activate your free trial.
                                </p>

                                <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700 text-left">
                                    <strong>Note:</strong> Strict verification is required to prevent trial abuse. Disposable emails are not accepted.
                                </div>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                                >
                                    I've Verified My Email
                                </button>

                                <button
                                    onClick={() => verifyEmail(user)}
                                    className="text-xs text-primary font-bold hover:underline"
                                >
                                    Resend Verification Email
                                </button>

                                <div className="border-t pt-4 mt-4">
                                    <button
                                        onClick={() => logout()}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        Sign out and use a different account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Verify-Then-Grade Modal */}
            {isUploaderOpen && (
                <EssayUploader
                    onConfirm={handleEssayConfirm}
                    onCancel={() => setIsUploaderOpen(false)}
                />
            )}

            {/* Header */}
            <div className="px-8 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/30 dark:bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className={cn("size-3 rounded-full transition-colors",
                        avatarState === 'THINKING' ? "bg-yellow-400 animate-pulse" :
                            avatarState === 'UPSET' ? "bg-red-500" : "bg-green-500"
                    )}></div>
                    <div className="flex -space-x-2">
                        <div className="w-[36px] h-[36px] rounded-full border-2 border-white overflow-hidden shadow-sm">
                            <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover" />
                        </div>
                        <div className={cn(
                            "w-[36px] h-[36px] rounded-full border-2 border-white overflow-hidden shadow-sm transition-transform",
                            studentState === 'TALKING' && "scale-110",
                            studentState === 'LISTENING' && "animate-pulse",
                            studentState === 'STUDYING' && "ring-2 ring-indigo-400 opacity-80"
                        )}>
                            <img src={getStudentAvatar()} alt="Student" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1d130c] dark:text-white text-sm">
                            {t('chat.agent_and_you').replace('{{agentName}}', activeAgent.name)}
                        </span>
                    </div>
                </div>

                {/* CENTERED ACTION BUTTONS */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-3">
                    <button
                        onClick={onOpenQuest}
                        disabled={!hasDiagnostic}
                        className={cn(
                            "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 min-w-[120px] justify-center",
                            hasDiagnostic
                                ? "bg-amber-100/80 hover:bg-amber-100 text-amber-700 border-amber-200/50"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200"
                        )}
                        title={hasDiagnostic ? t('nav.view_daily_quest') : t('nav.complete_diagnostic_first')}
                    >
                        {hasDiagnostic ? <Target className="w-5 h-5 stroke-[2.5]" /> : <Lock className="w-4 h-4" />}
                        <span className="text-sm font-black tracking-wide uppercase">{t('nav.quest')}</span>
                    </button>

                    {user && (
                        <button
                            onClick={handleOpenMastery}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 bg-cyan-50 text-cyan-700 border-cyan-200/50 min-w-[120px] justify-center"
                            )}
                            title={t('nav.mastery_compass')}
                        >
                            <Compass className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase">{t('nav.mastery_compass')}</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-primary/60 dark:text-primary/40 uppercase tracking-widest hidden sm:block text-right min-w-[120px]">
                        {avatarState === 'THINKING' ? t('chat.ai_thinking') :
                            studentState === 'TALKING' ? t('chat.you_speaking') :
                                studentState === 'STUDYING' ? t('chat.you_studying') :
                                    ''}
                    </div>
                    {/* Clear History Button */}
                    {user && (
                        <button
                            onClick={handleClearHistory}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-red-500 group relative"
                            title={t('chat.clear_history') || "Clear Conversation"}
                        >
                            <div className="relative">
                                <MessageSquare className="size-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                                <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-[#1a110a] rounded-full border border-white dark:border-[#1a110a]">
                                    <CircleX className="size-3.5 text-gray-400 group-hover:text-red-500 fill-white dark:fill-[#3d2c20] transition-colors" />
                                </div>
                            </div>
                        </button>
                    )}



                    <button
                        onClick={() => setIsEnlarged(!isEnlarged)}
                        className={cn(
                            "p-1.5 bg-white/50 dark:bg-white/5 text-primary/60 border border-transparent hover:border-primary/20 transition-all rounded-md flex items-center gap-1.5 text-xs font-medium",
                            isEnlarged
                                ? "bg-primary text-white border-primary"
                                : "bg-white/50 dark:bg-white/5 text-primary/60 border-primary/20 hover:border-primary/40"
                        )}
                        title={isEnlarged ? t('chat.reduce_font') : t('chat.enlarge_font')}
                    >
                        <Type className="size-3" />
                        <span>{isEnlarged ? t('chat.small') : t('chat.enlarge')}</span>
                    </button>

                    {/* Language Toggle Button */}
                    <button
                        onClick={() => {
                            const newLang = chatLanguage === 'en' ? 'zh-HK' : 'en';
                            setChatLanguage(newLang);
                            toggleLanguage(); // Sync UI language
                        }}
                        className={cn(
                            "p-1.5 border border-transparent hover:border-primary/20 transition-all rounded-md flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide",
                            chatLanguage === 'en'
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                : "bg-red-100 text-red-700 border-red-200" // Canto/Trad Chi color
                        )}
                        title="Switch AI Response Language"
                    >
                        <span className="opacity-60">→</span>
                        {chatLanguage === 'en' ? '繁體' : 'ENG'}
                    </button>
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className="p-2 text-primary/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                        title={isFocusMode ? t('chat.exit_focus') : t('chat.focus_mode')}
                    >
                        {isFocusMode ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Chat Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex items-start gap-4 max-w-[80%]", msg.role === 'user' ? "ml-auto justify-end" : "")}>

                        {/* AI Avatar (Left) */}
                        {msg.role === 'assistant' && (
                            <div className="w-[44px] h-[44px] shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm">
                                <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover object-top" />
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div className={cn(
                            "rounded-2xl shadow-sm border border-black/5 flex flex-col gap-3 transition-all",
                            isEnlarged ? "p-5" : "p-4",
                            msg.role === 'user'
                                ? "bg-primary/10 dark:bg-primary/20 rounded-tr-none"
                                : "bg-white dark:bg-[#3d2c20] rounded-tl-none"
                        )}>
                            {msg.image && (
                                <img src={msg.image.preview} alt="Uploaded handwriting" className="max-w-xs rounded-lg border border-black/10 shadow-sm" />
                            )}
                            <p className={cn(
                                "text-[#1d130c] dark:text-white whitespace-pre-wrap transition-all",
                                isEnlarged ? "text-[16px] leading-relaxed" : "text-[14px] leading-snug"
                            )}>
                                {formatMessageContent(msg.content)}
                            </p>
                            {/* Custom Component: Active Mock List (Just Generated) */}
                            {msg.customComponent === 'active_mock_list' && (
                                <div className="mt-4 grid gap-2">
                                    {msg.mocks.map((mock, mIdx) => (
                                        <button
                                            key={mIdx}
                                            onClick={() => handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${mock.id}`)}
                                            className="text-left w-full p-3 bg-white hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30 border border-black/5 rounded-xl transition-all group flex items-center justify-between shadow-sm"
                                        >
                                            <div>
                                                <div className="font-bold text-primary text-sm">📝 {mock.title}</div>
                                                {/* Description removed per user request */}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.customComponent === 'exam_link' && (
                                <div className="mt-4 space-y-3">
                                    {(msg.examType === 'writing' ? writingExams : (msg.examType === 'listening' ? listeningExams : (msg.examType === 'speaking' ? speakingExams : mockExams))).length === 0 ? (
                                        <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-500 italic">
                                            {t('chat.no_mock_exams')}
                                        </div>
                                    ) : (
                                        (msg.examType === 'writing' ? writingExams : (msg.examType === 'listening' ? listeningExams : (msg.examType === 'speaking' ? speakingExams : mockExams))).map(exam => (
                                            <Link
                                                key={exam.id}
                                                to={
                                                    msg.examType === 'writing' ? `/writing/exam/${exam.id}` :
                                                        msg.examType === 'listening' ? `/listening/exam/${exam.id}` :
                                                            msg.examType === 'speaking' ? `/speaking-exam/${exam.id}` :
                                                                `/exam/${exam.id}`
                                                }
                                                className="block p-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all group"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-primary">{exam.title}</h4>
                                                        <p className="text-xs text-[#a16b45] mt-1">
                                                            {msg.examType === 'speaking' ? '' : (exam.topic || exam.topic_category) + ' • '}
                                                            {
                                                                msg.examType === 'writing' ? '120 min' :
                                                                    msg.examType === 'listening' ? '60 min' :
                                                                        msg.examType === 'speaking' ? '20 min' :
                                                                            `${exam.reading_time_minutes} min`
                                                            }
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                            {msg.customComponent === 'launch_card' && (
                                <LaunchCard
                                    payload={msg.payload}
                                    onLaunch={(payload) => {
                                        // If it's EXAM_ROUTER, use existing exam logic, otherwise open Lab
                                        if (payload.module === 'EXAM_ROUTER') {
                                            handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${payload.params.type}`);
                                        } else {
                                            const params = payload.params || {};
                                            const searchParams = new URLSearchParams();
                                            if (params.topic) searchParams.set('topic', params.topic);
                                            if (params.level) searchParams.set('level', params.level);
                                            if (params.focus && Array.isArray(params.focus)) {
                                                params.focus.forEach(f => searchParams.append('focus', f));
                                            }
                                            navigate(`/lab?${searchParams.toString()}`);
                                        }
                                    }}
                                />
                            )}
                        </div>

                        {/* User Avatar (Right) */}
                        {/* User Avatar (Right) */}
                        {msg.role === 'user' && (
                            <div className="w-[44px] h-[44px] shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                <img
                                    src={getStudentAvatar()}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                ))}

                {/* Thinking Indicator */}
                {avatarState === 'THINKING' && (
                    <div className="flex items-start gap-4 max-w-[80%]">
                        <div className="size-10 shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm">
                            <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="bg-white dark:bg-[#3d2c20] p-4 rounded-2xl rounded-tl-none shadow-sm border border-black/5">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/60 dark:bg-white/5 flex flex-col gap-4">
                {/* Suggestion Chips */}
                {showChips && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-2 px-2">
                        {/* Mock Exam Button - Shown if diagnostic is done */}
                        {hasDiagnostic && (
                            <button
                                onClick={() => handleSendMessage("Start Mock Exam")}
                                className="whitespace-nowrap px-4 py-2 rounded-full border border-primary/40 bg-primary/5 text-sm font-bold text-primary hover:bg-primary hover:text-white hover:scale-105 transition-all shadow-sm flex items-center gap-2"
                            >
                                <span>🚀</span>
                                {t('chat.start_mock')}
                            </button>
                        )}

                        {/* Dynamic AI Chips */}
                        {/* Dynamic AI Chips */}
                        {(dynamicChips.length > 0
                            ? dynamicChips.filter(c => {
                                const val = typeof c === 'string' ? c : c.value;
                                const lbl = typeof c === 'string' ? c : c.label;
                                // 1. Filter out Mock Exam duplicates
                                if (["Start Mock Exam", "Start mock exam", "模擬考試", "開始模擬考試"].includes(val)) return false;

                                // 2. Semantic Deduplication (The Fix)
                                // If we have "Yes, please", remove "Yes".
                                // Strategy: If this chip is a substring of another chip in the SAME list, drop it?
                                // Or explicitly filter out known weak duplicates if a strong one exists.
                                const lowerVal = val.toLowerCase();
                                if (lowerVal === 'yes' || lowerVal === 'ok' || lowerVal === 'sure') {
                                    // Check if a "better" version exists in the list
                                    const hasBetter = dynamicChips.some(other => {
                                        const otherVal = (typeof other === 'string' ? other : other.value).toLowerCase();
                                        return otherVal !== lowerVal && (otherVal.includes('yes') || otherVal.includes('please') || otherVal.includes('sure'));
                                    });
                                    if (hasBetter) return false;
                                }
                                return true;
                            })
                            : suggestionChips.filter(c => c.value !== "Start Mock Exam")
                        )
                            .map((item, idx) => {
                                // Handle dynamic vs static chips
                                const label = typeof item === 'string' ? item : item.label;
                                const value = typeof item === 'string' ? item : item.value;

                                // Check if this is the "Start Calibration" chip
                                const isCalibration = value === "I want to start the diagnostic test";
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(value)}
                                        className={cn(
                                            "whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm flex items-center gap-2",
                                            isCalibration
                                                ? "bg-orange-500 border-orange-600 text-white hover:bg-orange-600 hover:scale-105"
                                                : "border-primary/20 bg-white/90 dark:bg-white/10 text-[#a16b45] dark:text-gray-200 hover:border-primary hover:text-primary hover:scale-105"
                                        )}
                                    >
                                        {isCalibration && <Zap className="size-4 text-white fill-white" />}
                                        {label}
                                    </button>
                                )
                            })}
                    </div>
                )}

                <div className="flex items-center gap-3 bg-white/80 dark:bg-white/10 rounded-2xl p-2 shadow-sm border border-black/5 dark:border-white/10">


                    {/* Mute Toggle */}
                    <button
                        onClick={() => {
                            const newMute = !isMuted;
                            setIsMuted(newMute);
                            isMutedRef.current = newMute;
                            if (newMute) window.speechSynthesis.cancel();
                        }}
                        className={cn("p-2 transition-colors rounded-full", isMuted ? "text-gray-400" : "text-green-500 hover:text-green-600")}
                        title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={cn("p-2 transition-colors rounded-full relative", selectedImage ? "text-primary" : "text-[#a16b45] hover:text-primary")}
                        title="Upload Handwriting / Photo"
                    >
                        <Paperclip className="w-5 h-5" />
                        {selectedImage && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setIsUploaderOpen(true)}
                        className="p-2 text-[#a16b45] hover:text-primary transition-colors rounded-full"
                        title="Analyze Handwriting (Grade Essay)"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleVoiceRecording}
                        className={cn(
                            "p-2 transition-all rounded-full relative",
                            isRecording ? "bg-red-500 text-white animate-pulse" : "text-[#a16b45] hover:text-primary"
                        )}
                        title={isRecording ? `Recording... ${recordingTime}s / 30s` : "Record your voice for pronunciation feedback"}
                    >
                        <Radio className="w-5 h-5" />
                        {isRecording && (
                            <>
                                {/* Pulsing red dot indicator */}
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                {/* Recording timer */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                                    🔴 {recordingTime}s / 30s
                                </div>
                            </>
                        )}
                    </button>
                    <div className="flex-1 flex flex-col relative">
                        {selectedImage && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-[#1a110a] rounded-xl shadow-lg border border-primary/20 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                <img src={selectedImage.preview} className="size-12 rounded-lg object-cover" alt="Preview" />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1 hover:bg-black/5 rounded-full text-red-500"
                                >
                                    <VolumeX className="size-4 rotate-45" /> {/* Using VolumeX rotated as a close button hack or just Lucide X if I had it, but keeping it simple */}
                                </button>
                            </div>
                        )}
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#1d130c] dark:text-white placeholder-[#a16b45]/50 px-2 h-10"
                            placeholder={getPlaceholder()}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={avatarState === 'THINKING'}
                        />
                    </div>
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={avatarState === 'THINKING'}
                        className="bg-primary text-white p-3 rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>


            </div>
            {/* RoadmapModal moved to Parent (Dashboard) */}

            {/* Confirmation Modal for Clearing History */}
            {isClearConfirmOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a110a] rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-white/10 scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Clear History?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            This will permanently delete your conversation history with this agent. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsClearConfirmOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearHistory}
                                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mastery Compass Modal */}
            <MasteryModal
                isOpen={isMasteryOpen}
                onClose={() => setIsMasteryOpen(false)}
                skillData={masteryData}
                history={masteryHistory}
            />
        </section>
    );
};

export default ChatInterface;
