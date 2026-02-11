import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Calendar, CheckCircle, TrendingUp, AlertTriangle, ArrowRight, Eye } from 'lucide-react';

const LoadingState = () => {
    const [progress, setProgress] = React.useState(0);
    const [statusIndex, setStatusIndex] = React.useState(0);

    const statuses = [
        "Starting final calibration...",
        "Analyzing Reading accuracy...",
        "Evaluating Writing sophistication...",
        "Assessing Listening comprehension...",
        "Reviewing Speaking performance...",
        "Mapping 47 micro-skills...",
        "Calculating your DSE Archetype...",
        "Synthesizing personalized feedback...",
        "Finalizing your roadmap..."
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return prev;
                // Slow down as we get closer to the end
                const inc = prev > 80 ? 0.5 : prev > 50 ? 1 : 2;
                return Math.min(prev + inc, 98);
            });
        }, 300);

        const statusTimer = setInterval(() => {
            setStatusIndex(prev => (prev < statuses.length - 1 ? prev + 1 : prev));
        }, 2500);

        return () => {
            clearInterval(timer);
            clearInterval(statusTimer);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                <div
                    className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"
                    style={{ animationDuration: '1.5s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
            </div>

            <div className="w-full max-w-sm bg-indigo-950/40 rounded-full h-2.5 mb-6 overflow-hidden border border-indigo-500/20">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-2">
                <p className="text-xl font-bold text-white tracking-tight animate-pulse">
                    {statuses[statusIndex]}
                </p>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-indigo-400 font-mono font-bold">{Math.round(progress)}%</span>
                    <span className="text-indigo-600 text-xs uppercase tracking-widest font-bold">Analysis in Progress</span>
                </div>
            </div>

            <p className="mt-8 text-indigo-300/60 text-sm max-w-xs leading-relaxed italic">
                Our AI Mentor is evaluating your HKDSE performance parameters to map your exact skill level.
            </p>

            <button
                onClick={() => {
                    sessionStorage.clear();
                    window.location.href = '/diagnostic';
                }}
                className="mt-6 text-xs text-indigo-500/40 hover:text-indigo-400 underline decoration-dotted transition-colors"
            >
                Calibration taking too long? Click here to restart.
            </button>
        </div>
    );
};

const DiagnosticResult = ({ results, onRetry }) => {
    const navigate = useNavigate();
    const profile = results.profile;
    const [isLeaving, setIsLeaving] = useState(false);

    const handleStartJourney = () => {
        setIsLeaving(true);
        setTimeout(() => {
            navigate('/dashboard', { state: { diagnosticCompleted: true, criticalAreas: profile.critical_areas, archetype: profile.archetype } });
        }, 800);
    };

    if (profile?.error) {
        return (
            <div className="max-w-6xl mx-auto p-12 text-center bg-white rounded-3xl border-2 border-red-100 shadow-xl">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                <p className="text-gray-600 mb-8">{profile.error || "Something went wrong while synthesizing your results."}</p>
                <button
                    onClick={onRetry || (() => window.location.reload())}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    if (!profile || Object.keys(profile).length === 0) return <LoadingState />;

    return (
        <div className={`max-w-6xl mx-auto animate-fade-in pb-12 transition-opacity duration-700 ${isLeaving ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>

            {/* Celebration & XP Section - NEW */}
            <div className="text-center mb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

                <div className="inline-flex flex-col items-center justify-center relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 mb-6 animate-bounce-short ring-4 ring-yellow-500/30">
                        <Target className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-12 rotate-12 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold shadow-lg animate-wiggle">
                        +{profile.xp_earned || 500} XP
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-indigo-950 mb-3">Calibration Complete!</h1>
                <p className="text-slate-600 text-lg font-medium">You've unlocked your personalized roadmap.</p>
            </div>

            {/* Archetype Card - BEAUTIFIED */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-xl p-8 rounded-3xl border border-indigo-500/30 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center text-5xl shadow-inner border border-white/10">
                    🌟
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-2">Your English Archetype</h3>
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{profile.archetype}</h2>
                    <div className="inline-flex items-center gap-2 bg-indigo-950/50 px-4 py-2 rounded-full border border-indigo-500/30">
                        <span className="text-indigo-200 font-medium">Predicted Level:</span>
                        <span className="text-white font-bold text-lg">{profile.overall_level}/5**</span>
                    </div>
                </div>
            </div>

            {/* Strengths & Weaknesses Grid - IMPROVED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Strengths */}
                <div className="bg-emerald-50/50 backdrop-blur-md p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-emerald-700 font-bold uppercase tracking-wide text-sm">Superpowers</h3>
                    </div>
                    <ul className="space-y-3">
                        {profile.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm items-start">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="font-medium">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/50 backdrop-blur-md p-6 rounded-2xl border-2 border-rose-100 hover:border-rose-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <h3 className="text-rose-700 font-bold uppercase tracking-wide text-sm">Growth Areas</h3>
                    </div>
                    <ul className="space-y-3">
                        {profile.weaknesses?.map((w, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm items-start">
                                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <span className="font-medium">{w}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Deep Dive Button - RELOCATED */}
            <button
                onClick={() => navigate('/diagnostic/analysis', { state: { results, paperId: results.paperId || 'A' } })}
                className="w-full mb-8 py-4 bg-indigo-50 text-indigo-700 border-2 border-indigo-100 rounded-2xl font-bold text-lg hover:bg-indigo-100 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 group shadow-sm"
            >
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                View Deep Dive Analysis
            </button>

            {/* Weekly Quest Plan - ALIGNED */}
            <div className="bg-slate-50 rounded-3xl border-2 border-slate-100 overflow-hidden mb-12 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-white">
                    <Target className="w-6 h-6 text-indigo-600" />
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg">Your Weekly Quest Plan</h3>
                        <p className="text-xs text-slate-500">Complete these tasks to level up this week</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {(profile.weekly_quest_plan || profile.one_month_plan)?.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white hover:bg-white hover:shadow-md transition-all border border-slate-100 group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                {i + 1}
                            </div>
                            <p className="text-slate-700 group-hover:text-slate-900 transition-colors pt-1 font-semibold">
                                {typeof step === 'object' ? step.title : step}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleStartJourney}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-extrabold text-xl hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    Start My Quest Journey <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div >
    );
};

export default DiagnosticResult;
