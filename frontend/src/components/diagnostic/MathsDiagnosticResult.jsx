import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle, TrendingUp, AlertTriangle, ArrowRight, Eye, Calculator, Sigma, Lock } from 'lucide-react';
import { useMockGate } from '../../hooks/useMockGate';
import { useAvatar } from '../../context/AvatarContext';

const LoadingState = () => {
    const [progress, setProgress] = React.useState(0);
    const [statusIndex, setStatusIndex] = React.useState(0);

    const statuses = [
        "Calibrating your mathematical compass...",
        "Evaluating algebraic fluency...",
        "Checking geometric intuition...",
        "Analyzing Paper 2 speed parameters...",
        "Reviewing step-by-step logic...",
        "Mapping DSE proficiency levels...",
        "Calculating your Math Archetype...",
        "Synthesizing personalized roadmap...",
        "Finalizing your DSE level prediction..."
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return prev;
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
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div
                    className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"
                    style={{ animationDuration: '1.5s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sigma className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
            </div>

            <div className="w-full max-w-sm bg-purple-900/10 rounded-full h-2.5 mb-6 overflow-hidden border border-purple-500/20">
                <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-2">
                <p className="text-xl font-bold text-gray-900 tracking-tight">
                    {statuses[statusIndex]}
                </p>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-purple-600 font-mono font-bold">{Math.round(progress)}%</span>
                    <span className="text-purple-400 text-xs uppercase tracking-widest font-bold font-sans">Logic Analysis</span>
                </div>
            </div>

            <p className="mt-8 text-slate-500 text-sm max-w-xs leading-relaxed italic">
                Our AI Model is evaluating your mathematical steps to map your DSE performance.
            </p>
        </div>
    );
};

const MathsDiagnosticResult = ({ results, uid }) => {
    const navigate = useNavigate();
    const { activeAgent } = useAvatar();
    const profile = results?.profile;
    const [isLeaving, setIsLeaving] = useState(false);
    const { mathsUnlocked } = useMockGate(uid);

    const handleStartJourney = () => {
        setIsLeaving(true);
        setTimeout(() => {
            // Navigation to Dashboard with "math" agent selected
            navigate('/dashboard', {
                state: {
                    diagnosticCompleted: true,
                    mathsResults: results,
                    activeAgentId: 'math' // Signal to ChatInterface
                }
            });
        }, 800);
    };

    if (!profile) return <LoadingState />;

    return (
        <div className={`max-w-4xl mx-auto animate-fade-in pb-12 transition-all duration-700 ${isLeaving ? 'opacity-0 translate-y-10 scale-95' : 'opacity-100'}`}>

            {/* Header Section */}
            <div className="text-center mb-12 relative pt-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

                <div className="inline-flex flex-col items-center justify-center relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-200 mb-6 rotate-3">
                        <Calculator className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-16 rotate-6 bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full font-bold shadow-lg text-sm">
                        +{profile.xp_earned || 500} XP Earned
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Calibration Results</h1>
                <p className="text-slate-500 text-lg font-medium">{activeAgent?.name || "Your tutor"} has mapped your mathematical potential.</p>
            </div>

            {/* Archetype Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2rem] border border-white/20 mb-10 flex flex-col md:flex-row items-center gap-10 shadow-3xl shadow-purple-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center text-6xl shadow-inner border border-white/20">
                    {profile.archetype.includes('Mathlete') ? '🏅' :
                        profile.archetype.includes('Logician') ? '📐' :
                            profile.archetype.includes('Tactician') ? '🏹' : '🧭'}
                </div>
                <div className="flex-1 text-center md:text-left text-white">
                    <h3 className="text-purple-200 text-xs font-black uppercase tracking-[0.3em] mb-3">Calibration Profile</h3>
                    <h2 className="text-5xl font-black mb-3 tracking-tighter">{profile.archetype}</h2>
                    <div className="inline-flex items-center gap-3 bg-black/20 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-white/10 mb-3">
                        <span className="text-white/80 font-bold">Ability Score:</span>
                        <span className="text-white font-extrabold text-3xl drop-shadow-md">{profile.overall_level} / 7</span>
                    </div>
                    {mathsUnlocked ? (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/70 text-sm font-bold">DSE Grade:</span>
                            <span className="text-yellow-400 font-extrabold text-2xl drop-shadow-md">Level {profile.overall_level}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 mt-2 text-purple-200/70 text-sm">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Complete Maths Papers 1 &amp; 2 to unlock your DSE Grade Projection</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Strengths */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">Main Superpowers</h3>
                    </div>
                    <ul className="space-y-4">
                        {profile.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-4 text-slate-600 text-[15px] items-start">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="font-semibold leading-snug">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">Growth Targets</h3>
                    </div>
                    <ul className="space-y-4">
                        {profile.weaknesses?.map((w, i) => (
                            <li key={i} className="flex gap-4 text-slate-600 text-[15px] items-start">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-sm" />
                                <span className="font-semibold leading-snug">{w}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Deep Dive Action */}
            <button
                onClick={() => navigate('/maths/diagnostic/analysis', { state: { results, paperId: results.paperId || 'A' } })}
                className="w-full mb-10 py-5 bg-white text-purple-600 border-2 border-purple-100 rounded-3xl font-black text-xl hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-purple-100/50"
            >
                <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                View Question-by-Question Analysis
            </button>

            {/* Study Plan */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />

                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner border border-white/5">
                        <Target className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-3xl tracking-tight">Weekly Quest Plan</h3>
                        <p className="text-slate-400 font-medium">{activeAgent?.name || "Your tutor"}'s strategic roadmap for your Level Upgrade</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {profile.weekly_quest_plan?.map((step, i) => (
                        <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group cursor-default">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                                {i + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-200 text-lg font-bold leading-tight pt-1 group-hover:text-white transition-colors">
                                    {typeof step === 'object' ? step.title : step}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Action */}
            <div className="flex flex-col gap-6">
                <button
                    onClick={handleStartJourney}
                    className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-2xl hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl shadow-purple-200 flex items-center justify-center gap-3 mb-4"
                >
                    Start My Math Journey with {activeAgent?.name || "Your tutor"} <ArrowRight className="w-7 h-7" />
                </button>
                <p className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                    Study calibration record secured • XP updated
                </p>
            </div>
        </div >
    );
};

export default MathsDiagnosticResult;
