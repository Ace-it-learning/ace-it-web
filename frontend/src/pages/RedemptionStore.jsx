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

    const handleOpenBox = async (tier = 'standard', cost = 500) => {
        if (xp < cost) {
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
                body: JSON.stringify({ uid: user.uid, tier })
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/collection')}
                        className="bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-white hover:shadow-md transition-all font-bold text-sm"
                    >
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        {t('collection.my_collection')}
                    </button>
                    <div className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('redemption.balance')}</span>
                        <span className="text-2xl font-black text-yellow-500">{xp} XP</span>
                    </div>
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

                {/* LEFT: Mystery Box Categories */}
                <div className="flex flex-col gap-4">
                    {[
                        { id: 'standard', name: t('redemption.standard_box'), cost: 500, icon: '📦', color: 'from-blue-600 to-indigo-700', desc: t('redemption.standard_box_desc') },
                        { id: 'tutor', name: t('redemption.tutor_box'), cost: 1500, icon: '⭐', color: 'from-amber-500 to-orange-600', desc: t('redemption.tutor_box_desc') },
                        { id: 'aesthetics', name: t('redemption.frames_box'), cost: 800, icon: '✨', color: 'from-emerald-500 to-teal-600', desc: t('redemption.frames_box_desc') },
                    ].map(box => (
                        <div key={box.id} className={`bg-gradient-to-r ${box.color} rounded-3xl p-6 text-white shadow-xl flex items-center justify-between group overflow-hidden relative`}>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="text-5xl group-hover:scale-110 transition-transform">{box.icon}</div>
                                <div>
                                    <h3 className="text-xl font-bold font-display">{box.name}</h3>
                                    <p className="text-white/70 text-sm max-w-[200px] leading-tight mt-1">{box.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenBox(box.id, box.cost)}
                                disabled={isOpening}
                                className="bg-white text-gray-900 px-5 py-2.5 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all relative z-10 disabled:opacity-50"
                            >
                                {box.cost} XP
                            </button>
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    ))}

                    {/* Result Overlay / Reveal Area */}
                    { (isOpening || revealedItem) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                             <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                {isOpening ? (
                                    <div className="py-10">
                                        <div className="text-8xl animate-bounce mb-6">📦</div>
                                        <h3 className="text-2xl font-black text-gray-900">{t('redemption.opening')}...</h3>
                                        <div className="mt-4 w-48 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                            <div className="h-full bg-indigo-600 animate-[loading_2s_ease-in-out_infinite]"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in zoom-in duration-500">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
                                        <div className="w-48 h-48 mx-auto mb-6 relative">
                                            <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full animate-pulse"></div>
                                            <img
                                                src={revealedItem.image || "https://img.freepik.com/free-vector/gradient-avatar-frame-template_23-2150338786.jpg"}
                                                alt={revealedItem.name}
                                                className="w-full h-full object-cover rounded-[2rem] border-4 border-gray-100 shadow-xl relative z-10"
                                            />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">{revealedItem.rarity || 'Common'}</p>
                                        <h3 className="text-3xl font-black text-gray-900 mb-2">{revealedItem.name}</h3>
                                        <p className="text-gray-500 text-sm mb-8">{t('redemption.congrats')}</p>
                                        <button
                                            onClick={() => setRevealedItem(null)}
                                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg"
                                        >
                                            {t('redemption.awesome')}
                                        </button>
                                        <div className="mt-4 text-xs text-gray-400">
                                            {t('redemption.check_collection')}
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
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
