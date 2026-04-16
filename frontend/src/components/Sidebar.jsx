import React, { useState, useEffect } from 'react';
import { useAvatar, AGENTS } from '../context/AvatarContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookOpen, Sparkles, Mic, Activity, Lightbulb, Ear, Zap } from 'lucide-react';
import ExamTipsModal from './ace/ExamTipsModal';
import CardPreviewModal from './CardPreviewModal';
import { cn } from '../utils/cn';
export { cn };

// Rarity ring styles for the avatar circles
const rarityRingStyles = {
    default: 'ring-4 ring-primary/10',
    common: 'ring-4 ring-gray-300/40',
    rare: 'ring-4 ring-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    epic: 'ring-4 ring-purple-400/60 shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-shimmer',
    legendary: 'ring-4 ring-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.4)] ring-sparkle',
};

const Sidebar = () => {
    const navigate = useNavigate();
    const { activeAgentId, setActiveAgentId, activeAgent, avatarState, studentState, equipment, getAgentIdentity } = useAvatar();
    const { user, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const [nickname, setNickname] = useState('Student');
    const [gender, setGender] = useState(null);
    const [stats, setStats] = useState(null);
    const [isExamTipsOpen, setIsExamTipsOpen] = useState(false);

    // Card preview state
    const [previewCard, setPreviewCard] = useState(null);
    const [previewType, setPreviewType] = useState('tutor');
    const [equippedTutorCard, setEquippedTutorCard] = useState(null);
    const [equippedTutorRarity, setEquippedTutorRarity] = useState('default');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (user) {
            fetch(`${API_URL}/api/stats?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    setNickname(data.nickname || 'Student');
                    setGender(data.gender);
                    setStats(data);
                })
                .catch(() => setNickname(user.displayName?.split(' ')[0] || 'Student'));

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
            setNickname(t('sidebar.visitor'));
            setGender(null);
        }
    }, [user, t]);

    // Helper to get avatar
    const getStudentAvatar = () => {
        if (equipment.student?.image) return equipment.student.image;
        const g = gender?.toLowerCase();
        if (g === 'female') return '/avatars/student_female_1.jpg';
        return '/avatars/student_male_1.jpg';
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
            name: nickname,
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
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-primary/20 flex flex-col items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <div className="size-24 bg-primary rounded-full blur-3xl"></div>
                </div>

                <h3 className="font-bold text-[#1d130c] dark:text-white text-lg z-10">{t(`agents.${activeAgentId}.description`)}</h3>

                <div className="flex items-center justify-center gap-2 relative z-10 w-full">
                    {/* Active AI — clickable with rarity ring */}
                    <div className="relative group text-center">
                        <div
                            onClick={handleTutorAvatarClick}
                            className={cn(
                                "w-[88px] h-[88px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-white mx-auto transition-all cursor-pointer hover:scale-105",
                                tutorRingClass,
                                (avatarState === 'TALKING' || avatarState === 'THINKING') && "animate-talking-glow ring-green-400"
                            )}
                        >
                            <img 
                                src={activeAgent.avatar} 
                                alt="AI" 
                                className="w-full h-full object-cover object-top scale-[1.35] translate-y-[5%]" 
                            />
                        </div>
                        <div className="absolute top-1 right-2 bg-green-500 size-4 rounded-full border-2 border-white shadow-sm"></div>
                        <p className="text-[10px] mt-1 font-bold text-primary truncate w-24 mx-auto">
                            {activeAgent.name}
                        </p>
                    </div>

                    {/* Linking Line */}
                    <div className="text-primary/40 animate-pulse">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
                    </div>

                    {/* Student — clickable */}
                    <div className="relative text-center group/student">
                        <div
                            onClick={handleStudentAvatarClick}
                            className={cn(
                                "w-[88px] h-[88px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-white ring-4 ring-orange-400/10 transition-all duration-500 mx-auto relative cursor-pointer hover:scale-105",
                                studentState === 'TALKING' && "scale-110 ring-green-400 animate-talking-glow",
                                studentState === 'LISTENING' && "ring-primary/40 animate-pulse",
                                studentState === 'STUDYING' && "ring-indigo-500/40 scale-95 opacity-90"
                            )}
                        >
                            <img
                                src={getStudentAvatar()}
                                alt="Student"
                                className="w-full h-full object-cover scale-[1.35] translate-y-[5%]"
                            />
                        </div>
                        <p className="text-[10px] mt-1 font-bold text-orange-600 truncate w-20 mx-auto">{nickname}</p>

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
                                {activeAgentId === 'ace' ? t('sidebar.exam_tips') : t('sidebar.notebook')}
                            </p>
                        </button>
                    )}

                    {/* English Tutor Special Buttons */}
                    {activeAgentId === 'english' && (
                        <div className="w-full flex flex-row gap-2">
                            <button
                                onClick={() => navigate('/dashboard', { state: { openRoadmap: 'ENGLISH', roadmapFilter: 'WRITING' } })}
                                className="flex-1 flex items-center gap-2 px-3 py-2 bg-indigo-50/50 hover:bg-indigo-100/50 border border-indigo-100 hover:border-indigo-200 rounded-xl shadow-sm transition-all group"
                            >
                                <div className="size-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[10px] font-bold text-indigo-950 uppercase tracking-tight">Writing Quests</p>
                            </button>
                            <button
                                onClick={() => window.location.href = '/vocabulary'}
                                className="flex-1 flex items-center gap-2 px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-100 hover:border-emerald-200 rounded-xl shadow-sm transition-all group"
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
                {Object.values(AGENTS).map((agentDef) => {
                    const agent = getAgentIdentity(agentDef.id);
                    return (
                        <div
                            key={agent.id}
                            onClick={() => setActiveAgentId(agent.id)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl shadow-sm transition-all cursor-pointer border group",
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
                                <p className="font-bold text-sm text-[#1d130c] dark:text-white leading-none">{agent.name}</p>
                                <p className="text-[10px] text-[#a16b45] mt-1">{t(`agents.${agent.id}.description`)}</p>
                            </div>
                            {activeAgentId === agent.id && (
                                <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></div>
                            )}
                        </div>
                    );
                })}
            </div>


            {!user && (
                <div className="mt-2 p-5 bg-gradient-to-br from-primary/90 to-primary rounded-3xl text-white shadow-xl">
                    <p className="text-xs font-medium opacity-90 mb-3 leading-relaxed">{t('sidebar.unlock_plan')}</p>
                    <button
                        onClick={loginWithGoogle}
                        className="w-full bg-white text-primary py-2.5 rounded-2xl text-xs font-bold hover:shadow-xl transition-all active:scale-95"
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
