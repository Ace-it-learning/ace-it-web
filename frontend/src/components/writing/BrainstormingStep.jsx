import React, { useState, useEffect } from 'react';
import { Send, Loader2, Lightbulb } from 'lucide-react';

const BrainstormingStep = ({ topic, title, onComplete, pillarData }) => {
    const hasInitialized = React.useRef(false);
    const scrollRef = React.useRef(null);

    // State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [points, setPoints] = useState([]); // { point: "", evidence: "" }

    // Auto-scroll when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Helper: Simple Markdown Bold Parser
    const renderMarkdown = (text) => {
        // Replace **text** with <b>text</b>
        return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    };

    // Helper: Add Bot Message
    const addBotMessage = (text) => {
        setMessages(prev => [...prev, { role: 'ai', text }]);
    };

    // Init
    useEffect(() => {
        // Start conversation - Use ref to prevent double-init in StrictMode
        if (!hasInitialized.current && messages.length === 0) {
            hasInitialized.current = true;
            addBotMessage(`Hello! I'm Miss Janie. Today we're going to **Spark Ideas** for: "**${title || topic}**".\n\n**Our Task:** ${topic}\n\nTo get a high score, we need deep arguments, not just surface ideas. Let's start: what is your **strongest argument** for this topic?`);
        }
    }, [topic, title]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userText = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsTyping(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/brainstorm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    // Pass full history for conversational AI
                    messages: [...messages, { role: 'user', text: userText }],
                    points
                })
            });

            if (res.ok) {
                const data = await res.json();
                setIsTyping(false);
                addBotMessage(data.intro_message || "That's a good point. Let's explore it further.");

                // For the conversational mode, we use the next question returned by AI
                const nextQ = data.questions?.[0]?.text;
                if (nextQ) addBotMessage(nextQ);

                // Sync the Idea Board with the AI's extracted points
                if (data.points && data.points.length > 0) {
                    setPoints(data.points);
                }
            } else {
                throw new Error("Brainstorming failed");
            }
        } catch (error) {
            console.error(error);
            setIsTyping(false);
            addBotMessage("I'm having trouble thinking right now. But keep going! What's your next point?");
            setPoints(prev => [...prev, { point: userText, evidence: "" }]);
        }
    };

    return (
        <div className="flex gap-6 h-[600px]">
            {/* Left: Chat Interface (Expanded) */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-indigo-200 flex items-center justify-center">🤖</div>
                        <span className="font-bold text-indigo-900">Miss Janie (Writing Tutor)</span>
                    </div>
                    {pillarData?.british_tutor_hint && (
                        <div className="bg-white/80 p-2 rounded-lg text-xs text-indigo-800 italic border border-indigo-100 flex gap-2">
                            <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" />
                            <span>"{pillarData.british_tutor_hint}"</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                            />
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-gray-400 text-xs flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin" /> Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex gap-2">
                    <input
                        className="flex-1 bg-gray-50 border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Type your idea here..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors">
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Right: The "Notebook" (Fixed Width) */}
            <div className="w-[350px] flex flex-col gap-4 shrink-0">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex-1 overflow-y-auto">
                    <h3 className="flex items-center gap-2 font-bold text-yellow-800 mb-2">
                        <Lightbulb size={18} /> Idea Board
                    </h3>
                    <p className="text-xs text-yellow-700 mb-4">I'm collecting your best ideas here to help you draft later.</p>

                    <div className="space-y-3">
                        {points.map((p, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border shadow-sm text-sm">
                                <div className="font-bold text-gray-700 mb-1">Point {i + 1}:</div>
                                <div className="text-gray-900 mb-2">{p.point}</div>
                                {p.evidence && (
                                    <>
                                        <div className="font-bold text-gray-500 text-xs mb-1">Evidence:</div>
                                        <div className="text-gray-600 italic text-xs border-l-2 border-indigo-200 pl-2">{p.evidence}</div>
                                    </>
                                )}
                            </div>
                        ))}
                        {points.length === 0 && <div className="text-center text-gray-400 text-sm py-8 italic">Start chatting to generate points!</div>}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {points.length >= 1 && (
                        <button
                            onClick={() => onComplete({ points })}
                            className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all animate-in fade-in slide-in-from-bottom-4"
                        >
                            Draft with these ideas →
                        </button>
                    )}

                    <button
                        onClick={() => onComplete({ points: [] })}
                        className="w-full py-3 bg-white border-2 border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        Skip to Drafting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrainstormingStep;
