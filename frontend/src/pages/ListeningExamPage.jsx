import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExamHeader from '../components/exam/ExamHeader';

const ListeningExamPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('PREP'); // PREP, PLAYING, FINISHED
    const [prepTime, setPrepTime] = useState(300); // 5 mins
    const [answers, setAnswers] = useState({});
    const [partBUnlocked, setPartBUnlocked] = useState(false);
    const [currentTask, setCurrentTask] = useState("Introduction");

    // New State for UI & Cheat
    const [activeTab, setActiveTab] = useState('Part_A');
    const [isCheating, setIsCheating] = useState(false);
    const [cheatLevel, setCheatLevel] = useState("5**");

    // Audio Refs
    const synth = useRef(window.speechSynthesis);
    const scriptQueue = useRef([]);
    const isPaused = useRef(false);

    // --- 1. Load Data ---
    useEffect(() => {
        const loadExam = async () => {
            try {
                const data = location.state?.examData;
                if (data) {
                    setExamData(data);
                } else {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/listening/exam/${examId}`);
                    if (!res.ok) throw new Error("Load failed");
                    const json = await res.json();
                    setExamData(json);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load listening exam.");
            } finally {
                setLoading(false);
            }
        };
        loadExam();
        return () => synth.current.cancel();
    }, [examId]);

    // --- 2. Prep Timer ---
    useEffect(() => {
        if (status === 'PREP' && prepTime > 0) {
            const timer = setInterval(() => setPrepTime(p => p - 1), 1000);
            return () => clearInterval(timer);
        } else if (status === 'PREP' && prepTime === 0) {
            // Timer expired naturally
            startAudio();
        }
    }, [status, prepTime]);

    // --- 3. Audio Engine ---
    const startAudio = () => {
        if (status === 'PLAYING') return; // Prevent double start
        setStatus('PLAYING');

        // Ensure user gesture activation for speech
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();

        if (!examData) return;

        const fullScript = [
            ...(examData.Part_A?.script || []),
            ...(examData.Part_B?.script || [])
        ];

        scriptQueue.current = fullScript;

        let startIndex = 0;
        if (activeTab === 'Part_B') {
            const partBIndex = fullScript.findIndex(line =>
                line.text.includes("Part B") || line.text.includes("Integrated Learning Portfolio")
            );
            if (partBIndex !== -1) startIndex = partBIndex;
        }

        playNextLine(startIndex);
    };

    const playNextLine = (index) => {
        if (index >= scriptQueue.current.length) {
            setStatus('FINISHED');
            return;
        }

        const line = scriptQueue.current[index];

        // Update Task Display
        if (line.text.includes("Task") || line.text.includes("Part")) {
            const match = line.text.match(/(Part [AB]|Task \d+)/);
            if (match) setCurrentTask(match[0]);
        }

        // Auto-Unlock Part B
        if (!partBUnlocked && (line.text.includes("Part B") || line.text.includes("Task 5"))) {
            setPartBUnlocked(true);
            setActiveTab('Part_B');
        }

        // Handle Pauses (e.g., "(10-second pause)")
        const pauseMatch = line.text.match(/\((\d+)[-\s]second pause\)/i);
        if (pauseMatch) {
            const seconds = parseInt(pauseMatch[1]);
            // Force longer pauses for realism if the AI generated short ones?
            // Optional: Math.max(seconds, 30) // Enforce min 30s?
            // Let's stick to script for now, but user can regenerate.
            setTimeout(() => playNextLine(index + 1), seconds * 1000);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(line.text);
        const voices = synth.current.getVoices();
        const ukVoice = voices.find(v => v.name.includes("United Kingdom") || v.name.includes("UK") || v.lang === "en-GB");
        if (ukVoice) utterance.voice = ukVoice;

        if (line.speaker === "Announcer") {
            utterance.pitch = 1; utterance.rate = 0.9;
        } else if (line.speaker === "Chris" || line.speaker === "Male") {
            utterance.pitch = 0.8;
        } else {
            utterance.pitch = 1.2;
        }

        utterance.onend = () => playNextLine(index + 1);
        synth.current.speak(utterance);
    };

    // --- 4. Inputs & Cheat ---
    const handleInputChange = (taskId, qId, val) => {
        setAnswers(prev => ({
            ...prev,
            [taskId]: {
                ...(prev[taskId] || {}),
                [qId]: val
            }
        }));
    };

    // --- CHEAT FUNCTION ---
    const handleCheat = async () => {
        if (!window.confirm(`⚠️ ACTIVATE DEV CHEAT (Level ${cheatLevel})?\nThis will STOP audio and auto-fill answers.`)) return;

        setIsCheating(true);

        // 1. Stop Audio & Force Writing Mode
        if (synth.current) synth.current.cancel();
        setStatus('WRITING_PERIOD');
        if (prepTime === 0 || status !== 'WRITING_PERIOD') setPrepTime(75 * 60);
        setPartBUnlocked(true);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        try {
            console.log(`Starting Cheat for ${activeTab} at Level ${cheatLevel}...`);

            if (activeTab === 'Part_A') {
                for (const task of examData.Part_A.tasks) {
                    for (const q of task.questions) {
                        try {
                            await sleep(4000); // 4s Throttle (Keep under 15 RPM)
                            const res = await fetch(`${API_URL}/api/listening/cheat`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    taskType: q.type,
                                    question: `${q.label} (Context: ${task.instructions})`,
                                    options: q.options || [],
                                    level: cheatLevel,
                                    answerKey: q.answer // Pass correct answer for 5** bypass
                                })
                            });
                            if (!res.ok) throw new Error(`Status ${res.status}`);
                            const data = await res.json();
                            if (data.answer) {
                                handleInputChange(task.id, q.id, data.answer.trim());
                            }
                        } catch (e) {
                            console.error(`Cheat failed for Q${q.id}`, e);
                        }
                    }
                }
            } else {
                for (const task of examData.Part_B.tasks) {
                    try {
                        await sleep(3000);
                        const res = await fetch(`${API_URL}/api/listening/cheat`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                taskType: task.type,
                                question: task.instructions,
                                context: `Data File: ${examData.Part_B.data_file.substring(0, 500)}...`,
                                level: cheatLevel
                            })
                        });
                        const data = await res.json();
                        handleInputChange(task.id, 'main', data.answer);
                    } catch (e) {
                        console.error("Cheat Part B failed", e);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCheating(false);
        }
    };

    const handleSubmit = () => {
        if (window.confirm("Submit Listening Exam?")) {
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Listening Mock...</div>;
    if (!examData) return <div className="p-10 text-center text-red-500">Error: No Data Found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header: Status Bar + Cheat */}
            <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg hidden md:block">🎧 {examData.metadata?.title}</h1>
                    <span className={`px-3 py-1 rounded text-xs font-bold ${status === 'PREP' ? 'bg-yellow-500 text-black' :
                        status === 'PLAYING' ? 'bg-green-500 text-white animate-pulse' :
                            status === 'WRITING_PERIOD' ? 'bg-orange-500 text-white' :
                                'bg-red-500 text-white'
                        }`}>
                        {status === 'PREP' ? `Prep: ${Math.floor(prepTime / 60)}:${(prepTime % 60).toString().padStart(2, '0')}` :
                            status === 'PLAYING' ? 'ON AIR' :
                                status === 'WRITING_PERIOD' ? `Time Left: ${Math.floor(prepTime / 3600)}:${Math.floor((prepTime % 3600) / 60).toString().padStart(2, '0')}:${(prepTime % 60).toString().padStart(2, '0')}` :
                                    'ENDED'}
                    </span>

                    {status === 'PREP' && (
                        <button
                            onClick={() => {
                                setPrepTime(0);
                                startAudio(); // Trigger directly on click
                            }}
                            className="ml-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded flex items-center gap-1 transition-colors"
                        >
                            ▶ Skip Prep
                        </button>
                    )}

                    {/* TABS */}
                    <div className="flex bg-gray-800 rounded-lg p-1 ml-4">
                        <button
                            onClick={() => setActiveTab('Part_A')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'Part_A' ? 'bg-indigo-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Part A (Recall)
                        </button>
                        <button
                            onClick={() => partBUnlocked && setActiveTab('Part_B')}
                            disabled={!partBUnlocked}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'Part_B' ? 'bg-indigo-500 text-white shadow' :
                                !partBUnlocked ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Part B (Integrated)
                            {!partBUnlocked && <span className="text-xs">🔒</span>}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {activeTab === 'Part_A' ? (
                        <button
                            onClick={() => {
                                if (window.confirm("Submit Part A and proceed to Part B?")) {
                                    if (synth.current) synth.current.cancel();

                                    setPartBUnlocked(true);
                                    setActiveTab('Part_B');

                                    setStatus('PREP');
                                    setPrepTime(60);
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded font-bold text-sm"
                        >
                            Submit Part A
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (window.confirm("Complete Listening Exam? This will submit all answers.")) {
                                    // Navigate to result page with data
                                    navigate(`/listening-result/${examId}`, { state: { answers, examData } });
                                }
                            }}
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-bold text-sm"
                        >
                            Complete Exam
                        </button>
                    )}
                </div>
            </div>

            {/* Task Indicator (Floating Top) */}
            {status === 'PLAYING' && (
                <div className="bg-black/90 text-white font-bold text-sm px-6 py-2 text-center relative z-10 w-full flex justify-center items-center gap-2 shadow-lg border-b border-gray-800">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    ON AIR: {currentTask}
                </div>
            )}

            {/* Content Area - Switched by Tab */}
            <div className="flex-1 overflow-hidden relative">

                {/* --- PART A VIEW (Single Column) --- */}
                {activeTab === 'Part_A' && (
                    <div className="h-full overflow-y-auto p-8 bg-white max-w-4xl mx-auto shadow-sm pb-24">
                        <div className="mb-8 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Part A: Listening Tasks</h2>
                            <p className="text-gray-500">Listen to the recording and write your answers in the spaces provided.</p>
                        </div>

                        {examData.Part_A.tasks.map(task => (
                            <div key={task.id} className="mb-10 bg-gray-50 p-8 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-lg text-indigo-900 mb-2">{task.id}</h3>
                                <p className="text-sm text-gray-600 italic mb-6 bg-yellow-50 p-2 rounded border border-yellow-100">{task.instructions}</p>

                                <div className="space-y-6">
                                    {task.questions.map(q => (
                                        <div key={q.id} className="flex items-center gap-4 group">
                                            <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm">{q.id.replace('Q', '')}</span>
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-sm font-semibold text-gray-700 mb-1">{q.label}</label>
                                                {q.type === 'multiple_choice' ? (
                                                    <select
                                                        value={answers[task.id]?.[q.id] || ''}
                                                        className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                                                        onChange={(e) => handleInputChange(task.id, q.id, e.target.value)}
                                                    >
                                                        <option value="">Select Option...</option>
                                                        {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={answers[task.id]?.[q.id] || ''}
                                                        className="w-full md:w-1/2 p-2 border-b-2 border-gray-300 bg-transparent focus:border-indigo-600 focus:outline-none transition-colors font-medium text-indigo-900 placeholder-gray-400"
                                                        placeholder="Answer here..."
                                                        onChange={(e) => handleInputChange(task.id, q.id, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- PART B VIEW (Split Screen) --- */}
                {activeTab === 'Part_B' && (
                    <div className="h-full flex pb-24">
                        {/* LEFT: Data File */}
                        <div className="w-1/2 h-full overflow-y-auto bg-white border-r border-gray-200 p-8">
                            <div className="mb-6 sticky top-0 bg-white/95 backdrop-blur py-2 border-b z-10">
                                <h2 className="text-xl font-bold text-gray-800">📂 Data File</h2>
                                <p className="text-xs text-gray-500">Read this carefully to complete the tasks.</p>
                            </div>
                            <div
                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-serif"
                                dangerouslySetInnerHTML={{ __html: examData.Part_B.data_file }}
                            />
                        </div>

                        {/* RIGHT: Answer Sheet */}
                        <div className="w-1/2 h-full overflow-y-auto bg-gray-50 p-8">
                            <div className="mb-6 sticky top-0 bg-gray-50/95 backdrop-blur py-2 border-b z-10">
                                <h2 className="text-xl font-bold text-purple-900">✍️ Part B Answer Book</h2>
                                <p className="text-xs text-gray-500">Write your tasks here.</p>
                            </div>

                            {examData.Part_B.tasks.map(task => (
                                <div key={task.id} className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{task.id}</h3>
                                            <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-600 uppercase">{task.type}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <strong>Requirements:</strong>
                                        <ul className="list-disc pl-5 mt-1 space-y-1">
                                            {task.requirements?.map((req, i) => <li key={i}>{req}</li>)}
                                        </ul>
                                    </div>

                                    <textarea
                                        value={answers[task.id]?.main || ''}
                                        className="w-full h-80 p-6 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-serif text-lg leading-relaxed resize-none shadow-inner"
                                        placeholder={`Start writing your ${task.type} here...`}
                                        onChange={(e) => handleInputChange(task.id, 'main', e.target.value)}
                                    />
                                    <div className="text-right text-xs text-gray-400 mt-2 font-mono">
                                        Word Count: {answers[task.id]?.main?.split(/\s+/).filter(w => w.length > 0).length || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* FLOATING CHEAT BUTTON (Bottom Left) */}
            <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-gray-900/90 backdrop-blur p-2 rounded-full shadow-2xl border border-gray-700 transition-all hover:scale-105">
                <select
                    value={cheatLevel}
                    onChange={(e) => setCheatLevel(e.target.value)}
                    className="bg-transparent text-xs text-red-300 font-mono focus:outline-none px-2"
                >
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                    <option value="5*">Level 5*</option>
                    <option value="5**">Level 5**</option>
                </select>
                <button
                    onClick={handleCheat}
                    disabled={isCheating}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${isCheating ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-500'} text-white shadow-lg`}
                >
                    {isCheating ? '🤖...' : 'DEV CHEAT'}
                </button>
            </div>

        </div>
    );
};

export default ListeningExamPage;
