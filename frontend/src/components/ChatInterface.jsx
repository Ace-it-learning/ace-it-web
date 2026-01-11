import React, { useState, useRef, useEffect } from 'react';
import { useAvatar } from '../context/AvatarContext';
import { ArrowRight, Mic, Paperclip, Send } from 'lucide-react';
import { cn } from './Sidebar'; // Reusing cn utility

const ChatInterface = () => {
    const { activeAgent, activeAgentId, avatarState, setAvatarState } = useAvatar();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Initial greeting when agent changes
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                content: `Here is your ${activeAgent.name}. How can I help you with your studies today?`,
                agentId: activeAgentId
            }
        ]);
        setAvatarState('IDLE');
    }, [activeAgentId, setAvatarState]); // Added setAvatarState to dependencies

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, avatarState]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setAvatarState('THINKING');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    agentId: activeAgentId
                })
            });
            const data = await response.json();

            const aiMsg = {
                role: 'assistant',
                content: data.reply,
                agentId: activeAgentId
            };
            setMessages(prev => [...prev, aiMsg]);
            setAvatarState('HAPPY'); // Success state

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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <section className="lg:col-span-9 flex flex-col h-[65vh] min-h-[500px] rounded-3xl glass-container shadow-2xl relative overflow-hidden">
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
                            <div className={`size-10 shrink-0 rounded-full overflow-hidden ${activeAgent.color}`}>
                                <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover opacity-80" />
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div className={cn(
                            "p-5 rounded-2xl shadow-sm border border-black/5",
                            msg.role === 'user'
                                ? "bg-primary/10 dark:bg-primary/20 rounded-tr-none"
                                : "bg-white dark:bg-[#3d2c20] rounded-tl-none"
                        )}>
                            <p className="text-[#1d130c] dark:text-white leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                            </p>
                        </div>

                        {/* User Avatar (Right) */}
                        {msg.role === 'user' && (
                            <div className="size-10 shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQZzao9lF3biaiHXLV7UnY79OpyxIJ5fbvV_jTDf0J5wAIqFuM4JoE_HbznpvB7AQIWKlVzlZF7mNYCdTzPcIejjVzV0rVphkD_0VglO_XxHg43W93WzYdq4G42X9_d7WN1A20-rwG8MOoeF78Wu3pWVk4oA32Ebn1Dvp-6NzFXjFyB7X7Y6eHPiUgRv15W_uVa6hvjKmS9DzgF4Kg7xgekIkPG1YFYEITkJuAvnFt_copRTFfxP5T4g_glC32vLzYj67CHOOLamg5"
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
                        <div className={`size-10 shrink-0 rounded-full overflow-hidden ${activeAgent.color}`}>
                            <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover opacity-80" />
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
                <div className="flex items-center gap-3 bg-white dark:bg-[#1a110a] rounded-2xl p-2 shadow-inner border border-black/5">
                    <button className="p-2 text-[#a16b45] hover:text-primary transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[#a16b45] hover:text-primary transition-colors">
                        <Mic className="w-5 h-5" />
                    </button>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#1d130c] dark:text-white placeholder-[#a16b45]/50 px-2"
                        placeholder="輸入您的答案... (Type your message)"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={avatarState === 'THINKING'}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={avatarState === 'THINKING'}
                        className="bg-primary text-white p-3 rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ChatInterface;
