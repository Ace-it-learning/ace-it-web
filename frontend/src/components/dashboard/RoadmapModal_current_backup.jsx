import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Compass, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, BookOpen, PenTool, Mic, MessageSquare, Layers, RefreshCcw, GraduationCap, Ear, ArrowRight, Calculator, Headphones, Target } from 'lucide-react';
import { useAvatar } from '../../context/AvatarContext';
import { MICRO_SKILLS, getSkillName, getSkillDesc, getSkillOutcome, getPaperBySkill, getSkillsByPaper } from '../../constants/microSkills';
import { getMathSkillName, getSkillsByCategory } from '../../constants/mathMicroSkills';
import { getMasteryStats } from '../../utils/masteryUtils';

const RoadmapModal = ({ isOpen, onClose, initialFilter = 'ALL' }) => {
    const { user, profile } = useAuth();
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
    const [weeklyTheme, setWeeklyTheme] = useState(null);

    // Fetch Listening/Writing Missions on open
    useEffect(() => {
        if (!isOpen) return;

        // Use relative path for local proxy support
        const API_BASE = '/api';

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

        const fetchWriting = async () => {
            try {
                setIsWritingLoading(true);
                const res = await fetch(`${API_BASE}/writing/scenarios`);
                if (res.ok) {
                    const data = await res.json();
                    setWritingMissions(data);
                }
            } catch (e) {
                console.error("Failed to fetch writing missions", e);
            } finally {
                setIsWritingLoading(false);
            }
        };

        fetchListening();
        fetchWriting();
    }, [isOpen]);

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

    const fetchWeeklyTheme = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/lab/weekly-theme`);
            if (res.ok) {
                const data = await res.json();
                setWeeklyTheme(data);
            }
        } catch (error) {
            console.warn("Failed to load weekly theme", error);
        }
    };

    useEffect(() => {
        if (user?.uid && isOpen) {
            fetchRoadmap();
            fetchUserSkills();
            fetchWeeklyTheme();
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
        onClose(); // Close modal before processing navigation

        // Smart Navigation based on Task Type
        // 0. Specialized Challenge Check (Force redirect to dedicated pages)
        if (task.title?.includes('Eraser Challenge')) {
            navigate('/eraser-challenge', {
                state: { topic: task.topic?.replace('Eraser Challenge: ', '') || 'General' }
            });
            return;
        }

        if (task.type === 'LEARN' || task.type === 'PRACTICE' || task.type === 'WEEKLY_QUEST' || task.type === 'SPEAKING_CHALLENGE' || task.type === 'GRAMMAR_LAB') {
            const topic = task.topic?.toLowerCase() || '';
            const skillId = task.id;
            const skillData = MICRO_SKILLS[skillId];
            const cluster = skillData?.cluster;

            // REDIRECTION LOGIC FOR WEEKLY QUESTS
            if (task.type === 'WEEKLY_QUEST' || topic.includes('weekly')) {
                const targetLevel = task.level || '3';
                const baseState = { isWeeklyQuest: true, level: targetLevel, topic: task.topic, taskId: task.id };
                
                if (topic.includes('reading')) {
                    navigate(`/lab?topic=${task.topic}&level=${targetLevel}&taskId=${task.id}`, { state: baseState });
                    return;
                }
                if (topic.includes('writing')) {
                    navigate('/writing/quest', { state: { ...baseState, isAutoLoad: true } });
                    return;
                }
                if (topic.includes('listening')) {
                    navigate(`/listening/briefing/${task.id || 'weekly_listening'}`, { 
                        state: { 
                            ...baseState, 
                            targetLevel: targetLevel,
                            isNewSession: true 
                        } 
                    });
                    return;
                }
                if (topic.includes('speaking')) {
                    navigate('/speaking/quest/interaction', { state: { ...baseState } });
                    return;
                }
            }

            // REDIRECTION LOGIC FOR SPEAKING
            if (topic.includes('speaking') || (skillId && skillId.startsWith('speaking_'))) {
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

                // Handle Integrated simulation (menu route)
                if (skillId === 'speaking_groupDiscussion') {
                    navigate('/speaking/menu', {
                        state: { activePillar: 'discussion' }
                    });
                    return;
                }

                // Fallback for labs
                navigate(`/lab?topic=${task.topic}&level=${task.level || '3'}&taskId=${task.id}`, {
                    state: { topic: task.topic, taskId: task.id }
                });
                return;
            }

            // REDIRECTION LOGIC FOR WRITING (Excluding Weekly which uses /lab)
            if ((skillId.startsWith('writing_') || topic.includes('writing')) && skillId !== 'weekly_writing' && topic !== 'writing_weekly') {
                const targetLevel = task.level || currentLevel || '3';
                
                // Map Pillar skills to a valid scenario category (Genre keys from genre_prompts.json)
                let genreName = skillData?.en?.name || 'Argumentative Essay';
                
                // Skill-to-Genre Logic Mapping
                const genreMap = {
                    'writing_content': 'Argumentative Essay',
                    'writing_language': 'Feature Article',
                    'writing_organization': 'Argumentative Essay',
                    'weekly_writing': 'Argumentative Essay'
                };
                
                if (genreMap[skillId]) {
                    genreName = genreMap[skillId];
                } else if (['Content', 'Language', 'Organization'].includes(genreName)) {
                    genreName = 'Argumentative Essay';
                }

                navigate('/writing/quest', { 
                    state: { 
                        taskId: skillId, 
                        level: targetLevel, 
                        genre: genreName,
                        xp: task.xp,
                        isAutoLoad: true 
                    } 
                });
                return;
            }

            // REDIRECTION LOGIC FOR LISTENING
            if (skillId.startsWith('listening_')) {
                const targetLevel = task.level || '3';
                navigate(`/listening/briefing/${skillId}`, { 
                    state: { 
                        questId: skillId, 
                        targetLevel: targetLevel,
                        xp: task.xp,
                        isNewSession: true
                    } 
                });
                return;
            }

            // REDIRECTION LOGIC FOR GRAMMAR LAB
            if (task.type === 'GRAMMAR_LAB') {
                const targetLevel = task.level || '5';
                navigate(`/lab?topic=${task.topic}&level=${targetLevel}&taskId=${task.id}`, { 
                    state: { 
                        topic: task.topic, 
                        taskId: task.id,
                        xp: 50,
                        isGrammarLab: true,
                        autoStart: {
                            topic: task.topic,
                            level: targetLevel,
                            focus: ["grammar"]
                        }
                    } 
                });
                return;
            }

            const userGoalStr = localStorage.getItem('user_goal') || 'Level 4';
            const userGoalNum = userGoalStr.match(/\d+/) ? userGoalStr.match(/\d+/)[0] : '4';
            const targetLevel = task.level || userGoalNum;
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

    const getMissionTitle = (skillId) => {
        const MISSION_TITLES = {
            'reading_inference': 'Decoding Hidden Meanings',
            'listening_noteTaking': 'Strategic Note-Taking',
            'speaking_pronunciationClarity': 'The Eloquent Voice',
            'reading_vocabularyContext': 'Contextual Detective',
            'speaking_activeListening': 'The Attentive Listener',
            'speaking_interaction': 'Dynamic Discussion',
            'reading_mainIdea': 'The Big Picture',
            'writing_organization': 'Structural Masterclass',
            'listening_factExtraction': 'The Precision Hunter'
        };
        
        if (MISSION_TITLES[skillId]) return `Quest: ${MISSION_TITLES[skillId]}`;
        
        // Fallback: Clean up the skill name
        return `Quest: ${getSkillName(skillId)}`;
    };

    const getPaperLevel = (paper) => {
        const skills = getSkillsByPaper(paper.toLowerCase());
        if (skills.length === 0) return 1;
        const levels = skills.map(sid => userSkills[sid]?.level || 1);
        return levels.reduce((a, b) => a + b, 0) / levels.length;
    };

    const getMathAreaLevel = (category) => {
        const skills = getSkillsByCategory(category.toLowerCase());
        if (skills.length === 0) return 1;
        const levels = skills.map(sid => userSkills[sid]?.level || 1);
        return levels.reduce((a, b) => a + b, 0) / levels.length;
    };

    const getWeakestSkillInCategory = (category, isMath = false) => {
        const skills = isMath ? getSkillsByCategory(category.toLowerCase()) : getSkillsByPaper(category.toLowerCase());
        if (skills.length === 0) return null;
        
        let weakest = skills[0];
        let minLevel = userSkills[weakest]?.level || 1;
        
        skills.forEach(sid => {
            const lvl = userSkills[sid]?.level || 1;
            if (lvl < minLevel) {
                minLevel = lvl;
                weakest = sid;
            }
        });
        
        return { id: weakest, level: minLevel };
    };

    const handleOpenMastery = () => {
        onClose();
        if (!user) return;
        if (activeAgentId === 'math') {
            navigate('/maths/ability');
        } else {
            navigate('/english/mastery');
        }
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
                                    { id: 'GRAMMAR', label: t('roadmap.grammar_lab'), icon: Layers },
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
                                {/* Weekly Adaptive Quest Card */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Weekly Challenge Quests</h3>
                                    </div>
                                    {weeklyTheme && (
                                        <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2 animate-in slide-in-from-right-4 duration-500">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tight">Theme: {weeklyTheme.theme}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                    {(activeAgentId === 'math' || activeAgentId === 'maths' 
                                        ? [
                                            { id: 'math_foundation', topic: 'math_alg_formulas', title: 'Section A1 Foundation', icon: Zap, color: 'from-emerald-600 to-teal-700', desc: 'Must-Win Core Basics', type: 'MATH_CHALLENGE', xp: 250 },
                                            { id: 'math_standard', topic: 'math_alg_quadratics', title: 'Section A2 Mastery', icon: Layers, color: 'from-blue-600 to-indigo-700', desc: 'Standard Core Topics', type: 'MATH_CHALLENGE', xp: 250 },
                                            { id: 'weekly_math', topic: 'integrated_challenge', title: 'Section B challenge', icon: Trophy, color: 'from-orange-600 to-red-700', desc: 'Integrated Level 5+ Mastery', type: 'MATH_CHALLENGE', xp: 250 },
                                            { id: 'mock_teaser', topic: 'Maths Paper 2 (MCQ)', title: 'MCQ Speed Drill', icon: Clock, color: 'from-purple-600 to-indigo-700', desc: 'Paper 2 Speed & Tactics', type: 'MOCK', xp: 250 }
                                          ]
                                        : [
                                            { id: 'weekly_reading', topic: 'reading_weekly', title: 'Reading Challenge', icon: BookOpen, color: 'from-indigo-600 to-blue-700', desc: weeklyTheme ? `Theme: ${weeklyTheme.theme}` : 'Paper 1 Comprehensive', type: 'WEEKLY_QUEST' },
                                            { id: 'weekly_writing', topic: 'writing_weekly', title: 'Writing Challenge', icon: PenTool, color: 'from-emerald-600 to-teal-700', desc: weeklyTheme ? `Theme: ${weeklyTheme.theme}` : 'Paper 2 Opinion Piece', type: 'WEEKLY_QUEST' },
                                            { id: 'weekly_listening', topic: 'listening_weekly', title: 'Listening Challenge', icon: Headphones, color: 'from-amber-600 to-orange-700', desc: weeklyTheme ? `Theme: ${weeklyTheme.theme}` : 'Paper 3 Strategic Capture', type: 'WEEKLY_QUEST' },
                                            { id: 'weekly_speaking', topic: 'speaking_weekly', title: 'Speaking Challenge', icon: Mic, color: 'from-rose-600 to-pink-700', desc: weeklyTheme ? `Theme: ${weeklyTheme.theme}` : 'Paper 4 Group Discussion', type: 'SPEAKING_CHALLENGE', isDiscussion: true }
                                          ]
                                    ).map((quest) => {
                                        return (
                                            <div
                                                key={quest.id}
                                                onClick={() => {
                                                    if (quest.type === 'MATH_CHALLENGE') {
                                                        onClose();
                                                        navigate('/maths/lab', { state: { topic: quest.topic } });
                                                    } else if (quest.isDiscussion) {
                                                        onClose();
                                                        navigate('/speaking/quest/interaction', { 
                                                            state: { 
                                                                topic: 'speaking_weekly',
                                                                challengeType: 'weekly',
                                                                level: '5'
                                                            } 
                                                        });
                                                    } else {
                                                        const currentLevel = Math.max(3, Math.min(5, Math.ceil(getAggregatedLevel(quest.topic === 'writing_weekly' ? 'writing_genre_opinion' : quest.topic.replace('_weekly', '_general')) || 3)));
                                                        handleTaskClick({
                                                            id: quest.id,
                                                            type: quest.type,
                                                            topic: quest.topic,
                                                            title: quest.title,
                                                            xp: 250,
                                                            level: String(currentLevel),
                                                            isWriting: quest.id === 'weekly_writing' || quest.topic?.includes('writing'),
                                                            isWeekly: true
                                                        });
                                                    }
                                                }}
                                                className={`p-5 h-[120px] rounded-2xl shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group bg-gradient-to-br ${quest.color}`}
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                                                <div className="relative z-10 h-full flex flex-col justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                                                            <quest.icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-[15px]">{quest.title}</h4>
                                                            <p className="text-[11px] text-white/70 italic opacity-80">{quest.desc}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-xs font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">
                                                            +250 XP
                                                        </span>
                                                        <Play className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Targeted Growth Strategy - Dynamic Assessment */}
                                <div className="mb-10 relative">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-indigo-600" />
                                            <h3 className="line-clamp-1 font-black text-slate-800 uppercase tracking-widest">
                                                Target Growth Strategy
                                            </h3>
                                        </div>
                                        <button 
                                            onClick={handleOpenMastery}
                                            className="px-4 py-1.5 bg-cyan-50 text-[#00aeef] border border-cyan-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#00aeef] hover:text-white transition-all shadow-sm"
                                        >
                                            <Compass className="w-3 h-3" />
                                            Detailed Ability Radar
                                        </button>
                                    </div>

                                    <div className={`grid grid-cols-1 md:grid-cols-${(activeAgentId === 'math' || activeAgentId === 'maths') ? '3' : '2'} gap-4`}>
                                        {(activeAgentId === 'math' || activeAgentId === 'maths' 
                                            ? [
                                                { id: 'algebra', label: 'Algebra Mastery', icon: Calculator, color: 'indigo' },
                                                { id: 'geometry', label: 'Geometry & Trig', icon: Map, color: 'blue' },
                                                { id: 'data', label: 'Data & Statistics', icon: Layers, color: 'emerald' }
                                              ]
                                            : [
                                                { id: 'Reading', label: 'Reading (Paper 1)', icon: BookOpen, color: 'blue' },
                                                { id: 'Writing', label: 'Writing (Paper 2)', icon: PenTool, color: 'emerald' },
                                                { id: 'Listening', label: 'Listening (Paper 3)', icon: Headphones, color: 'amber' },
                                                { id: 'Speaking', label: 'Speaking (Paper 4)', icon: Mic, color: 'rose' }
                                              ]
                                        ).map((track) => {
                                            const level = (activeAgentId === 'math' || activeAgentId === 'maths') 
                                                ? getMathAreaLevel(track.id) 
                                                : getPaperLevel(track.id);
                                            
                                            // 0-7 scale to 0-100%
                                            const progress = (level / 7) * 100;
                                            const priority = getWeakestSkillInCategory(track.id, (activeAgentId === 'math' || activeAgentId === 'maths'));
                                            const missionName = (activeAgentId === 'math' || activeAgentId === 'maths')
                                                ? (priority ? (typeof getMathSkillName === 'function' ? getMathSkillName(priority.id, language) : priority.id) : 'All General Skills')
                                                : (priority ? getSkillName(priority.id, language) : 'Foundations');

                                            return (
                                                <div key={track.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 bg-${track.color}-50 rounded-xl`}>
                                                                 <track.icon className={`w-5 h-5 text-${track.color}-600`} />
                                                            </div>
                                                            <span className="font-black text-slate-800 text-sm tracking-tight">{track.label}</span>
                                                        </div>
                                                        <span className={`text-xs font-black text-${track.color}-600 bg-${track.color}-50 px-2 py-0.5 rounded-lg border border-${track.color}-100`}>
                                                            Level {level.toFixed(1)}
                                                        </span>
                                                    </div>

                                                    {/* Progress Gauge */}
                                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                                                        <div 
                                                            className={`h-full bg-gradient-to-r from-${track.color}-400 to-${track.color}-600 transition-all duration-1000`} 
                                                            style={{ width: `${Math.max(10, progress)}%` }}
                                                        />
                                                    </div>

                                                    {/* Priority Mission Action */}
                                                    {priority && (() => {
                                                        const targetLevel = String(Math.max(3, Math.min(5, Math.ceil(priority.level))));
                                                        const stats = getMasteryStats(targetLevel);
                                                        
                                                        return (
                                                            <div 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onClose();
                                                                    if (activeAgentId === 'math' || activeAgentId === 'maths') {
                                                                        navigate(`/maths/learn/${priority.id}`, { 
                                                                            state: { 
                                                                                topic: priority.id, 
                                                                                level: '3', 
                                                                                xp: stats.xp,
                                                                                isFactoryQuest: true
                                                                            } 
                                                                        });
                                                                    } else {
                                                                        handleTaskClick({ 
                                                                            id: priority.id, 
                                                                            title: `Boost: ${missionName}`, 
                                                                            topic: priority.id, 
                                                                            type: 'PRACTICE', 
                                                                            xp: stats.xp, 
                                                                            level: targetLevel
                                                                        });
                                                                    }
                                                                }}
                                                                className="relative flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all overflow-hidden"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-white rounded-lg shadow-xs group-hover:scale-110 transition-transform">
                                                                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Priority Boost</div>
                                                                        <div className="text-[12px] font-black text-slate-700 italic group-hover:text-indigo-600 transition-colors line-clamp-1">{missionName}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[11px] font-black text-indigo-600">+{stats.xp} XP</span>
                                                                    <Play className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Tasks Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                    {(plan?.tasks || [])
                                            .filter(task => {
                                                if (activeAgentId === 'math' || activeAgentId === 'maths') return true;
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
                                                <div className="flex items-center gap-2">
                                                    {task.status === 'COMPLETED' ? (
                                                        <CheckCircle size={18} className="text-green-500" />
                                                    ) : (
                                                        <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                                            {task.type}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                            <h4 className="font-bold mb-1 line-clamp-1 text-slate-900">{task.title}</h4>
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
                                        </div>
                                            ))
                                    }
                                </div>
                            </div>
                        ) : activeTab === 'GRAMMAR' ? (
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <Layers className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                        Grammar Lab Modules
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                                    {Object.keys(MICRO_SKILLS)
                                        .filter(id => id.startsWith('grammar_'))
                                        .map((id, index) => {
                                            const skill = MICRO_SKILLS[id];
                                            const isElite = id.includes('_elite_');
                                            const trackLabel = isElite ? t('roadmap.elite_track') : t('roadmap.accuracy_track');
                                            const trackColor = isElite ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";
                                            
                                            return (
                                                <div 
                                                    key={id}
                                                    onClick={() => {
                                                        handleTaskClick({
                                                            id: id,
                                                            topic: id,
                                                            title: skill[language]?.name || id,
                                                            type: 'GRAMMAR_LAB',
                                                            xp: 50,
                                                            level: selectedLevels[id] || (id.includes('_elite_') ? '7' : '5')
                                                        });
                                                    }}
                                                    className="group relative bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                                                >
                                                    <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${trackColor}`}>
                                                            {trackLabel}
                                                        </span>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-amber-200 rounded-lg shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                            <Target size={12} className="text-amber-600" />
                                                            <select
                                                                value={selectedLevels[id] || (isElite ? '7' : '5')}
                                                                onChange={(e) => setSelectedLevels({ ...selectedLevels, [id]: e.target.value })}
                                                                className="bg-transparent text-[10px] font-black text-amber-600 focus:outline-none cursor-pointer uppercase"
                                                            >
                                                                <option value="3">Level 3</option>
                                                                <option value="4">Level 4</option>
                                                                <option value="5">Level 5</option>
                                                                <option value="7">Level 7</option>
                                                            </select>
                                                        </div>
                                                        <div className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                            +50 XP
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors mb-2">
                                                        {skill[language]?.name || id}
                                                    </h4>
                                                    <p className="text-[12px] text-slate-500 leading-relaxed mb-6 line-clamp-2 min-h-[3em]">
                                                        {skill[language]?.desc}
                                                    </p>
                                                    
                                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                            <span className="line-clamp-1">Outcome: {skill[language]?.outcome}</span>
                                                        </div>
                                                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-amber-100 transition-colors shrink-0">
                                                            <Play className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                            {(() => {
                                                const lCount = listeningMissions.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase())).length;
                                                const wCount = writingMissions.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase())).length;
                                                if (paperFilter === 'LISTENING') return lCount;
                                                if (paperFilter === 'WRITING') return wCount;
                                                if (paperFilter === 'ALL') return lCount + wCount + filteredSkills.length;
                                                return filteredSkills.length;
                                            })()} skills available
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

                                {(() => {
                                    return (
                                        <>
                                            {/* LISTENING MISSIONS */}
                                            {(paperFilter === 'ALL' || paperFilter === 'LISTENING') && (
                                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Layers className="w-5 h-5 text-rose-600" />
                                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Listening Quests</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                                        {listeningMissions
                                                            .filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                            .map((mission) => {

                                                                return (
                                                                    <div 
                                                                        key={mission.id} 
                                                                        onClick={() => { 
                                                                            onClose();
                                                                            navigate(`/listening/briefing/${mission.id}`, { state: { questData: mission, targetLevel: '5', targetXp: 200 } }); 
                                                                        }} 
                                                                        className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-rose-300 hover:shadow-md"
                                                                    >
                                                                        <div>
                                                                            <h4 className="text-sm font-bold mb-1 text-slate-800 group-hover:text-rose-600">{mission.title}</h4>
                                                                            <p className="text-[11px] text-slate-500 line-clamp-2">{mission.description || "Synthesizing data files and auditory clues."}</p>
                                                                            <div className="mt-4 flex items-center justify-between">
                                                                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">+200 XP</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* WRITING MISSIONS */}
                                            {(paperFilter === 'ALL' || paperFilter === 'WRITING') && (
                                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <PenTool className="w-5 h-5 text-purple-600" />
                                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Writing Quests</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                                        {writingMissions
                                                            .filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                            .map((mission) => {

                                                                return (
                                                                    <div 
                                                                        key={mission.id} 
                                                                        onClick={() => { 
                                                                            onClose();
                                                                            navigate(`/writing/quest`, { state: { questData: mission } }); 
                                                                        }} 
                                                                        className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-purple-300 hover:shadow-md"
                                                                    >
                                                                        <div>
                                                                            <h4 className="text-sm font-bold mb-1 text-slate-800 group-hover:text-purple-600">{mission.title}</h4>
                                                                            <p className="text-[11px] text-slate-500 line-clamp-2">{mission.prompt || "Advancing DSE linguistic proficiency."}</p>
                                                                            <div className="mt-4 flex items-center justify-between">
                                                                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">+150 XP</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* SKILLS LIST */}
                                            {(paperFilter === 'ALL' || (paperFilter !== 'LISTENING' && paperFilter !== 'WRITING')) && (
                                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                                        {filteredSkills.map(([id]) => {
                                                            const name = getSkillName(id);
                                                            const paper = id.split('_')[0];

                                                            const levelToUse = selectedLevels[id] || '5';
                                                            const stats = getMasteryStats(Number(levelToUse), false, false);

                                                            return (
                                                                <div 
                                                                    key={id} 
                                                                    onClick={() => {
                                                                        handleTaskClick({ id, title: name, topic: id, type: 'PRACTICE', xp: stats.xp, level: levelToUse });
                                                                    }} 
                                                                     className="group relative p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-amber-300 transition-all cursor-pointer flex flex-col"
                                                                >
                                                                    <div>
                                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2 inline-block ${
                                                                            paper === 'reading' ? 'bg-blue-50 text-blue-600' :
                                                                            paper === 'writing' ? 'bg-purple-50 text-purple-600' :
                                                                            paper === 'listening' ? 'bg-orange-50 text-orange-600' :
                                                                            'bg-green-50 text-green-600'
                                                                        }`}>
                                                                            {paper}
                                                                        </span>
                                                                        <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-amber-600 mb-1">{name}</h4>
                                                                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-4">{getSkillDesc(id)}</p>
                                                                        <div className="flex items-center justify-between mt-auto">
                                                                            <span className="text-xs font-bold text-amber-600">+{stats.xp} XP</span>
                                                                            {paper === 'reading' && (
                                                                                <select value={levelToUse} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); setSelectedLevels(prev => ({ ...prev, [id]: e.target.value })); }} className="text-[9px] font-bold bg-slate-50 border rounded px-1 outline-none">
                                                                                    <option value="3">Easy</option>
                                                                                    <option value="4">Medium</option>
                                                                                    <option value="5">DSE Standard</option>
                                                                                    <option value="7">Elite</option>
                                                                                </select>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapModal;
