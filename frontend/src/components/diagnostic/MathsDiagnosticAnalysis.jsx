import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeInlineMath, SafeBlockMath } from '../maths/SafeMath';
import { Sigma, Calculator, ChevronLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatNumbers, sanitizeMath, prepareMathText, splitContentByDelimiters, looksLikeMath } from '../../utils/mathFormattingUtils';
import MathStepExplainer from '../maths/MathStepExplainer';
import GeometryRenderer from '../maths/GeometryRenderer';

const MathsDiagnosticAnalysis = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
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
                                language={language}
                            />
                        )}
                        {activeTab === 'paper2' && (
                            <MCQAnalysis
                                results={results.details.filter(d => d.id.includes('p2'))}
                                paper={results.paper || { questions: [] }}
                                language={language}
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

    const displaySubtext = text
        .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
        .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
        .trim();

    const cleanText = prepareMathText(displaySubtext);
    const parts = splitContentByDelimiters(cleanText);

    return (
        <div className="space-y-4">
            <div className="text-slate-700 font-medium font-sans leading-relaxed">
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

                    // For plain text, split by lines to handle "Step X:" prefixes
                    return (
                        <span key={i}>
                            {part.split(/(?:\r?\n|(?=\.Step\s*\d+\s*:?))/).map((line, lineIdx, arr) => {
                                if (!line.trim() && arr.length > 1) {
                                    return <br key={lineIdx} />;
                                }
                                const trimmedLine = line.trim().replace(/^\./, ''); // Clean leading dot artifact
                                if (!trimmedLine) return null;

                                // Detect "Step X:" prefix (more flexible regex)
                                const stepMatch = trimmedLine.match(/^(Step\s*\d+\s*:?)/i);
                                let innerContent = trimmedLine;
                                let stepPrefix = null;

                                if (stepMatch) {
                                    stepPrefix = stepMatch[1];
                                    innerContent = trimmedLine.replace(stepMatch[1], '').trim();
                                }

                                const isMathLine = looksLikeMath(innerContent || stepPrefix);

                                return (
                                    <React.Fragment key={lineIdx}>
                                        <div className="flex flex-wrap items-baseline gap-x-1 mb-1">
                                            {stepPrefix && (
                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mr-1 shadow-sm shrink-0 ${stepPrefix.includes('1') ? 'bg-indigo-100 text-indigo-700' :
                                                    stepPrefix.includes('2') ? 'bg-violet-100 text-violet-700' :
                                                        stepPrefix.includes('3') ? 'bg-fuchsia-100 text-fuchsia-700' :
                                                            'bg-teal-100 text-teal-700'
                                                    }`}>
                                                    {stepPrefix}
                                                </span>
                                            )}
                                            {isMathLine ? (
                                                <SafeInlineMath key={lineIdx} math={formatNumbers(sanitizeMath(innerContent.replace(/%/g, '\\%').replace(/___HKD___/g, '\\text{HK}\\$').replace(/___USD___/g, '\\$')), true)} className="mx-1" />
                                            ) : (
                                                <span className="whitespace-pre-wrap">{formatNumbers(innerContent).replace(/___HKD___/g, 'HK$').replace(/___USD___/g, '$').replace(/\\,/g, ' ')}</span>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

const ConventionalAnalysis = ({ results, language }) => {
    const isChinese = language?.startsWith('zh');
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
                            {item.diagram_json && (
                                <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
                                    <GeometryRenderer data={item.diagram_json} />
                                </div>
                            )}
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 gap-8">
                            {/* Student Answer */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Submission</label>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[80px]">
                                    {item.student_answer ? (
                                        <div className="text-lg">
                                            <SmartMathText text={
                                                typeof item.student_answer === 'string'
                                                    ? item.student_answer
                                                    : Object.entries(item.student_answer)
                                                        .map(([k, v]) => `Part (${k}): ${v}`)
                                                        .join('\n')
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
                                        <div className="text-base text-slate-700 space-y-2 mb-4">
                                            <SmartMathText text={(isChinese && item.explanation_zh) ? item.explanation_zh : (item.explanation || item.feedback || "Detailed analysis unavailable.")} />
                                        </div>
                                        <MathStepExplainer
                                            question={item.question_text}
                                            fullSolution={item.explanation || item.feedback}
                                            targetStep={item.explanation || item.feedback}
                                        />
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

const MCQAnalysis = ({ results, language }) => {
    const isChinese = language?.startsWith('zh');
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
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${item.score === item.max ? 'bg-emerald-400 text-white' : item.score > 0 ? 'bg-amber-400 text-white' : 'bg-rose-400 text-white'}`}>
                                    {item.score || 0} / {item.max || 1} Marks
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 text-slate-800 font-medium text-lg">
                            <SmartMathText text={item.question_text} />
                            {item.diagram_json && (
                                <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
                                    <GeometryRenderer data={item.diagram_json} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs font-bold">Your Ans:</span>
                                <span className={`font-black text-lg ${item.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {/[\\$α-ωΔ-Ω]/.test(item.student_answer || '') ? (
                                        <SafeInlineMath math={sanitizeMath(item.student_answer || 'N/A')} />
                                    ) : (
                                        <span>{item.student_answer || 'N/A'}</span>
                                    )}
                                </span>
                            </div>
                            {!item.is_correct && (
                                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                                    <span className="text-slate-400 text-xs font-bold">Correct:</span>
                                    <span className="font-black text-lg text-slate-800">
                                        {/[\\$α-ωΔ-Ω]/.test(item.correct_answer || item.explanation || '') ? (
                                            <SafeInlineMath math={sanitizeMath(item.explanation?.match(/Answer: (.*)/)?.[1] || item.correct_answer || 'Check Explanation')} />
                                        ) : (
                                            <span>{item.explanation?.match(/Answer: (.*)/)?.[1] || item.correct_answer || 'Check Explanation'}</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Deep Logic Section */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h5 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                🔍 Logic Breakdown
                            </h5>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                <SmartMathText text={(isChinese && item.explanation_zh) ? item.explanation_zh : (item.explanation || "No deep analysis available.")} />
                            </p>
                            <MathStepExplainer
                                question={item.question_text}
                                fullSolution={item.explanation}
                                targetStep={item.explanation}
                            />

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
