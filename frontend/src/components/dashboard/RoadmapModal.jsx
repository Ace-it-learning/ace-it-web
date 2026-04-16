import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, BookOpen, PenTool, Mic, MessageSquare, Layers, RefreshCcw, GraduationCap, Ear, ArrowRight, Calculator } from 'lucide-react';
import { useAvatar } from '../../context/AvatarContext';
import { MICRO_SKILLS, getSkillName, getSkillDesc, getSkillOutcome } from '../../constants/microSkills';
import { getMathSkillName } from '../../constants/mathMicroSkills';
import { calculateTier, getTierMetadata, getMasteryStats } from '../../utils/masteryUtils';

const RoadmapModal = ({ isOpen, onClose, initialFilter = 'ALL' }) => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const { activeAgentId } = useAvatar();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('WEEKLY'); // 'WEEKLY' | 'GENERAL'
    const [searchQuery, setSearchQuery] = useState('');
    const [userSkills, setUserSkills] = useState({});
    const [practicedSkills, setPracticedSkills] = useState([]);
    const [paperFilter, setPaperFilter] = useState(initialFilter); // 'ALL' | 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING'
    const [selectedLevels, setSelectedLevels] = useState({}); // skillId -> level
    const [weeklyQuestStatus, setWeeklyQuestStatus] = useState({ completed: false });
    const [listeningMissions, setListeningMissions] = useState([]);
    const [writingMissions, setWritingMissions] = useState([]);
    const [isWritingLoading, setIsWritingLoading] = useState(false);

    // Fetch Listening/Writing Missions when filter is active
    useEffect(() => {
        if (!isOpen) return;

        // Use relative path for local proxy support
        const API_BASE = '/api';

        if (paperFilter === 'LISTENING') {
            // Reset other list to prevent contamination
            setWritingMissions([]);
            
            const fetchListening = async () => {
                try {
                    const res = await fetch(`${API_BASE}/lab/listening`);
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

        if (paperFilter === 'WRITING') {
            // Reset other list to prevent contamination
            setListeningMissions([]);
            
            const fetchWriting = async () => {
                try {
                    setIsWritingLoading(true);
                    console.log("[Roadmap] Fetching writing missions...");
                    const res = await fetch(`${API_BASE}/writing/scenarios`);
                    if (res.ok) {
                        const data = await res.json();
                        console.log(`[Roadmap] Received ${data.length} writing missions`);
                        setWritingMissions(data);
                    } else {
                        console.error("[Roadmap] Failed to fetch scenarios:", res.status);
                    }
                } catch (e) {
                    console.error("Failed to fetch writing missions", e);
                } finally {
                    setIsWritingLoading(false);
                }
            };
            fetchWriting();
        }
    }, [paperFilter, isOpen]);

    const fetchUserSkills = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const subject = (activeAgentId === 'math' || activeAgentId === 'maths') ? 'maths' : 'english';
            const res = await fetch(`${API_URL}/api/microskills/${user.uid}?subject=${subject}`);
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
                setPlan(data);
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
            const getGenSubject = () => {
                if (activeAgentId === 'chinese') return 'chinese';
                if (activeAgentId === 'math' || activeAgentId === 'maths') return 'maths';
                return 'english';
            };
            const res = await fetch(`${API_URL}/api/roadmap/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: user.uid, subject: getGenSubject() })
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
                // Phase 26: Redirect foundation criteria to the Pillar Menu
                const pillarMap = {
                    'speaking_delivery': 'criterion_a',
                    'speaking_strategies': 'criterion_b',
                    'speaking_language': 'criterion_c',
                    'speaking_organization': 'criterion_d'
                };

                if (pillarMap[skillId]) {
                    navigate('/speaking/menu', {
                        state: { activePillar: pillarMap[skillId] }
                    });
                    return;
                }

                // Handle Integrated simulation (direct route)
                if (skillId === 'speaking_groupDiscussion') {
                    navigate('/speaking/quest/interaction?module=interaction&level=3&taskId=speaking_groupDiscussion', {
                        state: { 
                            topic: 'Group Discussion', 
                            taskId: 'speaking_groupDiscussion',
                            taskTitle: 'Part A Simulation: Group Discussion'
                        }
                    });
                    return;
                }

                // Fallback for labs
                navigate(`/lab?module=speaking&level=${task.level || '3'}&taskId=${task.id}`, {
                    state: { topic: task.topic, taskId: task.id }
                });
                return;
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
            navigate('/mock-exam');
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

        // Hide specific speaking skills from GENERAL tab (Use Special Quest instead)
        if (activeTab === 'GENERAL') {
            if (id === 'speaking_individualResponse') {
                return false;
            }
            // Hide old writing/listening skills, only show Genres in English Writing
            if ((id.startsWith('writing_') && !id.startsWith('writing_genre_')) || id.startsWith('listening_')) return false;
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

    const getSubjectInfo = () => {
        switch (activeAgentId) {
            case 'chinese':
                return {
                    title: t('roadmap.title_chinese'),
                    icon: PenTool
                };
            case 'math':
            case 'maths':
                return {
                    title: t('roadmap.title_math'),
                    icon: Calculator
                };
            default:
                return {
                    title: t('roadmap.title_english'),
                    icon: GraduationCap
                };
        }
    };

    const subjectInfo = getSubjectInfo();
    const SubjectIcon = subjectInfo.icon;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header - Standardized Ace It! Theme (Brand Orange) */}
                <div className="p-6 relative overflow-hidden bg-[#FF6600] border-b border-white/10 shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <SubjectIcon className="w-40 h-40 text-white transform rotate-12" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-6 text-white/80 hover:text-white transition-colors z-[60]"
                    >
                        <X className="w-7 h-7" />
                    </button>

                    <div className="relative z-10 text-white grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black leading-tight tracking-tight mb-1">{subjectInfo.title}</h2>
                            <p className="text-white/90 text-sm font-medium opacity-90">
                                {t('roadmap.complete_quest_xp')}
                            </p>
                        </div>

                        {/* Tab Switcher - Centered & Larger & Energetic Blue */}
                        <div className="flex justify-center">
                            <div className="flex p-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-inner">
                                {[
                                    { id: 'WEEKLY', label: t('roadmap.targeted_growth'), icon: Clock },
                                    { id: 'GENERAL', label: t('roadmap.quests_lab'), icon: Search }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all duration-300
                                            ${activeTab === tab.id
                                                ? 'bg-[#007AFF] text-white shadow-lg scale-105'
                                                : 'text-white hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Empty spacer for balancing the grid and avoiding close button overlap */}
                        <div className="hidden md:block w-full h-px" />
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
                                {/* Top 3 Radar Bottlenecks - Targeted Growth */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top 3 Radar Bottlenecks</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(Object.entries(userSkills).filter(([id]) => id.includes('_') && 
                                            ((activeAgentId === 'math' || activeAgentId === 'maths') ? id.startsWith('math_') : (!id.startsWith('writing_') && !id.startsWith('listening_')))
                                        ).length > 0 
                                            ? Object.entries(userSkills)
                                                .filter(([id]) => id.includes('_') && 
                                                    ((activeAgentId === 'math' || activeAgentId === 'maths') ? id.startsWith('math_') : (!id.startsWith('writing_') && !id.startsWith('listening_')))
                                                )
                                                .sort((a, b) => (a[1].level || 0) - (b[1].level || 0))
                                                .slice(0, 3)
                                            : ((activeAgentId === 'math' || activeAgentId === 'maths') 
                                                ? [
                                                    ['math_num_percentages', { level: 1 }],
                                                    ['math_alg_quadratics', { level: 1 }],
                                                    ['math_geo_circles', { level: 1 }]
                                                  ]
                                                : [
                                                    ['reading_inference', { level: 1 }],
                                                    ['reading_vocabularyContext', { level: 1 }],
                                                    ['speaking_pronunciationClarity', { level: 1 }]
                                                  ]
                                              )
                                        ).map(([id, skillData]) => {
                                                const name = (activeAgentId === 'math' || activeAgentId === 'maths') ? (Math.getMathSkillName ? Math.getMathSkillName(id, language) : id) : getSkillName(id);
                                                // Note: I need the math labels. I'll import getMathSkillName if not available or just use id.
                                                // Actually getMathSkillName is imported above from mathMicroSkills.
                                                const finalName = (activeAgentId === 'math' || activeAgentId === 'maths') 
                                                    ? (typeof getMathSkillName === 'function' ? getMathSkillName(id, language) : id.replace('math_', '').replace('_', ' '))
                                                    : getSkillName(id);
                                                
                                                const level = skillData.level || 1;
                                                const isFallback = Object.keys(userSkills).length === 0;
                                                return (
                                                    <div
                                                        key={`weak_${id}`}
                                                        onClick={() => {
                                                            if (activeAgentId === 'math' || activeAgentId === 'maths') {
                                                                onClose();
                                                                navigate(`/maths/learn/${id}`, {
                                                                    state: { topic: id, level: '3', xp: 250 }
                                                                });
                                                            } else {
                                                                handleTaskClick({ id: id, title: `Practice: ${finalName}`, topic: id, type: 'PRACTICE', xp: 200, level: String(Math.max(3, Math.min(5, Math.ceil(level)))) });
                                                            }
                                                        }}
                                                        className="bg-white border-2 border-slate-100 hover:border-red-200 hover:shadow-lg p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden group"
                                                    >
                                                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <Zap className="w-12 h-12 text-red-600" />
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isFallback ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                                                {isFallback ? 'Recommended Start' : 'Urgent Mastery'}
                                                            </div>
                                                            <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">Level {level}</div>
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{finalName}</h4>
                                                        <p className="text-[10px] text-slate-500 mt-1">Practice this to eliminate the "dent" in your Radar chart.</p>
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <span className="text-xs font-bold text-red-500">+250 XP</span>
                                                            <Play className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Weekly Adaptive Quest Card */}
                                <div className="mt-8 flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Weekly Adaptive Quests</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {((activeAgentId === 'math' || activeAgentId === 'maths') 
                                        ? [
                                            { id: 'weekly_math', topic: 'integrated_challenge', title: 'Weekly Integrated Challenge', icon: Calculator, color: 'from-orange-600 to-red-700', desc: 'Section B Integrated Mastery', type: 'MATH_CHALLENGE' },
                                            { id: 'mock_teaser', topic: 'Maths Paper 2 (MCQ)', title: 'Mock Speed Drill', icon: Zap, color: 'from-blue-600 to-indigo-700', desc: 'Full-length Paper 2 Simulation', type: 'MOCK' }
                                          ]
                                        : []
                                    ).map((quest) => {
                                        return (
                                            <div
                                                key={quest.id}
                                                onClick={() => {
                                                    if (quest.type === 'MATH_CHALLENGE') {
                                                        onClose();
                                                        navigate('/maths/lab', { state: { topic: 'integrated_challenge' } });
                                                    } else {
                                                        handleTaskClick({
                                                            id: quest.id,
                                                            type: quest.type,
                                                            topic: quest.topic,
                                                            title: quest.title,
                                                            xp: 300,
                                                            level: '5'
                                                        });
                                                    }
                                                }}
                                                className={`p-5 rounded-2xl shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group bg-gradient-to-br ${quest.color}`}
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                                                            <quest.icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm">{quest.title}</h4>
                                                            <p className="text-[10px] text-white/70 italic">{quest.desc}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Tasks Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                    {(plan?.tasks || [])
                                        .filter(task => {
                                            if (activeAgentId === 'math' || activeAgentId === 'maths') return true;
                                            // Hide specific static cards for English as requested
                                            return !['MOCK', 'DIAGNOSTIC', 'CHALLENGE', 'SPEAKING_CHALLENGE'].includes(task.type);
                                        })
                                        .map((task) => (
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

                                {/* Listening Missions (Paper 3) - Specialized View */}
                                {paperFilter === 'LISTENING' ? (
                                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Layers className="w-5 h-5 text-rose-600" />
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                                General Listening Quests
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                            {listeningMissions.map((mission) => {
                                                const currentSelected = (() => {
                                                    const lvl = mission.level;
                                                    if (lvl === 'Elite (5**)') return '7';
                                                    if (lvl === 'Elite (5*)') return '6';
                                                    if (lvl === 'DSE Standard' || lvl === '5') return '5';
                                                    if (lvl === 'Medium' || lvl === '4') return '4';
                                                    if (lvl === 'Easy' || lvl === '3' || lvl === 'HKDSE Level 3') return '3';
                                                    return '5'; // Default to DSE Standard
                                                })();
                                                
                                                const stats = getMasteryStats(currentSelected, false, false);

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
                                                        </div>

                                                        <h4 className="text-sm font-bold mb-1 transition-colors text-slate-800 line-clamp-1 group-hover:text-rose-600">
                                                            {mission.title}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-tight min-h-[2.4em]">
                                                            {mission.description || "Synthesizing data files and auditory clues for Paper 3 proficiency."}
                                                        </p>

                                                        <div className="pt-3 border-t border-slate-50 mt-auto">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="text-[10px] font-bold text-rose-600">
                                                                    +{stats.xp} XP
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : paperFilter === 'WRITING' ? (
                                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <PenTool className="w-5 h-5 text-purple-600" />
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                                    Elite Writing Quests
                                                </h3>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setWritingMissions([]);
                                                    setPaperFilter('WRITING'); // Trigger effect
                                                }}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-purple-600"
                                                title="Refresh Missions"
                                            >
                                                <RefreshCcw className={`w-4 h-4 ${isWritingLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        {isWritingLoading ? (
                                             <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Missions...</p>
                                             </div>
                                        ) : writingMissions.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                                                <div className="bg-slate-100 p-4 rounded-full mb-4">
                                                    <Search className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <h4 className="font-black text-slate-800 uppercase tracking-tight">No Missions Found</h4>
                                                <p className="text-[11px] text-slate-500 mt-1">Please try refreshing or check your connection.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                                {writingMissions.map((mission) => {
                                                    const stats = getMasteryStats(5, false, false); // Default to DSE Standard

                                                    return (
                                                        <div
                                                            key={mission.id}
                                                            onClick={() => {
                                                                onClose();
                                                                navigate(`/writing/quest`, {
                                                                    state: {
                                                                        questData: mission
                                                                    }
                                                                });
                                                            }}
                                                            className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-purple-300 hover:shadow-md"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex flex-col">
                                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 inline-block w-fit mb-1">
                                                                        {mission.genre || 'QUEST'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <h4 className="text-sm font-bold mb-1 transition-colors text-slate-800 line-clamp-1 group-hover:text-purple-600">
                                                                {mission.title}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-tight min-h-[2.4em]">
                                                                {mission.prompt || "Advancing DSE linguistic proficiency through high-fidelity mission simulation."}
                                                            </p>

                                                            <div className="pt-3 border-t border-slate-50 mt-auto">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="text-[10px] font-bold text-purple-600 px-2 py-0.5 bg-purple-50 rounded-lg">
                                                                        +{stats.xp + 100} XP
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
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
                                                    if (currentLevel < 3) targetLevel = 3;
                                                    else targetLevel = 5;

                                                    const outcome = getSkillOutcome(id, language);
                                                    const isPracticed = practicedSkills.includes(id) || practicedSkills.includes(name);

                                                    const isIntegrated = MICRO_SKILLS[id]?.isIntegrated;

                                                    return (
                                                        <div
                                                            key={id}
                                                            onClick={() => {
                                                                const skillLevel = getAggregatedLevel(id);
                                                                const levelToUse = paper === 'listening' ? '5' : (selectedLevels[id] || (activeTab === 'CHALLENGE' ? '7' : (skillLevel < 3.5 ? '3' : skillLevel < 5.0 ? '4' : '5')));
                                                                const stats = getMasteryStats(Number(levelToUse), false, false);

                                                                handleTaskClick({
                                                                    id: id,
                                                                    title: `${activeTab === 'CHALLENGE' ? 'Integrated' : 'Practice'}: ${name}`,
                                                                    topic: id,
                                                                    type: isIntegrated ? 'SPEAKING_CHALLENGE' : 'PRACTICE',
                                                                    xp: stats.xp,
                                                                    level: levelToUse
                                                                });
                                                            }}
                                                            className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer
                                                                ${isIntegrated 
                                                                    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 border-indigo-400 shadow-xl scale-[1.02]' 
                                                                    : activeTab === 'CHALLENGE'
                                                                        ? 'bg-white border-indigo-100 shadow-sm hover:border-indigo-400'
                                                                        : 'bg-white border-slate-100 hover:border-amber-300 hover:shadow-md'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isIntegrated ? 'bg-white/20 text-white' : paper === 'reading' ? 'bg-blue-50 text-blue-600' :
                                                                    paper === 'writing' ? 'bg-purple-50 text-purple-600' :
                                                                        paper === 'listening' ? 'bg-orange-50 text-orange-600' :
                                                                            'bg-green-50 text-green-600'
                                                                    }`}>
                                                                    {isIntegrated ? 'DSE Simulation' : paper}
                                                                </span>
                                                                {isIntegrated && (
                                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/90 text-yellow-950 rounded text-[8px] font-black tracking-tight">
                                                                        <Sparkles className="w-2 h-2" />
                                                                        Integrated Skill
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <h4 className={`text-sm font-bold mb-1 transition-colors ${isIntegrated ? 'text-white' : 'text-slate-800 group-hover:text-amber-600'}`}>
                                                                {name}
                                                            </h4>
                                                            <p className={`text-[11px] mb-3 line-clamp-2 leading-tight min-h-[2.4em] ${isIntegrated ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                                {desc || "Master this skill to excel in HKDSE English."}
                                                            </p>

                                                            <div className={`pt-3 border-t mt-auto ${isIntegrated ? 'border-white/10' : 'border-slate-50'}`}>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 ${isIntegrated ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 uppercase tracking-wide'}`}>
                                                                                {isPracticed ? <RefreshCcw className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                                                                                {isIntegrated ? 'Simulate exam' : isPracticed ? 'Continue Training' : 'Start Training'}
                                                                            </div>
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-amber-600">
                                                                        +{getMasteryStats(Number(selectedLevels[id] || targetLevel), false, false).xp} XP
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic">
                                                                        <Sparkles className="w-3 h-3 text-amber-400" />
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
