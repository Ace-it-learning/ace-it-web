import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MathInput from '../components/maths/MathInput';
import { ChevronRight, ChevronLeft, Clock, Save, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const MathsExamPage = () => {
    const { examId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Exam Data State
    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Session State
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(75 * 60); // Default 75 mins
    const [examStarted, setExamStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // View State
    const [activePart, setActivePart] = useState(1); // 1 or 2
    const [showFormulaSheet, setShowFormulaSheet] = useState(false);

    useEffect(() => {
        fetchExam();
    }, [examId]);

    useEffect(() => {
        if (!examStarted) return;
        if (timeLeft <= 0) {
            handleAutoSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, timeLeft]);

    const fetchExam = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/exam/${examId}`);

            if (!res.ok) throw new Error("Failed to load exam");

            const data = await res.json();
            setExamData(data);
            if (data.questions) {
                setQuestions(data.questions);
            }
            if (data.reading_time_minutes) {
                setTimeLeft(data.reading_time_minutes * 60);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load exam. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = () => {
        setExamStarted(true);
        window.scrollTo(0, 0);
    };

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: value
        }));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAutoSubmit = () => {
        alert("Time's up! Submitting your exam automatically.");
        handleSubmit(true);
    };

    const handleSubmit = async (force = false) => {
        if (!force) {
            const unanswered = questions.filter(q => !answers[q.id]);
            const confirmMsg = unanswered.length > 0
                ? `You have ${unanswered.length} unanswered questions. Are you sure you want to submit?`
                : "Ready to submit your exam for grading?";

            if (!window.confirm(confirmMsg)) return;
        }

        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/maths/exam/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid || 'guest',
                    examId: examId,
                    answers: answers,
                    timeSpent: (examData.reading_time_minutes * 60) - timeLeft
                })
            });

            const result = await res.json();
            if (result.success) {
                navigate(`/maths/exam/result/${examId}`, { state: { result } });
            } else {
                alert("Submission failed: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Network error during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter questions by active part
    const visibleQuestions = questions.filter(q => q.part === activePart);

    // --- Render Helpers ---

    const renderText = (text) => {
        if (!text) return null;

        // Handle Diagrams
        const hasDiagram = text.includes('[DIAGRAM') || text.includes('[TABLE');
        const displaySubtext = text
            .replace(/\[DIAGRAM REQUIRED:[\s\S]*?\]/g, '')
            .replace(/\[TABLE REQUIRED:[\s\S]*?\]/g, '')
            .trim();

        // Similar to MathsLabPage renderer logic
        const parts = displaySubtext.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?:\$\$[\s\S]*?\$\$)|(?:\$[^$]+?\$))/g);

        return (
            <div className="space-y-4">
                <div className="text-gray-800 text-lg leading-relaxed">
                    {parts.map((part, i) => {
                        if (!part) return null;
                        if ((part.startsWith('\\[') && part.endsWith('\\]')) || (part.startsWith('$$') && part.endsWith('$$'))) {
                            return <div key={i} className="my-2 overflow-x-auto"><BlockMath math={part.slice(2, -2)} /></div>;
                        } else if ((part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'))) {
                            const math = part.startsWith('\\(') ? part.slice(2, -2) : part.slice(1, -1);
                            return <InlineMath key={i} math={math} />;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Exam</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => navigate('/dashboard')} className="w-full bg-slate-100 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    if (!examStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{examData.title}</h1>
                        <p className="text-indigo-100">{examData.topic_category}</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex justify-center gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{examData.reading_time_minutes}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Minutes</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{examData.total_marks}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Marks</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{examData.questions?.length}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Questions</div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Exam Instructions
                            </h3>
                            <ul className="list-disc list-inside space-y-1 opacity-90">
                                <li>Part 1: Conventional Questions (Show your working)</li>
                                <li>Part 2: Multiple Choice Questions</li>
                                <li>Formula Sheet is available during the exam</li>
                                <li>Timer will auto-submit when it reaches zero</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleStartExam}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            Start Examination
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-white text-slate-400 py-2 rounded-xl font-bold text-sm hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-16 bg-white shadow-sm z-50 px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="font-bold text-slate-800 hidden md:block">{examData.title}</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActivePart(1)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === 1 ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Section A (Conventional)
                        </button>
                        <button
                            onClick={() => setActivePart(2)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === 2 ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Section B (MCQ)
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFormulaSheet(!showFormulaSheet)}
                        className="text-slate-500 hover:text-indigo-600 text-sm font-bold flex items-center gap-1"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Formula Sheet</span>
                    </button>

                    <div className={`flex items-center gap-2 font-mono text-lg font-bold px-3 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-24 pb-12 px-4 max-w-4xl mx-auto w-full space-y-6">
                {visibleQuestions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">No questions in this section.</p>
                        <button onClick={() => setActivePart(activePart === 1 ? 2 : 1)} className="mt-4 text-indigo-600 font-bold hover:underline">
                            Go to Section {activePart === 1 ? 'B' : 'A'}
                        </button>
                    </div>
                ) : (
                    visibleQuestions.map((q, idx) => (
                        <div key={q.id} id={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded text-xs">
                                        Q{visibleQuestions.findIndex(vq => vq.id === q.id) + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {q.topic}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded">
                                    {q.marks} Marks
                                </span>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="mb-8">
                                    {renderText(q.text)}

                                    {/* Generic Diagram Handler if imageURL exists */}
                                    {q.imageURL && (
                                        <div className="my-6 flex justify-center">
                                            <img src={q.imageURL} alt="Question Diagram" className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm" />
                                        </div>
                                    )}
                                </div>

                                {q.type === 'mc' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options?.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswerChange(q.id, opt)}
                                                className={`p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 ${answers[q.id] === opt
                                                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${answers[q.id] === opt ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                                    }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <div className="font-medium text-slate-700">{opt}</div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Your Answer / Working</label>
                                        <MathInput
                                            id={`input-${q.id}`}
                                            value={answers[q.id] || ''}
                                            onChange={(val) => handleAnswerChange(q.id, val)}
                                            placeholder="Type your steps here... (LaTeX supported)"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Quick Nav FAB (Optional) */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    ↑
                </button>
            </div>
        </div>
    );
};

export default MathsExamPage;
