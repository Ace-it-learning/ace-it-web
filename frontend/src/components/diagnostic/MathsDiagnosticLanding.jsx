import React from 'react';
import { Play, Clock, Calculator, Zap, Shapes, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MathsDiagnosticLanding = ({ onStart }) => {
    const { language } = useLanguage();

    const translations = {
        en: {
            title: "15-Minute Calibration",
            subtitle: "Before we design your study plan, let's find your starting line.",
            subtext: "This is not a test—it's a quick check to see what you already know.",
            time: "15 Minutes",
            timeDesc: "Total time",
            skills: "3 Areas",
            skillsDesc: "DSE Core Topics",
            instant: "Instant",
            instantDesc: "Results now",
            adaptive: "Adaptive",
            adaptiveDesc: "Your level",
            reward: "Earn 500 XP",
            rewardDesc: "Guaranteed upon completion",
            button: "Start Calibration"
        },
        zh: {
            title: "15分鐘能力校準",
            subtitle: "在制定學習計劃之前，讓我們找準你的起跑線。",
            subtext: "這不是考試——這是一個快速檢查，了解你的現有水平。",
            time: "15 分鐘",
            timeDesc: "總需時間",
            skills: "3 大範疇",
            skillsDesc: "DSE 核心課題",
            instant: "即時反饋",
            instantDesc: "立即獲得結果",
            adaptive: "自適應性",
            adaptiveDesc: "因材施教",
            reward: "獲得 500 XP",
            rewardDesc: "完成後保證獲得",
            button: "開始能力校準"
        }
    };

    const t = translations[language === 'zh' ? 'zh' : 'en'];

    return (
        <div className="min-h-screen bg-white flex items-start justify-center p-4 pt-16">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" />
                        Mathematics Edition
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-900 mb-4 tracking-tight">
                        {t.title}
                    </h1>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        {t.subtitle}
                        <span className="block text-gray-500 text-sm mt-2 font-medium">{t.subtext}</span>
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Time Card */}
                    <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform">
                                <Clock className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{t.time}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.timeDesc}</p>
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 hover:border-purple-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform">
                                <Calculator className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{t.skills}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.skillsDesc}</p>
                        </div>
                    </div>

                    {/* Instant Feedback Card */}
                    <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform">
                                <Zap className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{t.instant}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.instantDesc}</p>
                        </div>
                    </div>

                    {/* Adaptive Card */}
                    <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform">
                                <Shapes className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{t.adaptive}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.adaptiveDesc}</p>
                        </div>
                    </div>
                </div>

                {/* XP Reward Badge */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl p-6 mb-8 shadow-inner group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="flex items-center justify-center gap-6 relative z-10">
                        <div className="text-5xl transform group-hover:scale-110 transition-transform duration-500">🎁</div>
                        <div className="text-center md:text-left">
                            <p className="text-amber-700 font-black text-2xl mb-1 tracking-tight">{t.reward}</p>
                            <p className="text-gray-600 text-sm font-bold uppercase tracking-widest opacity-80">{t.rewardDesc}</p>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <button
                        onClick={onStart}
                        className="group bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black py-4 px-12 rounded-2xl text-xl shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 inline-flex items-center gap-4"
                    >
                        {t.button}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MathsDiagnosticLanding;
