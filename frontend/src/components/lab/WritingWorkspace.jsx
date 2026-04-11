import React, { useState } from 'react';
import { PenTool, Send, Info, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const WritingWorkspace = ({ lessonData, onSubmit, isSubmitting }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [cheatingLevel, setCheatingLevel] = useState(null);

    const handleTextChange = (e) => {
        const val = e.target.value;
        setText(val);
        setWordCount(val.trim() === "" ? 0 : val.trim().split(/\s+/).length);
    };

    const handleCheat = async (level) => {
        if (!user) return;
        setCheatingLevel(level);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = await user.getIdToken();

            // Construct Prompt Context
            let promptText = "";
            if (lessonData.mode === 'SENTENCE_BUILDER') {
                promptText = `Instruction: ${lessonData.instruction}. Context: ${lessonData.kernel}. Hint: ${lessonData.hint}`;
            } else if (lessonData.mode === 'PARAGRAPH_PLANNER') {
                promptText = `Write a body paragraph for: "${lessonData.prompt_text}". Focus: ${lessonData.functional_focus}.`;
            } else {
                promptText = `Question: ${lessonData.question_text}. Role: ${lessonData.role}. Audience: ${lessonData.target_audience}.`;
            }

            const res = await fetch(`${API_URL}/api/lab/writing/cheat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: promptText,
                    mode: lessonData.mode,
                    level: level,
                    uid: user.uid
                })
            });

            if (res.ok) {
                const data = await res.json();
                setText(data.text);
                setWordCount(data.text.trim().split(/\s+/).length);
            }
        } catch (error) {
            console.error("Cheat failed", error);
        } finally {
            setCheatingLevel(null);
        }
    };

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSubmit(text);
    };

    const getModeLabel = (mode) => {
        switch (mode) {
            case 'SENTENCE_BUILDER': return "Sentence Builder";
            case 'PARAGRAPH_PLANNER': return "Paragraph Workshop";
            case 'MINI_ESSAY': return "Mini-Essay Challenge";
            default: return "Writing Task";
        }
    };

    // Extract prompt details based on schema
    const mode = lessonData.mode;
    const theme = lessonData.theme;

    // Prompt content resolution
    let mainInstruction = "";
    let context = "";
    let constraint = "";

    if (mode === 'SENTENCE_BUILDER') {
        context = `Kernel Idea: "${lessonData.kernel}"`;
        mainInstruction = lessonData.instruction;
        constraint = lessonData.hint;
    } else if (mode === 'PARAGRAPH_PLANNER') {
        context = `Argument: "${lessonData.prompt_text}"`;
        mainInstruction = `Write one body paragraph focusing on: ${lessonData.functional_focus}`;
        constraint = lessonData.guidance ? lessonData.guidance.join(' • ') : "";
    } else { // MINI_ESSAY
        context = `Role: ${lessonData.role} | Audience: ${lessonData.target_audience}`;
        mainInstruction = lessonData.question_text;
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500">
            {/* Archival Banner */}
            <div className="mb-8 p-4 bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-amber-800">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="font-black uppercase tracking-widest text-[10px]">Legacy Component</p>
                        <p className="text-sm font-bold">This writing workshop has been archived in favor of the new Quests Lab.</p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest">
                    <PenTool size={14} />
                    {getModeLabel(mode)}
                </div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                    {theme || "General Writing"}
                </h1>
            </div>

            {/* Prompt Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50 mb-8 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600" />

                <div className="space-y-6">
                    {/* Context / Kernel */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Task Context
                        </span>
                        <div className="text-xl font-medium text-gray-700 font-serif italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {context}
                        </div>
                    </div>

                    {/* Instruction */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Your Mission
                        </span>
                        <p className="text-2xl font-black text-gray-900 leading-snug">
                            {mainInstruction}
                        </p>
                    </div>

                    {/* Constraints / Hints */}
                    {constraint && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl text-amber-800 text-sm font-medium">
                            <Info className="shrink-0 w-5 h-5 mt-0.5 text-amber-600" />
                            <div>
                                <span className="font-bold block text-amber-900 mb-1">Key Constraints</span>
                                {constraint}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cheat Buttons (Dev/Test) */}
            <div className="flex justify-end gap-2 mb-2 px-4">
                {['3', '4', '5', '5*', '5**'].map(lvl => (
                    <button
                        key={lvl}
                        onClick={() => handleCheat(lvl)}
                        disabled={isSubmitting}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                        title={`Generate Level ${lvl} Response`}
                    >
                        L{lvl}
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="bg-white rounded-[2rem] p-1 shadow-sm border border-gray-200 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex justify-between items-center rounded-t-[1.8rem]">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <FileText size={14} />
                        Writer's Draft
                    </div>
                    <div className={`text-xs font-bold ${wordCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {wordCount} Words
                    </div>
                </div>
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Start writing here..."
                    className="w-full h-80 p-6 text-lg text-gray-800 placeholder-gray-300 resize-y focus:outline-none rounded-b-[1.8rem] leading-relaxed font-serif"
                    spellCheck="false"
                />
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !text.trim()}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-xl shadow-gray-200"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Polishing...
                        </>
                    ) : (
                        <>
                            Submit for Critique
                            <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default WritingWorkspace;
