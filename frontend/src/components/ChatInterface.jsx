import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAvatar } from '../context/AvatarContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Radio, Paperclip, Send, Volume2, VolumeX, Edit3, Type, Maximize2, Minimize2, X, MessageSquare, CircleX, Trophy, Lock, Zap, Target, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn'; // Reusing cn utility
import EssayUploader from './EssayUploader';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { getAdditionalUserInfo, deleteUser } from 'firebase/auth'; // Import for Google Sign-In handling
import { db } from '../firebase';
import LaunchCard from './LaunchCard';
import AuthForm from './AuthForm';
// Mastery modals removed - now dedicated pages
import DreamProgramsModal from './dashboard/DreamProgramsModal'; // Ace Sir - Dream University List
import { getUserMastery, getMasteryHistory } from '../services/masteryService';
import { Compass } from 'lucide-react';
import { MathsLab, MathsDiagnostic } from './maths';
import { SafeInlineMath, SafeBlockMath } from './maths/SafeMath';
import { splitContentByDelimiters } from '../utils/mathFormattingUtils';
import PolisherCard from './tutor/PolisherCard';
import DecoderCard from './tutor/DecoderCard';
import VocabCard from './tutor/VocabCard';
// RoadmapModal import removed - hoisted to Dashboard

const getSuggestionChips = (t) => ({
    guest: [
        { label: t('chat.what_is_ace_it'), value: "What is Ace It?", emoji: "🤔" },
        { label: t('chat.start_diagnostic'), value: "I want to start the diagnostic test", emoji: "📋" },
    ],
    member: [
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

/**
 * Robust chat message formatter that handles:
 * - Markdown bold (**text**)
 * - LaTeX inline math: $...$ and \(...\)
 * - LaTeX block math: $$...$$ and \[...\]
 * - Markdown headers: ### heading
 * - Cleans stray backslashes from legacy AI messages
 */
const formatMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    const cleanContent = content.replace(/\n{3,}/g, '\n\n');

    // Unified regex to split by ALL math delimiter types + bold + headers
    // Order matters: longest/most-specific patterns first
    // 1. $$...$$ (block math)
    // 2. \[...\] (block math, escaped)
    // 3. \(...\) (inline math, escaped)
    // 4. $...$ (inline math, non-greedy, must not match $$)
    // 5. **...** (bold)
    // 6. ### (header lines)
    const UNIFIED_REGEX = /(\$\$[\s\S]*?\$\$|\\?\\\[[\s\S]*?\\?\\\]|\\?\\\([\s\S]*?\\?\\\)|(?<!\$)\$(?!\$)(?:[^$\\]|\\.)*?\$(?!\$)|\*\*(?:.*?)\*\*|^###\s+(?:.+)$)/gm;

    const parts = cleanContent.split(UNIFIED_REGEX);
    
    return parts.map((part, idx) => {
        if (!part && part !== '') return null;
        if (part === undefined) return null;
        const key = `fmt-${idx}`;
        
        // Block Math: $$...$$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
            const mathStr = part.slice(2, -2).trim();
            return <SafeBlockMath key={key} math={mathStr} />;
        }
        
        // Block Math: \[...\] (may have optional leading \)
        if (/^\\?\\\[/.test(part) && /\\?\\\]$/.test(part)) {
            const mathStr = part.replace(/^\\?\\\[/, '').replace(/\\?\\\]$/, '').trim();
            return <SafeBlockMath key={key} math={mathStr} />;
        }
        
        // Inline Math: \(...\) (may have optional leading \)
        if (/^\\?\\\(/.test(part) && /\\?\\\)$/.test(part)) {
            let mathStr = part.replace(/^\\?\\\(/, '').replace(/\\?\\\)$/, '').trim();
            // Clean trailing stray backslashes from legacy AI output
            mathStr = mathStr.replace(/\\+$/, '').trim();
            return <SafeInlineMath key={key} math={mathStr} />;
        }
        
        // Inline Math: $...$
        if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$') && part.length > 2) {
            const mathStr = part.slice(1, -1).trim();
            if (mathStr.length > 0) {
                return <SafeInlineMath key={key} math={mathStr} />;
            }
        }

        // Bold: **text** (captured group from regex)
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={key} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        
        // Header: ### heading
        if (part.startsWith('### ')) {
            return <div key={key} className="font-bold text-base mt-3 mb-1">{part.slice(4)}</div>;
        }

        // Regular Text
        return <span key={key}>{part}</span>;
    }).filter(Boolean);
};

const ChatInterface = ({ onOpenQuest }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        activeAgent, activeAgentId, setActiveAgentId, 
        avatarState, setAvatarState, 
        studentState, setStudentState, 
        isFocusMode, setIsFocusMode,
        equipment, syncEquipment 
    } = useAvatar();
    const { user, loginWithGoogle, logout, verifyEmail } = useAuth(); // Destructure all needed methods
    const { t, toggleLanguage, language } = useLanguage();

    // State definitions moved to top
    const [hasDiagnostic, setHasDiagnostic] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);


    // Dynamic Chips Logic based on User State
    const suggestionChips = (() => {
        if (activeAgentId === 'ace') {
            const subject = user?.dreamSubject || "夢想學科";
            return [
                { label: "幫我分析 Best 5", value: "我想要分析我嘅 Best 5 成績估計", emoji: "📊" },
                { label: `分析 ${subject} 收生要求`, value: `我想知 ${subject} 嘅收生要求同 Career Path`, emoji: "🎓" },
                { label: "有咩奪星策略？", value: "話俾我聽點樣可以攞到 5* 甚至 5**？", emoji: "💡" }
            ];
        }
        if (!hasDiagnostic) {
            return [
                { label: t('chat.what_is_ace_it'), value: "What is Ace It?", emoji: "🤔" },
                { label: t('chat.start_mock'), value: "I want to try a mock exam", emoji: "📝" }
            ];
        } else {
            return [
                { label: "What should I focus on?", value: "Analyze my recent performance and tell me what to focus on today.", emoji: "🧠" }
            ];
        }
    })();

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // { data: base64, type: mimeType, preview: url }
    // isQuestOpen removed - controlled by parent
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const lastUserMessageRef = useRef(null);
    const isHistoryScrolledRef = useRef(false);
    const sectionRef = useRef(null);
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
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [isImageConfirmOpen, setIsImageConfirmOpen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const [hasStartedTyping, setHasStartedTyping] = useState(false); // Tracks if user modified the default prompt
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);
    const [gender, setGender] = useState(null);


    const [isNewStudent, setIsNewStudent] = useState(true); // Default to true until fetched
    const idleTimerRef = useRef(null);

    // Mastery Compass State - Redirects to dedicated pages
    const [isDreamProgramsOpen, setIsDreamProgramsOpen] = useState(false); // Ace Sir - Dream University List

    const handleOpenMastery = () => {
        if (!user) return;
        if (activeAgentId === 'math') {
            navigate('/maths/ability');
        } else {
            navigate('/english/mastery');
        }
    };

    const speakText = (text, agentId) => {
        if (!text || isMutedRef.current) return;

        // Clean text for speech: remove markdown, LaTeX, and system tags
        const cleanText = text
            .replace(/\[SYSTEM:.*?\]/g, '')
            .replace(/\[FORCE_TTS\]/g, '')
            .replace(/\[TRIGGER_CLEAR\]/g, '')
            .replace(/\[STUDENT_STATE:.*?\]/g, '')
            .replace(/\[REDIRECT_DIAGNOSTIC\]/g, '')
            .replace(/\[LIST_MOCKS:.*?\]/g, '')
            .replace(/\$\$[\s\S]*?\$\$/g, ' [mathematical expression] ')
            .replace(/\\\[[\s\S]*?\\\]/g, ' [mathematical expression] ')
            .replace(/\\\(|\\\)/g, '')
            .replace(/\*\*|__/g, '')
            .replace(/###\s/g, '')
            .replace(/\\/g, '') // Clean stray backslashes
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        
        let selectedVoice = null;
        const isEnglish = agentId === 'english';

        if (isEnglish) {
            selectedVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Google'))) || voices[0];
        } else {
            selectedVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Male')) || voices[0];
        }

        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };


    const getStudentAvatar = () => {
        return equipment.student?.image || '/avatars/student_male_1.jpg';
    };

    const isProcessedRef = useRef(false);

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
        setDynamicChips([]); // Reset dynamic chips on agent switch
        setMessages([]); // Clear messages immediately for instant feedback
        setIsHistoryLoading(true);
        setHasDiagnostic(false);

        const fetchHistory = async () => {
            if (user) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                    // 1 & 2. Parallelize Fetches
                    const [statsRes, historyRes] = await Promise.all([
                        fetch(`${API_URL}/api/stats?uid=${user.uid}`).catch(err => {
                            console.warn("Stats fetch failed", err);
                            return { ok: false };
                        }),
                        fetch(`${API_URL}/api/history/${activeAgentId}?uid=${user.uid}`).catch(err => {
                            console.warn("History fetch failed", err);
                            return { ok: false };
                        })
                    ]);

                    let currentHasDiagnostic = false;
                    if (statsRes.ok) {
                        const statsData = await statsRes.json();
                        if (statsData.gender) setGender(statsData.gender);
                        if (statsData.is_new_student !== undefined) setIsNewStudent(statsData.is_new_student);

                        currentHasDiagnostic = typeof statsData?.hasDiagnostic === 'object' && statsData?.hasDiagnostic !== null
                            ? (activeAgentId === 'math' ? statsData.hasDiagnostic.maths : statsData.hasDiagnostic.english)
                            : statsData?.hasDiagnostic === true;
                    }

                        setHasDiagnostic(currentHasDiagnostic);

                    // Sync equipment before greeting
                    await syncEquipment();

                    let visibleHistory = [];
                    if (historyRes.ok) {
                        const history = await historyRes.json();
                        visibleHistory = history.filter(m =>
                            !m.content.includes('[SYSTEM:') &&
                            !m.content.includes('[ACTIVATING_EXAM_MODE]')
                        );
                    }

                    if (visibleHistory.length > 0) {
                        setMessages(visibleHistory);
                        setShowChips(true);
                    } else {
                        let initialContent;
                        const agentName = equipment.tutor?.name || activeAgent?.name || "Ace Sir";
                        const userName = user?.displayName || user?.email?.split('@')[0] || "小戰士";

                        if (activeAgentId === 'ace') {
                            const subject = user?.dreamSubject;
                            initialContent = subject
                                ? `你好 ${userName}！我係 Ace Sir。聽講你目標係入 **${subject}**？同我講你嘅計劃，我幫你制定 DSE 奪星策略，確保你穩入大學！`
                                : `你好 ${userName}！我係 Ace Sir。想入邊間大學？同我講你嘅目標，我幫你制定全方位奪星藍圖，助你進軍大學、稱霸 DSE！`;
                        } else if (['english', 'math'].includes(activeAgentId) && !currentHasDiagnostic) {
                            // Always use greeting_new for new students, which now has no calibration mention
                            initialContent = t('chat.greeting_new', { agentName, userName });
                        } else {
                            initialContent = t('chat.greeting_return', { agentName, userName });
                        }

                        setMessages([{
                            role: 'assistant',
                            content: initialContent,
                            agentId: activeAgentId
                        }]);
                        setShowChips(true);
                    }

                    // 3. Process Post-Activity State SEQUENTIALLY after history is loaded
                    if (!isProcessedRef.current) {
                        const searchParams = new URLSearchParams(location.search);
                        const questCompleted = searchParams.get('quest_completed');
                        const questTopic = searchParams.get('topic');

                        if (questCompleted === 'true' || location.state?.questCompleted) {
                            isProcessedRef.current = true;
                            const topicToReport = questTopic || location.state?.topic || 'Activity';
                            handleSendMessage(`[SYSTEM: QUEST_COMPLETED: ${topicToReport}]`, true);
                            navigate('/dashboard', { replace: true, state: {} });
                            window.history.replaceState({}, document.title);
                        } else if (location.state?.diagnosticCompleted) {
                            isProcessedRef.current = true;
                            setHasDiagnostic(true);
                            const criticalAreas = location.state.criticalAreas || [];
                            const archetype = location.state.archetype || "Student";
                            if (location.state.activeAgentId) {
                                setActiveAgentId(location.state.activeAgentId);
                            }
                            setDynamicChips(criticalAreas);
                            handleSendMessage(`[SYSTEM: DIAGNOSTIC_JUST_COMPLETED: ${archetype}]`, true);
                            window.history.replaceState({}, document.title);
                            navigate('/dashboard', { replace: true, state: {} });
                        } else if (location.state?.labCompleted) {
                            isProcessedRef.current = true;
                            const { topic, earnedXp, masteryScore } = location.state;
                            handleSendMessage(`[SYSTEM: LAB_COMPLETED: ${topic} | XP: ${earnedXp || 0} | Mastery: ${masteryScore || 0}%]`, true);
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
                    }
                } catch (err) {
                    console.error("fetchHistory failed", err);
                } finally {
                    setIsHistoryLoading(false);
                }
            } else {
                // GUEST MODE
                const agentName = activeAgent?.name || "Ace Sir";
                const userName = "小戰士";
                let content = ['english', 'math'].includes(activeAgentId)
                    ? t('chat.greeting_new', { agentName, userName })
                    : t('chat.greeting_generic', { agentName, userName });

                setMessages([{
                    role: 'assistant',
                    content: content,
                    agentId: activeAgentId
                }]);
                setShowChips(true);
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
        setAvatarState('IDLE');
    }, [activeAgentId, setAvatarState, activeAgent.name, user]);




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
        console.log(`[ChatInterface] File selected:`, file ? file.name : 'none');
        
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            console.warn('[ChatInterface] Unsupported file type:', file.type);
            alert("Matt sir currently only supports Image files (JPG, PNG) for handwriting analysis. Please take a photo of your work!");
            return;
        }

        // Restriction: Guest 1-upload limit
        if (!user) {
            const uploadedImages = messages.filter(m => m.role === 'user' && m.image).length;
            if (uploadedImages >= 1) {
                alert("Guest preview: You can only upload 1 handwriting sample per session. Sign up to upload more!");
                return;
            }
        }

        const reader = new FileReader();
        console.log(`[ChatInterface] Starting file read...`);
        
        reader.onload = () => {
            console.log(`[ChatInterface] FileReader finished. Status: ${reader.readyState}`);
            const base64Data = reader.result.split(',')[1];
            
            const previewUrl = URL.createObjectURL(file);
            setSelectedImage({
                data: base64Data,
                type: file.type,
                preview: previewUrl
            });
            console.log(`[ChatInterface] Selected image state set successfully.`);
            
            // Trigger the Image Analysis Popup
            const defaultPrompt = activeAgentId === 'math' 
                ? "Please analyse my Math question" 
                : "Please analyze my handwriting";
            setImagePrompt(defaultPrompt);
            setHasStartedTyping(false);
            setIsImageConfirmOpen(true);
        };
        
        reader.onerror = (err) => {
            console.error('[ChatInterface] FileReader error:', err);
            alert("Failed to read the file. Please try again.");
        };

        reader.readAsDataURL(file);
    };



    const handleSendMessage = async (overrideValue, isHidden = false) => {
        const textToSend = overrideValue || inputValue;
        if (!textToSend.trim() && !selectedImage) return;

        if (!isHidden) {
            // --- MATHS DIAGNOSTIC INTERCEPT ---
            if (textToSend === "I want to start the diagnostic test" && activeAgentId === 'math') {
                const userMsg = { role: 'user', content: textToSend };
                setMessages(prev => [...prev, userMsg]);
                saveMessageToBackend(userMsg); // Save for history

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Let's calibrate your Maths skills! Opening the assessment now... 📐",
                    agentId: 'math'
                }]);

                setTimeout(() => {
                    navigate('/maths-diagnostic', { state: { forceRestart: true } });
                }, 1500);
                return;
            }

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
                    // Consolidate all legacy exam activations to the new Mock Library
                    navigate('/mock-exam', { state: { autoSelectId: paperId } });
                }, 1500);
                return;
            }
        }

        // --- REGULAR CHAT FLOW ---
        let finalMessage = textToSend;
        if (!finalMessage.trim() && selectedImage) {
            // Default text for image-only uploads to provide context in the bubble
            finalMessage = activeAgentId === 'math' ? "[Math Problem Assessment]" : "[Handwriting Analysis]";
        }

        const saveMessageToBackend = async (msg) => {
            if (!user) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const token = await user.getIdToken();
                await fetch(`${API_URL}/api/history/${activeAgentId}?uid=${user.uid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(msg)
                });
            } catch (err) {
                console.error("Failed to save message to history:", err);
            }
        };

        const userMsg = {
            role: 'user',
            content: finalMessage,
            image: selectedImage ? { preview: selectedImage.preview } : null
        };

        // Only add to UI if NOT hidden
        if (!isHidden) {
            setMessages(prev => [...prev, userMsg]);
            saveMessageToBackend(userMsg);
        }

        const currentInput = finalMessage;

        if (showChips) setShowChips(false);
        const currentImage = selectedImage;

        setInputValue('');
        setSelectedImage(null);
        setAvatarState('THINKING');
        if (currentImage) setIsAnalyzingImage(true);
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
                    outputLanguage: language // Pass preference to backend
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

            // Type Safety: Ensure replyText is a string even if backend returns an object
            let replyText = '';
            let parsedReply = null;

            if (typeof rawReply === 'string' && (rawReply.trim().startsWith('{') || rawReply.trim().startsWith('['))) {
                try {
                    parsedReply = JSON.parse(rawReply);
                } catch (e) {
                    // Not valid JSON, treat as string
                }
            } else if (typeof rawReply === 'object') {
                parsedReply = rawReply;
            }

            if (parsedReply) {
                replyText = parsedReply.text || parsedReply.reply || (typeof rawReply === 'string' ? rawReply : JSON.stringify(parsedReply));
                if (parsedReply.suggested_chips && Array.isArray(parsedReply.suggested_chips)) {
                    setDynamicChips(parsedReply.suggested_chips);
                }
            } else {
                replyText = String(rawReply);
            }

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
                    const targetPath = activeAgentId === 'math' ? '/maths-diagnostic' : '/diagnostic';
                    navigate(targetPath, { state: { forceRestart: true } });
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

            setAvatarState('HAPPY'); // Success state - moved up to prevent auto-scroll jump when msg arrives
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
            console.log(`[ChatInterface] Finally reached. Resetting states...`);
            setIsAnalyzingImage(false);
            // Safety valve: Unconditionally reset to IDLE if we are stuck in THINKING
            // Use functional update to avoid stale closure issues
            setAvatarState(prev => prev === 'THINKING' ? 'IDLE' : prev);
        }

    };
    
    // --- VOICE RECORDING LOGIC ---
    const handleVoiceRecording = () => {
        if (!isRecording) {
            // Start recording (simulated for UI feedback in this version)
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 30) {
                        clearInterval(recordingTimerRef.current);
                        setIsRecording(false);
                        handleSendMessage("[VOICE_RECORDING_TIMEOUT] I've finished recording my pronunciation.");
                        return 30;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            // Stop recording
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setIsRecording(false);
            handleSendMessage(`[VOICE_RECORDING_STOPPED] I've finished recording my pronunciation. Duration: ${recordingTime}s`);
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

        // --- CUSTOM PER-AGENT PLACEHOLDERS ---
        if (activeAgentId === 'ace') return t('chat.placeholder_ace');
        if (activeAgentId === 'math') return t('chat.placeholder_math');
        if (activeAgentId === 'english') return t('chat.placeholder_english');

        return t('chat.type_message');
    };

    const content = (
        <section 
            ref={sectionRef}
            className={cn(
            "flex flex-col rounded-3xl glass-container shadow-2xl relative overflow-hidden transition-all duration-500",
            isFocusMode
                ? "!fixed !top-0 !left-0 !m-0 inset-0 z-[999] rounded-none shadow-none h-screen w-screen flex flex-col overflow-hidden"
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
                    <div className="flex -space-x-2">
                        <div className="relative">
                            <div className={cn(
                                "w-[36px] h-[36px] rounded-full border-2 border-white overflow-hidden shadow-sm transition-all",
                                (avatarState === 'TALKING' || avatarState === 'THINKING') && "animate-talking-glow ring-2 ring-green-400"
                            )}>
                                <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover" />
                            </div>
                            {/* Status Dot */}
                            <div className={cn(
                                "absolute -top-0.5 -right-0.5 size-3 rounded-full border-[1.5px] border-white z-10 transition-colors",
                                avatarState === 'THINKING' ? "bg-yellow-400 animate-pulse" :
                                    avatarState === 'UPSET' ? "bg-red-500" : "bg-green-500"
                            )}></div>
                        </div>
                        <div className={cn(
                            "w-[36px] h-[36px] rounded-full border-2 border-white overflow-hidden shadow-sm transition-transform relative",
                            studentState === 'TALKING' && "ring-2 ring-green-400 animate-talking-glow",
                            studentState === 'LISTENING' && "animate-pulse",
                            studentState === 'STUDYING' && "ring-2 ring-indigo-400 opacity-80"
                        )}>
                            <img src={getStudentAvatar()} alt="Student" className="w-full h-full object-cover" />
                            {equipment.frame && (
                                <img src={equipment.frame.image} alt="Frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110" />
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">
                            {equipment.tutor?.name || activeAgent.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                            {activeAgent.headerInfo}
                        </span>
                    </div>
                </div>

                {/* CENTERED ACTION BUTTONS */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-3">
                    {activeAgentId !== 'ace' && (
                        <button
                            onClick={() => onOpenQuest(activeAgentId)}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 min-w-[120px] justify-center",
                                "bg-amber-100/80 hover:bg-amber-100 text-amber-700 border-amber-200/50"
                            )}
                            title={t('nav.view_daily_quest')}
                        >
                            <Target className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase whitespace-nowrap">{t('nav.quest')}</span>
                        </button>
                    )}

                    {/* NEW: MOCK EXAM BUTTON - Always Unlocked */}
                    {user && activeAgentId !== 'ace' && (
                        <button
                            onClick={() => navigate('/mock-exam')}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 min-w-[120px] justify-center",
                                "bg-indigo-50 text-indigo-700 border-indigo-200/50"
                            )}
                            title="Enter Mock Exam Hall"
                        >
                            <BookOpen className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase whitespace-nowrap">{t('nav.mock_exam') || "Mock Exam"}</span>
                        </button>
                    )}

                    {user && activeAgentId !== 'ace' && (
                        <button
                            onClick={handleOpenMastery}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 min-w-[120px] justify-center",
                                "bg-cyan-50 text-cyan-700 border-cyan-200/50"
                            )}
                            title={t('nav.mastery_compass')}
                        >
                            <Compass className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase whitespace-nowrap">
                                {activeAgentId === 'math' ? t('math_ability.title') : t('nav.mastery_compass')}
                            </span>
                        </button>
                    )}

                    {/* Dream Programs Button - Ace Sir Only */}
                    {user && activeAgentId === 'ace' && (
                        <button
                            onClick={() => setIsDreamProgramsOpen(true)}
                            className={cn(
                                "px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm border hover:shadow-md active:scale-95 bg-orange-50 text-orange-700 border-orange-200/50 min-w-[120px] justify-center"
                            )}
                            title="夢想學科清單"
                        >
                            <Target className="w-5 h-5 stroke-[2.5]" />
                            <span className="text-sm font-black tracking-wide uppercase">夢想學科</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-primary/60 dark:text-primary/40 uppercase tracking-widest hidden sm:block text-right min-w-[120px]">
                        {/* Status text removed at user request */}
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
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 flex flex-col justify-start gap-6 min-h-0">
                {/* Skeleton Loading State */}
                {isHistoryLoading && (
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={cn(
                                "flex items-start gap-4 animate-pulse",
                                i % 2 === 0 ? "ml-auto justify-end" : ""
                            )}>
                                {i % 2 !== 0 && (
                                    <div className="w-[44px] h-[44px] rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                                )}
                                <div className={cn(
                                    "h-20 w-64 rounded-2xl bg-gray-100 dark:bg-gray-800",
                                    i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"
                                )} />
                                {i % 2 === 0 && (
                                    <div className="w-[44px] h-[44px] rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isLastUserMsg = msg.role === 'user' && idx === messages.findLastIndex(m => m.role === 'user');

                    return (
                        <div
                            key={idx}
                            ref={isLastUserMsg ? lastUserMessageRef : null}
                            className={cn(
                                "flex items-start gap-4 transition-all duration-300",
                                msg.role === 'user' ? "ml-auto justify-end max-w-[80%]" : "max-w-[95%]"
                            )}
                        >

                            {/* AI Avatar (Left) */}
                            {msg.role === 'assistant' && (
                                <div className={cn(
                                    "w-[44px] h-[44px] shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm transition-all relative",
                                    (avatarState === 'TALKING' || avatarState === 'THINKING') && "animate-talking-glow ring-2 ring-green-400"
                                )}>
                                    <img src={equipment.tutor?.image || activeAgent.avatar} alt="AI" className="w-full h-full object-cover object-top" />
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
                                <div className={cn(
                                    "text-[#1d130c] dark:text-white whitespace-pre-wrap transition-all",
                                    isEnlarged ? "text-[16px] leading-relaxed" : "text-[14px] leading-snug"
                                )}>
                                    {formatMessageContent(msg.content)}
                                </div>
                                {/* Custom Component: Active Mock List */}
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
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* TUTOR CARDS */}
                                {msg.customComponent === 'polisher_card' && (
                                    <PolisherCard data={msg.payload} />
                                )}
                                {msg.customComponent === 'decoder_card' && (
                                    <DecoderCard data={msg.payload} />
                                )}
                                {msg.customComponent === 'vocab_card' && (
                                    <VocabCard data={msg.payload} />
                                )}

                                {/* Launch Card */}
                                {msg.customComponent === 'launch_card' && (
                                    <LaunchCard
                                        payload={msg.payload}
                                        onConfirm={() => {
                                            const payload = msg.payload;
                                            if (payload.module === 'EXAM_ROUTER') {
                                                handleSendMessage(`[ACTIVATING_EXAM_MODE] I want to study ${payload.params.type}`);
                                            } else if (payload.module === 'MATHS_LAB') {
                                                const params = payload.params || {};
                                                const searchParams = new URLSearchParams();
                                                if (params.topic) searchParams.set('topic', params.topic);
                                                if (params.level) searchParams.set('level', params.level);
                                                navigate(`/maths-lab?${searchParams.toString()}`);
                                            } else if (payload.module === 'WRITING_LAB') {
                                                navigate('/writing-lab');
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

                                {/* Exam Link */}
                                {msg.customComponent === 'exam_link' && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(msg.examType === 'writing' ? writingExams : (msg.examType === 'listening' ? listeningExams : (msg.examType === 'speaking' ? speakingExams : mockExams)))
                                            .filter(e => e.type === msg.examType || !msg.examType)
                                            .map(exam => (
                                                <button
                                                    key={exam.id}
                                                    onClick={() => {
                                                        const event = new CustomEvent('open-exam-modal', { detail: { examId: exam.id, type: exam.type } });
                                                        window.dispatchEvent(event);
                                                    }}
                                                    className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200 flex items-center gap-1"
                                                >
                                                    📝 {exam.title}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* User Avatar (Right) */}
                            {/* User Avatar (Right) */}
                            {
                                msg.role === 'user' && (
                                    <div className="w-[44px] h-[44px] shrink-0 rounded-full bg-gray-200 overflow-hidden relative">
                                        <img
                                            src={getStudentAvatar()}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                        {equipment.frame && (
                                            <img src={equipment.frame.image} alt="Frame" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110" />
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    );
                })}

                {/* Thinking Indicator */}
                {avatarState === 'THINKING' && (
                    <div className="flex items-start gap-4 max-w-[80%]">
                        <div className={cn(
                            "size-10 shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm animate-talking-glow ring-2 ring-green-400 relative"
                        )}>
                            <img src={equipment.tutor?.image || activeAgent.avatar} alt="AI" className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="bg-white dark:bg-[#3d2c20] p-4 rounded-2xl rounded-tl-none shadow-sm border border-black/5">
                            <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                {isAnalyzingImage && (
                                    <span className="text-xs text-black/40 dark:text-white/40 ml-2 font-medium animate-pulse">
                                        {activeAgentId === 'math' ? "Analyzing math problem..." : "Analyzing handwriting..."}
                                    </span>
                                )}
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
                    <div className="flex flex-wrap gap-2 pb-2 -mx-2 px-2">


                        {/* Dynamic AI Chips */}
                        {/* Dynamic AI Chips */}
                        {(dynamicChips.length > 0
                            ? dynamicChips.filter(c => {
                                const val = typeof c === 'string' ? c : c.value;
                                const lbl = typeof c === 'string' ? c : c.label;
                                // 1. Filter out Mock Exam duplicates
                                if (["模擬考試", "開始模擬考試"].includes(val)) return false;

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

                                // 3. Filter out calibration chips from dynamic chips (we'll use suggestionChips for that)
                                if (val === "I want to start the diagnostic test") return false;

                                return true;
                            })
                                // Prepend calibration chip to dynamic chips if user hasn't completed diagnostic
                                .reduce((acc, current, idx) => {
                                    if (!hasDiagnostic && acc.length === 0) {
                                        acc.push({ label: t('chat.start_calibration'), value: "I want to start the diagnostic test", emoji: "⚡" });
                                    }
                                    acc.push(current);
                                    return acc;
                                }, [])
                            // Fallback to suggestionChips (already contains calibration when !hasDiagnostic)
                            : suggestionChips
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
                    {/* PAPERCLIP (HANDWRITING / PHOTO) - ENABLED FOR ALL */}
                    {(
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn("p-2 transition-colors rounded-full relative", selectedImage ? "text-primary" : "text-[#a16b45] hover:text-primary")}
                            title={activeAgentId === 'math' ? t('chat.upload_tooltip_math') : "Upload Handwriting / Photo"}
                        >
                            <Paperclip className="w-5 h-5" />
                            {selectedImage && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                            )}
                        </button>
                    )}
                    {activeAgentId !== 'math' && activeAgentId !== 'ace' && (
                        <button
                            onClick={() => setIsUploaderOpen(true)}
                            className="p-2 text-[#a16b45] hover:text-primary transition-colors rounded-full"
                            title="Analyze Handwriting (Grade Essay)"
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>
                    )}
                    {activeAgentId !== 'math' && activeAgentId !== 'ace' && (
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
                    )}
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

            {/* Math Ability Modal - REMOVED, now dedicated page */}

            {/* Dream University List Modal (Ace Sir) */}
            <DreamProgramsModal
                isOpen={isDreamProgramsOpen}
                onClose={() => setIsDreamProgramsOpen(false)}
            />

            {/* Image Analysis Confirmation Popup */}
            {isImageConfirmOpen && selectedImage && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1a110a] rounded-[2.5rem] shadow-2xl max-w-2xl w-full border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
                            {/* Left Side: Image Preview */}
                            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-black/20 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10">
                                <div className="relative w-full aspect-square md:aspect-auto md:h-full rounded-2xl overflow-hidden shadow-inner flex items-center justify-center bg-white/50 dark:bg-black/40">
                                    <img 
                                        src={selectedImage.preview} 
                                        alt="Preview" 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>

                            {/* Right Side: Questions & Actions */}
                            <div className="w-full md:w-1/2 p-8 flex flex-col gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Handwriting Analysis</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        {activeAgentId === 'math' 
                                            ? "Add context or specific questions to help Matt Sir analyze your math problem." 
                                            : "Add context to help your tutor analyze your handwriting."}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">Your Question</label>
                                    <textarea
                                        className="w-full h-32 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-white/10 p-4 text-sm text-gray-800 dark:text-white resize-none transition-all placeholder-gray-400 outline-none"
                                        placeholder="Type your question here..."
                                        value={imagePrompt}
                                        onFocus={() => {
                                            if (!hasStartedTyping) {
                                                setImagePrompt("");
                                                setHasStartedTyping(true);
                                            }
                                        }}
                                        onChange={(e) => {
                                            setImagePrompt(e.target.value);
                                            setHasStartedTyping(true);
                                        }}
                                    />
                                </div>

                                <div className="flex gap-3 mt-auto pt-4">
                                    <button
                                        onClick={() => {
                                            setIsImageConfirmOpen(false);
                                            setSelectedImage(null);
                                        }}
                                        className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsImageConfirmOpen(false);
                                            handleSendMessage(imagePrompt);
                                        }}
                                        className="flex-[1.5] py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} />
                                        Analyze Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );

    if (isFocusMode) {
        return createPortal(content, document.body);
    }
    return content;
};

export default ChatInterface;
