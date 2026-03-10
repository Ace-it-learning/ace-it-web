import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Star, Lightbulb, Ear, PenTool, Brain, Globe, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ListeningBriefing = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    // Data from Roadmap or fetch
    const [questData, setQuestData] = useState(location.state?.questData || null);
    const [loading, setLoading] = useState(!location.state?.questData);

    useEffect(() => {
        const fetchQuest = async () => {
            if (!questData && questId) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const res = await fetch(`${API_URL}/api/lab/listening/${questId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setQuestData(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch quest", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQuest();
    }, [questId, questData]);

    const targetLevel = location.state?.targetLevel || questData?.level || 3;
    const targetXp = location.state?.targetXp || 250;

    const handleStart = () => {
        navigate('/listening/quest', {
            state: {
                questData: questData,
                pillarId: 'all', // Default to integrated mode
                isWeeklyQuest: questData?.isWeeklyQuest || false,
                targetLevel: targetLevel,
                targetXp: targetXp
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (!questData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
                <p className="text-slate-500 font-bold">Quest not found.</p>
                <button onClick={() => navigate('/dashboard')} className="text-rose-600 hover:underline">Return to Dashboard</button>
            </div>
        );
    }

    const pillars = [
        {
            id: 'ear',
            title: 'The Ear: Decoding',
            icon: Ear,
            desc: "Parse accents and speed.",
            hint: "Listen for stress and intonation patterns."
        },
        {
            id: 'pen',
            title: 'The Pen: Capture',
            icon: PenTool,
            desc: "Note-taking and keyword spotting.",
            hint: "Don't write everything. Capture triggers."
        },
        {
            id: 'brain',
            title: 'The Brain: Synthesis',
            icon: Brain,
            desc: "Integration and response generation.",
            hint: "Combine your notes to form the answer."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header / Banner */}
            <div className="bg-rose-900 text-white p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Ear size={200} />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/dashboard')} // Go back to Dashboard/Roadmap
                        className="mb-6 text-rose-200 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        ← Back to Roadmap
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-rose-700 rounded-full text-xs font-bold tracking-wider uppercase border border-rose-500">
                            Listening Mission
                        </span>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold tracking-wider uppercase border border-amber-500/30 flex items-center gap-1">
                            <Star size={12} className="fill-current" /> Level {targetLevel}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {questData.title || "Listening Quest"}
                    </h1>
                    <p className="text-xl text-rose-200 max-w-2xl">
                        {questData.description || "Decode the audio, capture the key points, and synthesize your answers."}
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 max-w-[85%] mx-auto w-full p-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Learning Guide */}
                    <div className="flex-1 p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-rose-600" />
                            Mission Briefing
                        </h2>

                        <div className="space-y-6">
                            {/* Topic Context */}
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 mb-6">
                                <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
                                    <Globe size={18} />
                                    Context & Situation
                                </h3>
                                <p className="text-amber-900 text-base leading-relaxed">
                                    {questData.introduction || questData.situation || questData.description || "No specific briefing available for this quest. Prepare your note-taking tools."}
                                </p>
                            </div>

                            {/* Pillars */}
                            <div>
                                <h3 className="font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs">
                                    Three Pillars of Listening
                                </h3>
                                <div className="grid gap-4">
                                    {pillars.map((p, idx) => (
                                        <div key={idx} className="flex gap-4 items-start group">
                                            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                                <p.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{p.title}</h4>
                                                <p className="text-slate-500 text-sm mb-1">{p.desc}</p>
                                                <div className="text-xs text-rose-500 italic flex items-center gap-1">
                                                    <Lightbulb size={12} />
                                                    "{p.hint}"
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Panel */}
                    <div className="w-full md:w-80 bg-slate-50 border-l border-slate-100 p-8 flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 relative">
                            <Shield size={32} className="text-rose-600" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-50">
                                <CheckCircle size={14} className="text-white" />
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg mb-2">Ready to Listen?</h3>
                        <p className="text-slate-500 text-sm mb-8">
                            Estimated time: 15-20 mins<br />
                            XP Reward: <b>{targetXp} XP</b>
                        </p>

                        <button
                            onClick={handleStart}
                            className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Start Mission <ArrowRight size={18} />
                        </button>

                        <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-wide">
                            Headphones Recommended
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningBriefing;
