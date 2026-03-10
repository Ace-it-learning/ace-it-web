import React, { useState } from 'react';
import { Clock, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DiagnosticReading = ({ assets, onSubmit }) => {
    const { user } = useAuth();
    const [answers, setAnswers] = useState({});
    const [showCheat, setShowCheat] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isDeveloper = user?.email === 'fungtam@gmail.com';

    const handleSubmit = () => {
        onSubmit({ answers });
    };

    const generateAnswers = async (level) => {
        if (isGenerating) return;
        try {
            setIsGenerating(true);
            setShowCheat(false);
            // Show loading state
            const loadingAnswers = {};
            assets.questions.forEach(q => {
                loadingAnswers[q.id] = '⚡ Generating realistic answer...';
            });
            setAnswers(loadingAnswers);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Calling API:', `${API_URL}/api/diagnostic/generate-answers`);
            console.log('Payload:', { uid: user.uid, level, type: 'reading', passage: assets.passage.substring(0, 100) + '...', questions: assets.questions });

            const response = await fetch(`${API_URL}/api/diagnostic/generate-answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    level,
                    type: 'reading',
                    passage: assets.passage,
                    questions: assets.questions
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.answers) {
                const generatedAnswers = {};
                data.answers.forEach(item => {
                    generatedAnswers[item.questionId] = item.answer;
                });
                setAnswers(generatedAnswers);
            }
        } catch (error) {
            console.error('Failed to generate answers:', error);
            alert(`Failed to generate answers: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!assets) return <div>Loading Reading...</div>;

    return (
        <div className="h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Part 1: Reading</h2>
                <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Estimated: 8 mins</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                {/* Passage - 50% width, larger container */}
                <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-200 h-fit">
                    <h3 className="text-gray-600 text-sm font-bold uppercase tracking-wider mb-4">Passage</h3>
                    <p className="text-gray-800 leading-relaxed text-base">
                        {assets.passage}
                    </p>
                </div>

                {/* Questions - 50% width, larger container */}
                <div className="space-y-4">
                    {assets.questions.map((q, i) => {
                        // Determine border color based on question type
                        const borderColor = q.type === 'mc' ? 'border-green-400' : 'border-blue-400';
                        const badgeColor = q.type === 'mc' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';

                        return (
                            <div key={q.id} className={`bg-white p-6 rounded-xl border-2 ${borderColor} shadow-sm`}>
                                <div className="flex justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-700 uppercase">Question {i + 1}</span>
                                        <span className={`text-xs font-medium ${badgeColor} px-2 py-0.5 rounded`}>
                                            {q.type === 'mc' ? 'Multiple Choice' : 'Short Answer'}
                                        </span>
                                    </div>
                                    {q.level === 5 && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Challenge</span>}
                                </div>
                                <p className="text-gray-900 mb-4 text-base font-medium">{q.text}</p>

                                {/* Render based on question type */}
                                {q.type === 'mc' && q.options ? (
                                    // Multiple Choice - Radio buttons
                                    <div className="space-y-2">
                                        {q.options.map((option, optIdx) => (
                                            <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={option}
                                                    disabled={isGenerating}
                                                    checked={answers[q.id] === option}
                                                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                                    className="w-4 h-4 text-green-600 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                                />
                                                <span className="text-gray-800">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    // Short Answer - Textarea
                                    <textarea
                                        className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:opacity-50"
                                        rows={4}
                                        disabled={isGenerating}
                                        placeholder="Type your answer here..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                    />
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={handleSubmit}
                        disabled={isGenerating}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400"
                    >
                        {isGenerating ? "Generating..." : "Submit Reading Check"}
                    </button>
                </div>
            </div>

            {/* Developer Cheat Button */}
            {isDeveloper && (
                <div className="fixed bottom-6 left-6 z-50">
                    {!showCheat ? (
                        <button
                            onClick={() => setShowCheat(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                            title="Developer: Auto-fill answers"
                        >
                            <Zap className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="bg-white border-2 border-purple-600 rounded-xl p-4 shadow-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-purple-600">Auto-fill Level</span>
                                <button onClick={() => setShowCheat(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {[3, 4, 5, '5*', '5**'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => generateAnswers(level)}
                                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Level {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiagnosticReading;
