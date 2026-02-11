import React, { useState } from 'react';
import { Sparkles, Loader2, X, ChevronRight, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MathStepExplainer = ({ question, fullSolution, targetStep }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleExplain = async (e) => {
        e.stopPropagation();
        if (explanation) {
            setIsOpen(true);
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/lab/explain-step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    fullSolution,
                    targetStep,
                    language
                })
            });

            if (res.ok) {
                const data = await res.json();
                setExplanation(data);
                setIsOpen(true);
            }
        } catch (err) {
            console.error("Math Explanation Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderMathText = (text) => {
        if (!text) return null;

        // 1. Smart Mixed-Mode Renderer to handle text, inline math ($...$, \(...\)), and block math (\[...\], $$...$$)
        // Correcting escaped delimeters if they exist
        const cleanText = text.replace(/\\\\\$/g, '$').replace(/\\\\\\\[/g, '\\[').replace(/\\\\\\\]/g, '\\]');

        // Regex for math delimiters:
        // - \[...\] : (\\\[[\s\S]*?\\\])
        // - \(...\) : (\\\([\s\S]*?\\\))
        // - $$...$$ : (\$\$[\s\S]*?\$\$)
        // - $...$   : (\$[^$]+?\$ )
        const parts = cleanText.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(\$\$[\s\S]*?\$\$)|(\$[^$]+?\$))/g);

        return (
            <div className="space-y-4">
                {parts.map((part, i) => {
                    if (!part) return null;

                    // Block Math: \[ ... \] or $$ ... $$
                    if ((part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'))) {
                        const math = part.slice(2, -2);
                        return (
                            <div key={i} className="my-3 overflow-x-auto text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <BlockMath math={math} />
                            </div>
                        );
                    }
                    // Inline Math: \( ... \) or $ ... $
                    else if ((part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'))) {
                        const math = part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1);
                        return <InlineMath key={i} math={math} />;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="relative inline-block ml-2 align-middle">
            {/* Explainer Trigger */}
            <button
                onClick={handleExplain}
                disabled={loading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${explanation
                    ? 'bg-indigo-600 text-white shadow-indigo-200'
                    : 'bg-white text-indigo-600 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                title={t('math_tutor.explain_step')}
            >
                {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : (
                    <Sparkles size={12} className={explanation ? 'text-indigo-200' : 'text-indigo-500'} />
                )}
                {explanation ? t('math_tutor.explain_step') : t('math_tutor.explain_step')}
            </button>

            {/* Modal/Overlay */}
            {isOpen && explanation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-indigo-600 p-6 text-white relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">{t('math_tutor.deep_dive_title')}</h3>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Mr. Wong's Special Breakdown</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Target Step Highlight */}
                            <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Line</p>
                                <div className="text-lg font-bold text-slate-800">
                                    <BlockMath math={targetStep.replace(/\$/g, '')} />
                                </div>
                            </div>

                            {/* Prereqs */}
                            {explanation.prerequisites && explanation.prerequisites.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {explanation.prerequisites.map((p, i) => (
                                        <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                                            <Info size={10} /> {p}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Main Explanation */}
                            <div className="bg-white text-slate-700 leading-relaxed text-sm">
                                {renderMathText(explanation.explanation)}
                            </div>

                            {/* Pro-Tip */}
                            {explanation.pro_tip && (
                                <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-10">
                                        <TrophyIcon size={80} />
                                    </div>
                                    <h4 className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-widest mb-2">
                                        <span>🌟</span> {t('math_tutor.pro_tip')}
                                    </h4>
                                    <p className="text-emerald-700 text-xs italic relative z-10">"{explanation.pro_tip}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                            >
                                {t('math_tutor.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrophyIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 21H16M12 17V21M7 4H17M17 4C17 4 19 4 19 7C19 10 17 11 17 11M17 4V13C17 15.7614 14.7614 18 12 18C9.23858 18 7 15.7614 7 13V4M7 4C7 4 5 4 5 7C5 10 7 11 7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default MathStepExplainer;
