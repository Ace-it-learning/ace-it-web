import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ExamHeader from '../components/exam/ExamHeader';

const ListeningResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { examId } = useParams();

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Part_A');

    useEffect(() => {
        if (!state?.answers || !state?.examData) {
            navigate('/dashboard');
            return;
        }

        const gradeExam = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const { answers, examData } = state;

                // --- Grade Part A (Question by Question) ---
                const partAGrades = {};
                let partAScore = 0;
                let partAMax = 0;

                for (const task of examData.Part_A.tasks) {
                    partAGrades[task.id] = {};
                    for (const q of task.questions) {
                        partAMax++;
                        const userAns = answers[task.id]?.[q.id] || "";
                        // If exact match (case insensitive), skip API to save quota
                        if (userAns.toLowerCase() === (q.answer || "").toLowerCase()) {
                            partAGrades[task.id][q.id] = { score: 1, classification: "CORRECT" };
                            partAScore++;
                        } else {
                            try {
                                const res = await fetch(`${API_URL}/api/listening/grade`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        mode: "PART_A",
                                        taskPrompt: `${q.label} (Context: ${task.instructions})`,
                                        modelAnswer: q.answer,
                                        studentAnswer: userAns
                                    })
                                });
                                const grade = await res.json();
                                partAGrades[task.id][q.id] = grade;
                                partAScore += grade.score || 0;
                            } catch (e) {
                                partAGrades[task.id][q.id] = { score: 0, classification: "ERROR" };
                            }
                        }
                    }
                }

                // --- Grade Part B (Task by Task) ---
                const partBGrades = {};
                let partBScore = 0;
                let partBMax = 0;

                for (const task of examData.Part_B.tasks) {
                    partBMax += 21; // 7+7+7
                    const userAns = answers[task.id]?.['main'] || "";
                    try {
                        const res = await fetch(`${API_URL}/api/listening/grade`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                mode: "PART_B",
                                taskPrompt: task.instructions,
                                context: `${task.data_file_ref} \n ${examData.Part_B.data_file.substring(0, 2000)}...`,
                                studentAnswer: userAns
                            })
                        });
                        const grade = await res.json();
                        partBGrades[task.id] = grade;
                        partBScore += grade.scores?.total || 0;
                    } catch (e) {
                        partBGrades[task.id] = { scores: { total: 0 }, feedback: { summary: "Grading Error" } };
                    }
                }

                setResults({
                    Part_A: { grades: partAGrades, score: partAScore, max: partAMax },
                    Part_B: { grades: partBGrades, score: partBScore, max: partBMax }
                });

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
                AI Examiner is Grading your Listening Paper...
            </h2>
            <p className="text-gray-500">Evaluating Part A Accuracy & Part B Integration</p>
        </div>
    );

    const { Part_A, Part_B } = results || {};
    const totalScore = (Part_A?.score || 0) + (Part_B?.score || 0);
    const maxScore = (Part_A?.max || 0) + (Part_B?.max || 0);
    const percentage = Math.round((totalScore / maxScore) * 100) || 0;

    const getDSELevel = (pct) => {
        if (pct >= 90) return "5**";
        if (pct >= 85) return "5*";
        if (pct >= 75) return "5";
        if (pct >= 65) return "4";
        if (pct >= 55) return "3";
        if (pct >= 40) return "2";
        if (pct >= 20) return "1";
        return "U";
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <ExamHeader title="Listening Assessment Report" timeLeft={0} onExit={() => navigate('/', { state: { examCompleted: true, examId } })} />

            <div className="max-w-7xl mx-auto p-6">
                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">DSE Level</h3>
                        <div className="text-6xl font-black text-indigo-600 mb-2">{getDSELevel(percentage)}</div>
                        <div className="text-gray-500 font-mono text-sm">Score: {totalScore} / {maxScore} ({percentage}%)</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Part A (Recall)</h3>
                        <div className="text-4xl font-bold text-blue-600 mb-1">{Part_A?.score} / {Part_A?.max}</div>
                        <div className="text-xs text-gray-400">Strict Accuracy</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Part B (Integrated)</h3>
                        <div className="text-4xl font-bold text-purple-600 mb-1">{Part_B?.score} / {Part_B?.max}</div>
                        <div className="text-xs text-gray-400">Content, Lang, Org</div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setActiveTab('Part_A')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'Part_A' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>Part A Reports</button>
                    <button onClick={() => setActiveTab('Part_B')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'Part_B' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>Part B Tasks</button>
                </div>

                {/* CONTENT */}
                {activeTab === 'Part_A' && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        {state.examData.Part_A.tasks.map(task => (
                            <div key={task.id} className="mb-8 border-b pb-6 last:border-0">
                                <h3 className="font-bold text-lg text-gray-800 mb-4">{task.title}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {task.questions.map(q => {
                                        const grade = Part_A.grades[task.id]?.[q.id];
                                        const isCorrect = grade?.score === 1;
                                        return (
                                            <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-gray-700 text-sm">{q.label}</span>
                                                    {isCorrect ? <span className="text-green-600 font-bold">✓ Correct</span> : <span className="text-red-500 font-bold">✗ Wrong</span>}
                                                </div>
                                                <div className="mb-2">
                                                    <div className="text-xs text-gray-500">Your Answer:</div>
                                                    <div className="font-mono font-bold text-gray-900">{state.answers[task.id]?.[q.id] || "(Empty)"}</div>
                                                </div>
                                                {!isCorrect && (
                                                    <div>
                                                        <div className="text-xs text-gray-500">Correct Answer:</div>
                                                        <div className="font-mono font-bold text-green-700">{q.answer || "N/A"}</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Part_B' && (
                    <div className="space-y-8">
                        {state.examData.Part_B.tasks.map(task => {
                            const result = Part_B.grades[task.id];
                            if (!result) return null;
                            return (
                                <div key={task.id} className="bg-white rounded-2xl shadow p-6 border border-gray-200">
                                    <h3 className="font-bold text-xl text-purple-800 mb-4">{task.title}: {task.instructions.substring(0, 50)}...</h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* RUBRIC */}
                                        <div className="lg:col-span-1 space-y-3">
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between font-bold mb-2"><span>Content</span><span>{result.scores?.content}/7</span></div>
                                                <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(result.scores?.content / 7) * 100}%` }}></div></div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between font-bold mb-2"><span>Language</span><span>{result.scores?.language}/7</span></div>
                                                <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(result.scores?.language / 7) * 100}%` }}></div></div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between font-bold mb-2"><span>Organization</span><span>{result.scores?.organization}/7</span></div>
                                                <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(result.scores?.organization / 7) * 100}%` }}></div></div>
                                            </div>
                                        </div>

                                        {/* FEEDBACK */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="bg-blue-50 p-5 rounded-xl text-blue-900 border border-blue-100 text-sm italic">
                                                "{result.feedback?.summary}"
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-green-700 uppercase mb-2">Strengths</h4>
                                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                                        {result.feedback?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Improvements</h4>
                                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                                        {result.feedback?.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border-l-4 border-yellow-400">
                                                <strong>💡 Advice:</strong> {result.feedback?.improvement_advice}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListeningResultPage;
