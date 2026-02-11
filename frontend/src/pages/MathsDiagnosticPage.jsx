import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import MathInput from '../components/maths/MathInput';
import MathsDiagnosticResult from '../components/diagnostic/MathsDiagnosticResult';
import MathsDiagnosticLanding from '../components/diagnostic/MathsDiagnosticLanding';

const MathsAnalysisLoading = () => {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    const statuses = [
        "Analyzing your step-by-step logic...",
        "Evaluating algebraic fluency...",
        "Checking geometric intuition...",
        "Mapping DSE proficiency levels...",
        "Synthesizing personalized roadmap...",
        "Finalizing your math profile..."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return prev;
                // Roughly 30 seconds to get to ~95%
                // 30000ms / 500ms = 60 updates. 95 / 60 = 1.58
                const inc = prev > 85 ? 0.2 : prev > 60 ? 0.8 : 1.6;
                return Math.min(prev + inc, 98);
            });
        }, 500);

        const statusTimer = setInterval(() => {
            setStatusIndex(prev => (prev < statuses.length - 1 ? prev + 1 : prev));
        }, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(statusTimer);
        };
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 mb-10 relative">
                <div className="absolute inset-0 rounded-3xl border-4 border-purple-500/10" />
                <div className="absolute inset-0 rounded-3xl border-4 border-t-purple-600 animate-spin" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-pulse">∑</span>
                </div>
            </div>

            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-purple-100 mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div className="text-left">
                        <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">Deep Logic Analysis</p>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {statuses[statusIndex]}
                        </h2>
                    </div>
                    <span className="text-3xl font-black text-purple-600 font-mono">{Math.round(progress)}%</span>
                </div>

                <div className="h-4 bg-purple-50 rounded-full overflow-hidden border border-purple-100 shadow-inner p-1">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <p className="text-slate-400 text-sm max-w-xs leading-relaxed italic">
                Matt Sir is evaluating your mathematical steps to map your DSE potential. This usually takes about 30 seconds.
            </p>
        </div>
    );
};

const MathsDiagnosticPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [paperId, setPaperId] = useState('A');

    // State: 'intro', 'part1' (Conventional), 'part2' (MCQ), 'submitting', 'result'
    // Restore stage and results if coming back from analysis
    const [stage, setStage] = useState(location.state?.fromAnalysis ? 'result' : 'intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showCheat, setShowCheat] = useState(false);
    const [results, setResults] = useState(location.state?.results || null);

    const handleCheat = async (level) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/diagnostic/debug/paper/${paperId}`);
            const fullPaper = await res.json();

            const newAnswers = { ...answers };
            const mcqQuestions = fullPaper.questions.filter(q => q.part === 2);
            const convQuestions = fullPaper.questions.filter(q => q.part === 1);

            // Accuracy map for MCQ
            const accuracy = { '5**': 1.0, '5*': 0.9, '5': 0.8, '4': 0.6, '3': 0.4, '2': 0.2, '1': 0.1 }[level] || 1.0;

            // Handle MCQs
            mcqQuestions.forEach(q => {
                if (Math.random() <= accuracy) {
                    newAnswers[q.id] = q.answer;
                } else {
                    const wrong = q.options.filter(o => o !== q.answer);
                    newAnswers[q.id] = wrong[Math.floor(Math.random() * wrong.length)];
                }
            });

            // Handle Conventional
            convQuestions.forEach(q => {
                const solution = q.model_answer || q.marking_scheme;
                // Clean any $ signs and convert LaTeX \\ to real newlines for the scratchpad
                let cleanSolution = solution.replace(/\$/g, '').replace(/\\\\/g, '\n');

                let generatedAns = "";
                if (level === '5**') {
                    generatedAns = cleanSolution;
                } else if (level === '5*' || level === '5') {
                    const steps = cleanSolution.split('\n');
                    generatedAns = steps.length > 1 ? steps.slice(0, -1).join('\n') : steps[0];
                } else if (level === '4' || level === '3') {
                    const steps = cleanSolution.split('\n');
                    generatedAns = steps.length > 2 ? steps.slice(0, 2).join('\n') : steps[0];
                } else {
                    generatedAns = "I am not sure how to solve this question.";
                }

                if (q.parts && q.parts.length > 0) {
                    // Split the generated answer among parts if possible, or just duplicate for now
                    // For cheat tool, putting same logic in both parts is a safe approximation
                    const partAnswers = {};
                    q.parts.forEach(p => {
                        partAnswers[p.id] = generatedAns;
                    });
                    newAnswers[q.id] = partAnswers;
                } else {
                    newAnswers[q.id] = generatedAns;
                }
            });

            setAnswers(newAnswers);
            setShowCheat(false);
            alert(`Cheat active: Auto-populated for Level ${level}`);
        } catch (e) {
            console.error("Cheat failed:", e);
        }
    };

    useEffect(() => {
        fetchPaper();
    }, []);

    const fetchPaper = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/diagnostic/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user?.uid })
            });
            const data = await res.json();
            setQuestions(data.questions || []);
            setPaperId(data.paperId);
            setLoading(false);
        } catch (e) {
            console.error("Failed to load paper", e);
            alert("Connection failed. Please refresh.");
        }
    };

    const handleAnswer = (val, partId) => {
        const currentQs = getCurrentQuestions();
        const currentQ = currentQs[currentIndex];
        if (!currentQ) return;

        if (partId) {
            setAnswers(prev => ({
                ...prev,
                [currentQ.id]: {
                    ...(typeof prev[currentQ.id] === 'object' ? prev[currentQ.id] : {}),
                    [partId]: val
                }
            }));
        } else {
            setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
        }
    };

    const getCurrentQuestions = () => {
        const part = stage === 'part1' ? 1 : 2;
        return questions.filter(q => q.part === part);
    };

    const submitTest = async () => {
        setStage('submitting');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const submission = {
                answers,
                paperId
            };
            const res = await fetch(`${API_URL}/api/maths/diagnostic/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user?.uid, submission })
            });
            const result = await res.json();
            setResults(result);
            setStage('result');
        } catch (e) {
            console.error("Submit failed", e);
            alert("Submission failed. Please try again.");
            setStage('part2'); // Go back to allow retry
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (stage === 'part2') {
            const part1Questions = questions.filter(q => q.part === 1);
            setStage('part1');
            setCurrentIndex(part1Questions.length - 1);
        }
    };

    const handleNext = () => {
        const currentQs = getCurrentQuestions();
        if (currentIndex < currentQs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // End of Section
            if (stage === 'part1') {
                setStage('part2');
                setCurrentIndex(0);
            } else {
                submitTest();
            }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Calibration...</div>;

    const renderQuestionText = (text) => {
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
        const parts = cleanText.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)?|(?:\$\$[\s\S]*?\$\$)|(?:\$[^\$]+?\$))/g);

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

                {/* Diagram/Table Placeholder */}
                {(text.includes('[DIAGRAM') || text.includes('[TABLE')) && (
                    <div className="my-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-purple-500/40">
                            {text.includes('[TABLE') ? (
                                <i className="fas fa-table text-xl"></i>
                            ) : (
                                <i className="fas fa-chart-area text-xl"></i>
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                            {text.includes('[TABLE') ? 'Statistical Data Provided' : 'Geometric Figure Provided'}
                        </h4>

                        {description && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 w-full my-2 shadow-sm text-center">
                                <p className="text-sm italic font-medium">"{description}"</p>
                            </div>
                        )}

                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-2">
                            Math Engine Logic Active
                        </p>
                    </div>
                )}
            </div>
        );
    };

    if (stage === 'intro') {
        return <MathsDiagnosticLanding onStart={() => setStage('part1')} />;
    }


    if (stage === 'submitting') {
        return <MathsAnalysisLoading />;
    }

    if (stage === 'result') {
        return (
            <div className="min-h-screen bg-slate-50 p-6 overflow-y-auto">
                <MathsDiagnosticResult results={results} />
            </div>
        );
    }

    const currentQs = getCurrentQuestions();
    const currentQ = currentQs[currentIndex];
    const totalPart1 = questions.filter(q => q.part === 1).length;
    const progress = questions.length > 0
        ? Math.round(((currentIndex + (stage === 'part2' ? totalPart1 : 0)) / questions.length) * 100)
        : 0;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="font-bold text-slate-900 leading-none">
                            {stage === 'part1' ? 'Part 1: Conventional' : 'Part 2: Multiple Choice'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Diagnostic Calibration • Question {currentIndex + 1} / {getCurrentQuestions().length}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to submit your test now? Any unanswered questions will be marked as incorrect.")) {
                            submitTest();
                        }
                    }}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                >
                    Submit
                </button>
            </header>

            {/* Progress Bar */}
            <div className="fixed top-16 left-0 right-0 h-1 bg-gray-100 z-40">
                <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <main className="flex-1 pt-24 p-6 pb-24">
                <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">

                    {/* Question Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-xs font-bold text-purple-600 uppercase mb-2 tracking-wider flex items-center gap-2">
                            <span className="bg-purple-100 px-2 py-0.5 rounded text-[10px]">Q{currentIndex + 1}</span>
                            Topic: {currentQ.topic}
                        </div>
                        <div className="text-lg text-gray-800 font-medium">
                            {renderQuestionText(currentQ.text)}

                            {currentQ.imageURL && (
                                <div className="mt-8 mb-4 rounded-xl overflow-hidden border border-gray-100 flex flex-col items-center bg-gray-50 p-6 shadow-inner">
                                    <div className="relative group cursor-zoom-in">
                                        <img src={currentQ.imageURL} alt="Question Diagram" className="max-h-96 object-contain shadow-md rounded-lg border border-white" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-4 uppercase font-black tracking-[0.3em]">Figure 5(a)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answer Area */}
                    <div className="flex flex-col">
                        {stage === 'part1' ? (
                            // PART 1: Math Input
                            <div className="space-y-6">
                                {currentQ.parts ? (
                                    currentQ.parts.map((part) => (
                                        <div key={part.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                            <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 font-medium">
                                                Part {part.label}: Show your steps below (LaTeX supported)
                                            </div>
                                            <div className="p-0">
                                                <MathInput
                                                    id={`math-input-${currentQ.id}-${part.id}`}
                                                    value={answers[currentQ.id]?.[part.id]}
                                                    onChange={(val) => handleAnswer(val, part.id)}
                                                    placeholder={part.placeholder}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                        <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 font-medium">
                                            Show your steps below (LaTeX supported)
                                        </div>
                                        <div className="p-0">
                                            <MathInput
                                                id={`math-input-${currentQ.id}`}
                                                value={answers[currentQ.id]}
                                                onChange={(val) => handleAnswer(val)}
                                                placeholder="Start typing your solution... (e.g. x^2 + 2x...)"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // PART 2: MCQ Options
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options?.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        className={`p-6 text-left rounded-xl border-2 transition-all ${answers[currentQ.id] === opt
                                            ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${answers[currentQ.id] === opt ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div className="flex-1">
                                                <InlineMath math={opt} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Nav */}
                    <div className="flex justify-between pt-4 items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentIndex === 0 && stage === 'part1'}
                            className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${currentIndex === 0 && stage === 'part1'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed hidden md:flex'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                                }`}
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            <span className="hidden md:inline">Previous</span>
                        </button>

                        <button
                            onClick={handleNext}
                            className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all bg-black text-white hover:bg-gray-800 shadow-lg transform hover:-translate-y-1`}
                        >
                            <span className="hidden md:inline">{currentIndex === getCurrentQuestions().length - 1 && stage === 'part2' ? 'Submit' : 'Next'}</span>
                            <span className="md:hidden">Next</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
            {/* Cheat UI */}
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={() => setShowCheat(!showCheat)}
                    className="bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 text-xs"
                >
                    Cheat 🛠️
                </button>
                {showCheat && (
                    <div className="bg-white border shadow-xl rounded-lg p-2 mt-2 flex gap-1">
                        {['5**', '5*', '5', '4', '2', '1'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => handleCheat(lvl)}
                                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-bold"
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MathsDiagnosticPage;
