import React, { useState, useEffect, useMemo } from 'react';
import { useAvatar, AGENTS } from '../context/AvatarContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookOpen, Sparkles, Mic, Activity, Lightbulb, Ear, Zap, Crown, Trophy, Clock } from 'lucide-react';
import ExamTipsModal from './ace/ExamTipsModal';
import CardPreviewModal from './CardPreviewModal';
import { cn } from '../utils/cn';
export { cn };

// Rarity ring styles for the study-duo avatar tiles
const rarityRingStyles = {
    default: 'ring-4 ring-primary/10',
    common: 'ring-4 ring-gray-300/40',
    rare: 'ring-4 ring-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    epic: 'ring-4 ring-purple-400/60 shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-shimmer',
    legendary: 'ring-4 ring-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.4)] ring-sparkle',
};

/** Label under learner portrait: prefer real name over default DB nickname "Student". */
function resolveLearnerSidebarName(user, profile, statsPayload) {
    const firstToken = (s) => {
        const x = (s || '').trim();
        if (!x) return '';
        return x.split(/\s+/)[0] || x;
    };
    const rawList = [
        statsPayload?.user?.nickname,
        statsPayload?.nickname,
        profile?.nickname,
        profile?.displayName,
        user?.displayName,
        user?.email?.split('@')[0]
    ];
    const isGeneric = (s) => !s || String(s).trim().toLowerCase() === 'student';
    for (const raw of rawList) {
        const tok = (raw ?? '').toString().trim();
        if (!tok || isGeneric(tok)) continue;
        return firstToken(tok) || tok;
    }
    for (const raw of rawList) {
        const tok = (raw ?? '').toString().trim();
        if (tok) return firstToken(tok) || tok;
    }
    return 'Student';
}

const Sidebar = ({ stats: statsProp }) => {
    const navigate = useNavigate();
    const { activeAgentId, setActiveAgentId, activeAgent, avatarState, studentState, equipment, getAgentIdentity } = useAvatar();
    const { user, profile, loginWithGoogle, loading: authBusy } = useAuth();
    const tier = (profile?.subscription_tier || 'free').toLowerCase();
    const isPaid = tier === 'pro' || tier === 'premium';
    const { t } = useLanguage();
    const [gender, setGender] = useState(null);
    const [stats, setStats] = useState(statsProp || null);
    const [isExamTipsOpen, setIsExamTipsOpen] = useState(false);

    // Card preview state
    const [previewCard, setPreviewCard] = useState(null);
    const [previewType, setPreviewType] = useState('tutor');
    const [equippedTutorCard, setEquippedTutorCard] = useState(null);
    const [equippedTutorRarity, setEquippedTutorRarity] = useState('default');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const learnerDisplayName = useMemo(() => {
        if (!user) return t('sidebar.visitor');
        return resolveLearnerSidebarName(user, profile, stats);
    }, [user, profile, stats, t]);

    useEffect(() => {
        if (user) {
            fetch(`${API_URL}/api/stats?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    setGender(data.user?.gender ?? data.gender);
                    setStats(data);
                })
                .catch(() => {
                    setStats(null);
                });

            // Fetch equipped tutor card info for rarity ring
            fetch(`${API_URL}/api/redemption/collection?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    const catalog = data.catalog || {};
                    const equipped = catalog.tutorCards?.find(c => c.equipped);
                    if (equipped) {
                        setEquippedTutorCard(equipped);
                        setEquippedTutorRarity(equipped.rarity || 'rare');
                    }
                })
                .catch(() => { });
        } else {
            setGender(null);
            setStats(null);
        }
    }, [user, API_URL]);

    // Helper to get avatar
    const getStudentAvatar = () => {
        if (equipment.student?.image) return equipment.student.image;
        const g = gender?.toLowerCase();
        if (g === 'female') return '/avatars/Student/Natalie.jpeg';
        return '/avatars/Student/Marcus.jpeg';
    };

    const handleTutorAvatarClick = () => {
        // Subject normalization mapping
        const subjectMap = {
            'english': ['english'],
            'math': ['maths', 'math'],
            'chinese': ['chinese'],
            'ace': ['general', 'ace']
        };

        // Only show the equipped card if it matches the current subject
        const targetSubjects = subjectMap[activeAgentId] || [];
        const isMatch = equippedTutorCard && targetSubjects.includes(equippedTutorCard.subject);

        const cardData = isMatch ? equippedTutorCard : {
            id: activeAgent.id,
            name: activeAgent.name,
            image: activeAgent.avatar,
            description: activeAgent.headerInfo || t('card_preview.default_tutor'),
            rarity: 'default',
        };
        setPreviewCard(cardData);
        setPreviewType('tutor');
    };

    const handleStudentAvatarClick = () => {
        setPreviewCard({
            id: 'student',
            name: learnerDisplayName,
            image: getStudentAvatar(),
            description: t('card_preview.default_student'),
            rarity: 'default',
        });
        setPreviewType('student');
    };

    const tutorRingClass = rarityRingStyles[equippedTutorRarity] || rarityRingStyles.default;

    return (
        <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* --- THE STUDY DUO SECTION --- */}
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md py-5 px-4 sm:px-5 rounded-3xl shadow-xl border border-primary/20 flex flex-col items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <div className="size-24 bg-primary rounded-full blur-3xl"></div>
                </div>

                <h3 className="font-bold text-[#1d130c] dark:text-white text-lg z-10">{t(`agents.${activeAgentId}.description`)}</h3>

                <div className="flex items-center justify-center gap-1 relative z-10 w-full min-w-0">
                    {/* Active AI — clickable with rarity ring */}
                    <div className="relative group text-center shrink-0">
                        <div
                            onClick={handleTutorAvatarClick}
                            className={cn(
                                "w-[100px] h-[100px] sm:w-[104px] sm:h-[104px] rounded-2xl overflow-hidden border-[3px] border-white shadow-lg bg-white mx-auto transition-all cursor-pointer hover:scale-[1.02]",
                                tutorRingClass,
                                (avatarState === 'TALKING' || avatarState === 'THINKING') && "animate-talking-glow ring-green-400"
                            )}
                        >
                            <img 
                                src={activeAgent.avatar} 
                                alt="AI" 
                                className="avatar-portrait-dashboard" 
                            />
                        </div>
                        <div className="absolute top-0.5 right-0.5 bg-green-500 size-3.5 rounded-full border-2 border-white shadow-sm"></div>
                        <p className="text-[10px] mt-1 font-bold text-primary truncate w-24 mx-auto">
                            {activeAgent.name}
                        </p>
                    </div>

                    {/* Linking Line */}
                    <div className="text-primary/40 animate-pulse shrink-0 p-0.5" aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
                    </div>

                    {/* Student — clickable */}
                    <div className="relative text-center group/student shrink-0">
                        <div
                            onClick={handleStudentAvatarClick}
                            className={cn(
                                "w-[100px] h-[100px] sm:w-[104px] sm:h-[104px] rounded-2xl overflow-hidden border-[3px] border-white shadow-lg bg-white ring-4 ring-orange-400/10 transition-all duration-500 mx-auto relative cursor-pointer hover:scale-[1.02]",
                                studentState === 'TALKING' && "scale-105 ring-green-400 animate-talking-glow",
                                studentState === 'LISTENING' && "ring-primary/40 animate-pulse",
                                studentState === 'STUDYING' && "ring-indigo-500/40 scale-95 opacity-90"
                            )}
                        >
                            <img
                                src={getStudentAvatar()}
                                alt={learnerDisplayName}
                                className="avatar-portrait-dashboard"
                            />
                            {equipment.frame && (
                                <img 
                                    src={equipment.frame.image} 
                                    alt="Frame" 
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110 avatar-frame-mask z-10" 
                                />
                            )}
                        </div>
                        <p className="text-[10px] mt-1 font-bold text-orange-600 truncate w-20 mx-auto">{learnerDisplayName}</p>

                        {/* XP Progress Bar (Mini) */}
                        <div className="mt-1 w-16 mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden border border-black/5">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-1000"
                                style={{ width: `${stats?.progressPercent || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex gap-2 z-10 mt-2">
                    {/* Smart Notebook / Exam Tips Button */}
                    {!(activeAgentId === 'english' || activeAgentId === 'math') && (
                        <button
                            onClick={() => {
                                if (activeAgentId === 'ace') {
                                    setIsExamTipsOpen(true);
                                } else {
                                    window.location.href = '/notebook';
                                }
                            }}
                            className="flex-1 flex items-center gap-2 px-3 py-2 bg-white hover:bg-indigo-50/50 border border-indigo-100 hover:border-indigo-200 rounded-xl shadow-sm transition-all group"
                        >
                            <div className="size-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                {activeAgentId === 'ace' ? <Lightbulb className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                            </div>
                            <p className="text-[10px] font-bold text-indigo-950 uppercase tracking-tight">
                                {activeAgentId === 'ace' ? t('sidebar.dse_strategy') : t('sidebar.notebook')}
                            </p>
                        </button>
                    )}

                    {/* English Tutor Special Buttons */}
                    {activeAgentId === 'english' && (
                        <div className="w-full">
                            <button
                                onClick={() => window.location.href = '/vocabulary'}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-100 hover:border-emerald-200 rounded-xl shadow-sm transition-all group"
                            >
                                <div className="size-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <BookOpen className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[10px] font-bold text-emerald-950 uppercase tracking-tight">Vocab Master</p>
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* --- AGENT SELECTION --- */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-[#a16b45] uppercase tracking-wider ml-2 opacity-60">{t('sidebar.your_mentors')}</p>
                {Object.values(AGENTS)
                    .filter(agentDef => agentDef.id !== 'chinese' && agentDef.id !== 'math')
                    .map((agentDef) => {
                        const agent = getAgentIdentity(agentDef.id);
                        return (
                            <div
                                key={agent.id}
                                onClick={() => {
                                    if (agent.id === 'ace' && !isPaid) {
                                        navigate('/subscription');
                                        return;
                                    }
                                    setActiveAgentId(agent.id);
                                }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl shadow-sm transition-all cursor-pointer border group active:scale-[0.98]",
                                    activeAgentId === agent.id
                                        ? "bg-white dark:bg-white/10 border-primary shadow-md"
                                        : "bg-white/40 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/20 hover:border-primary/20"
                                )}
                            >
                                <div className="size-10 rounded-full flex items-center justify-center overflow-hidden bg-white border border-black/5">
                                    <img
                                        src={agent.avatar}
                                        alt={agent.name}
                                        className={cn("w-full h-full object-cover object-top transition-all", activeAgentId !== agent.id && "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100")}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-base text-[#1d130c] dark:text-white leading-none flex items-center gap-2">
                                        {agent.name}
                                        {(agent.id === 'ace' && !isPaid) && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                    </p>
                                    <p className="text-xs text-[#a16b45] mt-1.5">{t(`agents.${agent.id}.description`)}</p>
                                </div>
                                {activeAgentId === agent.id && (
                                    <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></div>
                                )}
                            </div>
                        );
                    })}
            </div>


            {/* XP Progress, Redeem & Timeline */}
            {user && (
                <div className="mt-2 p-4 rounded-3xl flex flex-col gap-3">
                    {/* XP Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('stats.xp_progress')}</span>
                            <span className="text-sm font-bold text-gray-800">{stats?.currentStepXP || 0} <span className="text-[10px] text-gray-400 font-medium">/ {stats?.nextLevelXP || 100}</span></span>
                        </div>
                        <div className="h-3 bg-gray-300/50 rounded-full flex-1 overflow-hidden border border-white shadow-inner relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm transition-all duration-1000"
                                style={{ width: `${stats?.progressPercent || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Level + Actions */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{t('stats.current_tier')}</span>
                                <span className="text-sm font-extrabold text-gray-800">LVL {stats?.level || 1}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/redemption')}
                                className="px-3 py-2 rounded-xl bg-electric-orange text-white text-[10px] font-bold hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,102,0,0.4)] hover:scale-105 transition-all flex items-center gap-1.5 shadow-md"
                            >
                                <span>🎁</span> {t('stats.redeem')}
                            </button>
                            <button
                                onClick={() => navigate('/achievements')}
                                className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-[10px] font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                            >
                                {t('stats.timeline')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!user && (
                <div className="mt-2 p-5 bg-gradient-to-br from-primary/90 to-primary rounded-3xl text-white shadow-xl">
                    <p className="text-xs font-medium opacity-90 mb-3 leading-relaxed">{t('sidebar.unlock_plan')}</p>
                    <button
                        type="button"
                        disabled={authBusy}
                        onClick={() => { loginWithGoogle().catch(() => {}); }}
                        className="w-full bg-white text-primary py-2.5 rounded-2xl text-xs font-bold hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('sidebar.register_now')}
                    </button>
                </div>
            )}

            {/* Exam Tips Modal */}
            <ExamTipsModal isOpen={isExamTipsOpen} onClose={() => setIsExamTipsOpen(false)} />

            {/* Card Preview Modal */}
            <CardPreviewModal
                isOpen={!!previewCard}
                onClose={() => setPreviewCard(null)}
                card={previewCard}
                type={previewType}
            />
        </aside>
    );
};

export default Sidebar;
