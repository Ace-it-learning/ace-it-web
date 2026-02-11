import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

// Sub-components (will be created next)
import DiagnosticLanding from '../components/diagnostic/DiagnosticLanding';
import DiagnosticReading from '../components/diagnostic/DiagnosticReading';
import DiagnosticWriting from '../components/diagnostic/DiagnosticWriting';
import DiagnosticListening from '../components/diagnostic/DiagnosticListening';
import DiagnosticSpeaking from '../components/diagnostic/DiagnosticSpeaking';
import DiagnosticResult from '../components/diagnostic/DiagnosticResult';

const DiagnosticPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(() => sessionStorage.getItem('diag_step') || 'landing');
    const [assets, setAssets] = useState(null);
    const [results, setResults] = useState(() => {
        const saved = sessionStorage.getItem('diag_results');
        return saved ? JSON.parse(saved) : {};
    });
    const [loading, setLoading] = useState(true);

    // Sync state to session storage
    useEffect(() => {
        sessionStorage.setItem('diag_step', step);
    }, [step]);

    useEffect(() => {
        sessionStorage.setItem('diag_results', JSON.stringify(results));
    }, [results]);

    useEffect(() => {
        // Fetch Assets
        const fetchAssets = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/diagnostic/assets`);
                const data = await res.json();
                setAssets(data);
                setLoading(false);
            } catch (e) {
                console.error("Failed to load assets", e);
            }
        };
        fetchAssets();
    }, []);

    const handleStepSubmit = async (paperName, submission) => {
        // 1. Initial submission save (Functional update for safety)
        setResults(prev => ({ ...prev, [paperName]: submission }));

        // 2. Submit to backend for grading
        // 2. Submit to backend for grading
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const payload = {
                step: paperName,
                submission: {
                    ...submission,
                    paperId: assets?.paperId || 'A'
                }
            };
            const res = await fetch(`${API_URL}/api/diagnostic/submit_step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const grade = await res.json();

            if (!res.ok || grade.error) {
                throw new Error(grade.error || "Grading failed");
            }

            // Update with grade (Functional update)
            setResults(prev => ({
                ...prev,
                [paperName]: { ...prev[paperName], ...grade }
            }));

            // 3. Move to next step ONLY after successful save
            const flow = ['landing', 'reading', 'writing', 'listening', 'speaking', 'result'];
            const nextIndex = flow.indexOf(step) + 1;
            if (nextIndex < flow.length) {
                setStep(flow[nextIndex]);
            }

        } catch (e) {
            console.error("Grading error", e);
            // Optionally show error to user, but for now we might still want to proceed or retry?
            // Safer to NOT advance if it failed, so they can retry.
            alert("Failed to submit step. Please try again.");
        }
    };

    const [finalizing, setFinalizing] = useState(false);

    const handleFinalize = async () => {
        // Minimum requirement: Reading and Writing
        const minimumSteps = ['reading', 'writing'];
        const missingMinSteps = minimumSteps.filter(s => !results[s] || results[s].score === undefined);

        if (missingMinSteps.length > 0) {
            console.warn("Retrying finalize: Missing minimum required results for", missingMinSteps);
            // If they haven't even done reading/writing, we can't finalize.
            if (step === 'result') setStep(missingMinSteps[0]);
            return;
        }

        if (finalizing) return;
        setFinalizing(true);

        // Submit all to finalize endpoint
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/diagnostic/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user?.uid, results })
            });
            const finalProfile = await res.json();
            if (finalProfile.error) {
                throw new Error(finalProfile.error);
            }
            setResults(prev => ({ ...prev, profile: finalProfile }));
        } catch (e) {
            console.error("Finalize error", e);
            setResults(prev => ({ ...prev, profile: { error: e.message || "Synthesize failed" } }));
        } finally {
            setFinalizing(false);
        }
    };

    const location = useLocation();

    // Handle Force Restart (signals a fresh start from Chat)
    useEffect(() => {
        if (location.state?.forceRestart) {
            console.log("[Diagnostic] Force Refresh detected. Clearing session state.");
            sessionStorage.removeItem('diag_step');
            sessionStorage.removeItem('diag_results');
            setStep('landing');
            setResults({});
        }
    }, [location.state]);

    // Auto-trigger finalize when entering result step
    useEffect(() => {
        if (step === 'result') {
            // Minimum requirement is Reading and Writing
            const minimumSteps = ['reading', 'writing'];
            const missingMin = minimumSteps.filter(s => !results[s] || results[s].score === undefined);

            if (missingMin.length > 0) {
                console.log("Waiting for minimum results to sync...", missingMin);
                const timer = setTimeout(() => {
                    const currentMissing = minimumSteps.filter(s => !results[s] || results[s].score === undefined);
                    if (currentMissing.length > 0) {
                        setStep(currentMissing[0]);
                    }
                }, 5000);
                return () => clearTimeout(timer);
            }

            if (!results.profile && !finalizing) {
                handleFinalize();
            }
        }
    }, [step, results, finalizing]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-white text-gray-900">Loading Calibration...</div>;

    const renderStep = () => {
        switch (step) {
            case 'landing': return <DiagnosticLanding onStart={() => setStep('reading')} />;
            case 'reading': return <DiagnosticReading assets={assets.reading} onSubmit={(data) => handleStepSubmit('reading', data)} />;
            case 'writing': return <DiagnosticWriting assets={assets.writing} onSubmit={(data) => handleStepSubmit('writing', data)} />;
            case 'listening': return <DiagnosticListening assets={assets.listening} onSubmit={(data) => handleStepSubmit('listening', data)} />;
            case 'speaking': return <DiagnosticSpeaking assets={assets.speaking} onSubmit={(data) => handleStepSubmit('speaking', data)} />;
            case 'result': return <DiagnosticResult results={results} onRetry={() => setResults(prev => { const { profile, ...rest } = prev; return rest; })} />;
            default: return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="h-16 border-b border-gray-200 flex items-center px-6 justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard', { state: { diagnosticCompleted: step === 'result' } })}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Study Calibration
                    </h1>
                </div>
                {/* Progress Bar & Actions */}
                <div className="flex items-center gap-4">
                    {/* Allow finishing early if Reading & Writing are done */}
                    {['listening', 'speaking'].includes(step) && results.reading && results.writing && (
                        <button
                            onClick={() => setStep('result')}
                            className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Finish Early & View Results
                        </button>
                    )}

                    <div className="flex gap-2">
                        {['reading', 'writing', 'listening', 'speaking'].map((s, i) => (
                            <div key={s} className={`h-2 w-16 rounded-full ${step === s ? 'bg-blue-500 animate-pulse' :
                                ['landing', ...['reading', 'writing', 'listening', 'speaking'].slice(0, ['reading', 'writing', 'listening', 'speaking'].indexOf(step))].includes(s)
                                    ? 'bg-blue-200'
                                    : 'bg-gray-200'
                                } ${results[s] ? 'bg-green-500' : (step === s ? 'bg-blue-500' : 'bg-gray-200')}`} />
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto p-6 mt-8">
                {renderStep()}
            </main>
        </div>
    );
};

export default DiagnosticPage;
