import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, RotateCcw, ChevronDown } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MathInput from '../components/maths/MathInput';
import { getMathSkillName } from '../constants/mathMicroSkills';

const MathsLabPage = () => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { topic, level, taskId, title, xp } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Map: { qId: answerVal }
    const [showCheatMenu, setShowCheatMenu] = useState(false);

    useEffect(() => {
        if (!user || !topic) {
            navigate('/dashboard');
            return;
        }
        generatePracticeSession();
    }, [user, topic]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showCheatMenu && !e.target.closest('.cheat-menu-container')) {
                setShowCheatMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showCheatMenu]);

    const generatePracticeSession = async () => {
        console.log('[MathsLabPage] generatePracticeSession called with:', { topic, level, language, uid: user?.uid });
        setLoading(true);
        setQuestions([]);
        setAnswers({});
        setCurrentIndex(0);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('[MathsLabPage] Fetching from:', `${API_URL}/api/maths/diagnostic/practice/generate`);
            const res = await fetch(`${API_URL}/api/maths/diagnostic/practice/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user?.uid, topic, level: level || 3, language: language || 'en' })
            });

            if (res.ok) {
                let data = await res.json();
                console.log("[MathsLabPage] Received data:", data);

                // Ensure we handle both single object (legacy), array, and direct tasks array
                let tasks = [];
                if (Array.isArray(data)) {
                    tasks = data;
                } else if (data.interactive_tasks) {
                    tasks = Array.isArray(data.interactive_tasks) ? data.interactive_tasks : [data.interactive_tasks];
                } else if (data.tasks) {
                    tasks = Array.isArray(data.tasks) ? data.tasks : [data.tasks];
                }

                if (tasks.length === 0) {
                    setError("No questions available in AI response.");
                    return;
                }

                // Fallback ID generation and type normalization
                const formattedTasks = tasks.map((t, idx) => ({
                    ...t,
                    id: t.id || `q_${Date.now()}_${idx}`,
                    type: (t.type || '').includes('mc') ? 'mc' : 'short_answer',
                    text: t.text || t.question
                }));

                setQuestions(formattedTasks);
            } else {
                setError(`Server Error: ${res.status}`);
            }
        } catch (error) {
            console.error("Failed to generate practice", error);
            if (error.message === 'Failed to fetch') {
                setError("Connection timeout or server unreachable. The AI might be taking too long. Please try again or choose a simpler topic.");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (val) => {
        const currentQ = questions[currentIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: val
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleCheat = (level) => {
        // Auto-fill all answers with correct answers
        const cheatAnswers = {};
        questions.forEach(q => {
            if (q.type === 'short_answer' && q.solution_steps && Array.isArray(q.solution_steps)) {
                // For short answer, combine steps and final answer
                const stepsText = q.solution_steps.join('\n');
                cheatAnswers[q.id] = `Solution:\n${stepsText}\n\nFinal Answer: ${q.answer}`;
            } else {
                // For MC or simple answers
                cheatAnswers[q.id] = q.answer || '';
            }
        });
        setAnswers(cheatAnswers);
        setShowCheatMenu(false);
        alert(`Cheat activated! All answers filled for Level ${level}`);
    };

    const handleSubmitAll = async () => {
        // Check if all questions are answered
        const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');

        if (unanswered.length > 0) {
            const confirmed = window.confirm(
                `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
            );
            if (!confirmed) return;
        }

        // Navigate to review page with all data
        navigate('/maths-lab-review', {
            state: {
                questions,
                answers,
                topic,
                level,
                taskId,
                title,
                xp
            }
        });
    };

    const renderQuestionText = (text, question) => {
        if (!text) return null;

        // 1. Extract and Hide [DIAGRAM REQUIRED: ...] and [TABLE REQUIRED: ...] tags
        // We capture the descriptive text to show it in the placeholder
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

        // Regex for math delimiters:
        // - \[...\] : (\\\[[\s\S]*?\\\])
        // - \(...\) : (\\\([\s\S]*?\\\))
        // - $$...$$ : (\$\$[\s\S]*?\$\$)
        // - $...$   : (\$[^$]+?\$ )
        const parts = cleanText.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$\$[\s\S]*?\$\$)|(?:\$[^$]+?\$))/g);

        return (
            <div className="space-y-4">
                <div className="text-gray-800 leading-relaxed text-lg font-medium whitespace-pre-line break-words">
                    {parts.map((part, i) => {
                        if (!part) return null;

                        // Block Math: \[ ... \] or $$ ... $$
                        if ((part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'))) {
                            const math = part.slice(2, -2);
                            return (
                                <div key={i} className="my-4 overflow-x-auto text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                                <div key={i} className="my-4 overflow-x-auto text-center bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                    <BlockMath math={part} />
                                </div>
                            );
                        }

                        return <span key={i}>{part}</span>;
                    })}
                </div>

                {/* Diagram/Table Visualization */}
                {(text.includes('[DIAGRAM') || text.includes('[TABLE')) && (
                    <div className="my-8 p-10 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 shadow-inner">
                        {question?.diagram_svg ? (
                            <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                                <div
                                    className="w-full flex items-center justify-center"
                                    dangerouslySetInnerHTML={{ __html: question.diagram_svg }}
                                />
                                {description && (
                                    <p className="text-xs text-slate-600 italic text-center mt-4 leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-indigo-500/40">
                                    {text.includes('[TABLE') ? (
                                        <i className="fas fa-table text-3xl"></i>
                                    ) : (
                                        <i className="fas fa-chart-area text-3xl"></i>
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-slate-600 uppercase tracking-widest mb-2">
                                    {text.includes('[TABLE') ? 'Statistical Data Provided' : 'Geometric Visualization Provided'}
                                </h3>

                                {description ? (
                                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 text-slate-700 max-w-2xl w-full my-4 shadow-sm">
                                        <p className="text-sm leading-relaxed font-semibold italic text-center">
                                            "{description}"
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-center max-w-sm leading-relaxed text-slate-500 my-4">
                                        {text.includes('[TABLE')
                                            ? 'The data for this question is provided in the descriptive text above. Please refer to the labels to visualize the distribution.'
                                            : 'A detailed geometric or graphical description is provided in the question text. Use those coordinates and properties for your calculation.'}
                                    </p>
                                )}

                                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-50 px-3 py-1 rounded-full">
                                    <i className="fas fa-info-circle"></i>
                                    <span>Math Engine visualization active</span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <h2 className="text-xl font-bold text-slate-700">Generating Practice Set...</h2>
                <p className="text-slate-500">Preparing questions for {getMathSkillName(topic, language)}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border-2 border-red-50">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <div className="space-y-3">
                        <button onClick={generatePracticeSession} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Try Again
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!questions[currentIndex]) return <div className="p-10 text-center">No questions available. Try reloading.</div>;

    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ.id] || '';
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900">
                            {getMathSkillName(topic, language)}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                            Practice Lab • Level {level}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-600">
                        Question {currentIndex + 1} of {questions.length}
                    </span>

                    {/* Cheat Menu */}
                    <div className="relative cheat-menu-container">
                        <button
                            onClick={() => setShowCheatMenu(!showCheatMenu)}
                            className="px-4 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-all flex items-center gap-1"
                        >
                            Cheat <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCheatMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                                {[3, 4, 5, '5*', '5**'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => handleCheat(lvl)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Level {lvl}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitAll}
                        className="px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-all shadow-md"
                    >
                        Submit All
                    </button>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 z-40">
                <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <main className="flex-1 pt-20 p-6 pb-24">
                <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">

                    {/* Question Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-purple-600 uppercase mb-2 tracking-wider flex items-center gap-2">
                            <span className="bg-purple-100 px-2 py-0.5 rounded text-[10px]">
                                {currentQ.type === 'mc' ? 'MULTIPLE CHOICE' : 'SHORT ANSWER'}
                            </span>
                            Topic: {currentQ.topic || getMathSkillName(topic, language)}
                        </div>
                        <div className="text-lg text-gray-800 font-medium">
                            {renderQuestionText(currentQ.text, currentQ)}
                        </div>
                    </div>

                    {/* Answer Area */}
                    <div className="flex-1">
                        {currentQ.type === 'mc' ? (
                            // MCQ Options
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options?.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswerChange(opt)}
                                        className={`p-6 text-left rounded-xl border-2 transition-all ${currentAns === opt
                                            ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentAns === opt ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div className="flex-1">
                                                {renderQuestionText(opt)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // Short Answer with MathInput
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 font-medium">
                                    Show your steps below (LaTeX supported)
                                </div>
                                <div className="p-0">
                                    <MathInput
                                        id={`math-input-${currentQ.id}`}
                                        value={currentAns}
                                        onChange={handleAnswerChange}
                                        placeholder="Start typing your solution... (e.g. x^2 + 2x...)"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${currentIndex === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {isLastQuestion ? (
                            <button
                                onClick={handleSubmitAll}
                                className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-2"
                            >
                                Submit All
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 rounded-full font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MathsLabPage;
