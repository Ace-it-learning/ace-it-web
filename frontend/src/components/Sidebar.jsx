import React, { useState, useEffect } from 'react';
import { useAvatar, AGENTS } from '../context/AvatarContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { activeAgentId, setActiveAgentId, activeAgent, studentState } = useAvatar(); // studentState added
    const { user, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const [nickname, setNickname] = useState('Student');
    const [gender, setGender] = useState(null);
    const [stats, setStats] = useState(null); // Added stats state

    useEffect(() => {
        if (user) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            fetch(`${API_URL}/api/stats?uid=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    setNickname(data.nickname || 'Student');
                    setGender(data.gender);
                    setStats(data); // Store full stats
                })
                .catch(() => setNickname(user.displayName?.split(' ')[0] || 'Student'));
        } else {
            setNickname(t('sidebar.visitor'));
            setGender(null);
        }
    }, [user, t]);

    // Helper to get avatar
    const getStudentAvatar = () => {
        // if (user?.photoURL) return user.photoURL; // Disable photoURL to fix broken google link issue
        const g = gender?.toLowerCase();
        if (g === 'female') return '/avatars/student_female_1.jpg';
        // Default to male 3D avatar if gender is male or unknown
        return '/avatars/student_male_1.jpg';
    };

    return (
        <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* --- THE STUDY DUO SECTION --- */}
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-primary/20 flex flex-col items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <div className="size-24 bg-primary rounded-full blur-3xl"></div>
                </div>

                <h3 className="font-bold text-[#1d130c] dark:text-white text-lg z-10">{t(`agents.${activeAgentId}.description`)}</h3>

                <div className="flex items-center justify-center gap-2 relative z-10 w-full">
                    {/* Active AI */}
                    <div className="relative group text-center">
                        <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-white ring-4 ring-primary/10 mx-auto">
                            <img src={activeAgent.avatar} alt="AI" className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="absolute top-1 right-2 bg-green-500 size-4 rounded-full border-2 border-white shadow-sm"></div>
                        <p className="text-[10px] mt-1 font-bold text-primary truncate w-20 mx-auto">{activeAgent.name}</p>
                    </div>

                    {/* Linking Line */}
                    <div className="text-primary/40 animate-pulse">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
                    </div>

                    {/* Student */}
                    <div className="relative text-center group/student">
                        <div className={cn(
                            "w-[88px] h-[88px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-white ring-4 ring-orange-400/10 transition-all duration-500 mx-auto relative",
                            studentState === 'TALKING' && "scale-110 ring-orange-400/30 animate-bounce",
                            studentState === 'LISTENING' && "ring-primary/40 animate-pulse",
                            studentState === 'STUDYING' && "ring-indigo-500/40 scale-95 opacity-90"
                        )}>
                            <img
                                src={getStudentAvatar()}
                                alt="Student"
                                className="w-full h-full object-cover"
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

                <div className="w-full py-2 px-4 bg-primary/5 rounded-full border border-primary/10 text-center shadow-inner">
                    <span className="text-xs font-medium text-primary">
                        {studentState === 'IDLE' ? t('sidebar.ready_to_learn') :
                            studentState === 'TALKING' ? t('sidebar.asking_ace_it') :
                                studentState === 'STUDYING' ? t('sidebar.focused_on_work') :
                                    t('sidebar.listening_to_mentor')}
                    </span>
                </div>
            </div>

            {/* --- AGENT SELECTION --- */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-[#a16b45] uppercase tracking-wider ml-2 opacity-60">{t('sidebar.your_mentors')}</p>
                {Object.values(AGENTS).map((agent) => (
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
                ))}
            </div>

            {/* --- KNOWLEDGE BASE --- */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-[#a16b45] uppercase tracking-wider ml-2 opacity-60">My Knowledge</p>
                <div
                    onClick={() => window.location.href = '/notebook'}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-transparent hover:bg-white transition-all cursor-pointer group"
                >
                    <div className="size-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-500 group-hover:scale-110 transition-transform">
                        📖
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-100">Smart Notebook</p>
                        <p className="text-[10px] text-gray-400">Vocab, Mistakes & Tips</p>
                    </div>
                </div>
            </div>

            {/* --- UTILS --- */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-[#a16b45] uppercase tracking-wider ml-2 opacity-60">System</p>
                <div
                    onClick={() => window.location.href = '/usage'}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-transparent hover:bg-white transition-all cursor-pointer group"
                >
                    <div className="size-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                        📊
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm text-gray-800">Usage & Costing</p>
                        <p className="text-[10px] text-gray-400">Monitor AI Tokens</p>
                    </div>
                </div>
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
        </aside>
    );
};

export default Sidebar;
