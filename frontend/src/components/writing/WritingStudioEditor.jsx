import React from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, PenTool } from 'lucide-react';

const WritingStudioEditor = ({ 
    title, 
    content, 
    onTitleChange, 
    onContentChange, 
    onSubmit, 
    isSubmitting,
    wordCount,
    isMock = false
}) => {
    return (
        <div className="flex flex-col h-full gap-6">
            {/* ... title area and editor surface ... */}
            {/* Title Area */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter your title here..."
                    className="w-full bg-transparent border-none text-3xl font-black text-slate-900 placeholder:text-slate-200 focus:ring-0"
                />
            </div>

            {/* Editor Surface */}
            <div className="flex-1 relative flex flex-col min-h-0">
                <textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Start drafting your DSE masterpiece here..."
                    className="flex-1 w-full bg-white rounded-[2.5rem] p-10 text-slate-800 font-bold text-lg leading-relaxed shadow-sm border border-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none placeholder:text-slate-200"
                />
            </div>

            {/* Submit Action Block */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Word Count Pill (Relocated from Header) */}
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <PenTool size={16} className="text-indigo-500" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Current Word Count</span>
                            <span className="text-sm font-black text-indigo-700 tabular-nums">
                                {wordCount} words
                            </span>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting || content.length < 50}
                    className={`px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-xl
                        ${content.length >= 50 
                            ? (isMock ? 'bg-indigo-600' : 'bg-slate-900') + ' text-white hover:bg-black hover:scale-105 active:scale-95' 
                            : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'}
                    `}
                >
                    {isSubmitting ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <><Send size={20} /> {isMock ? 'Hand in Paper' : 'Final Submission'}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default WritingStudioEditor;
