import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, BookOpen, PenTool, Mic, MessageSquare, Layers, RefreshCcw, GraduationCap, Ear, ArrowRight } from 'lucide-react';
import { MICRO_SKILLS, getSkillName, getSkillDesc, getSkillOutcome } from '../../constants/microSkills';
import { calculateTier, getTierMetadata, getMasteryStats } from '../../utils/masteryUtils';

const RoadmapModal = ({ isOpen, onClose, initialFilter = 'ALL' }) => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('WEEKLY'); // 'WEEKLY' | 'GENERAL' | 'CHALLENGE'
    const [searchQuery, setSearchQuery] = useState('');
    const [userSkills, setUserSkills] = useState({});
    const [practicedSkills, setPracticedSkills] = useState([]);
    const [paperFilter, setPaperFilter] = useState(initialFilter); // 'ALL' | 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING'
    const [selectedLevels, setSelectedLevels] = useState({}); // skillId -> level
    const [weeklyQuestStatus, setWeeklyQuestStatus] = useState({ completed: false });
    const [listeningMissions, setListeningMissions] = useState([]);

    // Fetch Listening Missions when filter is active
    useEffect(() => {
        if (paperFilter === 'LISTENING' && isOpen) {
            const fetchListening = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    // Use the existing public endpoint (relative path via proxy also works)
                    const res = await fetch(`${API_URL}/api/lab/listening`);
                    if (res.ok) {
                        const data = await res.json();
                        setListeningMissions(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch listening missions", e);
                }
            };
            fetchListening();
        }
    }, [paperFilter, isOpen]);

    const fetchUserSkills = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/microskills/${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setUserSkills(data.microSkills || {});
                setPracticedSkills(data.practicedSkills || []);
                if (data.weeklyQuest) setWeeklyQuestStatus(data.weeklyQuest);

                // Initialize selected levels based on current mastery + progression logic
                const initialSelected = {};
                Object.entries(data.microSkills || {}).forEach(([id, meta]) => {
                    const masteryLevel = meta.level || 0;
                    const practiced = (data.practicedSkills || []).includes(id);

                    if (!practiced) {
                        // Unpracticed: default based on current mastery
                        if (masteryLevel < 3.5) initialSelected[id] = '3';
                        else if (masteryLevel < 5.0) initialSelected[id] = '4';
                        else initialSelected[id] = '5';
                    } else {
                        // Practiced: auto-advance to next level to encourage progression
                        if (masteryLevel < 4) initialSelected[id] = '4'; // Attempted Easy, suggest Medium
                        else if (masteryLevel < 5) initialSelected[id] = '5'; // Attempted Medium, suggest DSE Standard
                        else initialSelected[id] = '5';
                    }
                });
                setSelectedLevels(initialSelected);
            }
        } catch (error) {
            console.error("Failed to load user skills", error);
        }
    };

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            // NEW: Fetch from Factory Model's personalized endpoint
            const res = await fetch(`${API_URL}/api/quests/personalized?uid=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setPlan({ tasks: data });
            }
        } catch (error) {
            console.error("Failed to load roadmap", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.uid && isOpen) {
            fetchRoadmap();
            fetchUserSkills();
        }
    }, [user, isOpen]);

    // formatDSELevel is defined but never used - fixing by using it or removing it.
    // Actually it's a helper that might be useful so I'll keep it but ensure it doesn't cause errors.

    const handleRegenerate = async () => {
        if (!user || regenerating) return;
        setRegenerating(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/roadmap/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: user.uid, subject: 'english' }) // Default to english for now
            });
            if (res.ok) {
                const newPlan = await res.json();
                setPlan(newPlan);
            }
        } catch (e) {
            console.error("Regenerate failed", e);
        } finally {
            setRegenerating(false);
        }
    };

    const handleTaskClick = (task) => {
        console.log("RoadmapModal: Clicked Task", task);
        if (task.locked) return;

        // Smart Navigation based on Task Type
        // 0. Specialized Challenge Check (Force redirect to dedicated pages)
        if (task.title?.includes('Eraser Challenge')) {
            navigate('/eraser-challenge', {
                state: { topic: task.topic?.replace('Eraser Challenge: ', '') || 'General' }
            });
            return;
        }

        if (task.type === 'LEARN' || task.type === 'PRACTICE' || task.type === 'WEEKLY_QUEST') {
            const topic = task.topic?.toLowerCase() || '';
            const skillId = task.id;
            const skillData = MICRO_SKILLS[skillId];
            const cluster = skillData?.cluster;

            // REDIRECTION LOGIC FOR SPEAKING
            if (topic.includes('speaking') || skillId.startsWith('speaking_')) {
                let targetRoute = '/lab'; // Fallback
                let moduleParam = '';

                if (cluster === 'delivery') {
                    targetRoute = '/speaking/quest/delivery';
                    moduleParam = 'delivery';
                } else if (cluster === 'flow' || skillId === 'speaking_individualResponse') {
                    targetRoute = '/speaking/quest/flow';
                    moduleParam = 'flow';
                } else if (cluster === 'interaction' || skillId === 'speaking_groupDiscussion') {
                    targetRoute = '/speaking/quest/interaction';
                    moduleParam = 'interaction';
                }

                if (targetRoute !== '/lab') {
                    navigate(`${targetRoute}?module=${moduleParam}&level=${task.level || '3'}&taskId=${task.id}`, {
                        state: {
                            topic: task.topic,
                            taskId: task.id,
                            taskTitle: task.title,
                            taskXp: task.xp
                        }
                    });
                    return;
                }
            }

            // REDIRECTION LOGIC FOR WRITING (Genre Factory)
            if (skillId.startsWith('writing_genre_')) {
                // Navigate to Writing Briefing Page
                const genreName = skillData?.en?.name || 'General Writing';
                navigate(`/writing/briefing/${encodeURIComponent(genreName)}`, {
                    state: {
                        initialGenre: genreName,
                        taskId: task.id
                    }
                });
                return;
            }

            const targetLevel = task.level || '5';
            const params = new URLSearchParams({
                topic: task.topic,
                level: targetLevel,
            });
            navigate(`/lab?${params.toString()}`, {
                state: {
                    autoStart: {
                        topic: task.topic,
                        focus: ["grammar", "vocabulary"],
                        level: targetLevel,
                        isWeeklyQuest: task.type === 'WEEKLY_QUEST'
                    },
                    taskId: task.id,
                    taskTitle: task.title,
                    taskXp: task.xp,
                    taskDescription: task.type === 'WEEKLY_QUEST' ? "Master this week's theme and earn bonus XP." : task.description || "Master this skill to level up.",
                    isWeeklyQuest: task.type === 'WEEKLY_QUEST'
                }
            });
        } else if (task.type === 'CHALLENGE') {
            navigate('/eraser-challenge', {
                state: { topic: task.topic || 'General' }
            });
        } else if (task.type === 'SPEAKING_CHALLENGE') {
            navigate('/speaking-interaction', {
                state: {
                    topic: task.topic || 'General Discussion',
                    taskId: task.id
                }
            });
        } else if (task.type === 'MOCK' || task.type === 'BOSS') { // Support both labels
            navigate('/exam/selector');
        } else if (task.type === 'DIAGNOSTIC') {
            navigate('/diagnostic');
        }
    };

    if (!isOpen) return null;

    const completedCount = plan?.tasks ? plan.tasks.filter(t => t.status === 'COMPLETED' && t.type !== 'MOCK').length : 0;
    const totalKeys = 5; // Fixed at 5 targets
    const bossTask = plan?.tasks ? plan.tasks.find(t => t.type === 'MOCK') : null;
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

        // Hide specific speaking skills from GENERAL tab (Use Special Quest instead)
        if (activeTab === 'GENERAL') {
            if (id === 'speaking_groupDiscussion' || id === 'speaking_individualResponse') {
                return false;
            }
            // Hide old writing skills, show Genres
            if (paperFilter === 'WRITING') {
                if (id.startsWith('writing_') && !id.startsWith('writing_genre_')) return false;
            }
        }

        // Hide Granular Speaking Skills (Consolidated into General)
        if (data.isGranular) return false;

        return true;
    });

    // Helper: Calculate Aggregated Level for General Skills
    const getAggregatedLevel = (skillId) => {
        if (!skillId.endsWith('_general') && !skillId.startsWith('writing_genre_')) return userSkills[skillId]?.level || 0;

        // If it's a genre or has its own level, use it
        if (userSkills[skillId]?.level) return userSkills[skillId].level;

        // Aggregate Writing Genres logic? Not needed for now as they are individual.
        if (skillId.startsWith('writing_genre_')) return userSkills[skillId]?.level || 0;

        // Otherwise, aggregate from children (Speking logic)
        const cluster = MICRO_SKILLS[skillId]?.cluster;
        if (!cluster) return 0;

        const children = Object.keys(MICRO_SKILLS).filter(k => MICRO_SKILLS[k].cluster === cluster && k !== skillId);
        if (children.length === 0) return 0;

        const levels = children.map(k => userSkills[k]?.level || 0).filter(l => l > 0);
        if (levels.length === 0) return 0;

        // Return average level
        return levels.reduce((a, b) => a + b, 0) / levels.length;
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header - English Theme (Indigo/Purple) */}
                <div className={`p-4 relative overflow-hidden ${activeTab === 'CHALLENGE' ? 'bg-indigo-950' : 'bg-[#FF6600] border-b border-white/10'}`}>
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <GraduationCap className="w-32 h-32 text-white transform rotate-12" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-3 right-4 text-white/80 hover:text-white transition-colors z-[60]"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative z-10 text-white flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1 opacity-90 text-[10px] font-bold tracking-wider uppercase">
                                <Sparkles className="w-3 h-3 text-yellow-400" />
                                {t('lab.personalized_quest_system')}
                            </div>
                            <h2 className="text-2xl font-bold leading-tight">{t('dashboard.roadmap')}</h2>
                            <p className="text-white/80 text-xs opacity-90">
                                Complete your daily set to earn 200 XP Bonus!
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                            {[
                                { id: 'WEEKLY', label: 'Weekly Quests', icon: Clock },
                                { id: 'GENERAL', label: 'General Quests', icon: Search },
                                { id: 'CHALLENGE', label: 'Elite Quests', icon: Trophy }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all
                                        ${activeTab === tab.id
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-white hover:bg-white/10'
                                        }
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
                    <div className="p-12 text-center text-slate-400 flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                            <p>{t('common.loading')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                        {activeTab === 'WEEKLY' ? (
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                {/* Weekly Reading Quest Card */}
                                {weeklyQuestStatus.completed ? (
                                    <div className="mb-6 p-5 bg-slate-100 border-2 border-slate-200 rounded-2xl flex items-center justify-between opacity-80">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-green-100 rounded-xl">
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-base">Weekly Reading Quest</h4>
                                                <p className="text-xs text-slate-500">Quest finished! Refresh next Monday.</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold">
                                            COMPLETED
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => handleTaskClick({
                                            id: 'weekly_quest_reading',
                                            type: 'WEEKLY_QUEST',
                                            topic: 'reading_weekly',
                                            title: 'Weekly Reading Quest',
                                            xp: 200,
                                            level: '5'
                                        })}
                                        className="mb-6 p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group"
                                    >
                                        {/* Decorative background elements */}
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-white/10 transition-colors" />

                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 group-hover:border-white/40 transition-colors">
                                                    <BookOpen className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className="font-bold text-white text-base">Weekly Reading Quest</h4>
                                                        <span className="px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-[9px] font-black text-yellow-300 uppercase tracking-wider">
                                                            NEW
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/70">
                                                        One DSE-standard passage • Personalised question set
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right mr-2 hidden md:block">
                                                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Expires in</div>
                                                    <div className="text-xs font-black text-white">{weeklyQuestStatus.daysRemaining || 7} Days</div>
                                                </div>
                                                <div className="bg-white text-indigo-700 p-2 rounded-lg shadow-md group-hover:shadow-indigo-400/50 transition-all">
                                                    <Play className="w-5 h-5 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tasks Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                    {(plan?.tasks || []).map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleTaskClick(task)}
                                            className={`
                                                group relative p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                                                bg-white border-slate-100 hover:border-indigo-300 hover:shadow-lg
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-2 rounded-lg ${task.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {task.type === 'LEARN' ? <BookOpen size={18} /> :
                                                        task.type === 'PRACTICE' ? <RefreshCcw size={18} /> :
                                                            task.type === 'SPEAKING_CHALLENGE' ? <Mic size={18} /> :
                                                                <Sparkles size={18} />}
                                                </div>
                                                {task.status === 'COMPLETED' ? (
                                                    <CheckCircle size={18} className="text-green-500" />
                                                ) : (
                                                    <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                                        {task.type}
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{task.title}</h4>
                                            <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-tight">
                                                {task.description}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" /> +{task.xp} XP
                                                </span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase">
                                                    Factory v1.0
                                                </span>
                                            </div>
                                        </div>
                                    ))}
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
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                <filter.icon className="w-3 h-3" />
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {paperFilter === 'LISTENING' ? (
                                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                        {/* Listening Quests Grid */}
                                        {/* Listening Quests Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                            {/* Fetched Listening Missions */}
                                            {listeningMissions.map((mission) => {
                                                // Default Level Logic
                                                const defaultLevel = userSkills['listening_general']?.level || 3;
                                                const currentSelected = selectedLevels[mission.id] || (defaultLevel < 3.5 ? '3' : defaultLevel < 5.0 ? '4' : '5');
                                                const stats = getMasteryStats(Number(currentSelected), false, false);
                                                const isPracticed = false; // TODO: Track practiced listening missions?

                                                return (
                                                    <div
                                                        key={mission.id}
                                                        onClick={() => {
                                                            onClose();
                                                            navigate(`/listening/briefing/${mission.id}`, {
                                                                state: {
                                                                    questData: mission,
                                                                    targetLevel: currentSelected,
                                                                    targetXp: stats.xp
                                                                }
                                                            });
                                                        }}
                                                        className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-rose-300 hover:shadow-md"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600">
                                                                LISTENING
                                                            </span>
                                                            <select
                                                                value={currentSelected}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedLevels(prev => ({ ...prev, [mission.id]: e.target.value }));
                                                                }}
                                                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border outline-none cursor-pointer hover:bg-gray-50 transition-colors ${stats.color}`}
                                                            >
                                                                <option value="3">Easy</option>
                                                                <option value="4">Medium</option>
                                                                <option value="5">DSE Standard</option>
                                                                <option value="6">Elite</option>
                                                            </select>
                                                            <div className="flex items-center gap-1.5">
                                                                {/* Mastery Circles Placeholder - can be real if we track history per mission */}
                                                                {[
                                                                    { l: 4, label: 'E', name: 'Easy' },
                                                                    { l: 5, label: 'M', name: 'Medium' },
                                                                    { l: 6, label: 'S', name: 'DSE Standard' }
                                                                ].map((tier) => (
                                                                    <div
                                                                        key={tier.l}
                                                                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all bg-slate-50 border-slate-200 text-slate-400"
                                                                    >
                                                                        {tier.label}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <h4 className="text-sm font-bold mb-1 group-hover:text-rose-600 transition-colors text-slate-800 line-clamp-1">
                                                            {mission.title}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-tight min-h-[2.4em]">
                                                            {mission.description || "Integrated listening mission covering all 3 pillars."}
                                                        </p>

                                                        <div className="pt-3 border-t border-slate-50 mt-auto">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                                                        <Play className="w-2.5 h-2.5" />
                                                                        Start Mission
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] font-bold text-rose-600">
                                                                    +{stats.xp} XP
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
                                                                    <Sparkles className="w-3 h-3 text-rose-400" />
                                                                    <span>Outcome: Exam Proficiency</span>
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Play className="w-3.5 h-3.5 text-rose-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
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
                                                {filteredSkills.map(([id]) => {
                                                    const name = getSkillName(id);
                                                    const desc = getSkillDesc(id);
                                                    const currentLevel = getAggregatedLevel(id);
                                                    const paper = id.split('_')[0];

                                                    let targetLevel;
                                                    if (activeTab === 'CHALLENGE') {
                                                        targetLevel = 7;
                                                    } else {
                                                        if (currentLevel < 3) targetLevel = 3;
                                                        else targetLevel = 5;
                                                    }

                                                    const outcome = getSkillOutcome(id, language);
                                                    const isPracticed = practicedSkills.includes(id) || practicedSkills.includes(name);

                                                    return (
                                                        <div
                                                            key={id}
                                                            onClick={() => {
                                                                const skillLevel = getAggregatedLevel(id);
                                                                const levelToUse = selectedLevels[id] || (activeTab === 'CHALLENGE' ? '7' : (skillLevel < 3.5 ? '3' : skillLevel < 5.0 ? '4' : '5'));
                                                                const stats = getMasteryStats(Number(levelToUse), false, false);

                                                                handleTaskClick({
                                                                    id: id,
                                                                    title: `${activeTab === 'CHALLENGE' ? 'Elite' : 'Practice'}: ${name}`,
                                                                    topic: id,
                                                                    type: 'PRACTICE',
                                                                    xp: stats.xp,
                                                                    level: levelToUse
                                                                });
                                                            }}
                                                            className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer
                                                                ${activeTab === 'CHALLENGE'
                                                                    ? 'bg-white border-indigo-100 shadow-sm hover:border-indigo-400'
                                                                    : 'bg-white border-slate-100 hover:border-amber-300 hover:shadow-md'
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
                                                                {activeTab !== 'CHALLENGE' && paper !== 'writing' && (paper !== 'speaking' || id === 'speaking_delivery_general') && (
                                                                    <select
                                                                        value={selectedLevels[id] || '3'}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedLevels(prev => ({ ...prev, [id]: e.target.value }));
                                                                        }}
                                                                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border outline-none cursor-pointer hover:bg-gray-50 transition-colors ${getMasteryStats(Number(selectedLevels[id] || '3'), false, false).color}`}
                                                                    >
                                                                        <option value="3">Easy</option>
                                                                        <option value="4">Medium</option>
                                                                        <option value="5">DSE Standard</option>
                                                                    </select>
                                                                )}
                                                                <div className="flex items-center gap-1.5">
                                                                    {(currentLevel >= 3 || isPracticed) && (
                                                                        <div className="flex items-center gap-1 translate-y-[-1px]">
                                                                            {[
                                                                                { l: 4, label: 'E', name: 'Easy' },
                                                                                { l: 5, label: 'M', name: 'Medium' },
                                                                                { l: 6, label: 'S', name: 'DSE Standard' }
                                                                            ].map((tier) => {
                                                                                const isPassed = isPracticed && currentLevel >= tier.l;
                                                                                return (
                                                                                    <div
                                                                                        key={tier.l}
                                                                                        title={isPassed ? `${tier.name} Mastery Verified` : `${tier.name} Level`}
                                                                                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all ${isPassed
                                                                                            ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                                                                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                                                                            }`}
                                                                                    >
                                                                                        {isPassed ? '✓' : tier.label}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <h4 className="text-sm font-bold mb-1 group-hover:text-amber-600 transition-colors text-slate-800">
                                                                {name}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-tight min-h-[2.4em]">
                                                                {desc || "Master this skill to excel in HKDSE English."}
                                                            </p>

                                                            <div className="pt-3 border-t border-slate-50 mt-auto">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {activeTab === 'CHALLENGE' ? (
                                                                            <div className="px-2 py-0.5 bg-indigo-100 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                                                                                <Zap className="w-3 h-3 fill-current" />
                                                                                Elite Quest
                                                                            </div>
                                                                        ) : (
                                                                            <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                                                                {isPracticed ? <RefreshCcw className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                                                                                {isPracticed ? 'Continue Training' : 'Start Training'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className={`text-[10px] font-bold ${activeTab === 'CHALLENGE' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                                                        +{getMasteryStats(Number(selectedLevels[id] || targetLevel), false, activeTab !== 'CHALLENGE').xp} XP
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
                                                                        <Sparkles className={`w-3 h-3 ${activeTab === 'CHALLENGE' ? 'text-indigo-400' : 'text-amber-400'}`} />
                                                                        <span>Outcome: {outcome}</span>
                                                                    </div>
                                                                    {isPracticed && (
                                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Play className="w-3.5 h-3.5 text-amber-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapModal;
