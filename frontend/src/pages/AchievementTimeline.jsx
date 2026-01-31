import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Calendar, Star, ArrowLeft, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AchievementTimeline = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

                // Parallel Fetch: Timeline + Stats
                const [timelineRes, statsRes] = await Promise.all([
                    fetch(`${API_URL}/api/timeline?uid=${user.uid}`),
                    fetch(`${API_URL}/api/stats?uid=${user.uid}`)
                ]);

                const timelineData = await timelineRes.json();
                const statsData = await statsRes.json();

                setEvents(timelineData);
                setStats(statsData);
            } catch (e) {
                console.error("Data fetch failed", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const getEventTitle = (event) => {
        const key = `timeline.events.${event.id}`;
        const translated = t(key);
        return translated === key ? event.title : translated;
    };

    const getEventIcon = (type) => {
        if (type === 'exam') return '📝';
        if (type === 'milestone') return '🎉';
        return '🏆';
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const eventDate = new Date(date);
        const diffMs = now - eventDate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return eventDate.toLocaleDateString();
    };

    // Calculate XP progress to next level (100 XP per level)
    const currentXP = stats?.xp || 0;
    const currentLevel = stats?.level || 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = (xpProgress / xpNeeded) * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900">{t('timeline.title')}</h1>
                        <p className="text-gray-500">{t('timeline.subtitle')}</p>
                    </div>
                </div>

                {/* Two-Column Layout */}
                <div className="flex gap-6">
                    {/* Left Sidebar - Stats (Sticky) */}
                    <aside className="w-80 shrink-0">
                        <div className="sticky top-6 space-y-3">
                            {/* Total XP Card */}
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl text-white shadow-lg">
                                <Trophy className="w-8 h-8 mb-2 opacity-80" />
                                <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest mb-1">
                                    {t('timeline.total_xp')}
                                </p>
                                <p className="text-4xl font-black mb-2">{currentXP}</p>

                                {/* Progress Bar */}
                                <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-white h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-[10px] mt-1.5 opacity-75">
                                    {xpProgress}/{xpNeeded} XP to Level {currentLevel + 1}
                                </p>
                            </div>

                            {/* Current Tier Card */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <Star className="w-8 h-8 mb-2 text-purple-500" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    {t('timeline.current_tier')}
                                </p>
                                <p className="text-4xl font-black text-gray-800">LVL {currentLevel}</p>
                            </div>

                            {/* Active Days Card */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <Calendar className="w-8 h-8 mb-2 text-blue-500" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    {t('timeline.active_days')}
                                </p>
                                <p className="text-4xl font-black text-gray-800 flex items-center gap-2">
                                    {stats?.streakDays || 1}
                                    <span className="text-xl">🔥</span>
                                </p>
                            </div>

                            {/* Future: Achievements Button */}
                            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg opacity-50 cursor-not-allowed">
                                <Award className="w-4 h-4" />
                                View Achievements
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Soon</span>
                            </button>
                        </div>
                    </aside>

                    {/* Right Panel - Timeline Feed */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                {t('timeline.history')}
                                <span className="text-sm font-normal text-gray-400">(Newest First)</span>
                            </h2>

                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl" />)}
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg">{t('timeline.no_activity')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {events.map((event, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group bg-gradient-to-r from-gray-50 to-white"
                                        >
                                            {/* Icon */}
                                            <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <span className="text-3xl">{getEventIcon(event.type)}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg mb-1">
                                                    {getEventTitle(event)}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {getRelativeTime(event.date)}
                                                </p>
                                            </div>

                                            {/* XP Badge */}
                                            <div className="text-right shrink-0">
                                                <span className="block font-black text-orange-500 text-2xl mb-1">
                                                    +{event.xp}
                                                </span>
                                                <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                    {event.score}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AchievementTimeline;
