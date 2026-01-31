import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, BookOpen, PenTool, Mic, MessageSquare, Layers } from 'lucide-react';
import { MICRO_SKILLS, getSkillName, getSkillDesc } from '../../constants/microSkills';

const RoadmapModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('WEEKLY'); // 'WEEKLY' | 'GENERAL' | 'CHALLENGE'
    const [searchQuery, setSearchQuery] = useState('');
    const [userSkills, setUserSkills] = useState({});
    const [practicedSkills, setPracticedSkills] = useState([]);
    const [paperFilter, setPaperFilter] = useState('ALL'); // 'ALL' | 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING'

    useEffect(() => {
        if (user?.uid && isOpen) {
            fetchRoadmap();
            fetchUserSkills();
        }
    }, [user, isOpen]);

    const fetchUserSkills = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/microskills/${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setUserSkills(data.microSkills || {});
                setPracticedSkills(data.practicedSkills || []);
            }
        } catch (error) {
            console.error("Failed to load user skills", error);
        }
    };

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/roadmap?uid=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setPlan(data);
            }
        } catch (error) {
            console.error("Failed to load roadmap", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDSELevel = (numericLevel) => {
        if (!numericLevel) return '1';
        if (numericLevel >= 7) return '5**';
        if (numericLevel >= 6) return '5*';
        if (numericLevel >= 5) return '5';
        if (numericLevel >= 4) return '4';
        if (numericLevel >= 3) return '3';
        if (numericLevel >= 2) return '2';
        return '1';
    };

    const handleTaskClick = (task) => {
        console.log("RoadmapModal: Clicked Task", task);
        if (task.status === 'COMPLETED' || task.locked) return;

        // Smart Navigation based on Task Type
        onClose(); // Close modal on navigation

        if (task.type === 'LEARN' || task.type === 'PRACTICE') {
            const targetLevel = task.level || (plan ? Number(plan.level_at_start) + 1 : 1);
            const params = new URLSearchParams({
                topic: task.topic,
                level: targetLevel,
            });
            navigate(`/lab?${params.toString()}`, {
                state: {
                    autoStart: {
                        topic: task.topic,
                        focus: ["grammar", "vocabulary"],
                        level: targetLevel
                    },
                    taskId: task.id,
                    taskTitle: task.title,
                    taskXp: task.xp,
                    taskDescription: task.description || "Master this skill to level up."
                }
            });
        } else if (task.type === 'MOCK' || task.type === 'BOSS') { // Support both labels
            navigate('/exam/selector');
        } else if (task.type === 'DIAGNOSTIC') {
            navigate('/diagnostic');
        }
    };

    if (!isOpen) return null;

    const completedCount = plan ? plan.tasks.filter(t => t.status === 'COMPLETED' && t.type !== 'MOCK').length : 0;
    const totalKeys = 5; // Fixed at 5 targets
    const bossTask = plan ? plan.tasks.find(t => t.type === 'MOCK') : null;
    const canUnlockBoss = completedCount >= 4;

    const filteredSkills = Object.entries(MICRO_SKILLS).filter(([id, data]) => {
        // 1. Search Query
        if (searchQuery) {
            const name = getSkillName(id).toLowerCase();
            if (!name.includes(searchQuery.toLowerCase())) return false;
        }

        const paper = id.split('_')[0].toUpperCase();

        // 2. Paper Filter
        if (paperFilter !== 'ALL' && paper !== paperFilter) return false;

        // 3. Tab Specific Filter
        if (activeTab === 'CHALLENGE') {
            // Only show if user has mastered it (Level 5+)
            const userLevel = userSkills[id]?.level || 0;
            return userLevel >= 5;
        }

        return true;
    });

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[85vw] h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header - Slimmer Version */}
                <div className={`p-4 relative overflow-hidden ${activeTab === 'CHALLENGE' ? 'bg-indigo-900' : 'bg-amber-500'}`}>
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Trophy className="w-24 h-24 text-white transform rotate-12" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-3 right-4 text-white/80 hover:text-white transition-colors z-[60]"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative z-10 text-white flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-1 opacity-90 text-[10px] font-bold tracking-wider uppercase">
                                <Map className="w-3 h-3" />
                                Quest System
                            </div>
                            <h2 className="text-2xl font-bold leading-tight">My Weekly Learning Path</h2>
                            <p className="text-white/80 text-xs opacity-90 truncate">
                                {activeTab === 'WEEKLY'
                                    ? "Complete targets to unlock the Master Quest!"
                                    : activeTab === 'CHALLENGE'
                                        ? "Take on elite challenges to prove your mastery."
                                        : "Practice any specific skill to master it."}
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className={`flex p-1 rounded-lg backdrop-blur-sm border ${activeTab === 'CHALLENGE' ? 'bg-indigo-800/40 border-indigo-400/30' : 'bg-amber-600/40 border-amber-400/30'}`}>
                            {[
                                { id: 'WEEKLY', label: 'Personalised Quest', icon: Clock },
                                { id: 'GENERAL', label: 'General Quest', icon: Sparkles },
                                { id: 'CHALLENGE', label: 'Challenge', icon: Zap }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPaperFilter('ALL'); // Reset filter on switch
                                    }}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all
                                        ${activeTab === tab.id
                                            ? 'bg-white text-slate-800 shadow-sm'
                                            : 'text-white hover:bg-white/10'}
                                    `}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400 flex-1 flex items-center justify-center">Loading your quest...</div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                        {activeTab === 'WEEKLY' ? (
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-2xl font-bold text-slate-800">{completedCount}</span>
                                            <span className="text-slate-400 text-sm ml-1">/{totalKeys} Practice Targets</span>
                                        </div>
                                        <div className="text-amber-600 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            Status: {canUnlockBoss ? 'Master Quest Unlocked!' : `${4 - completedCount} more to unlock Master Quest`}
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                            style={{ width: `${(completedCount / totalKeys) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Task Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                    {plan?.tasks.filter(t => t.type !== 'MOCK').map((task, idx) => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleTaskClick(task)}
                                            className={`
                                                group relative p-4 rounded-xl border-2 text-left transition-all duration-200
                                                ${task.status === 'COMPLETED'
                                                    ? 'bg-green-100 border-green-300 opacity-90'
                                                    : 'bg-white border-slate-100 hover:border-amber-300 hover:shadow-lg cursor-pointer'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`
                                                    px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700
                                                `}>
                                                    PRACTICE
                                                </span>
                                                {task.status === 'COMPLETED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            </div>

                                            <h3 className={`font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors ${task.status === 'COMPLETED' && 'line-through decoration-slate-400'}`}>
                                                {task.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {task.description || "Master this skill to level up your English."}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between">
                                                {task.status === 'COMPLETED' ? (
                                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                        Earned {task.xp} XP
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" /> +{task.xp} XP
                                                    </span>
                                                )}

                                                {task.status !== 'COMPLETED' && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 text-amber-700 p-1.5 rounded-full">
                                                        <Play className="w-4 h-4 ml-0.5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Master Quest (Boss) Card */}
                                    {bossTask && (
                                        <div className={`
                                            relative p-4 rounded-xl border-2 flex flex-col justify-center items-center text-center transition-all duration-300
                                            ${bossTask.locked && !canUnlockBoss
                                                ? 'bg-slate-50 border-slate-200 text-slate-400 grayscale'
                                                : 'bg-gradient-to-br from-amber-50 to-white border-amber-400 shadow-amber-100 shadow-xl cursor-pointer transform hover:scale-[1.02]'
                                            }
                                        `}
                                            onClick={() => (!bossTask.locked || canUnlockBoss) && handleTaskClick(bossTask)}
                                        >
                                            <div className={`
                                                mb-3 p-3 rounded-full shadow-inner
                                                ${bossTask.locked && !canUnlockBoss ? 'bg-slate-200 text-white' : 'bg-amber-500 text-white animate-pulse'}
                                            `}>
                                                {bossTask.locked && !canUnlockBoss ? <Lock className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight mb-1">Weekly Master Quest</h3>
                                            <p className="text-xs font-medium mb-3 opacity-80 text-amber-700">Consolidated Review & Exam</p>

                                            <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-amber-600 border border-amber-200 flex items-center gap-1.5">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span>500 XP Reward</span>
                                            </div>

                                            {(bossTask.locked && !canUnlockBoss) && (
                                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                                    <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                                        <Lock className="w-3 h-3" />
                                                        Complete {4 - completedCount} more targets
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Search & Difficulty */}
                                <div className="p-4 bg-white border-b border-slate-100 flex flex-col gap-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="relative w-full max-w-sm">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search micro-skills..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {filteredSkills.length} skills available
                                        </div>
                                    </div>

                                    {/* Paper Filter Pills */}
                                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                        {[
                                            { id: 'ALL', label: 'All Papers', icon: Layers },
                                            { id: 'READING', label: 'Reading', icon: BookOpen },
                                            { id: 'WRITING', label: 'Writing', icon: PenTool },
                                            { id: 'LISTENING', label: 'Listening', icon: Mic },
                                            { id: 'SPEAKING', label: 'Speaking', icon: MessageSquare }
                                        ].map(filter => (
                                            <button
                                                key={filter.id}
                                                onClick={() => setPaperFilter(filter.id)}
                                                className={`
                                                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border
                                                    ${paperFilter === filter.id
                                                        ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                                `}
                                            >
                                                <filter.icon className="w-3 h-3" />
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Grid */}
                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                    {filteredSkills.length === 0 ? (
                                        <div className="text-center py-20 opacity-50">
                                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="font-bold text-slate-500">No skills found matching your filters.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pb-4">
                                            {filteredSkills.map(([id, data]) => {
                                                const name = getSkillName(id);
                                                const desc = getSkillDesc(id);
                                                const currentLevel = userSkills[id]?.level || 0;
                                                const mastered = currentLevel >= 4;
                                                const paper = id.split('_')[0];

                                                // 3-Tier Mapping Logic
                                                let targetLevel;
                                                let xpReward = 50;

                                                if (activeTab === 'CHALLENGE') {
                                                    targetLevel = 7; // Challenge always aims for Elite
                                                    xpReward = 100;
                                                } else {
                                                    // General Tab Logic:
                                                    // If < 3 => Foundation (3)
                                                    // Else => Standard (5)
                                                    if (currentLevel < 3) targetLevel = 3;
                                                    else targetLevel = 5;
                                                }

                                                const outcome = paper === 'reading' ? 'Boost comprehension & speed' :
                                                    paper === 'writing' ? 'Improve clarity & vocabulary' :
                                                        paper === 'listening' ? 'Capture details & nuances' :
                                                            'Master fluency & expression';

                                                return (
                                                    <div
                                                        key={id}
                                                        onClick={() => handleTaskClick({
                                                            id: `general_${id}`,
                                                            title: `${activeTab === 'CHALLENGE' ? 'Elite' : 'Practice'}: ${name}`,
                                                            topic: id,
                                                            type: 'PRACTICE',
                                                            xp: xpReward,
                                                            level: targetLevel
                                                        })}
                                                        className={`group p-4 rounded-xl border transition-all flex flex-col 
                                                            ${practicedSkills.includes(id)
                                                                ? 'bg-green-100 border-green-300 opacity-90'
                                                                : activeTab === 'CHALLENGE'
                                                                    ? 'bg-white border-indigo-100 shadow-sm hover:border-indigo-400'
                                                                    : 'bg-white border-slate-100 hover:border-amber-300'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${paper === 'reading' ? 'bg-blue-50 text-blue-600' :
                                                                paper === 'writing' ? 'bg-purple-50 text-purple-600' :
                                                                    paper === 'listening' ? 'bg-orange-50 text-orange-600' :
                                                                        'bg-green-50 text-green-600'
                                                                }`}>
                                                                {paper}
                                                            </span>
                                                            {mastered && <Trophy className="w-4 h-4 text-amber-500" />}
                                                        </div>

                                                        <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                                                            {name}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-tight min-h-[2.4em]">
                                                            {desc || "Master this skill to excel in HKDSE English."}
                                                        </p>

                                                        <div className="pt-3 border-t border-slate-50 mt-auto">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {practicedSkills.includes(id) ? (
                                                                        <div className="px-2 py-0.5 bg-green-200 rounded text-[10px] font-bold text-green-700 uppercase tracking-wide flex items-center gap-1">
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            Completed
                                                                        </div>
                                                                    ) : activeTab === 'CHALLENGE' ? (
                                                                        <div className="px-2 py-0.5 bg-indigo-100 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                                                                            <Zap className="w-3 h-3 fill-current" />
                                                                            Elite Quest
                                                                        </div>
                                                                    ) : (
                                                                        <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                                            General Quest
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className={`text-[10px] font-bold ${practicedSkills.includes(id) ? 'text-green-700' : activeTab === 'CHALLENGE' ? 'text-indigo-600' : 'text-amber-500'}`}>
                                                                    {practicedSkills.includes(id) ? `Earned ${xpReward} XP` : `+${xpReward} XP`}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
                                                                <Sparkles className={`w-3 h-3 ${activeTab === 'CHALLENGE' ? 'text-indigo-400' : 'text-amber-400'}`} />
                                                                <span>Outcome: {outcome}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    );
};

export default RoadmapModal;
