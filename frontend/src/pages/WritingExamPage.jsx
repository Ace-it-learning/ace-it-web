import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Reuse existing components for consistency
import ExamHeader from '../components/exam/ExamHeader';

const WritingExamPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePart, setActivePart] = useState('Part_A'); // Part_A, Part_B
    const [timeLeft, setTimeLeft] = useState(120 * 60); // 2 hours default
    const [answers, setAnswers] = useState({
        Part_A: "",
        Part_B: ""
    });
    const [selectedElective, setSelectedElective] = useState(null); // For Part B
    const [showDevMenu, setShowDevMenu] = useState(false);

    const [isGeneratingCheat, setIsGeneratingCheat] = useState(false);

    // --- DEV CHEAT ---
    const handleCheatFill = async (level) => {
        setIsGeneratingCheat(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            let payload = { level };

            if (activePart === 'Part_A') {
                const partA = Array.isArray(examData.Part_A) ? examData.Part_A[0] : examData.Part_A;
                payload = {
                    ...payload,
                    question: "Part A (Short Task)",
                    situation: partA?.situation || "N/A",
                    requirements: partA?.requirements || []
                };
            } else {
                const partBData = Array.isArray(examData.Part_B) ? examData.Part_B : (examData.Part_B?.questions || []);
                let selected = selectedElective;

                if (!selected && partBData?.length > 0) {
                    selected = partBData[0];
                    setSelectedElective(selected);
                }

                if (!selected) {
                    alert("Please select a Part B question first.");
                    setIsGeneratingCheat(false);
                    return;
                }

                payload = {
                    ...payload,
                    question: selected.question || selected.text || "N/A",
                    situation: selected.elective ? `Elective: ${selected.elective} (${selected.type})` : `Topic: ${selected.topic || "N/A"}`,
                    requirements: ["Write approx 400 words", "Adhere to the text type conventions"]
                };
            }

            const res = await fetch(`${API_URL}/api/debug/writing/cheat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Gen Failed");
            const data = await res.json();

            setAnswers(prev => ({ ...prev, [activePart]: data.text }));
            setShowDevMenu(false);

        } catch (err) {
            console.error(err);
            alert("Failed to generate cheat answer.");
        } finally {
            setIsGeneratingCheat(false);
        }
    };

    // Fetch Exam Data
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/writing/exam/${examId}`);
                if (!res.ok) throw new Error("Failed to load writing exam");
                const data = await res.json();
                setExamData(data);
            } catch (err) {
                console.error(err);
                setError("Could not load exam data.");
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId]);

    const handleSubmit = (force = false) => {
        if (!force) {
            const countA = (answers.Part_A || "").split(/\s+/).filter(w => w.length > 0).length;
            const countB = (answers.Part_B || "").split(/\s+/).filter(w => w.length > 0).length;

            if (countA < 100 || countB < 100) {
                const msg = `Warning: Your answers seem short.\nPart A: ${countA} words\nPart B: ${countB} words\n\nRecommended: 200+ for Part A, 400+ for Part B.\nAre you sure you want to submit?`;
                if (!window.confirm(msg)) return;
            } else {
                if (!window.confirm("Submit your writing exam?")) return;
            }
        }

        navigate(`/writing/result/${examId}`, {
            state: {
                answers,
                examData,
                selectedElective
            }
        });
    };

    // Timer Logic
    useEffect(() => {
        if (loading || error) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, error]);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Writing Exam...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

    // --- RENDER HELPERS ---

    // Part A: Single Mandatory Question
    const renderPartAInstructions = () => {
        const q = Array.isArray(examData.Part_A) ? examData.Part_A[0] : examData.Part_A;
        if (!q) return <div className="text-red-500">Error: Invalid Part A data</div>;

        return (
            <div className="space-y-6">
                {/* Resources / Reading Text */}
                {q.resources && q.resources.length > 0 && (
                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">Reading Resources</h3>
                        {q.resources.map((res, idx) => (
                            <div key={idx} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                                    <span className="font-bold text-sm text-gray-600">Text {idx + 1}: {res.title}</span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">{res.genre}</span>
                                </div>
                                <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-serif italic bg-[#fffaf5]">
                                    {res.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-900 mb-2">📢 Situation</h3>
                    <p className="text-gray-800 leading-relaxed">{q.situation}</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 mb-2">📝 Task Requirements</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {q.requirements?.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                </div>
                {q.instructions && (
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                        <span className="font-bold">Instructions:</span> {q.instructions}
                    </div>
                )}

                <div className="pt-8 border-t">
                    <button
                        onClick={() => setActivePart('Part_B')}
                        className="w-full py-3 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                    >
                        Go to Part B (Long Task) →
                    </button>
                </div>
            </div>
        );
    };

    // Part B: 8 Electives Choice
    const renderPartBInstructions = () => {
        const partBData = Array.isArray(examData.Part_B) ? examData.Part_B : (examData.Part_B?.questions || []);

        if (!selectedElective) {
            return (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Select a Topic (Elective):</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {partBData.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (window.confirm(`Choose "${q.elective || q.topic || `Option ${idx + 2}`}"?`)) setSelectedElective(q);
                                }}
                                className="text-left p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all group"
                            >
                                <div className="font-bold text-gray-700 group-hover:text-primary mb-1">
                                    Question {idx + 2}: {q.elective || q.topic || `Topic ${idx + 2}`}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-3">{q.question || q.text}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        // Selected View
        return (
            <div className="space-y-6 animate-in fade-in">
                <button
                    onClick={() => setSelectedElective(null)}
                    className="text-sm text-gray-500 hover:text-gray-800 mb-2 flex items-center gap-1"
                >
                    ← Back to Choices
                </button>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">{selectedElective.elective || selectedElective.topic || "Selected Task"} ({selectedElective.type || "Writing"})</h3>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedElective.question || selectedElective.text}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
            {/* DEV TOOL TOGGLE */}
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={() => setShowDevMenu(!showDevMenu)}
                    className={`size-10 ${isGeneratingCheat ? "bg-purple-600 animate-pulse" : "bg-gray-800"} text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform font-mono text-xs`}
                    title="Developer Tools"
                    disabled={isGeneratingCheat}
                >
                    {isGeneratingCheat ? "..." : "DEV"}
                </button>

                {showDevMenu && (
                    <div className="absolute bottom-12 left-0 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-64 space-y-3 animate-fade-in-up">
                        <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">Cheat Sheet</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {['1', '2', '3', '4', '5', '5*', '5**'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => handleCheatFill(lvl)}
                                    className={`text-xs font-bold py-2 px-3 rounded-lg border transition-colors ${lvl.includes('5') ? "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100" : "bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100"
                                        }`}
                                >
                                    Level {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 1. Universal Header */}
            <ExamHeader
                title="English Paper 2 (Writing)"
                timeLeft={timeLeft}
                onExit={() => navigate('/dashboard')}
            />

            {/* 2. Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Question Paper */}
                <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white p-8">
                    <div className="max-w-xl mx-auto">
                        <div className="flex gap-4 mb-6 border-b">
                            <button
                                onClick={() => setActivePart('Part_A')}
                                className={`pb-2 px-1 font-bold ${activePart === 'Part_A' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                            >
                                Part A (Short Task)
                            </button>
                            <button
                                onClick={() => setActivePart('Part_B')}
                                className={`pb-2 px-1 font-bold ${activePart === 'Part_B' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                            >
                                Part B (Long Task)
                            </button>
                        </div>

                        {activePart === 'Part_A' ? renderPartAInstructions() : renderPartBInstructions()}
                    </div>
                </div>

                {/* RIGHT: Answer Book (Notebook Style) */}
                <div className="w-1/2 bg-[#fdfbf7] relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-black/5 to-transparent"></div>
                    <textarea
                        className="w-full h-full p-10 bg-transparent text-lg font-serif resize-none focus:outline-none leading-loose text-gray-800 placeholder-gray-300"
                        style={{ backgroundImage: 'linear-gradient(transparent 95%, #e5e7eb 95%)', backgroundSize: '100% 2rem', lineHeight: '2rem' }}
                        placeholder="Start writing your answer here..."
                        value={answers[activePart]}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        disabled={activePart === 'Part_B' && !selectedElective}
                    />
                    {/* Word Count Overlay */}
                    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-gray-500 shadow-sm border">
                        {answers[activePart].split(/\s+/).filter(w => w).length} words
                    </div>

                    {/* Submit Button (Floating) */}
                    <button
                        onClick={() => handleSubmit()}
                        className="absolute bottom-6 left-6 bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        Submit Exam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WritingExamPage;
