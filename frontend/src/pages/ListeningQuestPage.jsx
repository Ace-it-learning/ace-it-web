import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

import PredictionStep from '../components/listening/PredictionStep';
import LiveListenStep from '../components/listening/LiveListenStep';
import IntegratedTaskStep from '../components/listening/IntegratedTaskStep';
import ResultsStep from '../components/listening/ResultsStep';

const ListeningQuestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pillarId = location.state?.pillarId || 'all';

    const [step, setStep] = useState('loading'); // loading, prediction, listening, integration, results
    const [questData, setQuestData] = useState(null);
    const [userNotes, setUserNotes] = useState("");
    const [userPrediction, setUserPrediction] = useState([]);

    // Check if this is a Weekly Quest (Exam Mode)
    const isWeeklyQuest = location.state?.isWeeklyQuest || false;

    // Load Data
    useEffect(() => {
        const loadQuest = async () => {
            setStep('loading');
            try {
                let data = location.state?.questData;
                const questId = location.state?.questId || data?.id;

                // If we don't have full data (interactive_tasks is missing), fetch it
                if (!data?.interactive_tasks && questId) {
                    console.log(`[QuestPage] Fetching full quest data for ID: ${questId}`);
                    const res = await fetch(`/api/lab/listening/${questId}`);
                    if (res.ok) {
                        data = await res.json();
                    } else {
                        throw new Error("Failed to fetch quest data");
                    }
                }

                if (data) {
                    // Normalize tasks if needed
                    const tasks = data.interactive_tasks || data.tasks || [];

                    setQuestData({
                        ...data,
                        script: data.reading_passage || data.script,
                        tasks: tasks
                    });

                    // Weekly Quest Logic: Skip Prediction, Go Straight to Listening (Exam Style)
                    if (isWeeklyQuest) {
                        setStep('listening');
                    } else {
                        setStep('prediction');
                    }
                } else {
                    // Mock Data Fallback
                    setTimeout(() => {
                        const mockData = {
                            topic: "The Future of Public Transport",
                            script: "Speaker 1 [British, Fast]: Well, I reckon the MTR system is... no, actually, it's the buses that need an overhaul. \nSpeaker 2 [Local, Calm]: I see your point. But with the new budget proposals...",
                            tasks: [
                                { id: 't1', type: 'MCQ', question: 'What does Speaker 1 correct themselves about?' },
                                { id: 't2', type: 'GAP_FILL', question: 'The budget proposes changes to...' },
                                { id: 't3', type: 'SHORT_RESPONSE', question: 'Identify the tone of Speaker 2.' },
                                { id: 't4', type: 'INTEGRATED', question: 'Summarize the transport debate for the newsletter.', instruction: 'Write 100 words.' }
                            ]
                        };
                        setQuestData(mockData);
                        setStep(isWeeklyQuest ? 'listening' : 'prediction');
                    }, 1000);
                }
            } catch (err) {
                console.error("Failed to load quest:", err);
                navigate('/listening/menu');
            }
        };

        loadQuest();
    }, [pillarId, location.state, isWeeklyQuest, navigate]);

    const handlePredictionComplete = (keywords) => {
        setUserPrediction(keywords);
        setStep('listening');
    };

    const handleListeningComplete = (notes) => {
        setUserNotes(notes);
        setStep('integration'); // Always go to integration (Paper 3 / Part B)
    };

    const handleIntegrationComplete = (response) => {
        // Here we would submit everything to backend for grading
        setStep('results');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(questData?.id ? `/listening/briefing/${questData.id}` : '/listening/menu', {
                            state: { questData: questData }
                        })}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-800">Listening Quest</h1>
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${step === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            Phase: {step.toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {step === 'loading' && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-pulse">
                        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
                        <p>Calibrating Audio Channels...</p>
                        <p className="text-sm mt-2">Pillar: {pillarId}</p>
                    </div>
                )}

                {step === 'prediction' && (
                    <PredictionStep
                        onComplete={handlePredictionComplete}
                        topic={questData?.topic}
                        metadata={questData?.prediction_metadata}
                    />
                )}

                {step === 'listening' && (
                    <LiveListenStep
                        script={questData?.script}
                        audioSegments={questData?.audio_segments}
                        prediction={userPrediction}
                        onComplete={handleListeningComplete}
                    />
                )}

                {step === 'integration' && (
                    <IntegratedTaskStep
                        notes={userNotes}
                        tasks={questData?.tasks}
                        onComplete={handleIntegrationComplete}
                    />
                )}

                {step === 'results' && (
                    <ResultsStep
                        onRetry={() => window.location.reload()}
                    />
                )}
            </main>
        </div>
    );
};

export default ListeningQuestPage;
