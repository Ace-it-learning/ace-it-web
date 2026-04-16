import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MessageSquare, Languages, Sparkles, Layout, ChevronRight, Loader2, Zap, Play, Activity } from 'lucide-react';

const SpeakingPillarMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mapping of internal keys to display names
    const PILLARS = [
        { id: 'criterion_a', label: 'Pronunciation', icon: Languages, color: 'emerald', route: '/speaking/quest/delivery' },
        { id: 'criterion_b', label: 'Strategies', icon: MessageSquare, color: 'blue', route: '/speaking/quest/interaction-lab' },
        { id: 'criterion_c', label: 'Vocab Lab', icon: Sparkles, color: 'fuchsia', route: '/speaking/quest/language' },
        { id: 'criterion_d', label: 'Ideas', icon: Layout, color: 'orange', route: '/speaking/quest/ideas' },
        { id: 'flow', label: 'Fluency', icon: Activity, color: 'purple', route: '/speaking/quest/flow' }
    ];

    const LEVELS = [
        { label: 'All Levels', value: 'all' },
        { label: 'Easy (Level 3)', value: 'Easy' },
        { label: 'Medium (Level 4)', value: 'Medium' },
        { label: 'DSE Standard (Level 5)', value: 'DSE Standard' },
        { label: 'Elite (Level 5**)', value: 'Elite' }
    ];

    const [activePillar, setActivePillar] = useState(null);
    const [drills, setDrills] = useState([]);
    const [filteredDrills, setFilteredDrills] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [loading, setLoading] = useState(false);

    // Initial load from location state (from Roadmap) or default to A
    useEffect(() => {
        const initialPillar = location.state?.activePillar || 'criterion_a';
        const pillar = PILLARS.find(p => p.id === initialPillar) || PILLARS[0];
        setActivePillar(pillar);
    }, [location.state]);

    // Fetch drills when pillar changes
    useEffect(() => {
        if (!activePillar) return;

        const fetchDrills = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${API_URL}/api/speaking/drills/${activePillar.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setDrills(data);
                    setFilteredDrills(data); // Initial set
                    setSelectedLevel('all'); // Reset filter on pillar change
                } else {
                    setDrills([]);
                    setFilteredDrills([]);
                }
            } catch (err) {
                console.error("Failed to load drills", err);
                setDrills([]);
                setFilteredDrills([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDrills();
    }, [activePillar]);

    // Filtering logic
    useEffect(() => {
        if (selectedLevel === 'all') {
            setFilteredDrills(drills);
        } else {
            setFilteredDrills(drills.filter(d => d.level_label === selectedLevel));
        }
    }, [selectedLevel, drills]);

    const handleStartDrill = (drill) => {
        // Navigate to the specific lab with the drill ID
        const levelVal = drill.level === '5**' ? '7' : (drill.level === '5*' ? '6' : (drill.level === '5' ? '5' : drill.level));
        
        let moduleType = 'delivery';
        if (activePillar.id === 'criterion_b') moduleType = 'interaction';
        if (activePillar.id === 'criterion_c') moduleType = 'language_patterns';
        if (activePillar.id === 'criterion_d') moduleType = 'ideas_organisation';
        if (activePillar.id === 'flow') moduleType = 'flow';
        
        navigate(`${activePillar.route}?module=${moduleType}&topic=${drill.id}&level=${levelVal}`, {
            state: {
                drill: drill,
                pillarId: activePillar.id
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            {/* Header Area */}
            <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
                        <Mic size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Speaking Training Hub</h1>
                        <p className="text-slate-500 font-medium">Master the 4 HKEAA Criteria through targeted micro-drills.</p>
                    </div>
                </div>

                {/* Pillar Navigation Tabs */}
                <div className="flex flex-wrap gap-3 mt-8">
                    {PILLARS.map(p => {
                        const Icon = p.icon;
                        const isActive = activePillar?.id === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setActivePillar(p)}
                                className={`flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-300 border-2 ${
                                    isActive 
                                    ? `bg-white border-indigo-600 shadow-xl shadow-indigo-50 transform -translate-y-1` 
                                    : `bg-white border-transparent text-slate-400 hover:border-slate-200`
                                }`}
                            >
                                <div className={`p-2.5 rounded-xl ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Icon size={22} />
                                </div>
                                <div className="text-left">
                                    <p className={`text-base font-black uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {p.label}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Drill Selection Section */}
            <main>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Available Drills ({filteredDrills.length})
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span>Filter:</span>
                        <select 
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="bg-white border-none rounded-lg px-3 py-1.5 text-slate-700 shadow-sm focus:ring-2 ring-indigo-500 font-bold outline-none cursor-pointer"
                        >
                            {LEVELS.map(l => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {filteredDrills.map((drill, idx) => (
                            <button
                                key={drill.id}
                                onClick={() => handleStartDrill(drill)}
                                className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 text-left relative overflow-hidden"
                            >
                                {/* Level Badge */}
                                <div className={`absolute top-6 right-6 px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${
                                    drill.level_label === 'Elite' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                    drill.level_label === 'DSE Standard' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                    {drill.level_label === 'Elite' ? 'Level 5**' : `Level ${drill.level}`}
                                </div>

                                <div className="flex flex-col h-full">
                                    <div className="mb-4">
                                        <div className={`w-10 h-10 rounded-xl bg-${activePillar?.color || 'indigo'}-50 text-${activePillar?.color || 'indigo'}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                            {drill.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                            {drill.scenario}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {drill.level_label}
                                        </span>
                                        <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                            Enter Lab <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {filteredDrills.length === 0 && !loading && (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 italic">No drills found for this level. Try another filter!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* AI Generator CTA Removed per User Request */}
        </div>
    );
};

export default SpeakingPillarMenu;
