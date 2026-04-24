import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Compass, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, Calculator, PieChart, Shapes, Ruler, RefreshCcw, ChevronDown, BarChart3, PenTool, Layers } from 'lucide-react';
import { MATH_MICRO_SKILLS, getMathSkillName, getMathSkillDesc, getMathSkillMinForm, getSkillsByCategory } from '../../constants/mathMicroSkills';
import { calculateTier, getTierMetadata, getMasteryStats, getDifficultyTierDetails, getMasteryPercentage, getMathMasteryPercentage } from '../../utils/masteryUtils';

const calculateCurrentForm = (baseGrade, joinedDateTimestamp) => {
    if (!baseGrade) return 6; // Default to F6 if unknown

    // Grades map to integers: F1=1...F6=6
    const gradeMap = { 'F1': 1, 'F2': 2, 'F3': 3, 'F4': 4, 'F5': 5, 'F6': 6, 'Self study': 6 };
    let startForm = gradeMap[baseGrade] || 6;

    if (!joinedDateTimestamp) return startForm;

    const joinedDate = new Date(Number(joinedDateTimestamp));
    const now = new Date();

    // Academic year starts in Sept (Month 8, since Jan=0)
    // Calculate academic years passed
    // For simplicity: difference in years, adjusted if we passed Sept 1st
    let yearsPassed = now.getFullYear() - joinedDate.getFullYear();

    // If joined before Sept and now is after Sept, that's +1 academic year transition
    // Actually, simpler logic:
    // Calculate "School Year" of joining: Year X if Month >= 8 (Sept), else Year X-1
    // Calculate "School Year" of now
    // Form = StartForm + (CurrentSchoolYear - StartSchoolYear)

    const getSchoolYear = (date) => {
        return date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
    };

    const startSchoolYear = getSchoolYear(joinedDate);
    const currentSchoolYear = getSchoolYear(now);

    const form = startForm + (currentSchoolYear - startSchoolYear);
    return Math.min(form, 6); // Cap at F6
};

const MathRoadmapModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { language, t: globalT } = useLanguage();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('WEEKLY'); // 'WEEKLY' | 'GENERAL' | 'CHALLENGE'
    const [searchQuery, setSearchQuery] = useState('');
    const [userSkills, setUserSkills] = useState({});
    const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' | 'ALGEBRA' | 'GEOMETRY' | 'DATA'
    const [currentForm, setCurrentForm] = useState(6);
    const [practicedSkills, setPracticedSkills] = useState([]);
    const [selectedLevels, setSelectedLevels] = useState({});

    useEffect(() => {
        if (user) {
            // Use metadata.creationTime or user profile joinedAt if available
            // Firebase user.metadata.creationTime is a string, handle carefully
            // Actually user.metadata.createdAt is usually available in milliseconds as string or number depending on SDK
            // Let's rely on date object if possible, or fallback
            // user object from context might be thin, let's assume standard firebase user
            const joinedTime = user.metadata?.createdAt || Date.now();
            const form = calculateCurrentForm(user.grade || 'F6', joinedTime);
            setCurrentForm(form);
        }
    }, [user]);

    const translations = {
        en: {
            questSystem: "Mathematics Quest",
            myPath: "My Math Path",
            subtitleWeekly: "Complete 5 targets to unlock the Master Quest!",
            subtitleGeneral: "Select a topic to generate practice questions.",
            tabPersonalised: "Targeted Growth",
            tabLibrary: "Skill Library",
            loading: "Calculating your optimal path...",
            targets: "Targets",
            bossUnlocked: "Boss Unlocked!",
            bossToUnlock: (count) => `${count} to unlock Boss`,
            statusCollected: "COLLECTED",
            statusPractice: "PRACTICE",
            collectedXp: "Collected! (Practice: +50 XP)",
            masterChallenge: "Weekly Quest",
            masterDescAlt: "Synthesize your skills across all topics.",
            unlockCondition: (count) => `Complete ${3 - count} more Quests to unlock`,
            moreTargets: (count) => `Complete ${count} more targets`,
            searchPlaceholder: "Search Math skills...",
            skillsFound: (count) => `${count} skills found`,
            noSkills: "No skills found for this category.",
            areas: {
                ALL: "All Areas",
                ALGEBRA: "Number & Algebra",
                GEOMETRY: "Geometry",
                DATA: "Data Handling"
            },
            mastery: "Mastery",
            emptyGrowthTitle: "Unlock Your Potential",
            emptyGrowthDesc: "Your Targeted Growth path is currently a blank slate. Start practicing in the Skill Library! As you complete quests, our AI will analyze your performance, identify your unique bottlenecks, and curate personalized targets to help you level up faster.",
            emptyGrowthAction: "Explore Skill Library",
            helpText: "How to enable?"
        },
        zh: {
            questSystem: "數學任務",
            myPath: "我的數學路徑",
            subtitleWeekly: "完成 5 個目標以解鎖每週任務！",
            subtitleGeneral: "選擇一個主題以生成練習題。",
            tabPersonalised: "個人化任務",
            tabLibrary: "技能庫",
            loading: "正在計算路徑...",
            targets: "個目標",
            bossUnlocked: "挑戰已解鎖！",
            bossToUnlock: (count) => `還差 ${count} 個目標解鎖`,
            statusCollected: "已完成",
            statusPractice: "開始練習",
            collectedXp: "已完成！(練習：+50 XP)",
            masterChallenge: "每週任務 (DSE)",
            masterDescAlt: "綜合各主題技能，挑戰 DSE 難度題目。",
            unlockCondition: (count) => `再完成 ${3 - count} 個主題任務以解鎖`,
            moreTargets: (count) => `再完成 ${count} 個目標`,
            searchPlaceholder: "搜尋數學技能...",
            skillsFound: (count) => `找到 ${count} 個技能`,
            noSkills: "沒有找到相關技能。",
            areas: {
                ALL: "所有範疇",
                ALGEBRA: "數與代數",
                GEOMETRY: "度量、圖形與空間",
                DATA: "數據處理"
            },
            mastery: "掌握度",
            emptyGrowthTitle: "啟動你的個人化路徑",
            emptyGrowthDesc: "你的『個人化任務』目前還是空白的。請先前往技能庫開始練習！當你完成任務後，AI 會分析你的表現，找出你的薄弱環節，並為你量身打造專屬的練習目標，助你更高效地進步。",
            emptyGrowthAction: "前往技能庫",
            helpText: "如何啟動？"
        }
    };

    const t = translations[language === 'zh' ? 'zh' : 'en'];

    const fetchUserSkills = async () => {
        if (!user?.uid) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            // Use the dedicated Math skillmap endpoint
            const res = await fetch(`${API_URL}/api/skillmap/maths?uid=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setUserSkills(data?.microSkills || {});
                setPracticedSkills(data?.practicedSkills || []);
            }
        } catch (error) {
            console.error("Failed to load user math skills", error);
        }
    };

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            // NEW: Use unified Factory Model personalized endpoint
            const res = await fetch(`${API_URL}/api/quests/personalized?uid=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setPlan(data);
            }
        } catch (error) {
            console.error("Failed to load math roadmap", error);
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

    const handleTaskClick = (task) => {
        if (task.locked) return;

        onClose(); // Close modal

        // Normalize level to FE tier 1-4 if it's a bank level (3, 4, 5, 7)
        // This ensures the backend mapping (!isFactory flow) works correctly.
        const tier = calculateTier(task.level || 3);

        // Standardized Math Quest XP: 150 for General, 250 for Weekly
        const isWeekly = task.id === 'weekly_math' || task.id.startsWith('weekly_') || task.type === 'WEEKLY_QUEST';
        const xpReward = isWeekly ? 250 : 150;

        // For Math Factory Model quests, navigate to the specialized learn page
        navigate(`/maths/learn/${task.meta?.topic || task.topic}`, {
            state: {
                topic: task.meta?.topic || task.topic,
                taskId: task.id,
                title: task.meta?.topic || task.topic,
                xp: xpReward,
                isFactoryQuest: true,
                level: 0 // ADAPTIVE (Uses Scaffolded sequence: Easy -> Medium -> DSE)
            }
        });
    };

    if (!isOpen) return null;

    const completedCount = plan?.tasks ? plan.tasks.filter(t => t.status === 'COMPLETED' && t.type !== 'MOCK').length : 0;
    const totalKeys = 5;
    const bossTask = plan?.tasks ? plan.tasks.find(t => t.type === 'MOCK') : null;
    const canUnlockBoss = completedCount >= 4;

    // Filter Logic
    const filteredSkills = Object.entries(MATH_MICRO_SKILLS).filter(([id, data]) => {
        // 1. Search Query
        if (searchQuery) {
            const name = getMathSkillName(id, language).toLowerCase();
            if (!name.includes(searchQuery.toLowerCase())) return false;
        }

        // 2. Category Filter
        // Determine category from ID prefix
        let cat = 'OTHER';
        if (id.startsWith('math_num') || id.startsWith('math_alg')) cat = 'ALGEBRA';
        else if (id.startsWith('math_geo') || id.startsWith('math_trig') || id.startsWith('math_mensuration')) cat = 'GEOMETRY';
        else if (id.startsWith('math_stat') || id.startsWith('math_prob')) cat = 'DATA';

        if (filterCategory !== 'ALL' && cat !== filterCategory) return false;

        // 3. Tab Filter
        // Only show single topics in GENERAL / WEEKLY tabs
        if (id.startsWith('math_int') || id === 'integrated_challenge') return false;

        // 4. Redundancy Filter: Consolidate Data Handling
        // Hide granular sub-skills that are covered by the math_stat_prob Quest
        const redundantDataSkills = ['math_stat_probability', 'math_stat_counting', 'math_stat_measures'];
        if (redundantDataSkills.includes(id)) return false;

        return true;
    });

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header - Standardized Ace It! Theme (Brand Orange) */}
                <div className="p-6 relative overflow-hidden bg-[#FF6600] border-b border-white/10 shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calculator className="w-40 h-40 text-white transform rotate-12" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-6 text-white/80 hover:text-white transition-colors z-[60]"
                    >
                        <X className="w-7 h-7" />
                    </button>

                    <div className="relative z-10 text-white grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black leading-tight tracking-tight mb-1">{globalT('roadmap.title_math')}</h2>
                            <p className="text-white/90 text-sm font-medium opacity-90">
                                {globalT('roadmap.complete_quest_xp')}
                            </p>
                        </div>

                        {/* Tab Switcher - Centered & Larger & Energetic Blue */}
                        <div className="flex justify-center">
                            <div className="flex p-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-inner">
                                {[
                                    { id: 'WEEKLY', label: globalT('roadmap.targeted_growth'), icon: Clock },
                                    { id: 'GENERAL', label: globalT('roadmap.quests_lab'), icon: Sparkles }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setFilterCategory('ALL');
                                        }}
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

                    {/* Matt's Personalization Banner - Standardized Contrast */}
                    <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 px-6 py-2 text-white/90 text-xs font-medium flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>
                            You are currently in <span className="font-bold text-white">Form {currentForm}</span>.
                            We've highlighted topics relevant to your level.
                            {currentForm < 6 && <span className="opacity-70 ml-1">(Future topics are dimmed)</span>}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400 flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600]"></div>
                            <p>{globalT ? globalT('common.loading') : t.loading}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                        {activeTab === 'WEEKLY' ? (
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                 {Object.keys(userSkills || {}).filter(id => id.startsWith('math_') && !id.startsWith('math_int')).length === 0 && (plan?.tasks || []).length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-24 h-24 bg-violet-100/50 rounded-full flex items-center justify-center mb-6">
                                            <Sparkles className="w-12 h-12 text-violet-500 animate-pulse" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-3">{t.emptyGrowthTitle}</h3>
                                        <p className="text-slate-500 max-w-lg mb-8 leading-relaxed">
                                            {t.emptyGrowthDesc}
                                        </p>
                                        <div className="flex flex-col items-center gap-4">
                                            <button
                                                onClick={() => setActiveTab('GENERAL')}
                                                className="px-8 py-4 bg-[#FF6600] text-white rounded-2xl font-bold hover:bg-[#e65c00] hover:scale-105 transition-all shadow-xl shadow-orange-200 flex items-center gap-2 group"
                                            >
                                                {t.emptyGrowthAction}
                                                <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                                <span>{t.helpText} Finish any quest in the library to get started.</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Weekly Quest Banner */}
                                        <div className="mb-8">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Trophy className="w-5 h-5 text-indigo-600" />
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t.masterChallenge}</h3>
                                            </div>
                                            
                                            <div 
                                                onClick={() => {
                                                    if (practicedSkills.length < 3) return;
                                                    onClose();
                                                    navigate('/maths/lab', {
                                                        state: {
                                                            topic: 'integrated_challenge',
                                                            mode: 'challenge',
                                                            level: 7, // DSE Elite
                                                            xp: 300,
                                                            title: t.masterChallenge,
                                                            isFactoryQuest: false
                                                        }
                                                    });
                                                }}
                                                className={`
                                                    group relative overflow-hidden rounded-[2rem] border-2 transition-all duration-500
                                                    ${practicedSkills.length < 3 
                                                        ? 'bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed' 
                                                        : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 border-indigo-400 shadow-xl shadow-indigo-200 cursor-pointer hover:scale-[1.02] hover:shadow-2xl'
                                                    }
                                                `}
                                            >
                                                {/* Background Decorative Elements */}
                                                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                                    <Zap className="w-64 h-64 text-white -rotate-12" />
                                                </div>
                                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                                
                                                <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                                    <div className="flex-1 text-center md:text-left">
                                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${practicedSkills.length < 3 ? 'bg-slate-200 text-slate-500' : 'bg-white/20 text-white border border-white/30 backdrop-blur-md'}`}>
                                                                {practicedSkills.length < 3 ? 'Locked' : 'Available Now'}
                                                            </div>
                                                            {practicedSkills.length >= 3 && (
                                                                <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs">
                                                                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                                                                    <span>+250 XP</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h4 className={`text-3xl font-black mb-2 ${practicedSkills.length < 3 ? 'text-slate-600' : 'text-white'}`}>
                                                            {t.masterChallenge}
                                                        </h4>
                                                        <p className={`text-sm leading-relaxed max-w-md ${practicedSkills.length < 3 ? 'text-slate-400' : 'text-indigo-100'}`}>
                                                            {practicedSkills.length < 3 
                                                                ? t.unlockCondition(practicedSkills.length)
                                                                : (language === 'zh' ? '綜合各主題技能，挑戰 DSE 難度題目。' : 'Synthesize your skills across all topics and tackle DSE-style challenges.')
                                                            }
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="shrink-0 flex flex-col items-center gap-3">
                                                        {practicedSkills.length < 3 ? (
                                                            <div className="w-16 h-16 bg-slate-200 rounded-3xl flex items-center justify-center text-slate-400 shadow-inner border border-slate-300">
                                                                <Lock className="w-8 h-8" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white text-indigo-600 p-6 rounded-[1.5rem] shadow-xl group-hover:scale-110 transition-transform duration-300">
                                                                <Play className="w-6 h-6 fill-current" />
                                                            </div>
                                                        )}
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${practicedSkills.length < 3 ? 'text-slate-300' : 'text-white/60'}`}>
                                                            {practicedSkills.length < 3 ? 'Path Restricted' : 'Begin Challenge'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Targeted Growth Strategy - Math Mastery Tracks */}
                                        <div className="mb-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-6 h-6 text-indigo-600" />
                                                    <h3 className="line-clamp-1 font-black text-slate-800 uppercase tracking-widest text-sm">
                                                        Syllabus Mastery Strategy
                                                    </h3>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        onClose();
                                                        navigate('/maths/ability');
                                                    }}
                                                    className="px-4 py-1.5 bg-cyan-50 text-[#00aeef] border border-cyan-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#00aeef] hover:text-white transition-all shadow-sm"
                                                >
                                                    <Compass className="w-3 h-3" />
                                                    Detailed Ability Radar
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'algebra', label: 'Algebra Mastery', icon: Calculator, color: 'indigo' },
                                                    { id: 'geometry', label: 'Geometry & Trig', icon: Map, color: 'blue' },
                                                    { id: 'data', label: 'Data & Statistics', icon: PieChart, color: 'emerald' }
                                                ].map((track) => {
                                                    const skills = getSkillsByCategory(track.id);
                                                    const levels = skills.length > 0 ? skills.map(sid => userSkills[sid]?.level || 1) : [1];
                                                    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
                                                    
                                                    // Mapping level (0-7) to percentage (0-100)
                                                    const progress = (avgLevel / 7) * 100;

                                                    // Find weakest skill in this category
                                                    let priority = null;
                                                    if (skills.length > 0) {
                                                        let minLvl = userSkills[skills[0]]?.level || 1;
                                                        priority = { id: skills[0], level: minLvl };
                                                        skills.forEach(sid => {
                                                            const lvl = userSkills[sid]?.level || 1;
                                                            if (lvl < minLvl) {
                                                                minLvl = lvl;
                                                                priority = { id: sid, level: lvl };
                                                            }
                                                        });
                                                    }

                                                    const missionName = priority ? getMathSkillName(priority.id, language) : 'Core Principles';

                                                    return (
                                                        <div key={track.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 bg-slate-50 text-indigo-600 rounded-xl`}>
                                                                        <track.icon className={`w-5 h-5`} />
                                                                    </div>
                                                                    <span className="font-black text-slate-800 text-sm tracking-tight">{track.label}</span>
                                                                </div>
                                                                <span className={`text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100`}>
                                                                    Level {avgLevel.toFixed(1)}
                                                                </span>
                                                            </div>

                                                            {/* Progress Gauge */}
                                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                                                                <div 
                                                                    className={`h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-1000`} 
                                                                    style={{ width: `${Math.max(10, progress)}%` }}
                                                                />
                                                            </div>

                                                            {/* Priority Mission Action */}
                                                            {priority && (() => {
                                                                const targetLevel = '5'; // Propose Level 5 for all Mastery Tracks
                                                                const stats = getMasteryStats(targetLevel);
                                                                
                                                                return (
                                                                    <div 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onClose();
                                                                            navigate(`/maths/learn/${priority.id}`, { 
                                                                                state: { 
                                                                                    topic: priority.id, 
                                                                                    level: targetLevel, 
                                                                                    xp: stats.xp,
                                                                                    isFactoryQuest: true
                                                                                } 
                                                                            });
                                                                        }}
                                                                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                                                                    >
                                                                        <div className="flex items-center gap-3 pr-2 overflow-hidden">
                                                                            <div className="p-2 bg-white rounded-lg shadow-xs group-hover:scale-110 transition-transform flex-shrink-0">
                                                                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Priority Boost</div>
                                                                                <div className="text-[12px] font-black text-slate-700 italic group-hover:text-indigo-600 transition-colors truncate">{missionName}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <span className="text-[11px] font-black text-indigo-600">+150 XP</span>
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

                                        {/* Weekly Adaptive Quest Card */}
                                        <div className="mt-8 flex items-center gap-2 mb-4">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Weekly Challenge Quests</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                            {[
                                                { id: 'math_foundation', topic: 'math_alg_formulas', title: 'Section A1 Foundation', icon: Zap, color: 'from-emerald-600 to-teal-700', desc: 'Must-Win Core Basics', level: '3' },
                                                { id: 'math_standard', topic: 'math_alg_quadratics', title: 'Section A2 Mastery', icon: Layers, color: 'from-blue-600 to-indigo-700', desc: 'Standard Core Topics', level: '5' },
                                                { id: 'weekly_math', topic: 'integrated_challenge', title: 'Section B Challenge', icon: Trophy, color: 'from-orange-600 to-red-700', desc: 'Level 5+ Detailed Analysis', level: '5' },
                                                { id: 'mock_teaser', topic: 'Maths Paper 2 (MCQ)', title: 'MCQ Speed Drill', icon: Clock, color: 'from-purple-600 to-indigo-700', desc: 'Paper 2 Speed & Tactics', level: '5' }
                                            ].map((quest) => {
                                                const stats = getMasteryStats(quest.level);
                                                return (
                                                    <div
                                                        key={quest.id}
                                                        onClick={() => {
                                                            onClose();
                                                            navigate('/maths/lab', { state: { topic: quest.topic, xp: stats.xp, level: quest.level } });
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

                                        {/* Factory Tasks Grid (Hidden if empty or redundant) */}
                                        {(plan?.tasks || []).length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                                {(plan?.tasks || [])
                                                    .filter(t => !['MOCK', 'DIAGNOSTIC'].includes(t.type))
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
                                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                                <Calculator size={18} />
                                                            </div>
                                                            <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                                                                FACTORY
                                                            </div>
                                                        </div>

                                                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{task.meta?.topic || task.topic}</h4>
                                                        <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-tight">
                                                            Advanced DSE practice targeting your current form.
                                                        </p>

                                                        <div className="mt-4 flex items-center justify-between">
                                                            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-current" /> +150 XP
                                                            </span>
                                                            <Play className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Filters */}
                                <div className="p-4 bg-white border-b border-slate-100 flex flex-col gap-4">
                                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                        <div className="relative w-full max-w-sm">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder={t.searchPlaceholder}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                            />
                                        </div>
                                        <div className="text-xs font-bold text-slate-400">
                                            {t.skillsFound(filteredSkills.length)}
                                        </div>
                                    </div>

                                {activeTab === 'GENERAL' && (
                                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                        {[
                                            { id: 'ALL', label: t.areas.ALL, icon: Calculator },
                                            { id: 'ALGEBRA', label: t.areas.ALGEBRA, icon: Ruler },
                                            { id: 'GEOMETRY', label: t.areas.GEOMETRY, icon: Shapes },
                                            { id: 'DATA', label: t.areas.DATA, icon: PieChart }
                                        ].map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFilterCategory(cat.id)}
                                                className={`
                                                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all
                                                      ${filterCategory === cat.id
                                                        ? 'bg-violet-100 border-violet-200 text-violet-700'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                                  `}
                                            >
                                                <cat.icon className="w-3 h-3" />
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>


                                {/* Skills List */}
                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {filteredSkills.map(([id, data]) => {
                                            const name = getMathSkillName(id, language);
                                            const desc = getMathSkillDesc(id, language);
                                            const minForm = getMathSkillMinForm(id);
                                            const level = userSkills[id]?.level || 0;

                                            const isFutureTopic = minForm > currentForm;

                                            // Determine Category Style
                                            let catColor = 'text-slate-500 bg-slate-100';
                                            if (id.startsWith('math_num') || id.startsWith('math_alg')) catColor = 'text-blue-600 bg-blue-50';
                                            else if (id.startsWith('math_geo')) catColor = 'text-orange-600 bg-orange-50';
                                            else if (id.startsWith('math_stat')) catColor = 'text-teal-600 bg-teal-50';

                                            const isPracticed = practicedSkills.includes(id) || practicedSkills.includes(name);

                                            return (
                                                <div
                                                    key={id}
                                                    onClick={() => {
                                                        const masteryLevel = userSkills[id]?.level || 0;
                                                        const capAtDSE = activeTab !== 'CHALLENGE';
                                                        const hasOverride = selectedLevels[id] !== undefined;
                                                        const activeTier = hasOverride ? selectedLevels[id] : calculateTier(masteryLevel, capAtDSE);
                                                        const xpReward = getDifficultyTierDetails(activeTier, language === 'zh').xp;

                                                        handleTaskClick({
                                                            id: `general_${id}`,
                                                            title: `${activeTab === 'CHALLENGE' ? (language === 'zh' ? '精英' : 'Elite') : (language === 'zh' ? '練習' : 'Practice')}: ${name}`,
                                                            topic: id,
                                                            type: 'PRACTICE',
                                                            xp: xpReward,
                                                            level: activeTier
                                                        });
                                                    }}
                                                    className={`
                                                                group p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer
                                                                ${isPracticed
                                                            ? 'bg-violet-100 border-violet-500 shadow-[0_4px_12px_rgba(139,92,246,0.2)] ring-1 ring-violet-200'
                                                            : isFutureTopic
                                                                ? 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                                                                : 'bg-white border-slate-100 hover:border-violet-300 hover:shadow-md'
                                                        }
                                                            `}
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${catColor}`}>
                                                                    {id.split('_')[1]}
                                                                </span>
                                                                {isFutureTopic && (
                                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-500 uppercase tracking-wider">
                                                                        F{minForm}
                                                                    </span>
                                                                )}
                                                                {!isPracticed && (
                                                                    <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                                        <Zap className="w-3 h-3" />
                                                                        {language === 'zh' ? '自適應練習' : 'Adaptive'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {isPracticed && (
                                                                    <div className="bg-violet-100 text-violet-600 p-1 rounded-full border border-violet-200">
                                                                        <CheckCircle className="w-3 h-3 fill-white" />
                                                                    </div>
                                                                )}
                                                                {level >= 5 && <Trophy className="w-4 h-4 text-amber-500" />}
                                                            </div>
                                                        </div>
                                                        <h4 className="text-[15px] font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">
                                                            {name}
                                                        </h4>
                                                        
                                                        {/* Mastery Bar */}
                                                        {(() => {
                                                            const masteryPct = getMathMasteryPercentage(level);
                                                            return (
                                                                <div className="mt-3 space-y-1">
                                                                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                        <span>{t.mastery}</span>
                                                                        <span>{masteryPct}%</span>
                                                                    </div>
                                                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                                        <div 
                                                                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-1000"
                                                                            style={{ width: `${masteryPct}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        <p className="text-[11px] text-slate-500 mt-3 line-clamp-1 leading-tight opacity-70">
                                                            {desc}
                                                        </p>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                                        {isPracticed ? (
                                                            <div className="px-2 py-0.5 bg-violet-100 rounded text-[10px] font-bold text-violet-700 uppercase tracking-wide flex items-center gap-1.5 border border-violet-200">
                                                                <RefreshCcw className="w-3 h-3" />
                                                                {language === 'zh' ? '重複練習' : 'Repeat Quest'}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs font-bold text-violet-500 flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-current" /> +150 XP
                                                            </span>
                                                        )}
                                                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity bg-violet-100 text-violet-700 p-1 rounded-full ${isPracticed ? 'border border-violet-200' : ''}`}>
                                                            <Play className="w-3 h-3 ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredSkills.length === 0 && (
                                            <div className="text-center py-20 text-slate-400 col-span-full">
                                                {t.noSkills}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MathRoadmapModal;
