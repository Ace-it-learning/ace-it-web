import React, { useState, useRef, useEffect } from 'react';
import { useAvatar } from '../context/AvatarContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mic, Paperclip, Send, Volume2, VolumeX } from 'lucide-react';
import { cn } from './Sidebar'; // Reusing cn utility

const SUGGESTION_CHIPS = {
    guest: [
        { label: "Give me a 5-min quiz", emoji: "📝" },
        { label: "Teach me 5 idioms", emoji: "🗣️" },
        { label: "Check my grammar", emoji: "✍️" },
        { label: "Tell me a joke", emoji: "😂" },
        { label: "Practice Past Tense", emoji: "📖" },
        { label: "Common slang", emoji: "😎" },
    ],
    member: [
        { label: "Review my last mistake", emoji: "🔄" },
        { label: "Continue my Writing Plan", emoji: "📝" },
        { label: "Check my weekly goal", emoji: "🎯" },
        { label: "Give me a 5-min quiz", emoji: "📝" },
        { label: "Explain 'have been'", emoji: "📖" },
        { label: "Start a story with me", emoji: "✍️" },
    ]
};

const ChatInterface = () => {
    const { activeAgent, activeAgentId, avatarState, setAvatarState } = useAvatar();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // { data: base64, type: mimeType, preview: url }
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [showChips, setShowChips] = useState(true);

    // Initial greeting or History restore
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setMessages([{
                    role: 'assistant',
                    content: activeAgentId === 'english'
                        ? "I'm your Ace It! English Mentor. I can help you follow your study plan, or we can just practice freely! What's on your mind? (Pick a topic below or type anything!)"
                        : `Hello! I'm your ${activeAgent.name}. Log in to save your learning progress, or start chatting with me now!`,
                    agentId: activeAgentId
                }]);
                setShowChips(true);
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/history/${activeAgentId}?uid=${user.uid}`);
                const history = await res.json();

                if (history && history.length > 0) {
                    setMessages(history);
                    setShowChips(false);
                } else {
                    setMessages([{
                        role: 'assistant',
                        content: activeAgentId === 'english'
                            ? "I'm your Ace It! English Mentor. I can help you follow your study plan, or we can just practice freely! What's on your mind? (Pick a topic below or type anything!)"
                            : `Welcome back! I'm your ${activeAgent.name}. How can I help you with your studies today?`,
                        agentId: activeAgentId
                    }]);
                    setShowChips(true);
                }
            } catch (err) {
                console.error("History fetch failed", err);
            }
        };

        fetchHistory();
        setAvatarState('IDLE');
    }, [activeAgentId, setAvatarState, activeAgent.name, user]);

    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Default: Sound Off
    const isMutedRef = useRef(isMuted);

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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, avatarState]);

    // Text-to-Speech Function
    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        // Stop any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // Attempt to find a British English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google UK English Female") || v.lang === "en-GB") || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition is not supported in this browser. Please use Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US'; // Default to English for practice
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };

        recognition.start();
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
            setSelectedImage({
                data: reader.result.split(',')[1],
                type: file.type,
                preview: reader.result
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async (overrideValue) => {
        const textToSend = overrideValue || inputValue;
        if (!textToSend.trim() && !selectedImage) return;

        const userMsg = {
            role: 'user',
            content: textToSend,
            image: selectedImage ? { preview: selectedImage.preview } : null
        };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = textToSend;

        if (showChips) setShowChips(false);
        const currentImage = selectedImage;

        setInputValue('');
        setSelectedImage(null);
        setAvatarState('THINKING');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Prepare history (exclude the very last user message which is being sent now, if it was already added to state? 
            // construct from 'messages' which doesn't have the new user msg yet? 
            // Wait, line 78 adds it to state: `setMessages(prev => [...prev, userMsg]);`
            // But state update is async. `messages` here is still the OLD value.
            // So `messages` is perfect as "history".

            // Prepare history (start from index 1 to skip local greeting)
            const history = messages.slice(1).map(m => ({
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
                    agentId: activeAgentId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();

            // Handling [FORCE_TTS] tag for Listening Mode
            let replyText = data.reply;
            if (!replyText) throw new Error("Backend failed to generate a reply.");

            const forceTTS = replyText.includes('[FORCE_TTS]');

            // Clean the tag from display
            replyText = replyText.replace('[FORCE_TTS]', '').trim();

            const aiMsg = {
                role: 'assistant',
                content: replyText,
                agentId: activeAgentId
            };
            setMessages(prev => [...prev, aiMsg]);
            setAvatarState('HAPPY'); // Success state

            // Speak logic: Speak if NOT muted OR if FORCE_TTS is present
            if (!isMutedRef.current || forceTTS) {
                speakText(replyText);
            }

            // Reset to IDLE after a few seconds
            setTimeout(() => setAvatarState('IDLE'), 3000);

        } catch (error) {
            console.error('Chat error:', error);
            setAvatarState('UPSET'); // Error state
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}. Ensure backend is running on port 3001.`
            }]);
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

    return (
        <section className="lg:col-span-9 flex flex-col h-[80vh] min-h-[600px] rounded-3xl glass-container shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="px-8 py-4 border-b border-black/5 dark:border-white/10 flex items-center gap-4">
                <div className={cn("size-3 rounded-full transition-colors",
                    avatarState === 'THINKING' ? "bg-yellow-400 animate-pulse" :
                        avatarState === 'UPSET' ? "bg-red-500" : "bg-green-500"
                )}></div>
                <span className="font-medium text-[#1d130c] dark:text-white">
                    {activeAgent.name} • {avatarState === 'THINKING' ? 'Thinking...' : 'Online'}
                </span>
            </div>

            {/* Chat Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex items-start gap-4 max-w-[80%]", msg.role === 'user' ? "ml-auto justify-end" : "")}>

                        {/* AI Avatar (Left) */}
                        {msg.role === 'assistant' && (
                            <div className="size-10 shrink-0 rounded-full overflow-hidden border border-black/5 bg-white shadow-sm">
                                <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover object-top" />
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div className={cn(
                            "p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col gap-3",
                            msg.role === 'user'
                                ? "bg-primary/10 dark:bg-primary/20 rounded-tr-none"
                                : "bg-white dark:bg-[#3d2c20] rounded-tl-none"
                        )}>
                            {msg.image && (
                                <img src={msg.image.preview} alt="Uploaded handwriting" className="max-w-xs rounded-lg border border-black/10 shadow-sm" />
                            )}
                            <p className="text-[#1d130c] dark:text-white leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                            </p>
                        </div>

                        {/* User Avatar (Right) */}
                        {msg.role === 'user' && (
                            <div className="size-10 shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                <img
                                    src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAQZzao9lF3biaiHXLV7UnY79OpyxIJ5fbvV_jTDf0J5wAIqFuM4JoE_HbznpvB7AQIWKlVzlZF7mNYCdTzPcIejjVzV0rVphkD_0VglO_XxHg43W93WzYdq4G42X9_d7WN1A20-rwG8MOoeF78Wu3pWVk4oA32Ebn1Dvp-6NzFXjFyB7X7Y6eHPiUgRv15W_uVa6hvjKmS9DzgF4Kg7xgekIkPG1YFYEITkJuAvnFt_copRTFfxP5T4g_glC32vLzYj67CHOOLamg5"}
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
            <div className="p-6 bg-white/40 dark:bg-black/20 flex flex-col gap-4">
                {/* Suggestion Chips */}
                {showChips && activeAgentId === 'english' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-2 px-2">
                        {(user ? SUGGESTION_CHIPS.member : SUGGESTION_CHIPS.guest).map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(chip.label)}
                                className="whitespace-nowrap px-4 py-2 rounded-full border border-primary/20 bg-white/80 dark:bg-white/5 text-sm font-medium text-[#a16b45] dark:text-gray-300 hover:border-primary hover:text-primary hover:scale-105 transition-all shadow-sm"
                            >
                                <span className="mr-2">{chip.emoji}</span>
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 bg-white dark:bg-[#1a110a] rounded-2xl p-2 shadow-inner border border-black/5">
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
                        onClick={handleMicClick}
                        className={cn(
                            "p-2 transition-colors rounded-full",
                            isListening ? "bg-red-500 text-white animate-pulse" : "text-[#a16b45] hover:text-primary"
                        )}
                        title="Click to Speak"
                    >
                        <Mic className="w-5 h-5" />
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
                            placeholder={selectedImage ? "Add a description (optional)..." : "輸入您的答案... (Type your message)"}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={avatarState === 'THINKING'}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={avatarState === 'THINKING'}
                        className="bg-primary text-white p-3 rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                {/* Guest Nudge */}
                {!user && (
                    <div className="flex justify-center">
                        <a
                            href="/login"
                            className="text-xs text-primary hover:underline font-medium bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 transition-all hover:bg-primary/10"
                        >
                            Sign up to save our progress & unlock full DSE tools ✨
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ChatInterface;
