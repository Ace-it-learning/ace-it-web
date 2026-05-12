import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ear, PenTool, Brain, Radio, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';

const ListeningQuestMenu = () => {
    const navigate = useNavigate();

    const pillars = [
        {
            id: 'pillar_capture',
            title: 'Phase 1: The Pen (Capture)',
            icon: <PenTool size={32} />,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100',
            description: 'Strategic preparation. Predict what comes next and prime your brain for the content.',
            skills: ['Note-Taking', 'Prediction', 'Detail Extraction'],
            mission: 'Don\'t just listen. Capture the value.'
        },
        {
            id: 'pillar_decoding',
            title: 'Phase 2: The Ear (Decoding)',
            icon: <Ear size={32} />,
            color: 'bg-rose-500',
            textColor: 'text-rose-600',
            bg: 'bg-rose-50',
            borderColor: 'border-rose-100',
            description: 'Master the mechanics. Conquer diverse accents, rapid speech, and ambiguity in real-time.',
            skills: ['Accent Recognition', 'Speed Processing', 'Ambiguity Handling'],
            mission: 'Can you parse the signal from the noise?'
        },
        {
            id: 'pillar_synthesis',
            title: 'Phase 3: The Brain (Synthesis)',
            icon: <Brain size={32} />,
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            bg: 'bg-indigo-50',
            borderColor: 'border-indigo-100',
            description: 'Critical interpretation. Detect attitude, irony, and integrate findings into the final tasks.',
            skills: ['Speaker Attitude', 'Main Idea', 'Integration'],
            mission: 'Understand what is meant, not just what is said.'
        }
    ];

    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('all');

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/lab/listening`);
                if (res.ok) {
                    const data = await res.json();
                    setMissions(data);
                }
            } catch (err) {
                console.error("Failed to fetch missions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    const handleStartMission = (mission) => {
        navigate(`/listening/briefing/${mission.id}`, {
            state: {
                questData: mission
            }
        });
    };

    const handleStart = (pillarId) => {
        // Navigate to the quest page with selected pillar
        navigate('/listening/quest', {
            state: {
                pillarId: pillarId,
                mode: 'training' // vs 'exam'
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <header className="mb-10 max-w-5xl mx-auto">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="bg-sky-600 text-white p-2 rounded-lg"><Radio size={24} /></span>
                    Listening Lab: The Silent Assassin
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Paper 3 isn't just about hearing—it's about brutal efficiency. Choose a pillar to master.
                </p>
            </header>

            <div className="max-w-5xl mx-auto mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Target size={20} className="text-indigo-600" />
                        Available Missions
                    </h2>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Difficulty:</span>
                        <select 
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="all">ALL LEVELS</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                            <option value="5">Level 5</option>
                            <option value="6">Level 5*</option>
                            <option value="7">Level 5**</option>
                        </select>
                    </div>
                </div>
                {missions.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></span>
                                Loading missions...
                            </div>
                        ) : (
                            "No missions available. Ask admin to generate some!"
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {missions
                            .filter(m => selectedLevel === 'all' || String(m.level) === selectedLevel)
                            .map(mission => (
                            <div
                                key={mission.id}
                                onClick={() => handleStartMission(mission)}
                                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">
                                        Level {mission.level}
                                    </span>
                                    {mission.hasAudio && (
                                        <span className="text-slate-400" title="Audio included">
                                            <Radio size={16} />
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {mission.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                    {mission.reading_passage ? mission.reading_passage.substring(0, 80) + "..." : "No preview"}
                                </p>
                                <div className="flex items-center text-xs text-indigo-500 font-medium">
                                    Start Mission <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="col-span-full text-center mb-2 text-slate-400 text-sm uppercase tracking-widest font-bold">
                    Or Practice Specific Pillars (Legacy)
                </div>
                {pillars.map((pillar) => (
                    <div
                        key={pillar.id}
                        className={`relative group bg-white rounded-2xl border ${pillar.borderColor} p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
                        onClick={() => handleStart(pillar.id)}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${pillar.bg} rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform`}></div>

                        <div className="relative z-10">
                            <div className={`${pillar.bg} w-14 h-14 rounded-xl flex items-center justify-center ${pillar.textColor} mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                {pillar.icon}
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-2">{pillar.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 h-16">
                                {pillar.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Micro-Skills</div>
                                <div className="flex flex-wrap gap-2">
                                    {pillar.skills.map(skill => (
                                        <span key={skill} className={`text-[10px] px-2 py-1 rounded-md font-bold ${pillar.bg} ${pillar.textColor} border ${pillar.borderColor}`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`mt-auto pt-4 border-t ${pillar.borderColor} flex items-center justify-between`}>
                                <span className={`text-xs font-bold ${pillar.textColor} italic`}>
                                    "{pillar.mission}"
                                </span>
                                <div className={`w-8 h-8 rounded-full ${pillar.bg} flex items-center justify-center ${pillar.textColor} group-hover:translate-x-1 transition-transform`}>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Challenge / Mixed Mode */}
            <div className="max-w-5xl mx-auto mt-12">
                <div
                    onClick={() => handleStart('all')}
                    className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden cursor-pointer group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                                <Zap className="text-yellow-400 fill-yellow-400" />
                                The Integrity Challenge (Full Mock)
                            </h3>
                            <p className="text-slate-300 max-w-xl">
                                Combine all three pillars. Decode usage, capture details, and synthesize a Data File task under time pressure.
                            </p>
                        </div>
                        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                            Start Full Simulation <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningQuestMenu;
