import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, Send, Loader2, ArrowRight, Clock, Zap, BookOpen } from 'lucide-react';

const SpeakingFlowPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const level = searchParams.get('level') || '3';
    const taskId = searchParams.get('taskId') || '';

    const [quest, setQuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Conversation State
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [silenceTimer, setSilenceTimer] = useState(0);
    const [confidenceMeter, setConfidenceMeter] = useState(100);
    const [currentHints, setCurrentHints] = useState([]);

    // AI State
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // Phase 42: Delay timer until first "Start"

    const recognition = useRef(null);
    const silenceInterval = useRef(null);
    const audioRef = useRef(null);
    const messagesEndRef = useRef(null);
    const hasInitialized = useRef(false);
    const messagesRef = useRef([]); // Phase 40: State mirror to avoid stale closures

    // Auto-scroll inside the message container, not the window
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages, currentTranscript]);

    // 1. Load Quest - Phase 39 Single-Fetch Guard
    useEffect(() => {
        if (hasInitialized.current) return;

        const fetchQuest = async () => {
            // Optimization: Wait for user to be available (unless guest is allowed)
            // But we can also just run it if we have a stable signal.
            hasInitialized.current = true;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/speaking/quest/generate?module=flow&level=${level}&uid=${user?.uid || 'guest'}&focus=${taskId}`);

                if (!res.ok) throw new Error('Failed to load quest');

                const data = await res.json();
                setQuest(data);

                // Start with the scenario description and first question
                const opening = `Hello! I'm ${data.role}. ${data.description}. Let's get started. ${data.questions?.[0]?.question_text || "Ready?"}`;

                const openingMsg = {
                    role: 'ai',
                    text: opening,
                    timestamp: Date.now()
                };
                setMessages([openingMsg]);
                messagesRef.current = [openingMsg]; // Phase 41: Initialize ref with opening message

                setCurrentHints(data.questions?.[0]?.structural_hints || []);

                // Speak the opening
                speakText(opening);

                setLoading(false);
            } catch (err) {
                console.error('Quest load error:', err);
                setError(err.message);
                setLoading(false);
                hasInitialized.current = false; // Allow retry on error
            }
        };

        fetchQuest();
    }, [level, user?.uid]);

    // 2. Setup Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const r = new window.webkitSpeechRecognition();
            r.continuous = true;
            r.interimResults = true;
            r.lang = 'en-HK';

            r.onstart = () => {
                setIsListening(true);
                startSilenceTimer();
            };

            r.onend = () => {
                setIsListening(false);
                stopSilenceTimer();
            };

            r.onresult = (event) => {
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        final += transcript;
                    } else {
                        interim += transcript;
                    }
                }

                if (final) {
                    handleUserSpeech(final);
                } else {
                    setCurrentTranscript(interim);
                    resetSilenceTimer();
                }
            };

            recognition.current = r;
        }

        return () => {
            stopSilenceTimer();
        };
    }, []);

    // 3. Silence Timer & Session Timer
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

    useEffect(() => {
        // Phase 42: Only count down if session has actually started
        if (!isComplete && !loading && hasStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval(timer);
                        // Phase 40: Use ref for finish detection
                        finishInterview(messagesRef.current);
                        return 0;
                    }
                    return next;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isComplete, loading, hasStarted]);

    const startSilenceTimer = () => {
        setSilenceTimer(0);
        setConfidenceMeter(100);

        silenceInterval.current = setInterval(() => {
            setSilenceTimer(prev => {
                const next = prev + 0.1;
                if (next > 2) {
                    setConfidenceMeter(Math.max(0, 100 - ((next - 2) * 20)));
                }
                return next;
            });
        }, 100);
    };

    const stopSilenceTimer = () => {
        if (silenceInterval.current) {
            clearInterval(silenceInterval.current);
            silenceInterval.current = null;
        }
    };

    const resetSilenceTimer = () => {
        setSilenceTimer(0);
        setConfidenceMeter(100);
    };

    // 4. Handle User Speech
    const handleUserSpeech = async (text) => {
        if (!text.trim()) return;

        if (recognition.current) {
            recognition.current.stop();
        }

        setCurrentTranscript('');

        const userMessage = {
            role: 'user',
            text: text.trim(),
            timestamp: Date.now()
        };

        // Phase 42: Use ref to avoid stale closures (fixes instructions wiping)
        const updatedMessages = [...messagesRef.current, userMessage];
        setMessages(updatedMessages);
        messagesRef.current = updatedMessages;

        await getAIResponse(text, updatedMessages);
    };

    // 5. Get AI Response
    const getAIResponse = async (userText, currentHistory) => {
        setIsAIThinking(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/flow/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quest_id: quest?.template_id || quest?.id,
                    history: currentHistory || messagesRef.current,
                    user_response: userText,
                    level: level,
                    uid: user?.uid || 'guest',
                    focus: taskId
                })
            });

            if (!res.ok) throw new Error('AI response failed');

            const data = await res.json();

            // Phase 41 Atomic Update: feedback AND the next question together
            const newTurnMessages = [];
            if (data.feedback_text) {
                newTurnMessages.push({
                    role: 'ai_feedback',
                    text: data.feedback_text,
                    timestamp: Date.now()
                });
            }

            const aiMessage = {
                role: 'ai',
                text: data.question,
                timestamp: Date.now()
            };
            newTurnMessages.push(aiMessage);

            // Update state and ref in one shot
            const updatedHistory = [...(currentHistory || messagesRef.current), ...newTurnMessages];
            setMessages(updatedHistory);
            messagesRef.current = updatedHistory;

            // Update Hints
            if (data.structural_hints) {
                setCurrentHints(data.structural_hints);
            }

            // Speak Feedback then Question
            const fullSpeech = data.feedback_text ? `${data.feedback_text}. ${data.question}` : data.question;
            speakText(fullSpeech);

            if (updatedHistory.length >= 10) {
                await finishInterview(updatedHistory);
            }

            setIsAIThinking(false);
        } catch (err) {
            console.error('AI response error:', err);
            setIsAIThinking(false);
        }
    };

    // 6. TTS
    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en')); // Default to any English
        if (voice) utterance.voice = voice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        audioRef.current = utterance;
    };

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
        } else {
            if (!hasStarted) setHasStarted(true); // Phase 42: Start timer on first interaction
            recognition.current?.start();
        }
    };

    // 8. Finish & Grade
    const finishInterview = async (forcedHistory = null) => {
        const finalHistory = forcedHistory || messagesRef.current;
        const hasUserSpoken = finalHistory.some(m => m.role === 'user');

        if (!hasUserSpoken) {
            if (!window.confirm("You haven't spoken yet. Ending now will result in zero marks. Continue?")) {
                return;
            }
        }

        setIsAIThinking(true);
        setIsComplete(true);
        window.speechSynthesis.cancel();
        stopSilenceTimer();

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/speaking/quest/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module: 'flow',
                    quest_id: quest?.template_id || quest?.id, // Phase 43: Ensure ID is passed
                    messages: finalHistory,
                    level,
                    uid: user?.uid || 'guest',
                    focus: taskId
                })
            });

            if (!res.ok) throw new Error('Grading failed');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', text: "Analyzing your performance...", isStatus: true }]);
            setMessages(prev => prev.filter(m => !m.isStatus));
            window.sessionStorage.setItem('lastSpeakingResult', JSON.stringify(data));
            setMessages(prev => [...prev, { role: 'system_result', data }]);
        } catch (err) {
            console.error('Grading error:', err);
            const fallback = {
                scores: { total: 0, spontaneity: 0, confidence: 0, vocabulary: 0, latency_score: 0 },
                feedback: {
                    summary: "Grading engine unavailable.",
                    improvement_advice: "Your connection may have dropped, or the grading server is busy. Your scores were not calculated correctly."
                }
            };
            setMessages(prev => [...prev, { role: 'system_result', data: fallback }]);
        } finally {
            setIsAIThinking(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-purple-600 font-bold animate-pulse">Generating Natural Response Flow Master Quest...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-red-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Quest</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden h-screen">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 z-20 flex-shrink-0">
                <div className="w-full max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Flow Quest</h1>
                            <p className="text-[11px] text-gray-500 font-medium">{quest.scenario}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            Level {level}
                        </div>
                        {!isComplete && (
                            <>
                                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeLeft < 30 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                                    <Clock size={14} />
                                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <button
                                    onClick={finishInterview}
                                    className="px-4 py-1.5 bg-red-500 text-white rounded-lg font-bold text-[10px] hover:bg-red-600 shadow-md transition-all active:scale-95"
                                >
                                    END INTERVIEW
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-8 py-4 overflow-hidden min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 overflow-hidden">

                    {/* Sidebar: Stats & Hints */}
                    <div className="md:col-span-1 space-y-4 flex flex-col">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-shrink-0">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Performance</h3>

                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                        <span className="text-gray-600">Confidence</span>
                                        <span className={confidenceMeter > 50 ? 'text-green-600' : 'text-red-500'}>{confidenceMeter}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${confidenceMeter > 60 ? 'bg-green-500' : confidenceMeter > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${confidenceMeter}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[9px] font-black mb-0.5">
                                        <span className="text-gray-600">Response Speed</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xl font-black ${silenceTimer > 2.5 ? 'text-red-500' : 'text-gray-900'}`}>{silenceTimer.toFixed(1)}</span>
                                        <span className="text-[10px] font-bold text-gray-400">sec</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Structural Hints - Better Height & Scroll */}
                        {!isComplete && (
                            <div className="bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6 flex flex-col overflow-hidden h-[400px]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-3 h-3 text-purple-600" />
                                    <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-widest leading-none">Logical hints</h3>
                                </div>

                                <div className="space-y-2 overflow-y-auto pr-1">
                                    {currentHints.length > 0 ? currentHints.map((hint, idx) => (
                                        <div key={idx} className="group animate-in slide-in-from-right-4 duration-300">
                                            <p className="text-[9px] font-black text-purple-400 uppercase mb-1">{hint.type}</p>
                                            <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-xs font-medium text-purple-900 group-hover:bg-purple-100 transition-colors">
                                                {hint.text}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-xs text-gray-400 italic font-medium">Listening for your thoughts...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Area - 60% Height Reduction */}
                    <div className="md:col-span-3 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative h-[60vh]">
                        {/* Messages Scroller */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                            {messages.map((msg, idx) => {
                                if (msg.role === 'system_result') {
                                    return (
                                        <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border border-green-200 p-8 text-center animate-in zoom-in-95 my-4">
                                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-white">✓</div>
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Interview Result</h2>
                                            <div className="text-6xl font-black text-green-600 mb-6 flex flex-col items-center">
                                                <div>{msg.data.scores?.total} <span className="text-xl opacity-50">/ 28</span></div>
                                                {msg.data.xp_awarded > 0 && (
                                                    <div className="mt-2 px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-bold tracking-widest uppercase animate-in slide-in-from-bottom-2">
                                                        +{msg.data.xp_awarded} XP Earned
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                                {Object.entries(msg.data.scores || {}).map(([key, val]) => (
                                                    key !== 'total' && (
                                                        <div key={key} className="bg-white rounded-xl p-4 text-center border border-green-100 shadow-sm">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 leading-tight">{key.replace('_', ' ')}</p>
                                                            <p className="text-xl font-black text-green-700 leading-none">{val}/7</p>
                                                        </div>
                                                    )
                                                ))}
                                            </div>

                                            <div className="bg-white rounded-2xl p-6 mb-6 text-left border border-green-100 shadow-sm">
                                                <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-3">Expert Summary</h4>
                                                <p className="text-gray-700 italic font-medium leading-relaxed">"{msg.data.feedback?.summary}"</p>
                                            </div>

                                            <button onClick={() => navigate('/dashboard')} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02]">
                                                Return to Dashboard <ArrowRight />
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                        <div className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-sm transition-all ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
                                            : msg.role === 'ai_feedback'
                                                ? 'bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-tl-none italic shadow-inner'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none font-medium'
                                            }`}>
                                            {msg.role === 'ai_feedback' && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Coach's Tip</span>
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {isAIThinking && !isComplete && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-2xl px-6 py-4 rounded-tl-none">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentTranscript && (
                                <div className="flex justify-end">
                                    <div className="max-w-[85%] bg-purple-50 text-purple-700 rounded-2xl px-6 py-4 border-2 border-purple-200 border-dashed rounded-tr-none">
                                        <p className="text-sm font-medium italic opacity-70">{currentTranscript}</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Fixed Control Bar */}
                        {!isComplete && (
                            <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex-shrink-0">
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={toggleListening}
                                        disabled={isAIThinking}
                                        className={`group relative px-6 py-2.5 rounded-full font-black text-sm flex items-center gap-3 transition-all shadow-lg hover:scale-105 active:scale-95 ${isListening
                                            ? 'bg-red-500 text-white ring-4 ring-red-100'
                                            : 'bg-white text-gray-900 border-2 border-gray-100 hover:border-purple-200'
                                            } disabled:opacity-50`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-white/20' : 'bg-purple-100'}`}>
                                            <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-purple-600'}`} />
                                        </div>
                                        <span className="tracking-tight">{isListening ? 'SUBMIT RESPONSE' : 'START SPEAKING'}</span>

                                        {isListening && (
                                            <div className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping opacity-25" />
                                        )}
                                    </button>

                                    {/* Manual Finish Button to improve UX */}
                                    {!isListening && messages.length >= 4 && (
                                        <button
                                            onClick={() => finishInterview()}
                                            disabled={isAIThinking}
                                            className="px-6 py-2.5 rounded-full font-black text-[10px] bg-red-100 text-red-600 border-2 border-red-200 hover:bg-red-200 transition-all flex items-center gap-2"
                                        >
                                            FINISH NOW
                                        </button>
                                    )}
                                </div>
                                <p className="text-center text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Press to start, press again to stop</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeakingFlowPage;
