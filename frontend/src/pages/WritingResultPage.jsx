import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExamHeader from '../components/exam/ExamHeader';
import { Sparkles, X, Loader2 } from 'lucide-react';
import PolisherCard from '../components/tutor/PolisherCard';
import VocabularySidekick from '../components/tutor/VocabularySidekick';

const WritingResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { examId } = useParams();
    const { user } = useAuth();

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Part_A');

    // Polisher State
    const [selectedText, setSelectedText] = useState('');
    const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
    const [showPolishBtn, setShowPolishBtn] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);
    const [polishResult, setPolishResult] = useState(null);
    const answerRef = useRef(null);

    useEffect(() => {
        if (!state?.answers) {
            navigate('/dashboard');
            return;
        }

        const gradeExam = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                // Grade Part A
                const partA = Array.isArray(state.examData?.Part_A) ? state.examData.Part_A[0] : state.examData?.Part_A;
                const resA = await fetch(`${API_URL}/api/writing/grade`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user?.uid,
                        question: "Part A (Short Task)",
                        requirements: partA?.requirements || [],
                        answer: state.answers.Part_A
                    })
                });
                const gradeA = await resA.json();

                // Grade Part B (if answered)
                let gradeB = null;
                if (state.answers.Part_B && state.selectedElective) {
                    const resB = await fetch(`${API_URL}/api/writing/grade`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: user?.uid,
                            question: state.selectedElective.question || state.selectedElective.text || "N/A",
                            requirements: ["Write approx 400 words", "Adhere to text type"],
                            answer: state.answers.Part_B
                        })
                    });
                    gradeB = await resB.json();
                }

                setResults({ Part_A: gradeA, Part_B: gradeB });
            } catch (err) {
                console.error("Grading failed:", err);
            } finally {
                setLoading(false);
            }
        };

        gradeExam();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <h2 className="text-xl font-bold text-gray-700 animate-pulse">
                AI Examiner is Grading your Paper...
            </h2>
            <p className="text-gray-500">Evaluating Content, Language & Organization</p>
        </div>
    );

    const activeResult = results?.[activeTab];
    const totalScore = activeResult?.scores?.total || 0;
    const maxScore = 21; // 7+7+7

    // Helper to get Level based on Score (approximate scaling)
    const getLevel = (score) => {
        if (score >= 19) return "5**"; // ~90%
        if (score >= 17) return "5*";  // ~80%
        if (score >= 15) return "5";   // ~70%
        if (score >= 12) return "4";
        if (score >= 9) return "3";
        if (score >= 6) return "2";
        return "1";
    };

    const level = getLevel(totalScore);

    // --- POLISHER HANDLERS ---
    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 5 && answerRef.current && answerRef.current.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            // Calculate position relative to viewport, adjusted for scroll if needed, 
            // but fixed position button works best with client rects
            setSelectionPos({
                x: rect.left + (rect.width / 2),
                y: rect.top - 10
            });
            setSelectedText(text);
            setShowPolishBtn(true);
        } else {
            setShowPolishBtn(false);
        }
    };

    const handlePolish = async () => {
        if (!selectedText) return;
        setIsPolishing(true);
        setShowPolishBtn(false);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/api/tutor/writing/polish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Ensure auth
                },
                body: JSON.stringify({
                    uid: user.uid,
                    text: selectedText
                })
            });
            const data = await res.json();
            setPolishResult(data);
        } catch (err) {
            console.error("Polishing failed:", err);
            alert("Failed to polish text. Please try again.");
        } finally {
            setIsPolishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <ExamHeader
                title="Writing Assessment Report"
                timeLeft={0}
                onExit={() => navigate('/dashboard', {
                    state: {
                        mockCompleted: true,
                        type: 'writing',
                        examId: examId,
                        score: totalScore,
                        level: level,
                        improvements: activeResult?.feedback?.improvement_advice
                    }
                })}
            />

            <div className="max-w-7xl mx-auto p-6">
                {/* TABS */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('Part_A')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'Part_A' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                    >
                        Part A (Short Task)
                    </button>
                    <button
                        onClick={() => setActiveTab('Part_B')}
                        disabled={!results?.Part_B}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'Part_B' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50'}`}
                    >
                        Part B (Elective)
                    </button>
                </div>

                {!activeResult ? (
                    <div className="text-center py-20 text-gray-400">No answer submitted for this part.</div>
                ) : activeResult.error ? (
                    <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="font-bold text-red-700 text-lg mb-2">Grading Error</h3>
                        <p className="text-red-500 px-4">{activeResult.error || "The AI examiner could not grade this submission."}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: SCORES & FEEDBACK (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* OVERALL CARD */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Overall Performance</h3>
                                <div className="text-6xl font-black text-primary mb-2">{level}</div>
                                <div className="text-gray-500 font-mono text-sm">Score: {totalScore} / 21</div>
                                {activeResult.xpEarned > 0 && (
                                    <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-bold text-xs animate-bounce shadow-sm">
                                        <span>⚡ +{activeResult.xpEarned} XP Earned!</span>
                                    </div>
                                )}
                            </div>

                            {/* RUBRIC BREAKDOWN */}
                            <div className="space-y-3">
                                {['Content', 'Language', 'Organization'].map(criterion => {
                                    const key = criterion.toLowerCase();
                                    const score = activeResult.scores?.[key] || 0;
                                    return (
                                        <div key={key} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                            <span className="font-bold text-gray-700">{criterion}</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                                    <div key={n} className={`h-2 w-4 rounded-sm ${n <= score ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                                ))}
                                                <span className="ml-2 font-mono font-bold text-gray-600">{score}/7</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* EXAMINER FEEDBACK */}
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">👨‍🏫 Examiner's Note</h3>
                                <p className="text-blue-800 text-sm italic mb-4">"{activeResult.feedback.summary}"</p>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-green-700 uppercase mb-1">Strengths</h4>
                                        <ul className="list-disc list-inside text-sm text-green-800">
                                            {activeResult.feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-red-700 uppercase mb-1">Weaknesses</h4>
                                        <ul className="list-disc list-inside text-sm text-red-800">
                                            {activeResult.feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">💡 Improvement Tip</h4>
                                        <p className="text-sm text-gray-700">{activeResult.feedback.improvement_advice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: COMPARISON (8 cols) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[800px]">
                                <div className="flex border-b">
                                    <div className="flex-1 p-4 bg-gray-50 font-bold text-center text-gray-600">Your Answer</div>
                                    <div className="flex-1 p-4 bg-purple-50 font-bold text-center text-purple-700 flex items-center justify-center gap-2">
                                        <span>🏆 Level 5** Model</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex overflow-hidden">
                                    {/* USER ANSWER */}
                                    <div
                                        ref={answerRef}
                                        onMouseUp={handleTextSelection}
                                        className="flex-1 p-6 overflow-y-auto border-r leading-relaxed whitespace-pre-wrap font-serif text-lg text-gray-800 relative selection:bg-purple-200 selection:text-purple-900"
                                    >
                                        {state.answers[activeTab]}
                                    </div>

                                    {/* MODEL ANSWER */}
                                    <div className="flex-1 p-6 overflow-y-auto bg-purple-50/30 leading-relaxed whitespace-pre-wrap font-serif text-lg text-gray-900">
                                        {activeResult.model_answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FLOATING POLISH BUTTON */}
            {showPolishBtn && (
                <button
                    onClick={handlePolish}
                    style={{
                        position: 'fixed',
                        left: selectionPos.x,
                        top: selectionPos.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                    className="z-50 bg-black text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold animate-in zoom-in slide-in-from-bottom-2 hover:scale-105 transition-transform"
                >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Polish with AI
                </button>
            )}

            {/* POLISHER MODAL */}
            {(isPolishing || polishResult) && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                <h3 className="font-bold text-lg">Magic Polisher</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setPolishResult(null);
                                    setIsPolishing(false);
                                }}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-gray-50 max-h-[70vh] overflow-y-auto">
                            {isPolishing ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                                    <p className="text-gray-500 font-medium animate-pulse">Refining your words...</p>
                                </div>
                            ) : (
                                <PolisherCard data={polishResult} />
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Vocab Sidekick: Available in Analysis Mode */}
            <VocabularySidekick topic={state.examData?.topic_category || "General Writing"} />
        </div>
    );
};

export default WritingResultPage;
