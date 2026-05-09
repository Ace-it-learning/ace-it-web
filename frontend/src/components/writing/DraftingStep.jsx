import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wand2, AlertTriangle, ArrowRight, BookOpen, Zap, Loader2, MousePointerClick } from 'lucide-react';
import { isCheatEnabled } from '../../utils/devAccess';

const DraftingStep = ({ topic, textType, brainstormPoints, initialContent, onUpdate, onNext, pillarData }) => {
    const [content, setContent] = useState(initialContent || "");
    const [feedback, setFeedback] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const textareaRef = useRef(null);
    const mirrorRef = useRef(null);

    // Sync mirror div width with textarea on resize
    useEffect(() => {
        if (textareaRef.current && mirrorRef.current) {
            mirrorRef.current.style.width = `${textareaRef.current.offsetWidth}px`;
        }
    }, [textareaRef.current?.offsetWidth]);

    const highlightText = (searchText) => {
        if (!searchText || !textareaRef.current) return;

        // Normalize search text (remove punctuation/case if needed, but strict for now)
        const text = content;
        const index = text.indexOf(searchText);

        if (index !== -1) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(index, index + searchText.length);

            // Robust Scroll Logic using Mirror Div
            if (mirrorRef.current) {
                // 1. Set text before the match
                const textBefore = text.substring(0, index);
                mirrorRef.current.textContent = textBefore;

                // 2. Scroll textarea to that position
                const targetTop = mirrorRef.current.scrollHeight;
                const viewportHeight = textareaRef.current.clientHeight;
                textareaRef.current.scrollTop = targetTop - (viewportHeight / 3);
            }
        }
    };

    // Admin Cheat Feature
    const { user, profile } = useAuth();
    const isAdmin = isCheatEnabled(user, profile);
    const [cheatLevel, setCheatLevel] = useState("5**");

    const handleCheatGenerate = async () => {
        setIsAnalyzing(true);
        setFeedback(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/writing/draft/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic,
                    textType: textType,
                    level: cheatLevel,
                    points: brainstormPoints
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.essay_content) {
                    setContent(data.essay_content);
                    onUpdate(data.essay_content);
                    setFeedback({
                        suggestions: [],
                        registerMsg: null,
                        summary: `✨ CHEAT CODE ACTIVATED: Generated Level ${cheatLevel} Essay! ✨`
                    });
                }
            }
        } catch (e) {
            console.error("Cheat generation failed", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePowerUp = async (rewriteLevel = null) => {
        if (!content.trim()) return;
        setIsAnalyzing(true);
        setFeedback(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // If rewriteLevel is set, call the rewrite endpoint
            if (rewriteLevel) {
                const res = await fetch(`${API_URL}/api/writing/draft/rewrite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: content,
                        textType: textType,
                        targetLevel: rewriteLevel
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.rewritten_text) {
                        setContent(data.rewritten_text);
                        onUpdate(data.rewritten_text);
                        setFeedback({
                            suggestions: [],
                            registerMsg: null,
                            summary: "✨ BOOM! Your text has been upgraded to Level 5**! ✨"
                        });
                    }
                }
            } else {
                // Normal Power Up (Analysis)
                const res = await fetch(`${API_URL}/api/writing/draft/powerup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: content,
                        textType: textType,
                        brainstormPoints: brainstormPoints
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setFeedback({
                        suggestions: data.suggestions || [],
                        registerMsg: data.register_check?.status !== 'green' ? data.register_check.message : null,
                        summary: data.feedback_summary || "I've analyzed your draft!"
                    });
                }
            }
        } catch (e) {
            console.error(e);
            setFeedback({
                suggestions: [],
                registerMsg: "Connection issue.",
                summary: "Couldn't reach the AI tutor."
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleChange = (e) => {
        setContent(e.target.value);
        onUpdate(e.target.value);
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-120px)] w-full pb-4">
            {/* Left: Input Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-800">
                    <div className="font-bold text-sm mb-2">Target Task: Write a {textType}</div>
                    <div className="space-y-2">
                        {(() => {
                            if (!topic) return null;
                            const blocks = topic.split(/(\*\*Writing Situation:\*\*|\*\*Requirements \(Focus\):\*\*)/g);
                            return blocks.map((block, idx) => {
                                const trimmed = block.trim();
                                if (!trimmed) return null;

                                const isHeader = trimmed === '**Writing Situation:**' || trimmed === '**Requirements (Focus):**';
                                if (isHeader) {
                                    return (
                                        <div key={idx} className="font-black text-indigo-900 mt-2 mb-0.5 uppercase tracking-tighter block">
                                            {trimmed.replace(/\*\*/g, '')}
                                        </div>
                                    );
                                }

                                const formattedText = trimmed.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <b key={pIdx} className="font-black text-indigo-950">{part.replace(/\*\*/g, '')}</b>;
                                    }
                                    return part;
                                });

                                return (
                                    <p key={idx} className="text-indigo-800 leading-normal">
                                        {formattedText}
                                    </p>
                                );
                            });
                        })()}
                    </div>
                </div>
                {pillarData?.dse_objective && (
                    <div className="bg-white p-2 rounded-lg text-xs text-indigo-600 border border-indigo-100 flex gap-2 items-center">
                        <span className="font-black bg-indigo-600 text-white px-1.5 rounded text-[10px]">GOAL</span>
                        {pillarData.dse_objective}
                    </div>
                )}

                <div className="flex-1 relative h-full">
                    {/* Mirror Div for Scroll Calculation */}
                    <div
                        ref={mirrorRef}
                        className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none p-8 font-serif text-lg leading-relaxed whitespace-pre-wrap break-words border border-transparent"
                        aria-hidden="true"
                    ></div>

                    <textarea
                        ref={textareaRef}
                        className="w-full h-full p-8 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-serif text-lg leading-relaxed"
                        placeholder="Start writing here... Use the ideas you brainstormed!"
                        value={content}
                        onChange={handleChange}
                    />
                    {/* Floating Power Up / Admin Controls */}
                    <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                        {isAdmin && (
                            <div className="flex gap-2 bg-white/90 p-1 rounded-full shadow-lg border border-red-200">
                                <select
                                    value={cheatLevel}
                                    onChange={(e) => setCheatLevel(e.target.value)}
                                    className="text-xs font-bold text-red-600 bg-transparent border-none focus:ring-0 cursor-pointer"
                                >
                                    <option value="3">Lv 3</option>
                                    <option value="4">Lv 4</option>
                                    <option value="5">Lv 5</option>
                                    <option value="5*">Lv 5*</option>
                                    <option value="5**">Lv 5**</option>
                                </select>
                                <button
                                    onClick={handleCheatGenerate}
                                    disabled={isAnalyzing}
                                    className="bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 transition flex items-center gap-1 font-bold text-xs"
                                    title="Admin: Generate Full Essay"
                                >
                                    {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Gen
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => handlePowerUp()}
                            disabled={isAnalyzing || !content}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 font-bold text-sm"
                        >
                            {isAnalyzing ? "Analyzing..." : <><Wand2 size={16} /> Power Up Draft</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Idea Reference & Feedback */}
            <div className="w-[450px] flex flex-col gap-4 overflow-hidden h-full shrink-0">
                {/* Brainstorm Reference */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-h-[160px] overflow-y-auto shrink-0 shadow-sm">
                    <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider"><BookOpen size={14} /> Your Ideas</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                        {brainstormPoints.map((p, i) => (
                            <li key={i} className="leading-tight">
                                <span className="font-bold">{p.point}</span>
                                {p.evidence && <span className="block text-[10px] text-yellow-700 ml-4 italic">Ev: {p.evidence}</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Feedback Panel */}
                <div className={`flex-1 rounded-xl border p-5 transition-all flex flex-col overflow-hidden shadow-sm ${feedback ? 'bg-white border-indigo-200' : 'bg-gray-50 border-gray-200 border-dashed items-center justify-center'}`}>
                    {!feedback ? (
                        <div className="text-gray-400 text-center text-sm">
                            <Wand2 className="mx-auto mb-3 opacity-30" size={32} />
                            <p className="font-medium">Write a paragraph and hit<br />"Power Up" to get AI suggestions.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-100 pr-2 animate-in fade-in duration-300">
                            <h3 className="font-extrabold text-indigo-900 border-b pb-3 mb-4 text-base flex items-center gap-2 shrink-0">
                                <Zap size={18} className="text-indigo-500" />
                                {feedback.summary}
                            </h3>

                            {feedback.registerMsg && (
                                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-bold flex gap-2 items-start border border-amber-200 mb-4 shrink-0 shadow-sm">
                                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                                    {feedback.registerMsg}
                                </div>
                            )}

                            <div className="space-y-3 pb-4">
                                {feedback.suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="text-sm border-l-4 border-indigo-400 bg-indigo-50/50 p-3 rounded-r-lg group hover:bg-indigo-100 transition-colors border border-indigo-100 cursor-pointer active:bg-indigo-200"
                                        onMouseEnter={() => highlightText(s.original)}
                                        onClick={() => highlightText(s.original)}
                                    >
                                        <div className="text-gray-400 line-through text-[10px] uppercase font-bold tracking-tighter mb-1 select-none">{s.original}</div>
                                        <div className="text-indigo-800 font-black flex items-center gap-2 text-base leading-tight">
                                            {s.suggestion}
                                            <MousePointerClick size={12} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="text-[11px] text-indigo-600/80 mt-2 font-medium leading-relaxed">{s.reason}</div>
                                    </div>
                                ))}
                                {feedback.suggestions.length === 0 && !feedback.registerMsg && (
                                    <div className="flex flex-col items-center justify-center py-8 text-emerald-600 text-center">
                                        <div className="bg-emerald-100 p-3 rounded-full mb-3 text-2xl">🌟</div>
                                        <p className="font-black text-sm uppercase tracking-widest text-emerald-700">Flawless Text!</p>
                                        <p className="text-xs text-emerald-600 mt-1">Your language usage is top-tier.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        onClick={onNext}
                        disabled={!content}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-black shadow-lg hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group shrink-0"
                    >
                        Next Step: Organization <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div >
    );
};

export default DraftingStep;
