import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, GraduationCap, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAvatar } from '../context/AvatarContext';

const CardCollection = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { syncEquipment } = useAvatar();
    const navigate = useNavigate();

    const [tab, setTab] = useState('student');
    const [subTab, setSubTab] = useState('english'); // Default to English tutors
    const [studentCards, setStudentCards] = useState([]);
    const [tutorCards, setTutorCards] = useState([]);
    const [avatarFrames, setAvatarFrames] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchCollection = async () => {
        try {
            const res = await fetch(`${API_URL}/api/redemption/collection?uid=${user.uid}`);
            const data = await res.json();

            setStudentCards(data.catalog.studentCards || []);
            setTutorCards(data.catalog.tutorCards || []);
            setAvatarFrames(data.catalog.avatarFrames || []);
            setStats(data.stats || {});
        } catch (e) {
            console.error("Failed to load collection data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchCollection();
    }, [user]);

    const handleEquip = async (card, type) => {
        // Map UI type to Backend Slot
        let slot = 'equipped_student_avatar';
        if (type === 'frame') slot = 'equipped_frame';
        if (type === 'tutor') {
            const subject = card.subject || 'ace';
            if (subject === 'maths' || subject === 'math') slot = 'equipped_tutor_maths';
            else if (subject === 'english') slot = 'equipped_tutor_english';
            else slot = 'equipped_tutor_ace';
        }

        try {
            const res = await fetch(`${API_URL}/api/redemption/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, itemId: card.id, slot })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh local state to show 'Equipped' status
                fetchCollection();
                // Update Sidebar and other components
                syncEquipment();
            }
        } catch (e) {
            console.error("Failed to equip item", e);
        }
    };

    const rarityColors = {
        common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-500', badge: 'bg-gray-200 text-gray-600' },
        rare: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-500', badge: 'bg-blue-100 text-blue-600' },
        epic: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-500', badge: 'bg-purple-100 text-purple-600' },
        legendary: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
    };

    const getRarityStyle = (rarity) => rarityColors[rarity] || rarityColors.common;

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">{t('collection.loading')}</p>
                </div>
            </div>
        );
    }

    const cardsMap = {
        student: studentCards,
        tutor: tutorCards.filter(c => c.subject !== 'chinese').filter(c => c.subject === subTab || (subTab === 'ace' && c.subject === 'general')),
        frame: avatarFrames
    };
    const activeCards = cardsMap[tab] || [];

    const traitLabels = {
        intensity: 'Level',
        disposition: 'Mood',
        vibe: 'Manner',
        philosophy: 'Driven'
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black font-display text-gray-900 tracking-tight">{t('collection.title')}</h1>
                        <p className="text-gray-500 font-medium">{t('collection.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Tab Switcher - Premium Style */}
            <div className="flex p-1.5 bg-gray-100 rounded-[2rem] w-fit mb-10 shadow-inner">
                {[
                    { id: 'student', label: t('collection.students'), icon: GraduationCap, count: stats.ownedStudentCards, total: stats.totalStudentCards },
                    { id: 'tutor', label: t('collection.tutors'), icon: User, count: stats.ownedTutorCards, total: stats.totalTutorCards },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all ${tab === item.id
                            ? 'bg-white text-gray-900 shadow-md scale-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <item.icon className={`w-4 h-4 ${tab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {item.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab === item.id ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                            {item.count}/{item.total}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tutor Sub-tabs */}
            {tab === 'tutor' && (
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar animate-in slide-in-from-left duration-500">
                    {[
                        { id: 'english', label: t('redemption.english'), color: 'bg-blue-50 text-blue-600' },
                        { id: 'maths', label: t('redemption.maths'), color: 'bg-violet-50 text-violet-600' },
                        { id: 'ace', label: 'Ace Sir', color: 'bg-amber-50 text-amber-600' },
                    ].map(st => (
                        <button
                            key={st.id}
                            onClick={() => setSubTab(st.id)}
                            className={`px-5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border-2 ${subTab === st.id
                                ? `${st.color} border-current shadow-sm`
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeCards.map(card => {
                    const owned = card.owned;
                    const equipped = card.equipped;
                    const rarity = card.rarity || 'common';
                    const style = getRarityStyle(rarity);

                    return (
                        <div
                            key={card.id}
                            className={`group relative rounded-[2.5rem] border-2 overflow-hidden transition-all duration-300 ${owned
                                ? `${style.bg} ${style.border} shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2`
                                : 'bg-white border-gray-100 border-dashed opacity-50 grayscale hover:grayscale-0 transition-all'
                                }`}
                        >
                            {/* Card Image Stage */}
                            <div className="aspect-[4/5] overflow-hidden relative m-3 rounded-[2rem] bg-white">
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=random&size=400&bold=true`;
                                    }}
                                />
                                
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${style.badge} shadow-sm`}>
                                        {rarity}
                                    </span>
                                    {equipped && (
                                        <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {!owned && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                                        <div className="bg-white/90 p-4 rounded-3xl shadow-xl">
                                            <Lock className="w-8 h-8 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info Area */}
                            <div className="p-6 pt-2">
                                <div className="mb-4">
                                    <h4 className="font-black text-xl text-gray-900 leading-tight mb-1">{card.name}</h4>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-2 min-h-[2.5rem]">{card.description}</p>
                                </div>

                                {tab === 'tutor' && card.traits && (
                                    <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-white/50 rounded-2xl border border-white">
                                        {Object.entries(card.traits).map(([key, val]) => (
                                            <div key={key} className="flex flex-col">
                                                <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider">{traitLabels[key] || key}</span>
                                                <span className="text-[11px] font-bold text-gray-700 capitalize">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {owned ? (
                                    <button
                                        disabled={equipped}
                                        onClick={() => handleEquip(card, tab)}
                                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${equipped
                                            ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                                            : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-black/10'
                                            }`}
                                    >
                                        {equipped ? t('collection.active') : t('collection.equip')}
                                    </button>
                                ) : (
                                    <div className="text-center py-4 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl">
                                        {t('collection.not_owned')}
                                    </div>
                                )}
                            </div>

                            {/* Legendary Shimmer */}
                            {rarity === 'legendary' && owned && (
                                <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] shadow-[inset_0_0_30px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/50"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {activeCards.length === 0 && (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                    <p className="text-lg font-bold text-gray-400">{t('collection.empty')}</p>
                </div>
            )}
        </div>
    );
};

export default CardCollection;
