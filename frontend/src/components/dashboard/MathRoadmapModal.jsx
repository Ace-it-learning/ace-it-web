import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, Calculator, PieChart, Shapes, Ruler, RefreshCcw, ChevronDown } from 'lucide-react';
import { MATH_MICRO_SKILLS, getMathSkillName, getMathSkillDesc, getMathSkillMinForm } from '../../constants/mathMicroSkills';
import { calculateTier, getTierMetadata, getMasteryStats, getDifficultyTierDetails } from '../../utils/masteryUtils';

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
            tabPersonalised: "Personalised",
            tabLibrary: "General",
            tabElite: "Elite",
            loading: "Calculating path...",
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
            }
        },
        zh: {
            questSystem: "數學任務",
            myPath: "我的數學路徑",
            subtitleWeekly: "完成 5 個目標以解鎖大師挑戰！",
            subtitleGeneral: "選擇一個主題以生成練習題。",
            tabPersonalised: "個人化任務",
            tabLibrary: "綜合",
            tabElite: "精英挑戰",
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
            }
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

        // For Math Factory Model quests, navigate to the specialized learn page
        navigate(`/maths/learn/${task.meta?.topic || task.topic}`, {
            state: {
                topic: task.meta?.topic || task.topic,
                taskId: task.id,
                title: task.meta?.topic || task.topic,
                xp: task.xp || 200, // Factory Quest standard fallback
                isFactoryQuest: true,
                level: task.meta?.difficulty || task.level
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
            const userLevel = userSkills[id]?.level || 0;
            return userLevel >= 5;
        }

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
                                { id: 'CHALLENGE', label: t.tabElite, icon: Zap }
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
                                {/* Batch Info */}
                                <div className="mb-6 flex items-center justify-between p-4 bg-violet-50 border border-violet-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-violet-600 text-white rounded-lg">
                                            <Shapes className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Your Adaptive Set</h4>
                                            <p className="text-xs text-slate-500">4 English • 2 Math Questions</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Set Bonus</div>
                                        <div className="text-lg font-black text-slate-900">+200 XP</div>
                                    </div>
                                </div>

                                {/* Tasks Grid */}
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
                                                                    <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                                                                        <select
                                                                            value={selectedLevels[id] !== undefined ? selectedLevels[id] : calculateTier(userSkills[id]?.level || 0, activeTab !== 'CHALLENGE')}
                                                                            onChange={(e) => setSelectedLevels(prev => ({ ...prev, [id]: parseInt(e.target.value) }))}
                                                                            className={`pl-2 pr-5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getDifficultyTierDetails(selectedLevels[id] !== undefined ? selectedLevels[id] : calculateTier(userSkills[id]?.level || 0, activeTab !== 'CHALLENGE'), language === 'zh').color} appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500`}
                                                                        >
                                                                            {[1, 2, 3, 4].map(lvl => (
                                                                                <option key={lvl} value={lvl} className="text-slate-800 bg-white">
                                                                                    {getDifficultyTierDetails(lvl, language === 'zh').displayName}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <ChevronDown className="absolute right-1 w-3 h-3 pointer-events-none opacity-60" />
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
                                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
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
