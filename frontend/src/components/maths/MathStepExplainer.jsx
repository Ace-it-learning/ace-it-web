import React, { useState } from 'react';
import { Sparkles, Loader2, X, ChevronRight, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import { SafeInlineMath, SafeBlockMath } from './SafeMath';
import 'katex/dist/katex.min.css';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../../utils/mathFormattingUtils';

const MathStepExplainer = ({ question, fullSolution, targetStep }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { activeAgent } = useAvatar();

    // For Math specific components, we always prioritize Matt sir
    const tutorName = activeAgent?.id === 'math' ? activeAgent.name : 'Matt sir';

    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Local formatting helpers replaced by mathFormattingUtils

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

        const cleanText = prepareMathText(text);
        const parts = splitContentByDelimiters(cleanText);

        return (
            <div className="space-y-4 font-sans text-slate-700">
                {parts.map((part, i) => {
                    if (!part) return null;

                    const isBlock = (part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'));
                    const isInline = (part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'));

                    if (isBlock || isInline) {
                        let math = '';
                        if (part.startsWith('\\[') || part.startsWith('\\(')) math = part.slice(2, -2);
                        else if (part.startsWith('$$')) math = part.slice(2, -2);
                        else math = part.slice(1, -1);

                        math = math
                            .replace(/\n/g, ' ')
                            .replace(/%/g, '\\%')
                            .replace(/___HKD___/g, '\\text{HK}\\$')
                            .replace(/___USD___/g, '\\$');

                        const labeledMath = sanitizeMath(math);
                        const finalMath = formatNumbers(labeledMath, true);

                        if (isBlock) {
                            return (
                                <SafeBlockMath key={i} math={finalMath} className="my-2" />
                            );
                        } else {
                            return (
                                <SafeInlineMath key={i} math={finalMath} className="mx-0.5" />
                            );
                        }
                    }

                    // For plain text, split by newlines so we can render paragraphs and apply heuristics to standalone lines
                    return (
                        <span key={i}>
                            {part.split(/\r?\n/).map((line, lineIdx, arr) => {
                                if (!line.trim() && arr.length > 1) {
                                    return <br key={lineIdx} />;
                                }
                                const trimmedLine = line.trim();
                                if (!trimmedLine) return null;

                                const isMathLine = looksLikeMath(trimmedLine);

                                if (isMathLine) {
                                    const mathReadyLine = trimmedLine
                                        .replace(/%/g, '\\%')
                                        .replace(/___HKD___/g, '\\text{HK}\\$')
                                        .replace(/___USD___/g, '\\$');

                                    const labeledMath = sanitizeMath(mathReadyLine);
                                    const finalMath = formatNumbers(labeledMath, true);

                                    return (
                                        <SafeInlineMath key={lineIdx} math={finalMath} className="mx-1" />
                                    );
                                } else {
                                    const formattedLine = formatNumbers(trimmedLine);
                                    const html = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/___HKD___/g, 'HK$').replace(/___USD___/g, '$')
                                        .replace(/\\,/g, ' '); // Strip LaTeX spaces in plain text

                                    return (
                                        <React.Fragment key={lineIdx}>
                                            <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
                                            {lineIdx < arr.length - 1 && <span className="mx-0.5" />}
                                        </React.Fragment>
                                    );
                                }
                            })}
                        </span>
                    );
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
                {explanation ? t('math_tutor.explain_step', { tutorName }) : t('math_tutor.explain_step', { tutorName })}
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
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Tutor's Special Breakdown</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Target Step Highlight */}
                            <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Line</p>
                                <div className="text-lg font-bold text-slate-800">
                                    {renderMathText(targetStep)}
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
                                        <span>🌟</span> {t('math_tutor.pro_tip', { tutorName })}
                                    </h4>
                                    <p className="text-emerald-700 text-xs italic relative z-10">"{formatNumbers(explanation.pro_tip)}"</p>
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
