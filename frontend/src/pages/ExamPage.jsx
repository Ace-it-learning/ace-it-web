import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import ReadingPanel from '../components/exam/ReadingPanel';
import QuestionList from '../components/exam/QuestionList';
import VocabularySidekick from '../components/tutor/VocabularySidekick';

const ExamPage = () => {
    const { examId } = useParams();
    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});

    // New State for Multi-Part Support
    const [activePart, setActivePart] = useState('Part_A');
    const [completedParts, setCompletedParts] = useState([]);
    const [showDevMenu, setShowDevMenu] = useState(false); // Moved here

    // --- TIMER & EXAM STATE ---
    const [examStarted, setExamStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(90 * 60); // Default 90 mins (in seconds)

    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                // 1. Try Firestore First
                const examRef = doc(db, 'mock_exams', examId);
                const examSnap = await getDoc(examRef);

                if (examSnap.exists()) {
                    const data = examSnap.data();
                    setExamData(data);
                    if (data.reading_time_minutes) setTimeLeft(data.reading_time_minutes * 60);

                    // Fetch Questions from Firestore
                    const qRef = collection(db, 'mock_exams', examId, 'questions');
                    const qSnap = await getDocs(qRef);
                    const qList = qSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                    setQuestions(qList);
                } else {
                    // 2. Fallback to API (for generated file-based mocks)
                    console.log("Exam not in Firestore, checking API...");
                    // Deterministic paper type detection from ID or try multiple
                    const papers = ['reading', 'writing', 'listening'];
                    let foundData = null;

                    for (const p of papers) {
                        try {
                            const res = await fetch(`${API_URL}/api/${p}/exam/${examId}`);
                            if (res.ok) {
                                foundData = await res.json();
                                foundData.paperType = p;
                                break;
                            }
                        } catch (e) { }
                    }

                    if (foundData) {
                        setExamData(foundData.meta ? { title: foundData.meta.topic, ...foundData } : foundData);
                        if (foundData.reading_time_minutes) setTimeLeft(foundData.reading_time_minutes * 60);

                        // Process Questions from JSON
                        const qList = [];
                        ['Part_A', 'Part_B1', 'Part_B2'].forEach(part => {
                            if (foundData[part] && foundData[part].questions) {
                                foundData[part].questions.forEach((q, idx) => {
                                    qList.push({ ...q, id: `${part}_q${idx}`, part });
                                });
                            }
                        });
                        setQuestions(qList);
                    } else {
                        setError("Exam not found. It might have been deleted or is still generating.");
                    }
                }
            } catch (err) {
                console.error("Error loading exam:", err);
                setError("Failed to load exam. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (examId) fetchExam();
    }, [examId]);


    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStartExam = () => {
        setExamStarted(true);
        window.scrollTo(0, 0);
    };

    const handleAnswerChange = (qId, value, index = null) => {
        setAnswers(prev => {
            const current = prev[qId];
            if (index !== null) {
                const arr = Array.isArray(current) ? [...current] : [];
                arr[index] = value;
                return { ...prev, [qId]: arr };
            }
            return { ...prev, [qId]: value };
        });
    };

    const handleSubmit = async (forceSubmit = false) => {
        // 1. Mark current part as complete
        if (!completedParts.includes(activePart)) {
            setCompletedParts(prev => [...prev, activePart]);
        }

        // 2. Part Separation Logic (Part A -> B1/B2 choice)
        if (activePart === 'Part_A' && !forceSubmit) {
            const choice = window.prompt("Part A Completed!\n\nType '1' for Part B1 (Easier)\nType '2' for Part B2 (Difficult)\n\n(Or click Cancel to review Part A)");

            if (choice === '1') {
                setActivePart('Part_B1');
                window.scrollTo(0, 0);
                return;
            } else if (choice === '2') {
                setActivePart('Part_B2');
                window.scrollTo(0, 0);
                return;
            }
            return;
        }

        // 3. Final Submission (B1 or B2)
        if (!forceSubmit) {
            const doSubmit = window.confirm("Ready to finish the exam? This will submit ALL parts for grading.");
            if (!doSubmit) return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                examId: examId,
                uid: 'guest_user', // Replace with real auth later if needed
                answers
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/submit-exam`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                navigate(`/result/${examId}`, { state: { result: data.result, answers } });
            } else {
                alert("Grading Error: " + (data.error || "Unknown"));
            }
        } catch (e) {
            console.error(e);
            alert("Network Error: Could not submit exam.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!examStarted) return;
        if (timeLeft <= 0) {
            alert("Time's up! Submitting exam automatically.");
            handleSubmit(true); // Force submit
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, timeLeft]);

    if (loading) return <div className="p-10 text-center text-gray-600 animate-pulse">Loading Exam Content...</div>;
    if (error) return <div className="p-10 text-center text-red-500 font-bold bg-red-50 rounded-xl m-10">{error}</div>;
    if (!examData) return <div className="p-10 text-center">Exam data unavailable.</div>;

    // --- START SCREEN ---
    if (!examStarted) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6 space-y-6">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 text-center space-y-6 border border-gray-100">
                    <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📝</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{examData.title || "Mock Exam"}</h1>
                    <div className="flex flex-col gap-2 text-gray-600 text-sm">
                        <p>Topic: {examData.topic_category || "General"}</p>
                        <p>Duration: {examData.reading_time_minutes || 90} Minutes</p>
                        <p>Components: Part A (Mandatory) + Part B1/B2 (Choice)</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl text-left text-sm text-blue-800 space-y-2">
                        <p className="font-bold">Instructions:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Please ensure you have a stable internet connection.</li>
                            <li>You must complete Part A first.</li>
                            <li>Choose ONE section from Part B (B1 is easier, B2 is harder).</li>
                            <li>The timer will start as soon as you click the button below.</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleStartExam}
                        className="w-full bg-primary text-white text-lg font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg hover:shadow-primary/30"
                    >
                        Start Exam Now
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-400 text-sm hover:text-gray-600 font-medium"
                    >
                        Cancel and Return to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Filter Content by Active Part
    // Filter Content by Active Part
    let currentResources = {};
    if (examData[activePart] && examData[activePart].resources) {
        // 1. Nested Schema (root.Part_A.resources) - New Generator
        currentResources = examData[activePart].resources;
    } else if (examData.resources && examData.resources[activePart]) {
        // 2. Legacy Schema (root.resources.Part_A)
        currentResources = examData.resources[activePart];
    } else if (examData.resources && activePart === 'Part_A') {
        // 3. Fallback Flat Legacy
        currentResources = examData.resources;
    }

    // Robust Filtering for Questions
    const currentQuestions = questions.filter(q => {
        if (!q.part) return activePart === 'Part_A';
        const val = String(q.part).toLowerCase().replace(/[\s_]+/g, '');
        const matchMap = {
            'Part_A': ['a', 'parta'],
            'Part_B1': ['b1', 'partb1'],
            'Part_B2': ['b2', 'partb2']
        };
        const allowed = matchMap[activePart] || [];
        return allowed.includes(val);
    });

    const handleExit = () => {
        if (examStarted && Object.keys(answers).length > 0) {
            const confirmQuit = window.confirm("Are you sure you want to quit? \n\n⚠️ Your answers will NOT be saved.");
            if (!confirmQuit) return;
        }
        navigate('/');
    };

    // --- DEV CHEAT TOOLS ---

    const handleCheatFill = async (targetLevel) => {
        const confirmCheat = window.confirm(`🤖 DEV: Auto-fill answers for Level ${targetLevel}? \nThis will overwrite current answers.`);
        if (!confirmCheat) return;

        try {
            // 1. Fetch Marking Keys (via Backend Debug Endpoint to bypass Rules)
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/debug/answers/${encodeURIComponent(examId)}`);

            if (!res.ok) throw new Error("Failed to fetch debug keys");

            const keyMap = await res.json();
            console.log("Dev: Loaded Keys", keyMap);

            // 2. Define Accuracy Map (Calibrated to ResultPage Thresholds)
            const accuracyMap = {
                '1': 0.25, // Target < 40%
                '2': 0.48, // Target 40-55%
                '3': 0.59, // Target 55-64% (Mid-Level 3)
                '4': 0.75, // Target 65-75%
                '5': 0.85, // Target 75-85%
                '5*': 0.95, // Target 85-90%
                '5**': 1.0 // Target 90%+
            };
            const accuracy = accuracyMap[targetLevel] || 0.5;

            // 3. Generate Answers
            const newAnswers = { ...answers };

            // Loop through ALL questions (not just visible ones, so we can submit full exam)
            questions.forEach(q => {
                const correctAnswer = keyMap[q.id];
                if (!correctAnswer) return; // No key found

                // Determine if we should be correct
                const isCorrect = Math.random() < accuracy;

                if (isCorrect) {
                    newAnswers[q.id] = correctAnswer;
                } else {
                    // Pick a wrong answer
                    // For MC: Pick random option != correct
                    // For Text: "Incorrect Answer"
                    if (q.options) {
                        const wrongOptions = q.options
                            .map((_, idx) => String.fromCharCode(65 + idx)) // A, B, C...
                            .filter(opt => opt !== correctAnswer);

                        newAnswers[q.id] = wrongOptions.length > 0
                            ? wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
                            : 'A'; // Fallback
                    } else {
                        newAnswers[q.id] = "I don't know the answer because I didn't study.";
                    }
                }
            });

            setAnswers(newAnswers);
            alert(`✅ Auto-filled answers for Level ${targetLevel}`);
            setShowDevMenu(false);

        } catch (err) {
            console.error("Dev Cheat Error:", err);
            alert("Failed to generating cheat answers. Check console.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">

            {/* DEV TOOL TOGGLE */}
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={() => setShowDevMenu(!showDevMenu)}
                    className="size-10 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform font-mono text-xs"
                    title="Developer Tools"
                >
                    DEV
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

            {/* Header / Tabs */}
            <div className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={handleExit} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="sr-only">Exit</span>
                        ←
                    </button>
                    <h2 className="font-bold text-gray-800 truncate max-w-[200px] sm:max-w-md" title={examData.title}>
                        {examData.title}
                    </h2>

                    {/* Part Tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ml-4">
                        {['Part_A', 'Part_B1', 'Part_B2'].map(part => (
                            <button
                                key={part}
                                onClick={() => setActivePart(part)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activePart === part
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {part.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg border ${timeLeft < 300 ? "text-red-500 border-red-200 bg-red-50 animate-pulse" : "text-gray-700 border-gray-200"
                        }`}>
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </button>
                </div>
            </div>

            {/* Main Content: Split View */}
            {/* Main Content: Split View */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Reading Passage */}
                <div className="w-1/2 overflow-y-auto p-8 border-r bg-white/50 backdrop-blur-xl space-y-8 scroll-smooth">
                    <ReadingPanel
                        resources={currentResources}
                    />
                </div>

                {/* Right: Questions */}
                <div className="w-1/2 overflow-y-auto bg-gray-50 p-8 scroll-smooth">
                    <QuestionList
                        questions={currentQuestions}
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                        onSubmit={() => handleSubmit(false)}
                        isSubmitting={isSubmitting}
                        activePart={activePart}
                        readOnly={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
