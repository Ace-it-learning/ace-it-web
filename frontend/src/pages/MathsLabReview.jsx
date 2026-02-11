import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, CheckCircle, XCircle, Trophy, Home } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { getMathSkillName } from '../constants/mathMicroSkills';
import MathStepExplainer from '../components/maths/MathStepExplainer';

const MathsLabReview = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { questions, answers, topic, level, taskId, title, xp } = location.state || {};

    const [results, setResults] = useState([]);
    const [score, setScore] = useState(0);
    const [submitting, setSubmitting] = useState(true);

    useEffect(() => {
        if (!questions || !answers) {
            navigate('/dashboard');
            return;
        }
        gradeAnswers();
    }, [questions, answers]);

    const gradeAnswers = async () => {
        // Grade all answers
        const gradedResults = questions.map(q => {
            const userAnswer = (answers[q.id] || '').trim();
            const correctAnswer = (q.answer || '').trim();

            // 1. Exact match (pre-cleaning)
            let isCorrect = userAnswer === correctAnswer;

            // 2. Short Answer smart matching
            if (!isCorrect && q.type === 'short_answer') {
                // Clean both of LaTeX markers and whitespace
                const clean = (str) => str.replace(/[\$\\]/g, '').replace(/\s+/g, '').toLowerCase();
                const cUser = clean(userAnswer);
                const cCorrect = clean(correctAnswer);

                if (cUser === cCorrect) {
                    isCorrect = true;
                } else if (cUser.includes(cCorrect) && cCorrect.length > 1) {
                    // Fallback: If the user solution contains the final answer
                    isCorrect = true;
                }
            }

            return {
                id: q.id,
                correct: isCorrect,
                userAnswer,
                correctAnswer,
                question: q
            };
        });

        const correctCount = gradedResults.filter(r => r.correct).length;
        setResults(gradedResults);
        setScore(correctCount);

        // Submit to backend for XP/progress
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${API_URL}/api/maths/diagnostic/practice/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid,
                    topic,
                    level,
                    score: correctCount,
                    total: questions.length,
                    taskId,
                    xp
                })
            });
        } catch (error) {
            console.error('Failed to submit results:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderMath = (text) => {
        if (!text) return null;

        // 1. Extract and Hide [DIAGRAM REQUIRED: ...] and [TABLE REQUIRED: ...] tags
        const diagramMatch = text.match(/\[DIAGRAM REQUIRED:([\s\S]*?)\]/);
        const tableMatch = text.match(/\[TABLE REQUIRED:([\s\S]*?)\]/);
        const description = (diagramMatch ? diagramMatch[1] : (tableMatch ? tableMatch[1] : '')).trim();

        const displaySubtext = text
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .trim();

        // 2. Smart Mixed-Mode Renderer to handle text, inline math ($...$, \(...\)), and block math (\[...\], $$...$$)
        // Correcting escaped delimeters if they exist
        const cleanText = displaySubtext.replace(/\\\\\$/g, '$').replace(/\\\\\\\[/g, '\\[').replace(/\\\\\\\]/g, '\\]');

        // Regex for math delimiters
        const parts = cleanText.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$\$[\s\S]*?\$\$)|(?:\$[^$]+?\$))/g);

        return (
            <div className="text-gray-800 leading-relaxed space-y-4">
                <div>
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

                        // Safety Net: If the whole part is raw LaTeX but missing delimiters
                        // Heuristic: contains common LaTeX and doesn't look like plain text
                        const isRawMath = (/[\\^=]/.test(part) || part.includes('_')) && !/^[A-Z][a-z]+ /.test(part);
                        if (isRawMath && parts.length === 1) {
                            return (
                                <div key={i} className="my-3 overflow-x-auto text-center bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                    <BlockMath math={part} />
                                </div>
                            );
                        }

                        return <span key={i}>{part}</span>;
                    })}
                </div>

                {description && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 text-center my-2">
                        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-400">
                            <i className={`fas ${tableMatch ? 'fa-table' : 'fa-chart-area'}`}></i>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Technical {tableMatch ? 'Data' : 'Figure'} Preview
                        </p>
                        <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{description}"</p>
                    </div>
                )}
            </div>
        );
    };

    if (submitting) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <h2 className="text-xl font-bold text-slate-700">Grading Your Answers...</h2>
                <p className="text-slate-500">Analyzing your responses</p>
            </div>
        );
    }

    if (!questions || !results.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
                    <h2 className="text-2xl font-black text-slate-800 mb-4">No Results Found</h2>
                    <p className="text-slate-500 mb-8">We couldn't find your practice results.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-purple-600 px-8 py-3 rounded-2xl text-white font-black hover:bg-purple-700 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const scorePercent = Math.round((score / questions.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            Practice Review
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            {getMathSkillName(topic, language)} • Level {level}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-slate-500 font-medium">Your Score</p>
                        <p className="text-2xl font-black text-purple-600">{score}/{questions.length}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                {/* Score Summary */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-8 h-8" />
                                <h2 className="text-3xl font-black">Practice Complete!</h2>
                            </div>
                            <p className="text-purple-100">
                                You scored <span className="font-black text-white">{scorePercent}%</span> on this practice set
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-6xl font-black">{score}</div>
                            <div className="text-purple-200 text-sm">out of {questions.length}</div>
                        </div>
                    </div>
                </div>

                {/* Question Review */}
                <div className="space-y-6">
                    {results.map((result, idx) => (
                        <div
                            key={result.id}
                            className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 overflow-hidden"
                        >
                            {/* Question Header */}
                            <div className={`px-6 py-4 flex items-center justify-between ${result.correct ? 'bg-emerald-50' : 'bg-red-50'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {result.correct ? (
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                            Question {idx + 1}
                                        </span>
                                        <p className={`font-black ${result.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {result.correct ? 'Correct' : 'Incorrect'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full">
                                    {result.question.type === 'mc' ? 'MCQ' : 'Short Answer'}
                                </span>
                            </div>

                            {/* Question Content */}
                            <div className="p-6 space-y-6">
                                {/* Question Text */}
                                <div>
                                    <div className="text-lg font-medium text-slate-800">
                                        {renderMath(result.question.text)}
                                    </div>
                                    {result.question.diagram_svg && (
                                        <div
                                            className="mt-4 p-4 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center overflow-x-auto"
                                            dangerouslySetInnerHTML={{ __html: result.question.diagram_svg }}
                                        />
                                    )}
                                </div>

                                {/* User Answer */}
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Your Answer</p>
                                    <div className={`p-4 rounded-xl border-2 ${result.correct
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-red-50 border-red-200'
                                        }`}>
                                        {result.userAnswer ? (
                                            renderMath(result.userAnswer)
                                        ) : (
                                            <span className="text-slate-400 italic">No answer provided</span>
                                        )}
                                    </div>
                                </div>

                                {/* Correct Answer (if wrong) */}
                                {!result.correct && (
                                    <div>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2">Correct Answer</p>
                                        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                                            {renderMath(result.correctAnswer)}
                                        </div>
                                    </div>
                                )}

                                {/* Solution Steps */}
                                {result.question.solution_steps && result.question.solution_steps.length > 0 && (
                                    <div>
                                        <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-3">Step-by-Step Solution</p>
                                        <div className="space-y-4">
                                            {result.question.solution_steps.map((step, stepIdx) => (
                                                <div key={stepIdx} className="flex gap-3 group relative">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center">
                                                        {stepIdx + 1}
                                                    </div>
                                                    <div className="flex-1 pt-1 flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            {renderMath(step)}
                                                        </div>
                                                        <MathStepExplainer
                                                            question={result.question.text}
                                                            fullSolution={result.question.solution_steps.join('\n')}
                                                            targetStep={step}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                    >
                        Practice Again
                    </button>
                </div>
            </main>
        </div>
    );
};

export default MathsLabReview;
