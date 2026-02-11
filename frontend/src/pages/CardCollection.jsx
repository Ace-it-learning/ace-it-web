import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, GraduationCap, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CardCollection = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [tab, setTab] = useState('student');
    const [studentCards, setStudentCards] = useState([]);
    const [tutorCards, setTutorCards] = useState([]);
    const [equippedTutor, setEquippedTutor] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!user) return;

        const fetchCollection = async () => {
            try {
                const res = await fetch(`${API_URL}/api/redemption/collection?uid=${user.uid}`);
                const data = await res.json();

                setStudentCards(data.studentCards || []);
                setTutorCards(data.tutorCards || []);
                setEquippedTutor(data.equippedTutor || null);
                setStats(data.stats || {});
            } catch (e) {
                console.error("Failed to load collection data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [user]);

    const handleEquip = async (cardId) => {
        try {
            const res = await fetch(`${API_URL}/api/redemption/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, cardId })
            });
            const data = await res.json();
            if (data.success) {
                setEquippedTutor(cardId);
                // Update the equipped status in tutor cards
                setTutorCards(prev => prev.map(c => ({
                    ...c,
                    equipped: c.id === cardId
                })));
            }
        } catch (e) {
            console.error("Failed to equip card", e);
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

    const activeCards = tab === 'student' ? studentCards : tutorCards;
    const ownedStudentCount = stats.ownedStudentCards || 0;
    const totalStudentCount = stats.totalStudentCards || studentCards.length;
    const ownedTutorCount = stats.ownedTutorCards || 0;
    const totalTutorCount = stats.totalTutorCards || tutorCards.length;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900">{t('collection.title')}</h1>
                        <p className="text-gray-500">{t('collection.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab('student')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'student'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <GraduationCap className="w-4 h-4" />
                    {t('collection.student_cards')} ({ownedStudentCount}/{totalStudentCount})
                </button>
                <button
                    onClick={() => setTab('tutor')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'tutor'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <User className="w-4 h-4" />
                    {t('collection.tutor_cards')} ({ownedTutorCount}/{totalTutorCount})
                </button>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeCards.map(card => {
                    const owned = card.owned;
                    const equipped = card.equipped;
                    const rarity = card.rarity || 'common';
                    const style = getRarityStyle(rarity);

                    return (
                        <div
                            key={card.id}
                            className={`relative rounded-2xl border-2 overflow-hidden transition-all group ${owned
                                ? `${style.bg} ${style.border} shadow-sm hover:shadow-md hover:-translate-y-1`
                                : 'bg-gray-50 border-gray-200 border-dashed opacity-60'
                                }`}
                        >
                            {/* Card Image */}
                            <div className={`aspect-square overflow-hidden relative ${!owned ? 'grayscale' : ''}`}>
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=random&size=200&bold=true`;
                                    }}
                                />
                                {!owned && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Lock className="w-10 h-10 text-white/70" />
                                    </div>
                                )}
                            </div>

                            {/* Card Info */}
                            <div className="p-3">
                                <h4 className="font-bold text-sm text-gray-800 truncate">{card.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{card.description}</p>

                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
                                        {rarity}
                                    </span>

                                    {/* Equip button for tutor cards */}
                                    {tab === 'tutor' && owned && (
                                        equipped ? (
                                            <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                                                <CheckCircle className="w-3 h-3" /> {t('collection.equipped')}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleEquip(card.id)}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                                            >
                                                {t('collection.equip')}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Rarity glow for legendaries */}
                            {rarity === 'legendary' && owned && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-amber-400 rounded-2xl shadow-[inset_0_0_20px_rgba(251,191,36,0.15)]"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {activeCards.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">{t('collection.empty')}</p>
                </div>
            )}
        </div>
    );
};

export default CardCollection;
