import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Compass, CheckCircle, Play, Map, Star, Clock, X, Trophy, Search, Sparkles, Zap, BookOpen, PenTool, Mic, MessageSquare, Layers, RefreshCcw, GraduationCap, Ear, ArrowRight, Calculator, Headphones, Target, Crown, Calendar, Coffee } from 'lucide-react';
import { useAvatar } from '../../context/AvatarContext';
import { MICRO_SKILLS, getSkillName, getSkillDesc, getSkillOutcome, getPaperBySkill, getSkillsByPaper } from '../../constants/microSkills';
import { getMathSkillName, getSkillsByCategory } from '../../constants/mathMicroSkills';
import { calculateTier, getTierMetadata, getMasteryStats } from '../../utils/masteryUtils';
import { LISTENING_MISSION_SHELLS } from '../../data/listeningMissionShells';
import { getGrammarMaxXp, getGrammarLevelOptionLabel } from '../../utils/grammarLabUtils';


// --- DSE Exam Date Helpers ---
// DSE English Paper 1 is always the first Tuesday of April each year.
function getDseEnglishExamDate(year) {
    const april = new Date(year, 3, 1); // April 1st
    const day = april.getDay(); // 0=Sun, 1=Mon, 2=Tue...
    const daysUntilTuesday = (2 - day + 7) % 7;
    april.setDate(1 + daysUntilTuesday);
    april.setHours(0, 0, 0, 0);
    return april;
}

function getCurrentDseEnglishExamDate() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let examDate = getDseEnglishExamDate(currentYear);
    // If exam has passed this year, use next year's date
    if (now > examDate) {
        examDate = getDseEnglishExamDate(currentYear + 1);
    }
    return examDate;
}

function isWithinMockExamWindow(months = 6) {
    const now = new Date();
    const examDate = getCurrentDseEnglishExamDate();
    const diffMs = examDate - now;
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
    return diffMonths <= months && diffMonths >= 0;
}

const RoadmapModal = ({ isOpen, onClose, initialFilter = 'READING' }) => {
    if (!isOpen) return null;
    
    const { user, profile } = useAuth();
    const { language, t } = useLanguage();
    const tier = (profile?.subscription_tier || 'free').toLowerCase();
    const isPaid = tier === 'pro' || tier === 'premium';
    const { activeAgent, activeAgentId } = useAvatar();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('WEEKLY'); // 'WEEKLY' | 'GENERAL'
    const [searchQuery, setSearchQuery] = useState('');
    const [userSkills, setUserSkills] = useState({});
    const [practicedSkills, setPracticedSkills] = useState([]);
    const [paperFilter, setPaperFilter] = useState(initialFilter); // 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING'
    const [selectedLevels, setSelectedLevels] = useState({}); // skillId -> level
    const [weeklyQuestStatus, setWeeklyQuestStatus] = useState({ completed: false });
    const [listeningMissions, setListeningMissions] = useState(LISTENING_MISSION_SHELLS);
    const [writingMissions, setWritingMissions] = useState([]);
    const [isWritingLoading, setIsWritingLoading] = useState(false);
    const [weeklyTheme, setWeeklyTheme] = useState(null);
    const [completedQuestIds, setCompletedQuestIds] = useState(new Set());

    // Helper: check if a quest has been completed based on recent quest results
    const isQuestCompleted = React.useCallback((quest) => {
        if (!completedQuestIds || completedQuestIds.size === 0) return false;
        
        // Speaking: match by drill ID (quest_id) or module+focus
        if (quest.category === 'speaking') {
            const navState = quest.nav?.state;
            const drillId = navState?.drill?.id;
            if (drillId && completedQuestIds.has('speaking_' + drillId)) return true;
            const pillarId = navState?.pillarId;
            const moduleMap = { criterion_a: 'delivery', criterion_b: 'interaction', criterion_c: 'language_patterns', criterion_d: 'ideas_organisation', discussion: 'interaction' };
            const moduleType = moduleMap[pillarId];
            if (moduleType && completedQuestIds.has(moduleType + '_' + quest.skillId)) return true;
        }
        
        // Listening: match by mission ID or topic
        if (quest.category === 'listening') {
            if (completedQuestIds.has(quest.skillId)) return true;
            const navState = quest.nav?.state;
            const questData = navState?.questData;
            if (questData?.title && completedQuestIds.has(String(questData.title).trim().toLowerCase())) return true;
        }
        
        // Writing: match by scenario title/topic
        if (quest.category === 'writing') {
            const navState = quest.nav?.state;
            const questData = navState?.questData;
            if (questData?.title && completedQuestIds.has(String(questData.title).trim().toLowerCase())) return true;
            if (questData?.topic && completedQuestIds.has(String(questData.topic).trim().toLowerCase())) return true;
            if (quest.title && completedQuestIds.has(String(quest.title).trim().toLowerCase())) return true;
        }
        
        // Reading: match by skill ID, questName, or title
        if (quest.category === 'reading') {
            if (completedQuestIds.has('Reading_' + quest.skillId)) return true;
            if (completedQuestIds.has(quest.skillId)) return true;
            if (quest.title && completedQuestIds.has(String(quest.title).trim().toLowerCase())) return true;
            if (quest.title && completedQuestIds.has('reading_' + String(quest.title).trim().toLowerCase().replace(/\s+/g, '_'))) return true;
        }
        
        // Grammar: match by skill ID
        if (quest.category === 'grammar') {
            if (completedQuestIds.has(quest.skillId)) return true;
        }
        
        // Math: match by skill/topic
        if (quest.category === 'algebra' || quest.category === 'geometry' || quest.category === 'data') {
            if (completedQuestIds.has(quest.skillId)) return true;
        }
        
        // Weekly challenges: match by task ID
        if (quest.isWeeklyChallenge) {
            if (completedQuestIds.has(quest.id)) return true;
        }
        
        return false;
    }, [completedQuestIds]);

    // Fetch Listening/Writing Missions on open
    useEffect(() => {
        if (!isOpen) return;

        // Must use VITE_API_URL in production (static hosts do not proxy /api like Vite dev).
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const API_BASE = `${API_URL}/api`;

        const fetchWithTimeout = (url, opts = {}, ms = 15000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), ms);
            return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id));
        };

        const fetchListening = async () => {
            try {
                const res = await fetchWithTimeout(`${API_BASE}/lab/listening`);
                if (res.ok) {
                    const data = await res.json();
                    const byId = new Map((data || []).map((m) => [m.id, m]));
                    // Canonical roadmap uses 20 shells; merge backend fields when IDs match.
                    const merged = LISTENING_MISSION_SHELLS.map((shell) => ({
                        ...shell,
                        ...(byId.get(shell.id) || {})
                    }));
                    setListeningMissions(merged);
                } else {
                    // If API fails (emulator/service hiccup), still render canonical shells.
                    setListeningMissions(LISTENING_MISSION_SHELLS);
                }
            } catch (e) {
                console.error("Failed to fetch listening missions", e);
                setListeningMissions(LISTENING_MISSION_SHELLS);
            }
        };

        const fetchWriting = async () => {
            try {
                setIsWritingLoading(true);
                // Add cache-busting query param to avoid stale cached data
                const cacheBuster = `cb=${Date.now()}`;
                const res = await fetchWithTimeout(`${API_BASE}/writing/scenarios?${cacheBuster}`);
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

    const fetchWithTimeout = (url, opts = {}, ms = 15000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id));
    };

    const fetchUserSkills = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const subject = (activeAgentId === 'math' || activeAgentId === 'maths') ? 'maths' : 'english';
            const res = await fetchWithTimeout(`${API_URL}/api/microskills/${user.uid}?subject=${subject}`);
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
            const res = await fetchWithTimeout(`${API_URL}/api/quests/personalized?uid=${user.uid}&subject=english`);
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
            const res = await fetchWithTimeout(`${API_URL}/api/lab/weekly-theme`);
            if (res.ok) {
                const data = await res.json();
                setWeeklyTheme(data);
            }
        } catch (error) {
            console.warn("Failed to load weekly theme", error);
        }
    };

    const fetchCompletedQuests = async () => {
        if (!user?.uid) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetchWithTimeout(`${API_URL}/api/quests/history?uid=${user.uid}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                const ids = new Set();
                (data.results || []).forEach(r => {
                    // Build composite keys for matching
                    if (r.quest_id) ids.add('speaking_' + r.quest_id);
                    if (r.module && r.focus) ids.add(r.module + '_' + r.focus);
                    if (r.module && r.questName) ids.add(r.module + '_' + r.questName);
                    if (r.topic) ids.add(String(r.topic).toLowerCase().replace(/\s+/g, '_'));
                    if (r.paperId) ids.add(r.paperId);
                    // Also store raw topic for flexible matching
                    if (r.topic) ids.add(String(r.topic).trim().toLowerCase());
                    if (r.questName) ids.add(String(r.questName).trim().toLowerCase());
                });
                setCompletedQuestIds(ids);
            }
        } catch (e) {
            console.warn('Failed to load quest history', e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (user?.uid) {
                fetchRoadmap();
                fetchUserSkills();
                fetchWeeklyTheme();
                fetchCompletedQuests();
            } else {
                // If user isn't resolved yet, don't stay in loading forever
                setLoading(false);
            }
        }
    }, [user, isOpen]);

    // When opening from navigation (e.g. Back from Listening briefing), apply the requested paper tab.
    useEffect(() => {
        if (isOpen && initialFilter) {
            setPaperFilter(initialFilter);
        }
    }, [isOpen, initialFilter]);

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
            const res = await fetchWithTimeout(`${API_URL}/api/roadmap/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: user.uid, subject: getGenSubject() })
            }, 30000);
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

    const normalizeMissionLevel = (lvl) => {
        if (lvl === undefined || lvl === null) return '5';
        const s = String(lvl).trim();
        if (s.includes('5**') || s === '7' || s.toLowerCase().includes('elite')) return '7';
        if (s.includes('5*') || s === '6') return '6';
        if (s === '5' || s.toLowerCase().includes('dse')) return '5';
        if (s === '4' || s.toLowerCase().includes('medium')) return '4';
        if (s === '3' || s.toLowerCase().includes('easy')) return '3';
        return '5';
    };

    const getDifficultyMeta = (lvl) => {
        const normalized = normalizeMissionLevel(lvl);
        if (normalized === '7') return { label: 'Elite / Advanced (Level 5**)', className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' };
        if (normalized === '5') return { label: 'DSE Standard (Level 5)', className: 'bg-blue-50 text-blue-700 border-blue-100' };
        if (normalized === '4') return { label: 'Medium (Level 4)', className: 'bg-amber-50 text-amber-700 border-amber-100' };
        return { label: 'Easy (Level 3)', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    };

    /** When a mission has no `outcome` / `learningOutcome`, derive text from title (and genre for writing). */
    const listeningQuestOutcome = (mission) => {
        const explicit = mission?.outcome || mission?.learningOutcome;
        if (explicit) return explicit;
        const title = (mission?.title || 'this listening scenario').trim();
        const flavours = [
            (t) =>
                `Strategic capture and distractor control for "${t}".`,
            (t) =>
                `Accurate synthesis of audio and data-file cues on "${t}".`,
            (t) =>
                `Selective attention and Paper 3 integration for "${t}".`,
        ];
        const i = title.length % flavours.length;
        return flavours[i](title);
    };

    const writingQuestOutcome = (mission) => {
        const explicit = mission?.outcome || mission?.learningOutcome;
        if (explicit) return explicit;
        const title = (mission?.title || 'this writing prompt').trim();
        const genre = (mission?.genre || '').trim();
        const genreTag = genre ? ` (${genre})` : '';
        const flavours = [
            (t, g) =>
                `Clear thesis, purposeful paragraphs, and appropriate tone for "${t}"${g}.`,
            (t, g) =>
                `Cohesive structure and examiner-ready argumentation on "${t}"${g}.`,
            (t, g) =>
                `Genre control: register, cohesion, and evaluative language for "${t}"${g}.`,
        ];
        const i = (title.length + genre.length) % flavours.length;
        return flavours[i](title, genreTag);
    };

    // --- ROBUST GATING CALCULATION (PRE-FILTER) ---
    const questLabGating = (() => {
        const lockedIds = new Set();
        if (isPaid) return { lockedIds };

        // 1. Listening Missions - First one is free
        listeningMissions.forEach((m, idx) => {
            if (idx > 0) lockedIds.add(m.id);
        });

        // 2. Writing Missions - First one is free
        writingMissions.forEach((m, idx) => {
            if (idx > 0) lockedIds.add(m.id);
        });

        // 3. General Skills - First of each category is free
        // Reading
        Object.keys(MICRO_SKILLS).filter(k => k.startsWith('reading_')).forEach((id, idx) => { if (idx > 0) lockedIds.add(id); });
        // Speaking (Phase 26: All pillars are unlocked for entry to access free quests inside)
        // Object.keys(MICRO_SKILLS).filter(k => k.startsWith('speaking_') && !MICRO_SKILLS[k].isGranular).forEach((id, idx) => { if (idx > 0) lockedIds.add(id); });
        // Writing Genres
        Object.keys(MICRO_SKILLS).filter(k => k.startsWith('writing_genre_')).forEach((id, idx) => { if (idx > 0) lockedIds.add(id); });

        return { lockedIds };
    })();

    const grammarGating = (() => {
        const lockedIds = new Set();
        if (isPaid) return { lockedIds };
        const grammarIds = Object.keys(MICRO_SKILLS).filter(id => id.startsWith('grammar_'));
        grammarIds.forEach((id, idx) => { if (idx > 0) lockedIds.add(id); });
        return { lockedIds };
    })();

    const handleTaskClick = (task) => {
        // Targeted Growth (Summary Cards) are all locked for free users
        if (!isPaid && task.isTargetedGrowth) {
            onClose();
            navigate('/subscription');
            return;
        }

        // Individual Tasks (Weekly/Grammar/Quest Lab) gating
        if (!isPaid && task.locked) {
            onClose();
            navigate('/subscription');
            return;
        }
        console.log("RoadmapModal: Clicked Task", task);
        if (task.locked) return;
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
                if (topic.includes('writing') || skillId === 'writing_quest') {
                    navigate('/writing/quest', { state: { ...baseState, isAutoLoad: true } });
                    return;
                }
                if (topic.includes('listening') || skillId === 'listening_quest') {
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

                if (skillId === 'listening_quest') {
                    navigate('/lab', { state: { paper: 'listening' } }); // Or a better landing page
                    return;
                }

                if (skillId === 'writing_quest') {
                    navigate('/writing/quest');
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
                const taskXp = getGrammarMaxXp(targetLevel);
                navigate(`/lab?topic=${task.topic}&level=${targetLevel}&taskId=${task.id}`, { 
                    state: { 
                        topic: task.topic, 
                        taskId: task.id,
                        xp: taskXp,
                        taskXp,
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
            // EXEMPT: writing_quest and listening_quest entry points
            if ((id.startsWith('writing_') && !id.startsWith('writing_genre_') && id !== 'writing_quest') || (id.startsWith('listening_') && id !== 'listening_quest')) return false;
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

    // Compute weekKey at component scope for stable memoization
    const getWeekKey = () => {
        const now = new Date();
        const hkOffset = 8 * 60;
        const localOffset = now.getTimezoneOffset();
        const hkTime = new Date(now.getTime() + (hkOffset + localOffset) * 60 * 1000);
        const dayOfWeek = hkTime.getDay();
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const mondayDate = new Date(hkTime);
        mondayDate.setDate(hkTime.getDate() - daysSinceMonday);
        mondayDate.setHours(0, 0, 0, 0);
        return {
            weekKey: mondayDate.getFullYear() + '-' + String(mondayDate.getMonth() + 1).padStart(2, '0') + '-' + String(mondayDate.getDate()).padStart(2, '0'),
            mondayDate
        };
    };
    const { weekKey, mondayDate } = getWeekKey();

    // --- WEEKLY PLAN GENERATOR (Mon-Sat focus, Sun rest) ---
    const generateWeeklyPlan = () => {
        const isMath = activeAgentId === 'math' || activeAgentId === 'maths';
        
        let seed = 0;
        for (let i = 0; i < weekKey.length; i++) seed = (seed * 31 + weekKey.charCodeAt(i)) >>> 0;
        const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        
        const shuffle = (arr) => {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };
        
        const take = (arr, n) => arr.slice(0, Math.min(n, arr.length));
        
        if (isMath) {
            const categories = [
                { id: 'algebra', label: 'Algebra', labelZh: '代數', icon: Calculator, color: 'indigo', skills: getSkillsByCategory('algebra') },
                { id: 'geometry', label: 'Geometry & Trig', labelZh: '幾何與三角', icon: Map, color: 'blue', skills: getSkillsByCategory('geometry') },
                { id: 'data', label: 'Data & Statistics', labelZh: '數據與統計', icon: Layers, color: 'emerald', skills: getSkillsByCategory('data') }
            ];
            
            const scoredCats = categories.map(cat => {
                const skillLevels = cat.skills.map(sid => ({ id: sid, level: userSkills[sid]?.level || 0 }));
                const avgLevel = skillLevels.length ? skillLevels.reduce((s, sk) => s + sk.level, 0) / skillLevels.length : 0;
                const unpracticed = skillLevels.filter(sk => sk.level < 1.5).length;
                const priorityScore = avgLevel - (unpracticed * 0.5);
                const sortedSkills = [...skillLevels].sort((a, b) => a.level - b.level);
                return { ...cat, avgLevel, unpracticed, priorityScore, sortedSkills };
            });
            
            const sortedCats = [...scoredCats].sort((a, b) => a.priorityScore - b.priorityScore);
            const weakestCat = sortedCats[0];
            
            const buildMathDay = (cat) => {
                const quests = [];
                const targetSkills = take(cat.sortedSkills, 4);
                targetSkills.forEach((sk) => {
                    const targetLevel = String(Math.max(3, Math.min(5, Math.ceil(sk.level || 1))));
                    quests.push({
                        id: sk.id,
                        title: typeof getMathSkillName === 'function' ? getMathSkillName(sk.id, language) : sk.id,
                        titleZh: typeof getMathSkillName === 'function' ? getMathSkillName(sk.id, 'zh') : sk.id,
                        skillId: sk.id,
                        level: targetLevel,
                        xp: getMasteryStats(targetLevel).xp,
                        type: 'PRACTICE',
                        category: cat.id,
                        nav: { path: '/maths/learn/' + sk.id, state: { topic: sk.id, level: targetLevel, isFactoryQuest: true } }
                    });
                });
                return quests;
            };
            
            const days = [
                { dayKey: 'monday', label: t('roadmap.monday'), labelShort: 'Mon', isRest: false, focusCat: sortedCats[0] },
                { dayKey: 'tuesday', label: t('roadmap.tuesday'), labelShort: 'Tue', isRest: false, focusCat: sortedCats[1] || sortedCats[0] },
                { dayKey: 'wednesday', label: t('roadmap.wednesday'), labelShort: 'Wed', isRest: false, focusCat: sortedCats[2] || sortedCats[0] },
                { dayKey: 'thursday', label: t('roadmap.thursday'), labelShort: 'Thu', isRest: false, focusCat: sortedCats[0] },
                { dayKey: 'friday', label: t('roadmap.friday'), labelShort: 'Fri', isRest: false, focusCat: sortedCats[1] || sortedCats[0] },
                { dayKey: 'saturday', label: t('roadmap.saturday'), labelShort: 'Sat', isRest: false, focusCat: null },
                { dayKey: 'sunday', label: t('roadmap.sunday'), labelShort: 'Sun', isRest: true, focusCat: null }
            ];
            
            const dayResults = days.map((d) => {
                if (d.isRest) {
                    return { ...d, focus: null, focusLabel: t('roadmap.rest_day'), focusLabelZh: '休息日', icon: Coffee, color: 'slate', quests: [] };
                }
                if (d.dayKey === 'saturday') {
                    const isMockWeek = isWithinMockExamWindow(6);
                    if (isMockWeek) {
                        const mockQuests = [
                            { id: 'mock_p1', title: 'Mock Exam Paper 1', titleZh: '模擬考試卷一', icon: BookOpen, color: 'blue', type: 'MOCK_EXAM', xp: 500, nav: { path: '/mock-eng/reading', state: { isMockMode: true } } },
                            { id: 'mock_p2', title: 'Mock Exam Paper 2', titleZh: '模擬考試卷二', icon: PenTool, color: 'emerald', type: 'MOCK_EXAM', xp: 500, nav: { path: '/mock-eng/writing', state: { isMockMode: true } } },
                            { id: 'mock_p3', title: 'Mock Exam Paper 3', titleZh: '模擬考試卷三', icon: Headphones, color: 'amber', type: 'MOCK_EXAM', xp: 500, nav: { path: '/mock-eng/listening', state: { isMockMode: true } } }
                        ];
                        return {
                            ...d,
                            focus: 'mock_exam',
                            focusLabel: 'Mock Exam',
                            focusLabelZh: '模擬考試',
                            icon: GraduationCap,
                            color: 'indigo',
                            quests: mockQuests,
                            isMockExam: true
                        };
                    }
                    const challengeQuests = [
                        { id: 'math_foundation', title: 'Section A1 Foundation', titleZh: '卷A1 基礎', icon: Zap, color: 'emerald', type: 'MATH_CHALLENGE', xp: 250, nav: { path: '/maths/lab', state: { topic: 'math_alg_formulas' } } },
                        { id: 'math_standard', title: 'Section A2 Mastery', titleZh: '卷A2 精通', icon: Layers, color: 'blue', type: 'MATH_CHALLENGE', xp: 250, nav: { path: '/maths/lab', state: { topic: 'math_alg_quadratics' } } },
                        { id: 'weekly_math', title: 'Section B Challenge', titleZh: '卷B 挑戰', icon: Trophy, color: 'orange', type: 'MATH_CHALLENGE', xp: 250, nav: { path: '/maths/lab', state: { topic: 'integrated_challenge' } } }
                    ];
                    return {
                        ...d,
                        focus: 'weekly_challenge',
                        focusLabel: 'Weekly Challenges',
                        focusLabelZh: '每週挑戰',
                        icon: Trophy,
                        color: 'orange',
                        quests: challengeQuests,
                        isWeeklyChallenge: true
                    };
                }
                const cat = d.focusCat;
                const quests = buildMathDay(cat);
                return {
                    ...d,
                    focus: cat.id,
                    focusLabel: cat.label,
                    focusLabelZh: cat.labelZh,
                    icon: Calculator,
                    color: cat.color,
                    quests,
                    avgLevel: cat.avgLevel
                };
            });
            
            const dayPlanText = sortedCats.map(c => c.label).join(t('roadmap.day_plan_separator'));
            const isMockWeekMath = isWithinMockExamWindow(6);
            const tutorMessage = {
                intro: t('roadmap.tutor_weekly_message_intro').replace('{{agentName}}', activeAgent?.name || 'Tutor'),
                body: t('roadmap.tutor_weekly_message_math').replace('{{weakestArea}}', weakestCat.label),
                strategy: t('roadmap.tutor_weekly_message_strategy').replace('{{dayPlans}}', dayPlanText),
                challenge: isMockWeekMath ? t('roadmap.tutor_weekly_message_mock') : t('roadmap.tutor_weekly_message_challenge'),
                bonus: t('roadmap.tutor_weekly_message_bonus')
            };
            
            return { weekKey, mondayDate, days: dayResults, tutorMessage, weakestArea: weakestCat, challengeCompleted: weeklyQuestStatus?.completed || false };
        }
        
        const isMockWeek = isWithinMockExamWindow(6);
        
        const papers = [
            { id: 'reading', label: 'Reading', labelZh: '閱讀', icon: BookOpen, color: 'blue', skills: getSkillsByPaper('reading') },
            { id: 'writing', label: 'Writing', labelZh: '寫作', icon: PenTool, color: 'emerald', skills: getSkillsByPaper('writing') },
            { id: 'speaking', label: 'Speaking', labelZh: '說話', icon: Mic, color: 'rose', skills: getSkillsByPaper('speaking') },
            { id: 'listening', label: 'Listening', labelZh: '聆聽', icon: Headphones, color: 'amber', skills: getSkillsByPaper('listening') }
        ];
        
        const scoredPapers = papers.map(p => {
            const skillLevels = p.skills.map(sid => ({ id: sid, level: userSkills[sid]?.level || 0 }));
            const avgLevel = skillLevels.length ? skillLevels.reduce((s, sk) => s + sk.level, 0) / skillLevels.length : 0;
            const unpracticed = skillLevels.filter(sk => sk.level < 1.5).length;
            const priorityScore = avgLevel - (unpracticed * 0.5);
            const sortedSkills = [...skillLevels].sort((a, b) => a.level - b.level);
            return { ...p, avgLevel, unpracticed, priorityScore, sortedSkills };
        });
        
        const grammarSkills = getSkillsByPaper('grammar');
        const grammarLevels = grammarSkills.map(sid => ({ id: sid, level: userSkills[sid]?.level || 0 }));
        const grammarAvg = grammarLevels.length ? grammarLevels.reduce((s, g) => s + g.level, 0) / grammarLevels.length : 7;
        const sortedGrammar = [...grammarLevels].sort((a, b) => a.level - b.level);
        
        const shuffledWriting = shuffle([...writingMissions]);
        const shuffledListening = shuffle([...listeningMissions]);
        
        const buildReadingDay = () => {
            const skills = take(scoredPapers.find(p => p.id === 'reading').sortedSkills, 4);
            return skills.map(sk => {
                const targetLevel = String(Math.max(3, Math.min(5, Math.ceil(sk.level || 1))));
                return {
                    id: sk.id,
                    title: getSkillName(sk.id, language),
                    titleZh: getSkillName(sk.id, 'zh'),
                    skillId: sk.id,
                    level: targetLevel,
                    xp: getMasteryStats(targetLevel).xp,
                    type: 'PRACTICE',
                    category: 'reading',
                    nav: {
                        path: '/lab?topic=' + sk.id + '&level=' + targetLevel + '&taskId=' + sk.id,
                        state: {
                            topic: sk.id,
                            taskId: sk.id,
                            autoStart: { topic: sk.id, focus: ['vocabulary', 'comprehension'], level: targetLevel }
                        }
                    }
                };
            });
        };
        
        const buildWritingDay = () => {
            const scenarios = take(shuffledWriting, 4);
            return scenarios.map((sc, idx) => ({
                id: sc.id || 'writing_' + idx,
                title: sc.title || sc.genre || 'Writing Practice',
                titleZh: sc.title || sc.genre || '寫作練習',
                skillId: sc.id,
                level: sc.level || '5',
                xp: 250,
                type: 'PRACTICE',
                category: 'writing',
                nav: { path: '/writing/quest', state: { questData: sc } }
            }));
        };
        
        const buildSpeakingDay = () => {
            // Map skill IDs to pillar info with correct module params
            // Module values must match what the backend /api/speaking/quest/generate expects
            const pillarInfo = {
                speaking_delivery: { route: '/speaking/quest/delivery', pillar: 'criterion_a', module: 'delivery', drillPrefix: 'a' },
                speaking_strategies: { route: '/speaking/quest/interaction-lab', pillar: 'criterion_b', module: 'interaction', drillPrefix: 'b' },
                speaking_language: { route: '/speaking/quest/language', pillar: 'criterion_c', module: 'language_patterns', drillPrefix: 'c' },
                speaking_organization: { route: '/speaking/quest/ideas', pillar: 'criterion_d', module: 'ideas_organisation', drillPrefix: 'd' },
                speaking_groupDiscussion: { route: '/speaking/quest/interaction', pillar: 'discussion', module: 'interaction', drillPrefix: 'disc' }
            };
            
            const skills = take(scoredPapers.find(p => p.id === 'speaking').sortedSkills, 4);
            return skills.map((sk, idx) => {
                const targetLevel = String(Math.max(3, Math.min(5, Math.ceil(sk.level || 1))));
                const info = pillarInfo[sk.id];
                
                // Generate deterministic drill ID based on week seed + skill + index
                // This ensures the same drill is suggested all week, but changes weekly
                const drillNum = (Math.floor(rng() * 20) + 1); // 1-20
                const drillId = info ? (info.drillPrefix + '_' + drillNum) : ('a_' + drillNum);
                const route = info ? info.route : '/speaking/quest/delivery';
                const moduleType = info ? info.module : 'delivery';
                const pillarId = info ? info.pillar : 'criterion_a';
                
                return {
                    id: sk.id,
                    title: getSkillName(sk.id, language),
                    titleZh: getSkillName(sk.id, 'zh'),
                    skillId: sk.id,
                    level: targetLevel,
                    xp: getMasteryStats(targetLevel).xp,
                    type: 'PRACTICE',
                    category: 'speaking',
                    nav: {
                        path: route + '?module=' + moduleType + '&topic=' + drillId + '&level=' + targetLevel,
                        state: {
                            drill: { id: drillId, title: getSkillName(sk.id, language), level: targetLevel },
                            pillarId: pillarId
                        }
                    }
                };
            });
        };
        
        const buildListeningDay = () => {
            const missions = take(shuffledListening, 4);
            return missions.map((m) => {
                const targetLevel = m.level || '5';
                return {
                    id: m.id,
                    title: m.title || 'Listening Mission',
                    titleZh: m.title || '聆聽任務',
                    skillId: m.id,
                    level: targetLevel,
                    xp: 250,
                    type: 'PRACTICE',
                    category: 'listening',
                    nav: {
                        path: '/listening/briefing/' + m.id,
                        state: { questData: m, targetLevel: targetLevel, targetXp: 250, isNewSession: true }
                    }
                };
            });
        };
        
        const buildGrammarDay = () => {
            const skills = take(sortedGrammar, 4);
            return skills.map(sk => {
                const targetLevel = String(Math.max(3, Math.min(5, Math.ceil(sk.level || 1))));
                const taskXp = getGrammarMaxXp(targetLevel);
                return {
                    id: sk.id,
                    title: getSkillName(sk.id, language),
                    titleZh: getSkillName(sk.id, 'zh'),
                    skillId: sk.id,
                    level: targetLevel,
                    xp: taskXp,
                    type: 'GRAMMAR_LAB',
                    category: 'grammar',
                    nav: {
                        path: '/lab?topic=' + sk.id + '&level=' + targetLevel + '&taskId=' + sk.id,
                        state: {
                            topic: sk.id,
                            taskId: sk.id,
                            xp: taskXp,
                            taskXp: taskXp,
                            isGrammarLab: true,
                            autoStart: { topic: sk.id, level: targetLevel, focus: ['grammar'] }
                        }
                    }
                };
            });
        };
        
        const buildWeeklyChallengeDay = () => {
            const challenges = [
                { id: 'weekly_reading', title: 'Reading Challenge', titleZh: '閱讀挑戰', icon: BookOpen, color: 'blue', type: 'WEEKLY_QUEST', topic: 'reading_weekly' },
                { id: 'weekly_writing', title: 'Writing Challenge', titleZh: '寫作挑戰', icon: PenTool, color: 'emerald', type: 'WEEKLY_QUEST', topic: 'writing_weekly' },
                { id: 'weekly_listening', title: 'Listening Challenge', titleZh: '聆聽挑戰', icon: Headphones, color: 'amber', type: 'WEEKLY_QUEST', topic: 'listening_weekly' },
                { id: 'weekly_speaking', title: 'Speaking Challenge', titleZh: '說話挑戰', icon: Mic, color: 'rose', type: 'SPEAKING_CHALLENGE', topic: 'speaking_weekly', isDiscussion: true }
            ];
            return challenges.map(c => ({
                id: c.id,
                title: c.title,
                titleZh: c.titleZh,
                skillId: c.id,
                level: '5',
                xp: 250,
                type: c.type,
                category: c.topic.replace('_weekly', ''),
                isWeeklyChallenge: true,
                isDiscussion: c.isDiscussion,
                nav: c.isDiscussion
                    ? { path: '/speaking/quest/interaction', state: { topic: c.topic, challengeType: 'weekly', level: '5' } }
                    : c.topic.includes('reading')
                        ? { path: '/lab?topic=' + c.topic + '&level=5&taskId=' + c.id, state: { isWeeklyQuest: true, level: '5', topic: c.topic, taskId: c.id } }
                        : c.topic.includes('writing')
                            ? { path: '/writing/quest', state: { isWeeklyQuest: true, level: '5', topic: c.topic, taskId: c.id, isAutoLoad: true } }
                            : c.topic.includes('listening')
                                ? { path: '/listening/briefing/' + c.id, state: { isWeeklyQuest: true, level: '5', topic: c.topic, taskId: c.id, targetLevel: '5', isNewSession: true } }
                                : { path: '/speaking/quest/interaction', state: { topic: c.topic, challengeType: 'weekly', level: '5' } }
            }));
        };
        
        const orderedPapers = [...scoredPapers].sort((a, b) => a.priorityScore - b.priorityScore);

        const buildMockExamDay = () => {
            const mocks = [
                { id: 'mock_reading', title: 'Reading Mock (Paper 1)', titleZh: '閱讀模擬考試（卷一）', skillId: 'mock_p1', level: '5', xp: 500, type: 'MOCK_EXAM', category: 'reading', nav: { path: '/mock-eng/reading', state: { isMockMode: true } } },
                { id: 'mock_writing', title: 'Writing Mock (Paper 2)', titleZh: '寫作模擬考試（卷二）', skillId: 'mock_p2', level: '5', xp: 500, type: 'MOCK_EXAM', category: 'writing', nav: { path: '/mock-eng/writing', state: { isMockMode: true } } },
                { id: 'mock_listening', title: 'Listening Mock (Paper 3)', titleZh: '聆聽模擬考試（卷三）', skillId: 'mock_p3', level: '5', xp: 500, type: 'MOCK_EXAM', category: 'listening', nav: { path: '/mock-eng/listening', state: { isMockMode: true } } },
                { id: 'mock_speaking', title: 'Speaking Mock (Paper 4)', titleZh: '說話模擬考試（卷四）', skillId: 'mock_p4', level: '5', xp: 500, type: 'MOCK_EXAM', category: 'speaking', nav: { path: '/mock-eng/speaking', state: { isMockMode: true } } }
            ];
            return mocks;
        };

        const dayBuilders = {
            monday: () => buildDayForPaper(orderedPapers[0]),
            tuesday: () => buildDayForPaper(orderedPapers[1]),
            wednesday: () => buildDayForPaper(orderedPapers[2]),
            thursday: () => buildDayForPaper(orderedPapers[3]),
            friday: buildGrammarDay,
            saturday: isMockWeek ? buildMockExamDay : buildWeeklyChallengeDay,
            sunday: () => []
        };
        
        function buildDayForPaper(paper) {
            if (!paper) return [];
            if (paper.id === 'reading') return buildReadingDay();
            if (paper.id === 'writing') return buildWritingDay();
            if (paper.id === 'speaking') return buildSpeakingDay();
            if (paper.id === 'listening') return buildListeningDay();
            return [];
        }
        
        const dayConfigs = [
            { dayKey: 'monday', label: t('roadmap.monday'), labelShort: 'Mon', isRest: false, builder: 'monday' },
            { dayKey: 'tuesday', label: t('roadmap.tuesday'), labelShort: 'Tue', isRest: false, builder: 'tuesday' },
            { dayKey: 'wednesday', label: t('roadmap.wednesday'), labelShort: 'Wed', isRest: false, builder: 'wednesday' },
            { dayKey: 'thursday', label: t('roadmap.thursday'), labelShort: 'Thu', isRest: false, builder: 'thursday' },
            { dayKey: 'friday', label: t('roadmap.friday'), labelShort: 'Fri', isRest: false, builder: 'friday' },
            { dayKey: 'saturday', label: t('roadmap.saturday'), labelShort: 'Sat', isRest: false, builder: 'saturday' },
            { dayKey: 'sunday', label: t('roadmap.sunday'), labelShort: 'Sun', isRest: true, builder: 'sunday' }
        ];
        
        const paperMeta = {
            reading: { icon: BookOpen, color: 'blue' },
            writing: { icon: PenTool, color: 'emerald' },
            speaking: { icon: Mic, color: 'rose' },
            listening: { icon: Headphones, color: 'amber' },
            grammar: { icon: Layers, color: 'violet' },
            weekly_challenge: { icon: Trophy, color: 'orange' },
            mock_exam: { icon: GraduationCap, color: 'indigo' }
        };
        
        const dayResults = dayConfigs.map(d => {
            if (d.isRest) {
                return { ...d, focus: null, focusLabel: t('roadmap.rest_day'), focusLabelZh: '休息日', icon: Coffee, color: 'slate', quests: [] };
            }
            const quests = dayBuilders[d.builder]();
            const focusPaper = d.builder === 'friday' ? { id: 'grammar', label: 'Grammar', labelZh: '語法' }
                : d.builder === 'saturday' && isMockWeek ? { id: 'mock_exam', label: 'Mock Exam', labelZh: '模擬考試' }
                : d.builder === 'saturday' ? { id: 'weekly_challenge', label: 'Weekly Challenges', labelZh: '每週挑戰' }
                : orderedPapers[['monday', 'tuesday', 'wednesday', 'thursday'].indexOf(d.builder)];
            const meta = paperMeta[focusPaper?.id] || paperMeta.reading;
            return {
                ...d,
                focus: focusPaper?.id,
                focusLabel: language === 'zh' && focusPaper?.labelZh ? focusPaper.labelZh : (focusPaper?.label || 'Practice'),
                icon: meta.icon,
                color: meta.color,
                quests
            };
        });
        
        const weakestPaper = orderedPapers[0];
        const dayPlanText = orderedPapers.map(p => language === 'zh' ? p.labelZh : p.label).join(t('roadmap.day_plan_separator'));
        const tutorMessage = {
            intro: t('roadmap.tutor_weekly_message_intro').replace('{{agentName}}', activeAgent?.name || 'Tutor'),
            body: t('roadmap.tutor_weekly_message_weakness')
                .replace('{{weakestArea}}', language === 'zh' ? weakestPaper.labelZh : weakestPaper.label)
                .replace('{{level}}', weakestPaper.avgLevel.toFixed(1)),
            strategy: t('roadmap.tutor_weekly_message_strategy').replace('{{dayPlans}}', dayPlanText),
            challenge: isMockWeek ? t('roadmap.tutor_weekly_message_mock') : t('roadmap.tutor_weekly_message_challenge'),
            bonus: t('roadmap.tutor_weekly_message_bonus')
        };
        
        return {
            weekKey,
            mondayDate,
            days: dayResults,
            tutorMessage,
            weakestArea: weakestPaper,
            challengeCompleted: weeklyQuestStatus?.completed || false
        };
    };
    
    const weeklyPlan = useMemo(() => generateWeeklyPlan(), [weekKey, activeAgentId, writingMissions.length, listeningMissions.length]);
    
    const getHkDayIndex = () => {
        const now = new Date();
        const hkOffset = 8 * 60;
        const localOffset = now.getTimezoneOffset();
        const hkTime = new Date(now.getTime() + (hkOffset + localOffset) * 60 * 1000);
        const dow = hkTime.getDay();
        return dow === 0 ? 6 : dow - 1;
    };
    const todayIndex = getHkDayIndex();
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

                    <div className="relative z-10 text-white flex flex-col gap-5 pr-12 sm:pr-14">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 w-full min-w-0">
                            <div className="text-left min-w-0 lg:max-w-[min(100%,28rem)]">
                                <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight mb-0.5">{subjectInfo.title}</h2>
                                <p className="text-white/85 text-[10px] md:text-xs font-medium">
                                    {t('roadmap.complete_quest_xp')}
                                </p>
                            </div>

                            {/* Tab buttons: spaced from title; no outer “pill” ring; inactive = dark tint (not peach-on-orange) */}
                            <div className="flex flex-wrap gap-2 lg:justify-end lg:flex-shrink-0">
                                {[
                                    { id: 'WEEKLY', label: t('roadmap.targeted_growth'), icon: Clock },
                                    { id: 'GRAMMAR', label: t('roadmap.grammar_lab'), icon: Layers },
                                    { id: 'GENERAL', label: t('roadmap.quests_lab'), icon: Search }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        type="button"
                                        className={`
                                            flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 whitespace-nowrap border-0
                                            ${activeTab === tab.id
                                                ? 'bg-[#007AFF] text-white shadow-lg ring-2 ring-white/30'
                                                : 'bg-black/35 text-white hover:bg-black/45 hover:text-white'
                                            }
                                        `}
                                    >
                                        <tab.icon className="w-4 h-4 shrink-0" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
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
                                {/* Weekly Adaptive Quest Card */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Weekly Challenge Quests</h3>
                                    </div>
                                    {weeklyTheme && (
                                        <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2 animate-in slide-in-from-right-4 duration-500">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tight">Week {weeklyTheme.weekNumber || 18} Theme: {weeklyTheme.theme}</span>
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
                                                        handleTaskClick({
                                                            id: quest.id,
                                                            type: quest.type,
                                                            topic: quest.topic,
                                                            title: quest.title,
                                                            xp: 250,
                                                            level: '5',
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
                                                            <h4 className="font-bold text-white text-[15px] flex items-center gap-2">
                                                                {quest.title}
                                                                {!isPaid && <Crown className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />}
                                                            </h4>
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

                                {/* Targeted Growth Strategy - Weekly Plan */}
                                <div className={`mb-10 relative ${!isPaid ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {!isPaid && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                                            <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl">
                                                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                                                <span className="text-white font-black text-sm uppercase tracking-wider">
                                                    Pro / Premium Only
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                                        <Calendar className="w-6 h-6 text-indigo-600 shrink-0" />
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm sm:text-base leading-tight">
                                                {t('roadmap.this_week_focus')}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 tracking-wide">
                                                {t('roadmap.week_of')} {weeklyPlan.mondayDate.toLocaleDateString(language === 'zh' ? 'zh-HK' : 'en-GB', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={handleOpenMastery}
                                            type="button"
                                            className="ml-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-cyan-50 text-[#00aeef] border border-cyan-100 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#00aeef] hover:text-white transition-all shadow-sm"
                                        >
                                            <Compass className="w-4 h-4 shrink-0" />
                                            {t('roadmap.detailed_ability_radar')}
                                        </button>
                                    </div>

                                    {/* Tutor Message Card */}
                                    {weeklyPlan.tutorMessage && (
                                        <div className="mb-5 bg-gradient-to-r from-indigo-50 via-white to-orange-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="shrink-0">
                                                    {activeAgent?.avatar ? (
                                                        <img 
                                                            src={activeAgent.avatar} 
                                                            alt={activeAgent.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-wider mb-1">
                                                        {activeAgent?.name || 'Tutor'}
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-slate-700 leading-relaxed">
                                                            {weeklyPlan.tutorMessage.intro}
                                                        </p>
                                                        <p className="text-sm text-slate-700 leading-relaxed">
                                                            {weeklyPlan.tutorMessage.body}
                                                        </p>
                                                        <p className="text-sm text-slate-600 leading-relaxed italic">
                                                            {weeklyPlan.tutorMessage.strategy}
                                                        </p>
                                                        <p className="text-sm font-bold text-orange-600 leading-relaxed flex items-center gap-1.5 mt-2">
                                                            <Trophy className="w-4 h-4 shrink-0" />
                                                            {weeklyPlan.tutorMessage.challenge}
                                                        </p>
                                                        <p className="text-sm font-bold text-indigo-600 leading-relaxed flex items-center gap-1.5 mt-1">
                                                            <Sparkles className="w-4 h-4 shrink-0" />
                                                            {weeklyPlan.tutorMessage.bonus}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {weeklyPlan.days.map((day, idx) => {
                                            const isToday = idx === todayIndex;
                                            const isRest = day.isRest;
                                            const DayIcon = day.icon;
                                            
                                            const colorMap = {
                                                blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
                                                emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
                                                amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
                                                rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
                                                indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-500' },
                                                violet: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', icon: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500' },
                                                orange: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
                                                slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-500', icon: 'text-slate-400', badge: 'bg-slate-100 text-slate-500', bar: 'bg-slate-400' }
                                            };
                                            const c = colorMap[day.color] || colorMap.slate;
                                            
                                            return (
                                                <div 
                                                    key={day.dayKey}
                                                    className={`
                                                        relative rounded-2xl border transition-all flex flex-col
                                                        ${isToday ? 'ring-2 ring-indigo-400 ring-offset-2 shadow-md' : 'shadow-sm'}
                                                        ${isRest ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-100 hover:shadow-md'}
                                                    `}
                                                >
                                                    {/* Day header */}
                                                    <div className={`px-4 py-3 border-b ${isRest ? 'border-slate-100' : 'border-slate-100'} flex items-center justify-between`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg ${c.bg} ${c.border} border`}>
                                                                <DayIcon className={`w-4 h-4 ${c.icon}`} />
                                                            </div>
                                                            <span className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                                {day.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {isToday && (
                                                                <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">
                                                                    {t('roadmap.today')}
                                                                </span>
                                                            )}
                                                            {isRest && (
                                                                <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                                                                    {t('roadmap.rest_day')}
                                                                </span>
                                                            )}
                                                            {!isRest && (
                                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${c.badge}`}>
                                                                    {day.focusLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Quest cards */}
                                                    <div className="p-3 flex-1 flex flex-col gap-2">
                                                        {isRest ? (
                                                            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3">
                                                                <Coffee className="w-8 h-8 text-slate-300" />
                                                                <p className="text-sm font-bold text-slate-400">{t('roadmap.rest_day')}</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {day.quests.map((quest, qIdx) => {
                                                                    const completed = isQuestCompleted(quest);
                                                                    return (
                                                                    <div
                                                                        key={quest.id + '_' + qIdx}
                                                                        onClick={() => {
                                                                            if (!isPaid) {
                                                                                onClose();
                                                                                navigate('/subscription');
                                                                                return;
                                                                            }
                                                                            onClose();
                                                                            navigate(quest.nav.path, { state: quest.nav.state });
                                                                        }}
                                                                        className={`
                                                                            group relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                                                                            ${completed 
                                                                                ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 hover:shadow-md' 
                                                                                : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-md'}
                                                                        `}
                                                                    >
                                                                        <div className="flex items-start gap-2.5">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between mb-0.5">
                                                                                    <p className={`text-[11px] font-bold line-clamp-1 ${completed ? 'text-emerald-800' : 'text-slate-800'}`}>
                                                                                        {language === 'zh' && quest.titleZh ? quest.titleZh : quest.title}
                                                                                    </p>
                                                                                    {completed ? (
                                                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0 ml-1" />
                                                                                    ) : !isPaid ? (
                                                                                        <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 ml-1" />
                                                                                    ) : null}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${completed ? 'bg-emerald-100 text-emerald-700' : c.badge}`}>
                                                                                        {completed ? 'Completed' : quest.category}
                                                                                    </span>
                                                                                    <span className={`text-[9px] font-bold ${completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                                                        {completed ? '+' + quest.xp + ' XP earned' : '+' + quest.xp + ' XP'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {completed ? (
                                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
                                                                            ) : (
                                                                                <Play className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-1" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    );
                                                                })}
                                                                
                                                                {/* Estimated time footer */}
                                                                <div className="mt-1 pt-2 border-t border-slate-50 flex items-center justify-between">
                                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                                        ~{day.quests.length * 15} min
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                                        {day.quests.length} quests
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
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
                                        .map(id => {
                                            const skill = MICRO_SKILLS[id];
                                            const isElite = id.includes('_elite_');
                                            const trackLabel = isElite ? t('roadmap.elite_track') : t('roadmap.accuracy_track');
                                            const trackColor = isElite ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";
                                            const missionLevel = selectedLevels[id] || (isElite ? '7' : '5');
                                            const maxXp = getGrammarMaxXp(missionLevel);
                                            const levelLang = language === 'zh' ? 'zh' : 'en';
                                            
                                            return (
                                                <div 
                                                    key={id}
                                                    onClick={() => {
                                                        if (grammarGating.lockedIds.has(id)) {
                                                            onClose();
                                                            navigate('/subscription');
                                                            return;
                                                        }
                                                        handleTaskClick({
                                                            id: id,
                                                            topic: id,
                                                            title: skill[language]?.name || id,
                                                            type: 'GRAMMAR_LAB',
                                                            xp: maxXp,
                                                            level: missionLevel
                                                        });
                                                    }}
                                                    className="group bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${trackColor}`}>
                                                            {trackLabel}
                                                        </span>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-amber-200 rounded-lg shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                            <Target size={12} className="text-amber-600" />
                                                            <select
                                                                value={missionLevel}
                                                                onChange={(e) => setSelectedLevels({ ...selectedLevels, [id]: e.target.value })}
                                                                className="bg-transparent text-[10px] font-black text-amber-600 focus:outline-none cursor-pointer uppercase"
                                                            >
                                                                {['3', '4', '5', '6', '7'].map((lvl) => (
                                                                    <option key={lvl} value={lvl}>
                                                                        {getGrammarLevelOptionLabel(lvl, levelLang)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                            {language === 'zh' ? `最高 ${maxXp} XP` : `Up to ${maxXp} XP`}
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors mb-2 flex items-center gap-2">
                                                        {skill[language]?.name || id}
                                                        {grammarGating.lockedIds.has(id) && <Crown className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
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
                                                            <Play className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
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
                                            { id: 'READING', label: 'Reading', icon: BookOpen },
                                            { id: 'WRITING', label: 'Writing', icon: PenTool },
                                            { id: 'LISTENING', label: 'Listening', icon: Headphones },
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
                                            {listeningMissions
                                                .filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map((mission) => {
                                                const currentSelected = normalizeMissionLevel(mission.level);
                                                const difficulty = getDifficultyMeta(mission.level);
                                                
                                                const stats = getMasteryStats(currentSelected, false, false);

                                                return (
                                                    <div
                                                        key={mission.id}
                                                        onClick={() => {
                                                            if (questLabGating.lockedIds.has(mission.id)) {
                                                                onClose();
                                                                navigate('/subscription');
                                                                return;
                                                            }
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
                                                        <div className="flex justify-between items-center gap-2 mb-2">
                                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 shrink-0">
                                                                LISTENING
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight text-right max-w-[65%] leading-tight ${difficulty.className}`}>
                                                                {difficulty.label}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between items-start gap-2 mb-1">
                                                            <h4 className="text-[15px] font-bold transition-colors text-slate-800 line-clamp-2 group-hover:text-rose-600 flex items-center gap-2 min-w-0 flex-1">
                                                                {mission.title}
                                                                {questLabGating.lockedIds.has(mission.id) && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                                            </h4>
                                                            <span className="text-xs font-bold text-rose-600 shrink-0">+{stats.xp} XP</span>
                                                        </div>
                                                        <p className="text-[13px] text-slate-600 mb-4 line-clamp-2 leading-snug">
                                                            {mission.description || 'Synthesizing data files and auditory clues for Paper 3 proficiency.'}
                                                        </p>
                                                        <div className="flex items-start gap-1.5 text-[13px] text-slate-600 italic mt-auto pt-2 leading-snug">
                                                            <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                                            <span>
                                                                Outcome: {listeningQuestOutcome(mission)}
                                                            </span>
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
                                                {writingMissions
                                                    .filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((mission) => {
                                                    const stats = getMasteryStats(5, false, false); // Default to DSE Standard

                                                    return (
                                                        <div
                                                            key={mission.id}
                                                            onClick={() => {
                                                                if (questLabGating.lockedIds.has(mission.id)) {
                                                                    onClose();
                                                                    navigate('/subscription');
                                                                    return;
                                                                }
                                                                onClose();
                                                                navigate(`/writing/quest`, {
                                                                    state: {
                                                                        questData: mission
                                                                    }
                                                                });
                                                            }}
                                                            className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-purple-300 hover:shadow-md"
                                                        >
                                                            <div className="flex justify-between items-center gap-2 mb-2">
                                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 shrink-0">
                                                                    WRITING
                                                                </span>
                                                                {mission.genre ? (
                                                                    <span className="text-[9px] font-bold uppercase tracking-tight text-purple-500 truncate max-w-[50%]">
                                                                        {mission.genre}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] font-black uppercase text-slate-300"> </span>
                                                                )}
                                                            </div>

                                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                                <h4 className="text-[15px] font-bold transition-colors text-slate-800 line-clamp-2 group-hover:text-purple-600 flex items-center gap-2 min-w-0 flex-1">
                                                                    {mission.title}
                                                                    {questLabGating.lockedIds.has(mission.id) && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                                                </h4>
                                                                <span className="text-xs font-bold text-purple-600 shrink-0">+{stats.xp} XP</span>
                                                            </div>
                                                            <p className="text-[13px] text-slate-600 mb-4 line-clamp-2 leading-snug">
                                                                {mission.prompt || 'Advancing DSE linguistic proficiency through high-fidelity mission simulation.'}
                                                            </p>
                                                            <div className="flex items-start gap-1.5 text-[13px] text-slate-600 italic mt-auto pt-2 leading-snug">
                                                                <Target className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                                                <span>
                                                                    Outcome: {writingQuestOutcome(mission)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                        {(() => {
                                            const lCount = listeningMissions.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase())).length;
                                            const wCount = writingMissions.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase())).length;
                                            const totalVisible = filteredSkills.length + (paperFilter === 'ALL' ? (lCount + wCount) : 0);
                                            
                                            if (totalVisible === 0) {
                                                return (
                                                    <div className="text-center py-20 opacity-50">
                                                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Search className="w-8 h-8 text-slate-400" />
                                                        </div>
                                                        <p className="font-bold text-slate-500">No skills found matching your filters.</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        {(filteredSkills.length + (paperFilter === 'ALL' ? (listeningMissions.length + writingMissions.length) : 0)) > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pb-4">
                                                {/* Listening Missions in ALL view */}
                                                {paperFilter === 'ALL' && listeningMissions
                                                    .filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((mission) => {
                                                        const currentSelected = normalizeMissionLevel(mission.level);
                                                        const difficulty = getDifficultyMeta(mission.level);
                                                        const missionStats = getMasteryStats(Number(currentSelected), false, false);
                                                        return (
                                                            <div
                                                                key={mission.id}
                                                                onClick={() => {
                                                                    if (questLabGating.lockedIds.has(mission.id)) {
                                                                        onClose();
                                                                        navigate('/subscription');
                                                                        return;
                                                                    }
                                                                    onClose();
                                                                    navigate(`/listening/briefing/${mission.id}`, {
                                                                        state: {
                                                                            questData: mission,
                                                                            targetLevel: currentSelected,
                                                                            targetXp: missionStats.xp
                                                                        }
                                                                    });
                                                                }}
                                                                className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-rose-300 hover:shadow-md"
                                                            >
                                                                <div className="flex justify-between items-center gap-2 mb-2">
                                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 shrink-0">
                                                                        LISTENING
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight text-right max-w-[65%] leading-tight ${difficulty.className}`}>
                                                                        {difficulty.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                                    <h4 className="text-[15px] font-bold transition-colors text-slate-800 line-clamp-2 group-hover:text-rose-600 flex items-center gap-2 min-w-0 flex-1">
                                                                        {mission.title}
                                                                        {questLabGating.lockedIds.has(mission.id) && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                                                    </h4>
                                                                    <span className="text-xs font-bold text-rose-600 shrink-0">+{missionStats.xp} XP</span>
                                                                </div>
                                                                <p className="text-[14px] text-slate-600 mb-4 line-clamp-2 leading-snug">
                                                                    {mission.description || 'Synthesizing data files and auditory clues for Paper 3 proficiency.'}
                                                                </p>
                                                                <div className="flex items-start gap-1.5 text-[14px] text-slate-600 italic mt-auto pt-2 leading-snug">
                                                                    <Target className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                                                    <span>
                                                                        Outcome: {listeningQuestOutcome(mission)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }

                                                {/* Writing Missions in ALL view */}
                                                {paperFilter === 'ALL' && writingMissions
                                                    .filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((mission) => {
                                                        const wStats = getMasteryStats(5, false, false);
                                                        return (
                                                        <div
                                                            key={mission.id}
                                                            onClick={() => {
                                                                if (questLabGating.lockedIds.has(mission.id)) {
                                                                    onClose();
                                                                    navigate('/subscription');
                                                                    return;
                                                                }
                                                                onClose();
                                                                navigate(`/writing/quest`, {
                                                                    state: {
                                                                        questData: mission
                                                                    }
                                                                });
                                                            }}
                                                            className="group relative p-4 rounded-xl border-2 transition-all flex flex-col cursor-pointer bg-white border-slate-100 hover:border-purple-300 hover:shadow-md"
                                                        >
                                                            <div className="flex justify-between items-center gap-2 mb-2">
                                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 shrink-0">
                                                                    WRITING
                                                                </span>
                                                                {mission.genre ? (
                                                                    <span className="text-[9px] font-bold uppercase tracking-tight text-purple-500 truncate max-w-[50%]">{mission.genre}</span>
                                                                ) : (
                                                                    <span className="text-[9px] font-black uppercase text-slate-300"> </span>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                                <h4 className="text-[15px] font-bold transition-colors text-slate-800 line-clamp-2 group-hover:text-purple-600 flex items-center gap-2 min-w-0 flex-1">
                                                                    {mission.title}
                                                                    {questLabGating.lockedIds.has(mission.id) && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                                                </h4>
                                                                <span className="text-xs font-bold text-purple-600 shrink-0">+{wStats.xp} XP</span>
                                                            </div>
                                                            <p className="text-[14px] text-slate-600 mb-4 line-clamp-2 leading-snug">
                                                                {mission.prompt || 'Advancing DSE linguistic proficiency through high-fidelity mission simulation.'}
                                                            </p>
                                                            <div className="flex items-start gap-1.5 text-[14px] text-slate-600 italic mt-auto pt-2 leading-snug">
                                                                <Target className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                                                <span>
                                                                    Outcome: {writingQuestOutcome(mission)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        );
                                                    })
                                                }
                                                {filteredSkills.map(([id]) => {
                                                    const name = getSkillName(id);
                                                    const desc = getSkillDesc(id);
                                                    const paper = id.split('_')[0];

                                                    const outcome = getSkillOutcome(id, language);
                                                    const isIntegrated = MICRO_SKILLS[id]?.isIntegrated;

                                                    const skillLevel = getAggregatedLevel(id);
                                                    const isWriting = id.startsWith('writing_');
                                                    const isListening = id.startsWith('listening_');
                                                    const levelToUse = (paper === 'reading' && selectedLevels[id]) ? selectedLevels[id] : (paper === 'listening' ? '5' : (activeTab === 'CHALLENGE' ? '7' : (skillLevel < 3.5 ? '3' : skillLevel < 5.0 ? '4' : '5')));
                                                    const stats = getMasteryStats(Number(levelToUse), false, false);
                                                    const displayXp = isWriting ? 150 : (isListening ? 200 : stats.xp);
                                                    const paperUpper = paper === 'reading' ? 'READING' : paper === 'writing' ? 'WRITING' : paper === 'listening' ? 'LISTENING' : 'SPEAKING';
                                                    const listeningDiff = getDifficultyMeta(levelToUse);

                                                    return (
                                                        <div
                                                            key={id}
                                                            onClick={() => {
                                                                if (questLabGating.lockedIds.has(id)) {
                                                                    onClose();
                                                                    navigate('/subscription');
                                                                    return;
                                                                }
                                                                onClose();
                                                                handleTaskClick({
                                                                    id: id,
                                                                    title: `${activeTab === 'CHALLENGE' ? 'Integrated' : 'Practice'}: ${name}`,
                                                                    topic: id,
                                                                    type: isIntegrated ? 'SPEAKING_CHALLENGE' : 'PRACTICE',
                                                                    xp: displayXp,
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
                                                            <div className="flex justify-between items-center gap-2 mb-2 min-h-[1.5rem]">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${isIntegrated ? 'bg-white/20 text-white' : paper === 'reading' ? 'bg-blue-50 text-blue-600' :
                                                                    paper === 'writing' ? 'bg-purple-50 text-purple-600' :
                                                                        paper === 'listening' ? 'bg-orange-50 text-orange-600' :
                                                                            'bg-green-50 text-green-600'
                                                                    }`}>
                                                                    {isIntegrated ? 'DSE SIMULATION' : paperUpper}
                                                                </span>
                                                                <div className="flex justify-end items-center gap-1 min-w-0 max-w-[72%]">
                                                                    {isIntegrated && (
                                                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/90 text-yellow-950 rounded text-[9px] font-black tracking-tight shrink-0">
                                                                            <Sparkles className="w-2 h-2" />
                                                                            Integrated Skill
                                                                        </div>
                                                                    )}
                                                                    {!isIntegrated && paper === 'reading' && (
                                                                        <select
                                                                            value={levelToUse}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedLevels(prev => ({ ...prev, [id]: e.target.value }));
                                                                            }}
                                                                            className="text-[9px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-amber-500/30 transition-all cursor-pointer hover:bg-white max-w-full truncate"
                                                                        >
                                                                            <option value="3">Easy</option>
                                                                            <option value="4">Medium</option>
                                                                            <option value="5">DSE Standard</option>
                                                                            <option value="7">Elite</option>
                                                                        </select>
                                                                    )}
                                                                    {!isIntegrated && paper === 'listening' && (
                                                                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight text-right leading-tight ${listeningDiff.className}`}>
                                                                            {listeningDiff.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                                <h4 className={`text-[15px] font-bold transition-colors line-clamp-2 flex items-center gap-2 min-w-0 flex-1 ${isIntegrated ? 'text-white' : 'text-slate-800 group-hover:text-amber-600'}`}>
                                                                    {name}
                                                                    {questLabGating.lockedIds.has(id) && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                                                </h4>
                                                                <span className={`text-xs font-bold shrink-0 ${isIntegrated ? 'text-amber-200' : 'text-amber-600'}`}>
                                                                    +{displayXp} XP
                                                                </span>
                                                            </div>
                                                            <p className={`text-[14px] mb-4 line-clamp-2 leading-snug ${isIntegrated ? 'text-indigo-100' : 'text-slate-600'}`}>
                                                                {desc || 'Master this skill to excel in HKDSE English.'}
                                                            </p>
                                                            <div className={`flex items-start gap-1.5 text-[14px] italic mt-auto pt-2 leading-snug ${isIntegrated ? 'text-indigo-100' : 'text-slate-600'}`}>
                                                                {isIntegrated ? (
                                                                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                                                                ) : (
                                                                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                                )}
                                                                <span>Outcome: {outcome}</span>
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
