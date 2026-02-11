import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Home, BookOpen, AlertCircle } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MathStepExplainer from '../components/maths/MathStepExplainer';

const MathsDeepDivePage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { result } = location.state || {};

    const [activePart, setActivePart] = useState(1);

    if (!result) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-600">No Review Data Available</h2>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 font-bold hover:underline">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { details } = result;
    const questionsList = Object.values(details);
    const visibleQuestions = questionsList.filter(q => (q.question?.part || 1) === activePart);

    const renderMath = (text) => {
        if (!text) return <span className="text-slate-400 italic">No text content</span>;

        const displaySubtext = text
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .trim();

        const parts = displaySubtext.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$\$[\s\S]*?\$\$)|(?:\$[^$]+?\$))/g);

        return (
            <div className="text-gray-800 leading-relaxed space-y-4">
                {parts.map((part, i) => {
                    if (!part) return null;
                    if ((part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'))) {
                        return <div key={i} className="my-2 overflow-x-auto"><BlockMath math={part.slice(2, -2)} /></div>;
                    } else if ((part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'))) {
                        return <InlineMath key={i} math={part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1)} />;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-16 bg-white shadow-sm z-50 px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-800">Exam Review: Set {examId}</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Deep Dive Analysis</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActivePart(1)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === 1 ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Section A
                    </button>
                    <button
                        onClick={() => setActivePart(2)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === 2 ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Section B
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-24 pb-12 px-4 space-y-6">
                {visibleQuestions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">No questions in this section.</p>
                    </div>
                ) : (
                    visibleQuestions.map((item, idx) => (
                        <div key={idx} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden ${item.isCorrect ? 'border-emerald-100' : 'border-red-100'}`}>
                            {/* Question Status Header */}
                            <div className={`px-6 py-3 flex items-center justify-between ${item.isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                <div className="flex items-center gap-3">
                                    {item.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                                    <span className={`font-bold text-sm ${item.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {item.isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-white/50 px-2 py-1 rounded">
                                    {item.score} / {item.maxScore} Marks
                                </span>
                            </div>

                            <div className="p-6 md:p-8 space-y-8">
                                {/* Question */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Question</h3>
                                    <div className="text-lg">
                                        {renderMath(item.question?.text || "Question text unavailable")}
                                    </div>
                                    {item.question?.imageURL && (
                                        <div className="mt-4">
                                            <img src={item.question.imageURL} alt="Diagram" className="max-h-60 rounded-lg border border-slate-200" />
                                        </div>
                                    )}
                                </div>

                                {/* Comparison Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`p-4 rounded-xl border-2 ${item.isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Your Answer</h4>
                                        <div className="font-mono text-slate-700 break-words">
                                            {item.userAnswer ? renderMath(item.userAnswer) : <span className="text-slate-400 italic">Empty</span>}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-indigo-50/50 border-2 border-indigo-100">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Model Answer</h4>
                                        <div className="font-mono text-indigo-700 break-words">
                                            {renderMath(item.correctAnswer)}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Explanation / Solution */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                        <h3 className="text-xs font-black text-purple-600 uppercase tracking-wider">Marking Scheme & Explanation</h3>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed mb-4">
                                        {renderMath(item.explanation || "No explanation provided.")}
                                    </div>

                                    {/* AI Step Explainer (Only for Conventional) */}
                                    {item.question?.type !== 'mc' && !item.isCorrect && (
                                        <MathStepExplainer
                                            question={item.question?.text}
                                            fullSolution={item.correctAnswer} // Using model answer as solution source
                                            targetStep={item.correctAnswer} // Explaining the final answer context
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default MathsDeepDivePage;
