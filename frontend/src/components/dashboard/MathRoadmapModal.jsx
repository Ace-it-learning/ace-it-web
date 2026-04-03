import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, Calculator, PieChart, Shapes, Ruler, RefreshCcw, ChevronDown, BarChart3 } from 'lucide-react';
import { MATH_MICRO_SKILLS, getMathSkillName, getMathSkillDesc, getMathSkillMinForm } from '../../constants/mathMicroSkills';
import { calculateTier, getTierMetadata, getMasteryStats, getDifficultyTierDetails, getMasteryPercentage } from '../../utils/masteryUtils';

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
    const { language } = useLanguage();
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
            subtitleWeekly: "Complete 5 targets to unlock the Master Challenge!",
            subtitleGeneral: "Select a topic to generate practice questions.",
            tabPersonalised: "Targeted Growth",
            tabLibrary: "Skill Library",
            tabIntegrated: "Integrated Maths",
            loading: "Calculating your optimal path...",
            targets: "Targets",
            bossUnlocked: "Boss Unlocked!",
            bossToUnlock: (count) => `${count} to unlock Boss`,
            statusCollected: "COLLECTED",
            statusPractice: "PRACTICE",
            collectedXp: "Collected! (Practice: +50 XP)",
            masterChallenge: "Weekly Master Challenge",
            masterDesc: "Prove your mastery of this week's topics.",
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
            subtitleWeekly: "完成 5 個目標以解鎖大師挑戰！",
            subtitleGeneral: "選擇一個主題以生成練習題。",
            tabPersonalised: "個人化任務",
            tabLibrary: "技能庫",
            tabIntegrated: "綜合數學",
            loading: "正在計算路徑...",
            targets: "個目標",
            bossUnlocked: "挑戰已解鎖！",
            bossToUnlock: (count) => `還差 ${count} 個目標解鎖`,
            statusCollected: "已完成",
            statusPractice: "開始練習",
            collectedXp: "已完成！(練習：+50 XP)",
            masterChallenge: "每週大師挑戰",
            masterDesc: "證明你對本週主題的掌握程度。",
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
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            // Use the dedicated Math endpoint
            const res = await fetch(`${API_URL}/api/profile/maths?uid=${user.uid}`);
            if (res.ok) {
                const data = await res.json();
                setUserSkills(data.microSkills || {});
                setPracticedSkills(data.practicedSkills || []);
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
                setPlan({ tasks: data });
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

        // For Math Factory Model quests, navigate to the specialized learn page
        navigate(`/maths/learn/${task.meta?.topic || task.topic}`, {
            state: {
                topic: task.meta?.topic || task.topic,
                taskId: task.id,
                title: task.meta?.topic || task.topic,
                xp: task.xp || 200, // Factory Quest standard fallback
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
        if (activeTab === 'CHALLENGE') {
            return id.startsWith('math_int');
        }

        // Only show single topics in GENERAL / WEEKLY tabs
        if (id.startsWith('math_int')) return false;

        return true;
    });

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header - Math Theme (Indigo/Purple) */}
                <div className={`p-4 relative overflow-hidden ${activeTab === 'CHALLENGE' ? 'bg-indigo-950' : 'bg-violet-600'}`}>
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Calculator className="w-32 h-32 text-white transform rotate-12" />
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
                                <Map className="w-3 h-3" />
                                {t.questSystem}
                            </div>
                            <h2 className="text-2xl font-bold leading-tight">{t.myPath}</h2>
                            <p className="text-white/80 text-xs opacity-90 truncate max-w-md">
                                {activeTab === 'WEEKLY'
                                    ? t.subtitleWeekly
                                    : t.subtitleGeneral}
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className={`flex p-1 rounded-lg backdrop-blur-sm border ${activeTab === 'CHALLENGE' ? 'bg-indigo-800/40 border-indigo-400/30' : 'bg-violet-700/40 border-violet-400/30'}`}>
                            {[
                                { id: 'WEEKLY', label: t.tabPersonalised, icon: Clock },
                                { id: 'GENERAL', label: t.tabLibrary, icon: Sparkles },
                                { id: 'CHALLENGE', label: t.tabIntegrated, icon: Zap }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setFilterCategory('ALL');
                                    }}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all
                                        ${activeTab === tab.id
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-white hover:bg-white/10'}
                                    `}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Matt's Personalization Banner */}
                    <div className="bg-indigo-900/40 backdrop-blur-sm border-t border-indigo-500/30 px-6 py-2 text-white/90 text-xs font-medium flex items-center gap-2">
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                            <p>{t.loading}</p>
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
                                                className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 hover:scale-105 transition-all shadow-xl shadow-violet-200 flex items-center gap-2 group"
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
                                        {/* Bottom 3 Bottlenecks - Targeted Growth */}
                                        {Object.keys(userSkills || {}).filter(id => id.startsWith('math_') && !id.startsWith('math_int')).length > 0 && (
                                            <div className="mb-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Sparkles className="w-5 h-5 text-violet-600" />
                                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top 3 Radar Bottlenecks</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {Object.entries(userSkills)
                                                        .filter(([id]) => id.startsWith('math_') && !id.startsWith('math_int'))
                                                        .sort((a, b) => (a[1].level || 0) - (b[1].level || 0))
                                                        .slice(0, 3)
                                                        .map(([id, skillData]) => {
                                                            const name = getMathSkillName(id, language);
                                                            const level = skillData.level || 1;
                                                            return (
                                                                <div
                                                                    key={`weak_${id}`}
                                                                    onClick={() => handleTaskClick({ topic: id, level: level, xp: 200, subject: 'Maths' })}
                                                                    className="bg-white border-2 border-slate-100 hover:border-red-200 hover:shadow-lg p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden group"
                                                                >
                                                                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                                                        <Zap className="w-12 h-12 text-red-600" />
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase">Urgent Mastery</div>
                                                                        <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">Level {level}</div>
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{name}</h4>
                                                                    
                                                                    {/* Mastery Bar */}
                                                                    <div className="mt-4 space-y-1.5">
                                                                        <div className="flex justify-between text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                                                            <span>{t.mastery}</span>
                                                                            <span>{getMasteryPercentage(level)}%</span>
                                                                        </div>
                                                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                                            <div 
                                                                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                                                                                style={{ width: `${getMasteryPercentage(level)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <p className="text-[10px] text-slate-400 mt-3 italic">Defeat this bottleneck to level up.</p>
                                                                    <div className="mt-4 flex items-center justify-between">
                                                                        <span className="text-xs font-bold text-red-500">+Adaptive XP</span>
                                                                        <Play className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Personalized Batch */}
                                        {(plan?.tasks || []).length > 0 && (
                                            <>
                                                <div className="mt-8 flex items-center gap-2 mb-4">
                                                    <Clock className="w-5 h-5 text-indigo-600" />
                                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Weekly Adaptive Quests</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                                    {(plan?.tasks || []).map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => handleTaskClick(task)}
                                                            className={`
                                                                group relative p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                                                                bg-white border-slate-100 hover:border-violet-300 hover:shadow-lg
                                                            `}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <span className={`
                                                                    px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                                    ${task.subject === 'Maths' ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}
                                                                `}>
                                                                    {task.subject}
                                                                </span>
                                                                <div className="bg-slate-100 text-slate-600 p-1.5 rounded-full group-hover:bg-violet-600 group-hover:text-white transition-all">
                                                                    <Play className="w-3.5 h-3.5 ml-0.5" />
                                                                </div>
                                                            </div>

                                                            <h3 className="font-bold text-slate-800 mb-1 leading-tight group-hover:text-violet-600 transition-colors">
                                                                {task.meta?.topic || task.topic}
                                                            </h3>
                                                            <p className="text-[10px] text-slate-500 line-clamp-2">
                                                                {task.subject === 'Maths' ? `DSE F${task.meta?.syllabus_layer || task.level} level challenge.` : `DSE English mastery target.`}
                                                            </p>

                                                            <div className="mt-4 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-violet-600 flex items-center gap-1">
                                                                    <Star className="w-3 h-3 fill-current" /> +200 XP
                                                                </span>
                                                                <span className="text-[9px] font-black text-slate-300 uppercase">
                                                                    Factory v1.0
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
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
                                                        <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">
                                                            {name}
                                                        </h4>
                                                        
                                                        {/* Mastery Bar */}
                                                        <div className="mt-3 space-y-1">
                                                            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                                <span>{t.mastery}</span>
                                                                <span>{getMasteryPercentage(level)}%</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-1000"
                                                                    style={{ width: `${getMasteryPercentage(level)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <p className="text-[10px] text-slate-500 mt-3 line-clamp-1 leading-tight opacity-70">
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
                                                            <span className="text-[10px] font-bold text-violet-500 flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-current" /> +{getDifficultyTierDetails(selectedLevels[id] !== undefined ? selectedLevels[id] : calculateTier(userSkills[id]?.level || 0, activeTab !== 'CHALLENGE'), language === 'zh').xp} XP
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
