import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserStats } from '../hooks/useUserStats';
import { cn } from '../utils/cn';

const StatsBar = () => {
    const { user } = useAuth();
    const { stats, mutate } = useUserStats();
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.uid) return;

        // Listen for XP updates (Triggered by ChatInterface or others)
        const handleXPUpdate = () => {
            console.log("StatsBar: Received xp_update event. Refreshing...");
            mutate();
        };

        window.addEventListener('xp_update', handleXPUpdate);
        return () => window.removeEventListener('xp_update', handleXPUpdate);
    }, [user, mutate]);

    // Calculate XP percentage safely
    const xpPercentage = stats?.progressPercent || 0;

    return (
        <div className="w-full mt-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-200 backdrop-blur-md p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60">
                {/* XP Bar Section */}
                <div className="flex items-center gap-4 flex-1 w-full max-w-xl">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('stats.xp_progress')}</span>
                        <span className="text-lg font-bold text-gray-800">{stats?.currentStepXP || 0} <span className="text-xs text-gray-400 font-medium">/ {stats?.nextLevelXP || 100}</span></span>
                    </div>

                    <div className="h-4 bg-gray-300/50 rounded-full flex-1 overflow-hidden border border-white shadow-inner relative">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm transition-all duration-1000"
                            style={{ width: `${xpPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Level Badge */}
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('stats.current_tier')}</span>
                        <span className="text-lg font-extrabold text-gray-800">LVL {stats?.level || 1}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/redemption')}
                        className="px-6 py-2.5 rounded-xl bg-electric-orange text-white text-xs font-bold hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,102,0,0.4)] hover:scale-105 transition-all flex items-center gap-2 shadow-md"
                    >
                        <span>🎁</span> {t('stats.redeem')}
                    </button>

                    <button
                        onClick={() => navigate('/achievements')}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                    >
                        {t('stats.timeline')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
