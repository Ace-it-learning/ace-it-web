import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Calendar, Star, ArrowLeft, Award, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiUrl } from '../utils/apiBase';

const AchievementTimeline = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            try {
                const uid = encodeURIComponent(user.uid);
                const [timelineRes, statsRes] = await Promise.all([
                    fetch(apiUrl(`/api/timeline?uid=${uid}`)),
                    fetch(apiUrl(`/api/stats?uid=${uid}`))
                ]);

                const timelineData = timelineRes.ok ? await timelineRes.json() : [];
                const statsData = statsRes.ok ? await statsRes.json() : null;

                if (!cancelled) {
                    setEvents(Array.isArray(timelineData) ? timelineData : []);
                    setStats(statsData);
                }
            } catch (e) {
                console.error("Data fetch failed", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        const onFocus = () => {
            if (location.pathname === '/achievements') fetchData();
        };
        window.addEventListener('focus', onFocus);
        return () => {
            cancelled = true;
            window.removeEventListener('focus', onFocus);
        };
    }, [user, location.pathname]);

    const getEventTitle = (event) => {
        const key = `timeline.events.${event.id}`;
        const translated = t(key);
        return translated === key ? event.title : translated;
    };

    const getEventIcon = (event) => {
        if (event.subject === 'maths') return '🧮';
        if (event.subject === 'english') return '📚';
        if (event.type === 'exam') return '📝';
        if (event.type === 'milestone') return '🎉';
        return '🏆';
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const eventDate = new Date(date);
        const diffMs = now - eventDate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return t('timeline.just_now');
        if (diffHours < 24) return t('timeline.hours_ago').replace('{{count}}', diffHours).replace('{{s}}', diffHours > 1 ? 's' : '');
        if (diffDays === 1) return t('timeline.yesterday');
        if (diffDays < 7) return t('timeline.days_ago').replace('{{count}}', diffDays);
        return eventDate.toLocaleDateString();
    };

    const formatXpValue = (value) => `${Number(value || 0)} XP`;

    const formatXpDelta = (event) => {
        const rawXp = Number(event?.xp || 0);
        const title = String(event?.title || '').toLowerCase();
        const questName = String(event?.questName || '').toLowerCase();
        const topic = String(event?.topic || '').toLowerCase();
        const isRedemption = title.includes('redeem') || questName.includes('redeem') || topic.includes('redeem') || event?.type === 'redemption';
        const signedXp = isRedemption ? -Math.abs(rawXp) : rawXp;
        const sign = signedXp > 0 ? '+' : '';
        return `${sign}${signedXp} XP`;
    };

    const getXpDeltaClassName = (event) => {
        const title = String(event?.title || '').toLowerCase();
        const questName = String(event?.questName || '').toLowerCase();
        const topic = String(event?.topic || '').toLowerCase();
        const isRedemption = title.includes('redeem') || questName.includes('redeem') || topic.includes('redeem') || event?.type === 'redemption';
        return isRedemption ? 'text-red-500' : 'text-emerald-600';
    };

    // Use spendable XP balance for wallet consistency with Redemption page.
    const currentXP = stats?.xp || 0;
    const lifetimeXP = stats?.total_xp || currentXP;
    const currentLevel = stats?.level || 1;
    const progressPercent = stats?.progressPercent || 0;
    const xpProgress = stats?.currentStepXP || 0;
    const xpNeeded = stats?.nextLevelXP || 100;

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
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl text-white shadow-lg relative group overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <Trophy className="w-8 h-8 opacity-80" />
                                    <button
                                        onClick={() => navigate('/redemption')}
                                        className="bg-white hover:bg-orange-50 text-orange-600 shadow-sm px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all outline-none"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        {t('timeline.redeem')}
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest mb-1">
                                    XP Balance
                                </p>
                                <p className="text-4xl font-black mb-2">{formatXpValue(currentXP)}</p>
                                <p className="text-[10px] opacity-75 mb-2">Lifetime earned: {formatXpValue(lifetimeXP)}</p>

                                {/* Progress Bar */}
                                <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-white h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-[10px] mt-1.5 opacity-75">
                                    {xpProgress}/{xpNeeded} XP {t('mastery.to_level')} {currentLevel + 1}
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
                                    {stats?.totalActiveDays || stats?.streakDays || 1}
                                    <span className="text-xl" title={`Streak: ${stats?.streakDays || 0} days`}>🔥</span>
                                </p>
                            </div>

                            {/* My Collection Button */}
                            <button
                                onClick={() => navigate('/collection')}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
                            >
                                <Award className="w-4 h-4" />
                                {t('collection.my_collection')}
                            </button>
                        </div>
                    </aside>

                    {/* Right Panel - Timeline Feed */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                {t('timeline.history')}
                                <span className="text-sm font-normal text-gray-400">{t('timeline.newest_first')}</span>
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
                                            <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${event.subject === 'maths' ? 'bg-blue-50' :
                                                event.subject === 'english' ? 'bg-purple-50' :
                                                    'bg-primary/10'
                                                }`}>
                                                <span className="text-3xl">{getEventIcon(event)}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="font-bold text-gray-900 text-lg">
                                                        {event.questName || getEventTitle(event)}
                                                    </h3>
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {event.subject && (
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${event.subject === 'maths' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                {event.subject}
                                                            </span>
                                                        )}
                                                        {event.paper && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
                                                                {event.paper}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {event.topic && !event.questName && (
                                                    <p className="text-xs font-medium text-slate-500 mb-1">
                                                        {t('timeline.topic')}: <span className="text-slate-700 italic">{event.topic.replace(/_/g, ' ')}</span>
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {getRelativeTime(event.date)}
                                                    </p>

                                                    {event.resultId && (
                                                        <button
                                                            onClick={() => {
                                                                const paper = event.paper?.toLowerCase();
                                                                let route = '';
                                                                if (paper === 'writing') route = '/writing/result';
                                                                else if (paper === 'speaking') route = '/speaking/result';
                                                                else if (paper === 'listening') route = '/listening/result';
                                                                else if (paper === 'reading') route = '/reading/result';
                                                                
                                                                if (route) navigate(`${route}/${event.resultId}`);
                                                            }}
                                                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            {t('timeline.review_performance') || 'Review Performance'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* XP Badge */}
                                            <div className="text-right shrink-0">
                                                <span className={`block font-black text-2xl mb-0.5 ${getXpDeltaClassName(event)}`}>
                                                    {formatXpDelta(event)}
                                                </span>
                                                <span className="block text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg mb-2">
                                                    {event.score}
                                                </span>

                                                {/* BREAKDOWN DISPLAY (New) */}
                                                {event.breakdown && (
                                                    <div className="text-left bg-orange-50/50 p-2 rounded-lg border border-orange-100/50 space-y-0.5">
                                                        <div className="flex justify-between items-center gap-4 text-[9px] text-orange-700">
                                                            <span className="font-medium opacity-70">Base:</span>
                                                            <span className="font-black">{event.breakdown.base}</span>
                                                        </div>
                                                        {event.breakdown.tierMultiplier > 1 && (
                                                            <div className="flex justify-between items-center gap-4 text-[9px] text-indigo-700">
                                                                <span className="font-medium opacity-70">Premium:</span>
                                                                <span className="font-black">x{event.breakdown.tierMultiplier}</span>
                                                            </div>
                                                        )}
                                                        {event.breakdown.masteryMultiplier > 1 && (
                                                            <div className="flex justify-between items-center gap-4 text-[9px] text-emerald-700">
                                                                <span className="font-medium opacity-70">Mastery:</span>
                                                                <span className="font-black">x{event.breakdown.masteryMultiplier}</span>
                                                            </div>
                                                        )}
                                                        {event.breakdown.milestoneBonus > 0 && (
                                                            <div className="flex justify-between items-center gap-4 text-[9px] text-pink-700">
                                                                <span className="font-medium opacity-70">Milestone:</span>
                                                                <span className="font-black">+{event.breakdown.milestoneBonus}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
