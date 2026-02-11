import React, { useState, useEffect } from 'react';
import { Gift, ArrowLeft, Lock, Award, BookOpen, Calculator, Languages, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RedemptionStore = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [xp, setXp] = useState(0);

    // Gacha State
    const [isOpening, setIsOpening] = useState(false);
    const [revealedItem, setRevealedItem] = useState(null);
    const [error, setError] = useState(null);

    const BOX_COST = 500;

    // Certificate subject tabs
    const [activeSubject, setActiveSubject] = useState('english');

    // Certificate definitions per subject
    const certificateMap = {
        english: [
            { id: 'eng_p1', label: t('redemption.cert_reading'), paper: 'Paper 1 Reading' },
            { id: 'eng_p2', label: t('redemption.cert_writing'), paper: 'Paper 2 Writing' },
            { id: 'eng_p3', label: t('redemption.cert_listening'), paper: 'Paper 3 Listening' },
            { id: 'eng_p4', label: t('redemption.cert_speaking'), paper: 'Paper 4 Speaking' },
        ],
        maths: [
            { id: 'math_p1', label: t('redemption.cert_math_p1'), paper: 'Paper 1' },
            { id: 'math_p2', label: t('redemption.cert_math_p2'), paper: 'Paper 2' },
        ],
        chinese: [
            { id: 'chi_p1', label: t('redemption.cert_chi_reading'), paper: 'Paper 1 Reading' },
            { id: 'chi_p2', label: t('redemption.cert_chi_writing'), paper: 'Paper 2 Writing' },
        ],
    };

    const subjectTabs = [
        { key: 'english', label: t('redemption.english'), icon: BookOpen, color: 'blue' },
        { key: 'maths', label: t('redemption.maths'), icon: Calculator, color: 'violet' },
        { key: 'chinese', label: t('redemption.chinese'), icon: Languages, color: 'rose' },
    ];

    useEffect(() => {
        if (!user) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        fetch(`${API_URL}/api/stats?uid=${user.uid}`)
            .then(res => res.json())
            .then(data => setXp(data.xp || 0))
            .catch(console.error);
    }, [user]);

    const handleOpenBox = async () => {
        if (xp < BOX_COST) {
            setError(t('redemption.not_enough_xp'));
            return;
        }
        setError(null);
        setIsOpening(true);
        setRevealedItem(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/redemption/blindbox`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
            });
            const data = await res.json();

            setTimeout(() => {
                if (data.success) {
                    setXp(data.newBalance);
                    setRevealedItem(data.newItem);
                } else {
                    setError(data.error || t('redemption.failed'));
                }
                setIsOpening(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(t('redemption.server_error'));
            setIsOpening(false);
        }
    };

    const colorMap = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', activeBg: 'bg-blue-600', icon: 'text-blue-500' },
        violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', activeBg: 'bg-violet-600', icon: 'text-violet-500' },
        rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', activeBg: 'bg-rose-600', icon: 'text-rose-500' },
    };

    const activeTabData = subjectTabs.find(s => s.key === activeSubject);
    const activeColor = colorMap[activeTabData?.color || 'blue'];

    return (
        <div className="max-w-7xl mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900">{t('redemption.title')}</h1>
                        <p className="text-gray-500">{t('redemption.subtitle')}</p>
                    </div>
                </div>
                <div className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('redemption.balance')}</span>
                    <span className="text-2xl font-black text-yellow-500">{xp} XP</span>
                </div>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl border border-red-200 animate-pulse text-center font-bold mb-6">
                    {error}
                </div>
            )}

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>

                {/* LEFT: Mystery Box */}
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Top: Title Area */}
                        <div className="space-y-4 mb-6">
                            <h2 className="text-3xl xl:text-4xl font-black font-display leading-tight">
                                {t('redemption.mystery_box')}
                            </h2>
                            <p className="text-purple-200 text-sm max-w-xs">
                                {t('redemption.mystery_box_desc')}
                            </p>
                        </div>

                        {/* Middle: Animation Stage */}
                        <div className="flex-1 flex justify-center items-center min-h-[180px]">
                            {isOpening ? (
                                <div className="animate-bounce text-8xl">📦</div>
                            ) : revealedItem ? (
                                <div className="text-center animate-in zoom-in duration-500">
                                    <div className="w-36 h-36 mx-auto mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                        <img
                                            src={revealedItem.image || "https://img.freepik.com/free-vector/gradient-avatar-frame-template_23-2150338786.jpg"}
                                            alt={revealedItem.name}
                                            className="w-full h-full object-cover rounded-xl border-4 border-white shadow-lg transform hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold">{revealedItem.name}</h3>
                                    <p className={`uppercase tracking-widest text-xs font-bold mt-1 ${revealedItem.rarity === 'legendary' ? 'text-yellow-400' : revealedItem.rarity === 'epic' ? 'text-purple-300' : 'text-gray-300'}`}>
                                        {revealedItem.rarity}
                                    </p>
                                    <button
                                        onClick={() => setRevealedItem(null)}
                                        className="mt-4 text-sm text-white/50 hover:text-white underline"
                                    >
                                        {t('redemption.open_another')}
                                    </button>
                                </div>
                            ) : (
                                <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse"></div>
                                    <Gift className="w-36 h-36 text-yellow-400 drop-shadow-2xl relative z-10" />
                                </div>
                            )}
                        </div>

                        {/* Bottom: CTA */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                            <button
                                onClick={handleOpenBox}
                                disabled={isOpening}
                                className={`px-6 py-3 rounded-2xl font-black text-base flex items-center gap-2 transition-all w-full sm:w-auto justify-center ${isOpening
                                    ? "bg-gray-600 cursor-wait"
                                    : "bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                                    }`}
                            >
                                {isOpening ? t('redemption.opening') : (<><span>🎁</span> {t('redemption.open_for').replace('{{cost}}', BOX_COST)}</>)}
                            </button>
                            <span className="text-xs text-purple-300 font-medium">{t('redemption.no_duplicates')}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Digital Certificates */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-amber-100 rounded-xl">
                            <Award className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{t('redemption.digital_certs')}</h3>
                            <p className="text-xs text-gray-400">{t('redemption.cert_subtitle')}</p>
                        </div>
                    </div>

                    {/* Subject Tabs */}
                    <div className="flex gap-2 mb-5">
                        {subjectTabs.map(tab => {
                            const isActive = activeSubject === tab.key;
                            const TabIcon = tab.icon;
                            const colors = colorMap[tab.color];
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveSubject(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                                        ? `${colors.activeBg} text-white shadow-md`
                                        : `${colors.bg} ${colors.text} hover:shadow-sm`
                                        }`}
                                >
                                    <TabIcon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Certificate Cards */}
                    <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-min">
                        {certificateMap[activeSubject]?.map(cert => {
                            // Placeholder: In Phase 2, this will be fetched from backend
                            const earned = false;
                            const grade = null;

                            return (
                                <div
                                    key={cert.id}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${earned
                                        ? `${activeColor.bg} ${activeColor.border}`
                                        : 'bg-gray-50 border-gray-200 border-dashed'
                                        }`}
                                >
                                    {earned ? (
                                        <>
                                            <Award className={`w-10 h-10 mb-2 ${activeColor.icon}`} />
                                            <span className="font-bold text-sm text-gray-800">{cert.label}</span>
                                            <span className={`text-xs font-black mt-1 ${activeColor.text}`}>
                                                Level {grade}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-8 h-8 mb-2 text-gray-300" />
                                            <span className="font-semibold text-sm text-gray-400">{cert.label}</span>
                                            <span className="text-[10px] text-gray-300 mt-1">
                                                {t('redemption.cert_locked')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer hint */}
                    <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                        <p className="text-[11px] text-gray-400">{t('redemption.cert_hint')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RedemptionStore;
