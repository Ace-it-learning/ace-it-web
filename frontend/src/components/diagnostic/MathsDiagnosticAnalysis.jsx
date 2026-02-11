import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import { Sigma, Calculator, ChevronLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MathsDiagnosticAnalysis = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('paper1'); // Default to Conventional

    if (!state || !state.results) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center bg-white p-12 rounded-[2rem] shadow-xl border border-slate-200">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">No Analysis Data</h2>
                    <p className="text-slate-500 mb-8">We couldn't find your calibration results. Please try taking the test again.</p>
                    <button
                        onClick={() => navigate('/maths-diagnostic')}
                        className="bg-purple-600 px-8 py-3 rounded-2xl text-white font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                    >
                        Start New Calibration
                    </button>
                </div>
            </div>
        );
    }

    const { results, paperId } = state;

    const tabs = [
        { id: 'paper1', label: 'Paper 1 (Conventional)', icon: <Sigma className="w-4 h-4" /> },
        { id: 'paper2', label: 'Paper 2 (MCQ)', icon: <Calculator className="w-4 h-4" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/maths-diagnostic', { state: { results, fromAnalysis: true } })}
                        className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            Mathematical Deep Dive
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Paper Set {paperId || 'A'} • Matt's Review</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-purple-600 shadow-md ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {activeTab === 'paper1' && (
                            <ConventionalAnalysis
                                results={results.details.filter(d => d.id.includes('p1'))}
                                paper={results.paper || { questions: [] }}
                            />
                        )}
                        {activeTab === 'paper2' && (
                            <MCQAnalysis
                                results={results.details.filter(d => d.id.includes('p2'))}
                                paper={results.paper || { questions: [] }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

// --- Sub-Components ---

// --- Smart Text Renderer for Analysis ---
const SmartMathText = ({ text }) => {
    if (!text) return null;

    // 1. Strip [DIAGRAM REQUIRED: ...] and [TABLE REQUIRED: ...] tags from visual display
    const displaySubtext = text
        .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
        .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
        .trim();

    // Split by newlines to handle multi-row requirement
    const lines = displaySubtext.split(/\n/g);

    return (
        <div className="space-y-4">
            {lines.map((line, lineIdx) => {
                if (!line.trim()) return lineIdx === 0 ? null : <div key={lineIdx} className="h-2" />;

                // Detect "Step X:" prefix
                const stepMatch = line.match(/^(Step \d+:)/i);
                let content = line;
                let stepPrefix = null;

                if (stepMatch) {
                    stepPrefix = stepMatch[1];
                    content = line.replace(stepMatch[1], '').trim();
                }

                // 2. Smart Mixed-Mode Renderer to handle text, inline math ($...$, \(...\)), and block math (\[...\], $$...$$)
                const cleanLine = content.replace(/\\\\\$/g, '$').replace(/\\\\\\\[/g, '\\[').replace(/\\\\\\\]/g, '\\]');
                const parts = cleanLine.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$\$[\s\S]*?\$\$)|(?:\$[^$]+?\$))/g);

                return (
                    <div key={lineIdx} className="leading-relaxed flex flex-wrap items-baseline gap-x-1">
                        {stepPrefix && (
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mr-1 shadow-sm shrink-0 ${stepPrefix.includes('1') ? 'bg-indigo-100 text-indigo-700' :
                                stepPrefix.includes('2') ? 'bg-violet-100 text-violet-700' :
                                    stepPrefix.includes('3') ? 'bg-fuchsia-100 text-fuchsia-700' :
                                        'bg-teal-100 text-teal-700'
                                }`}>
                                {stepPrefix}
                            </span>
                        )}
                        <span className="text-slate-700 font-medium whitespace-pre-wrap">
                            {parts.map((part, i) => {
                                if (!part) return null;
                                // Block Math: \[ ... \] or $$ ... $$
                                if ((part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'))) {
                                    return <div key={i} className="my-2 w-full text-center bg-slate-50/50 p-3 rounded-lg"><BlockMath math={part.slice(2, -2)} /></div>;
                                }
                                // 0. Extract diagram/table description
                                const diagramMatch = part.match(/\[DIAGRAM REQUIRED:([\s\S]*?)\]/);
                                const tableMatch = part.match(/\[TABLE REQUIRED:([\s\S]*?)\]/);
                                const description = (diagramMatch ? diagramMatch[1] : (tableMatch ? tableMatch[1] : '')).trim();

                                if (description) {
                                    return (
                                        <div key={i} className="my-2 w-full p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 text-center">
                                            <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-400">
                                                <i className={`fas ${tableMatch ? 'fa-table' : 'fa-chart-area'}`}></i>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                Technical {tableMatch ? 'Data' : 'Figure'} Preview
                                            </p>
                                            <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{description}"</p>
                                        </div>
                                    );
                                }

                                // Inline Math: \( ... \) or $ ... $
                                else if ((part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'))) {
                                    const math = part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1);
                                    return <InlineMath key={i} math={math} />;
                                }

                                // Safety Net: If the whole part is raw LaTeX but missing delimiters
                                // Heuristic: contains common LaTeX and doesn't look like plain text
                                const isRawMath = (/[\\^=]/.test(part) || part.includes('_')) && !/^[A-Z][a-z]+ /.test(part);
                                if (isRawMath && parts.length === 1) {
                                    return <div key={i} className="my-2 w-full text-center bg-slate-50/50 p-3 rounded-lg"><BlockMath math={part} /></div>;
                                }

                                return <span key={i}>{part}</span>;
                            })}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const ConventionalAnalysis = ({ results }) => {
    return (
        <div className="space-y-10">
            {results.map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                    {/* Header: Score & Topic */}
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center group-hover:bg-purple-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm">
                                Q{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.topic || 'General Math'}</span>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 ${item.score === item.max
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.score > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                            {item.score === item.max ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {item.score} / {item.max} Marks
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Question Text */}
                        <div className="mb-10 text-xl text-slate-800 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                            <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Question Fragment</div>
                            <SmartMathText text={item.question_text} />
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 gap-8">
                            {/* Student Answer */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Submission</label>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[80px]">
                                    {item.student_answer ? (
                                        <div className="text-lg">
                                            <BlockMath math={
                                                typeof item.student_answer === 'string'
                                                    ? item.student_answer.replace(/\n/g, ' \\\\[1.2em] ')
                                                    : Object.entries(item.student_answer)
                                                        .map(([k, v]) => `\\text{Part (${k}): } ${v}`)
                                                        .join(' \\\\[1.2em] ')
                                            } />
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 italic font-medium">No steps provided.</div>
                                    )}
                                </div>
                            </div>

                            {/* Deep Analysis & Micro-skills */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[8px] animate-pulse">✨</div>
                                    DSE Expert Analysis
                                </label>
                                <div className="p-8 bg-purple-50/50 rounded-2xl border border-purple-100 text-slate-800 leading-relaxed font-medium">
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-purple-900 mb-2">Step-by-Step Explanation</h4>
                                        <div className="text-base text-slate-700 space-y-2">
                                            <SmartMathText text={item.explanation || item.feedback || "Detailed analysis unavailable."} />
                                        </div>
                                    </div>

                                    {item.micro_skills && item.micro_skills.length > 0 && (
                                        <div className="pt-6 border-t border-purple-100">
                                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Micro-Skills Assessed</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {item.micro_skills.map((skill, sIdx) => (
                                                    <span key={sIdx} className="px-3 py-1 bg-white border border-purple-100 rounded-lg text-xs font-bold text-purple-600 shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MCQAnalysis = ({ results }) => {
    return (
        <div className="grid grid-cols-1 gap-6">
            {results.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start gap-6 hover:border-purple-200 transition-colors">
                    {/* Number Badge */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${item.is_correct ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                        {idx + 1}
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Question {idx + 1} • {item.topic}</h4>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase border border-slate-200">
                                    {item.max} Mark
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${item.is_correct ? 'bg-emerald-400 text-white' : 'bg-rose-400 text-white'
                                    }`}>
                                    {item.is_correct ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 text-slate-800 font-medium text-lg">
                            <SmartMathText text={item.question_text} />
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs font-bold">Your Ans:</span>
                                <span className={`font-black text-lg ${item.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    <InlineMath math={item.student_answer || 'N/A'} />
                                </span>
                            </div>
                            {!item.is_correct && (
                                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                                    <span className="text-slate-400 text-xs font-bold">Correct:</span>
                                    <span className="font-black text-lg text-slate-800">
                                        <InlineMath math={item.explanation?.match(/Answer: (.*)/)?.[1] || item.correct_answer || 'Check Explanation'} />
                                        {/* Fallback to simple logic if exact answer not strictly parsed */}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Deep Logic Section */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h5 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                🔍 Logic Breakdown
                            </h5>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                <SmartMathText text={item.explanation || "No deep analysis available."} />
                            </p>

                            {item.micro_skills && item.micro_skills.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.micro_skills.map((skill, sIdx) => (
                                        <span key={sIdx} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MathsDiagnosticAnalysis;
