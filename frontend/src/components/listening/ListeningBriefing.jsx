import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Star, Ear, Shield, Zap, Layers, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ListeningBriefing = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    // Data from Roadmap or fetch
    const [questData, setQuestData] = useState(location.state?.questData || null);
    const [loading, setLoading] = useState(!location.state?.questData);
    const [selectedMode, setSelectedMode] = useState(null); // 'A' or 'B'
    const [selectedLevel, setSelectedLevel] = useState('B2'); // 'B1' or 'B2' for Part B
    const [completedResults, setCompletedResults] = useState({ A: null, B: null });

    useEffect(() => {
        const fetchQuest = async () => {
            if (!questData && questId) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    // Use different endpoint for weekly quests
                    const url = questId.startsWith('weekly_') 
                        ? `${API_URL}/api/lab/weekly/${questId.replace('weekly_', '')}`
                        : `${API_URL}/api/lab/listening/${questId}`;
                    
                    const res = await fetch(url);
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

        // Check for completed results in local storage (HISTORY - persists through retries)
        if (questId) {
            const results = {};
            ['A', 'B'].forEach(m => {
                const key = `ace_it_listening_history_${questId}_${m}`;
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        const resData = parsed.results;
                        if (resData) {
                            const maxXP = m === 'A' ? 25 : 50;
                            // Use raw score if available, otherwise calculate from counts
                            const rawScore = resData.score !== undefined ? resData.score : (m === 'A' && resData.totalCount > 0 ? (resData.correctCount / resData.totalCount) * 100 : 0);
                            const earnedXP = Math.floor((rawScore / 100) * maxXP);
                            
                            results[m] = {
                                score: rawScore,
                                totalScore: m === 'A' ? (resData.correctCount ?? 0) : (resData.totalScore ?? 0),
                                maxScore: m === 'A' ? (resData.totalCount ?? 20) : 18,
                                xp: earnedXP || 0
                            };
                        }
                    } catch (e) { console.error("Error parsing stored history", e); }
                }
            });
            setCompletedResults(results);
        }
    }, [questId, questData]);

    const targetLevel = location.state?.targetLevel || questData?.level || 3;
    const targetXp = location.state?.targetXp || 250;

    const modes = [
        {
            id: 'A',
            title: 'Part A: The Data Sprint',
            icon: Zap,
            color: 'bg-amber-100 text-amber-700 border-amber-200',
            hoverColor: 'hover:border-amber-400 hover:shadow-amber-100',
            activeColor: 'ring-2 ring-amber-500 border-amber-500',
            desc: "Rapid-fire information retrieval. Form filling, table completion, and MCQs.",
            skills: ['Speed Processing', 'Fact Extraction', 'Numerical Listening']
        },
        {
            id: 'B',
            title: 'Part B: Integrated Simulation',
            icon: Layers,
            color: 'bg-rose-100 text-rose-700 border-rose-200',
            hoverColor: 'hover:border-rose-400 hover:shadow-rose-100',
            activeColor: 'ring-2 ring-rose-500 border-rose-500',
            desc: "Comprehensive synthesis. Integrated listening, data file analysis, and professional writing.",
            skills: ['Synthesis', 'Professional Writing', 'Data Integration']
        }
    ];

    const handleStart = () => {
        if (!selectedMode) return;
        
        navigate('/listening/quest', {
            state: {
                questData: questData,
                mode: selectedMode,
                level: 'B2', // Unified Elite standard for Part B
                targetLevel: targetLevel,
                targetXp: targetXp,
                isNewSession: true,
                isWeeklyQuest: questData?.isWeeklyQuest || questId?.startsWith('weekly_')
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!questData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
                <p className="text-slate-500 font-bold">Quest not found.</p>
                <button onClick={() => navigate('/dashboard')} className="text-orange-600 hover:underline">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header / Banner */}
            <div className="bg-[#FF6600] text-white py-6 px-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Ear size={140} />
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mb-4 text-white/80 hover:text-white flex items-center gap-2 transition-colors font-bold text-sm"
                    >
                        ← Back to Roadmap
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20">
                            HKDSE Simulator
                        </span>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-100 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-500/30 flex items-center gap-1">
                            <Star size={10} className="fill-current" /> Level {targetLevel}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                        {questData.title || "Listening Quest"}
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl font-medium">
                        {questData.description || "Master the raw skills of Information Retrieval and Data Integration."}
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-6 -mt-8 mb-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                    
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Zap className="text-amber-500" />
                            Select Mission Mode
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {modes.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMode(m.id)}
                                    className={`
                                        relative p-8 rounded-2xl border-2 text-left transition-all duration-300
                                        ${m.id === selectedMode ? m.activeColor : `bg-white border-slate-100 ${m.hoverColor}`}
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${m.color}`}>
                                            <m.icon size={24} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {m.id === selectedMode && (
                                                <div className="bg-green-500 text-white p-1 rounded-full shadow-lg shadow-green-200 animate-in zoom-in duration-300">
                                                    <CheckCircle size={16} />
                                                </div>
                                            )}
                                            {completedResults[m.id] && (
                                                <div className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-base font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-200/50 hover:scale-105 transition-all border-2 border-white/20">
                                                    <Trophy size={18} className="fill-current text-amber-400" /> 
                                                    <span>{completedResults[m.id].totalScore}/{completedResults[m.id].maxScore} Marks</span>
                                                    <span className="opacity-40">|</span>
                                                    <span className="text-amber-400">+{completedResults[m.id].xp} XP</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{m.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        {m.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {m.skills.map(skill => (
                                            <span key={skill} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded border border-slate-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center relative border border-slate-100">
                                <Shield size={28} className="text-indigo-600" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <CheckCircle size={10} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Exam Atmosphere: ON</h3>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-black mt-1">High-Fidelity Paper 3 Simulation</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                Reward: <span className="text-indigo-600">+{targetXp} XP</span> &bull; Time: <span className="text-rose-600">{selectedMode === 'A' ? '~10 Mins' : '~60 Mins'}</span>
                            </div>
                            <button
                                onClick={handleStart}
                                disabled={!selectedMode}
                                className={`
                                    px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                                    ${selectedMode 
                                        ? 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-slate-200' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
                                `}
                            >
                                Start Simulator <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningBriefing;
