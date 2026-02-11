import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { Clock, Eraser, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, Trophy, Zap } from 'lucide-react';

const EraserChallengePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { activeAgent } = useAvatar();

    // Game State
    const [status, setStatus] = useState('LOADING'); // LOADING, PLAYING, GRADING, RESULT, OBSERVED
    const [challenge, setChallenge] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null); // null means not started
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const inputRef = useRef(null);

    // Load Challenge on Mount
    useEffect(() => {
        fetchChallenge();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (status === 'PLAYING' && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && status === 'PLAYING') {
            // Auto-submit on timeout, but ONLY if they have typed something
            if (userInput.trim()) {
                handleSubmit();
            } else {
                setStatus('RESULT');
                setResult({
                    score: 0,
                    feedback: "Time's up! You didn't enter anything.",
                    golden_rewrite: challenge?.original_sentence || "...",
                    diff_analysis: "The original sentence remains weak."
                });
            }
        }
    }, [status, timeLeft]);

    const fetchChallenge = async () => {
        setStatus('LOADING');
        setError(null);
        setUserInput('');
        setResult(null);
        setTimeLeft(45);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/tutor/eraser/challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid,
                    topic: location.state?.topic || 'General Academic'
                })
            });

            if (!res.ok) throw new Error("Failed to load challenge");
            const data = await res.json();

            // Double-check structure in frontend too
            if (!data.original_sentence) {
                throw new Error("Received empty challenge data");
            }

            setChallenge(data);
            setTimeLeft(45); // Set time only AFTER data is ready
            setStatus('PLAYING');

            // Auto-focus input
            if (inputRef.current) setTimeout(() => inputRef.current.focus(), 100);

        } catch (err) {
            console.error(err);
            setError("Could not load challenge. Please try again.");
            setStatus('ERROR');
        }
    };

    const handleSubmit = async () => {
        if (!userInput.trim()) return;
        setStatus('GRADING');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/tutor/eraser/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid,
                    original: challenge.original_sentence,
                    attempt: userInput
                })
            });

            if (!res.ok) throw new Error("Grading failed");
            const data = await res.json();
            setResult(data);
            setStatus('RESULT');

        } catch (err) {
            console.error(err);
            setError("Grading failed. Please check your connection.");
            setStatus('PLAYING'); // Let them try again
        }
    };

    const getScoreColor = (score) => {
        if (score >= 9) return 'text-emerald-500';
        if (score >= 7) return 'text-blue-500';
        if (score >= 4) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">

            {/* Header */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-8">
                <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2">
                    ← Quit Game
                </button>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                    <Eraser className="w-5 h-5 text-pink-500" />
                    <span className="font-black text-slate-800">THE ERASER CHALLENGE</span>
                </div>
            </div>

            {/* ERROR STATE */}
            {status === 'ERROR' && (
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={fetchChallenge} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Try Again</button>
                </div>
            )}

            {/* LOADING STATE */}
            {status === 'LOADING' && (
                <div className="flex flex-col items-center justify-center h-64 animate-pulse">
                    <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-slate-400">Finding a weak sentence...</p>
                </div>
            )}

            {/* PLAYING STATE */}
            {(status === 'PLAYING' || status === 'GRADING') && challenge && (
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    {/* Top Bar: Timer & Context */}
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Context</span>
                            <p className="text-lg font-medium text-blue-200">{challenge.context}</p>
                        </div>
                        <div className={`flex items-center gap-2 text-2xl font-black font-mono ${(timeLeft || 0) < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            <Clock className="w-6 h-6" />
                            {timeLeft !== null ? `${timeLeft}s` : '--'}
                        </div>
                    </div>

                    <div className="p-8">
                        {/* The Bad Sentence */}
                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Original (Level 3)</label>
                            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg relative">
                                <p className="text-xl font-serif text-slate-800">"{challenge.original_sentence}"</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(challenge.flaws && challenge.flaws.length > 0) ? challenge.flaws.map((flaw, i) => (
                                        <span key={i} className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> {flaw}
                                        </span>
                                    )) : (
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">No specific flaws identified</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="mb-6 relative">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Your Rewrite (Level 5**)</label>
                            <textarea
                                ref={inputRef}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                disabled={status === 'GRADING'}
                                placeholder="Erase the weakness. Make it sophisticated..."
                                className="w-full h-32 p-4 text-lg font-serif border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none shadow-inner"
                            />
                            {/* Floating Submit Button */}
                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!userInput.trim() || status === 'GRADING'}
                                    className={`
                                        flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-lg transition-all
                                        ${!userInput.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'}
                                    `}
                                >
                                    {status === 'GRADING' ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>Submit <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RESULT STATE */}
            {status === 'RESULT' && result && (
                <div className="w-full max-w-3xl animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        {/* Score Header */}
                        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-600/10 opacity-50"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Examiner Score</div>
                                <div className={`text-6xl font-black ${getScoreColor(result.score)}`}>{result.score}<span className="text-3xl text-slate-600">/10</span></div>
                                <div className="mt-2 font-bold text-white text-xl">"{result.feedback}"</div>
                            </div>
                        </div>

                        {/* Comparison */}
                        <div className="p-8 space-y-8">
                            {/* Student Attempt */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Version</h3>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-serif text-lg text-slate-700">
                                    {userInput}
                                </div>
                            </div>

                            {/* Golden Answer */}
                            <div className="relative">
                                <div className="absolute -top-3 -right-2 rotate-12 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded shadow-lg border border-amber-200 flex items-center gap-1">
                                    <Trophy className="w-3 h-3" /> 5** GOLDEN
                                </div>
                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Ace Sir's Rewrite</h3>
                                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 font-serif text-xl font-medium text-slate-900 shadow-sm ring-1 ring-amber-100">
                                    {result.golden_rewrite}
                                </div>
                            </div>

                            {/* Diff Analysis */}
                            <div className="bg-blue-50 p-4 rounded-lg flex gap-4 items-start">
                                <Zap className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Examiner's Note</h4>
                                    <p className="text-blue-800 text-sm leading-relaxed">{result.diff_analysis}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-200">
                            <button
                                onClick={fetchChallenge}
                                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:scale-105 transition-all shadow-lg"
                            >
                                <RefreshCw className="w-5 h-5" /> Next Challenge
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EraserChallengePage;
