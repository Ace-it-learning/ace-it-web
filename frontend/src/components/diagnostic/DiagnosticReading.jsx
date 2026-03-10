import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { QuestionCard, DiagnosticLayout, TwoColumnLayout } from '../shared';

const DiagnosticReading = ({ assets, onSubmit, isSubmitting }) => {
    const { user } = useAuth();
    const [answers, setAnswers] = useState({});
    const [showCheat, setShowCheat] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isDeveloper = user?.email === 'fungtam@gmail.com';

    const handleSubmit = () => {
        onSubmit({ answers });
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

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
            alert(`Failed to generate answers: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!assets) return <div>Loading Reading...</div>;

    return (
        <DiagnosticLayout
            title="Part 1: Reading"
            estimatedTime="8 mins"
            onSubmit={handleSubmit}
            isSubmitting={isGenerating || isSubmitting}
            submitButtonText={isGenerating ? "Generating..." : (isSubmitting ? "Processing Analysis..." : "Submit Reading Check")}
            subjectColor="blue"
        >
            <TwoColumnLayout
                sticky={true}
                leftPanel={<p>{assets.passage}</p>}
                leftTitle="Passage"
                rightPanel={
                    <>
                        {assets.questions.map((q, i) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                answer={answers[q.id]}
                                onChange={handleAnswerChange}
                                disabled={isGenerating || isSubmitting}
                                questionNumber={i + 1}
                                showChallengeBadge={true}
                            />
                        ))}
                    </>
                }
            />

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
        </DiagnosticLayout>
    );
};

export default DiagnosticReading;
