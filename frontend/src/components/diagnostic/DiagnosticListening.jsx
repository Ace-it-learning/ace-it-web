import React, { useState } from 'react';
import { Play, Pause, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import IntegratedListeningBoard from '../listening/IntegratedListeningBoard';

const DiagnosticListening = ({ assets, onSubmit }) => {
    const { user } = useAuth();
    const [started, setStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showCheat, setShowCheat] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isDeveloper = user?.email === 'fungtam@gmail.com';

    const handleSubmit = () => {
        window.speechSynthesis.cancel();
        onSubmit({ answers });
    };

    const handleStart = () => {
        setStarted(true);
        handlePlayPause();
    };

    const handlePlayPause = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            const utterance = new SpeechSynthesisUtterance(assets.script);
            utterance.onend = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
        } else {
            setIsPlaying(false);
            window.speechSynthesis.cancel();
        }
    };

    const generateAnswers = async (level) => {
        if (isGenerating) return;
        try {
            setIsGenerating(true);
            setShowCheat(false);
            // Show loading state
            const loadingAnswers = {};
            assets.questions.forEach(q => {
                loadingAnswers[q.id] = '⚡ Generating...';
            });
            setAnswers(loadingAnswers);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/diagnostic/generate-answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    level,
                    type: 'listening',
                    script: assets.script,
                    questions: assets.questions
                })
            });

            const data = await response.json();

            if (data.answers) {
                const generatedAnswers = {};
                data.answers.forEach(item => {
                    generatedAnswers[item.questionId] = item.answer;
                });
                setAnswers(generatedAnswers);
            }
        } catch (error) {
            console.error('Failed to generate answers:', error);
            alert('Failed to generate answers. Check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!assets) return <div>Loading Listening...</div>;

    const renderMainContent = () => {
        if (assets.dataFile) {
            return (
                <IntegratedListeningBoard
                    script={assets.script}
                    dataFile={assets.dataFile}
                    questions={assets.questions}
                    onAnswer={(qid, val) => setAnswers(prev => ({ ...prev, [qid]: val }))}
                    answers={answers}
                    isGenerating={isGenerating}
                    onSubmit={handleSubmit}
                />
            );
        }

        if (!started) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 animate-pulse">
                        <Play className="w-10 h-10 text-white fill-white ml-2" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Listen?</h2>
                    <p className="text-gray-600 max-w-md mb-2">
                        You will hear a short clip (approx. 45 seconds). Click the button below when you are ready to start the audio and see the questions.
                    </p>
                    <p className="text-blue-600 text-sm mb-8">Estimated: 3 mins</p>
                    <button
                        onClick={handleStart}
                        className="px-10 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        Start Audio
                    </button>
                </div>
            );
        }

        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlayPause} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                        </button>
                        <div>
                            <h3 className="text-white font-medium">Audio Clip #1</h3>
                            <p className="text-xs text-gray-400">{isPlaying ? "Playing..." : "Paused"}</p>
                        </div>
                    </div>
                    <div className="text-blue-400 text-sm font-bold">Part 3: Listening</div>
                </div>

                <div className="space-y-6">
                    {(assets.questions || []).map((q, i) => (
                        <div key={q.id} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                            <p className="text-gray-900 mb-4 font-medium">{i + 1}. {q.text}</p>
                            <input
                                type="text"
                                disabled={isGenerating}
                                className="w-full bg-white border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
                                placeholder="Answer..."
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            />
                        </div>
                    ))}

                    <button
                        onClick={handleSubmit}
                        disabled={isGenerating}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl mt-8 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? "Generating..." : "Submit Listening Check"}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative h-full">
            {renderMainContent()}

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

export default DiagnosticListening;
