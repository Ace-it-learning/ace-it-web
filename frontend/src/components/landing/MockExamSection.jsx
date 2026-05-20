import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Target, 
    ClipboardCheck, 
    Timer, 
    BarChart, 
    Layers,
    ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const MockExamSection = ({ id }) => {
    const { t, language } = useLanguage();

    const stats = [
        { 
            icon: <Timer className="w-6 h-6 text-blue-500" />, 
            label: language === 'zh' ? '標準長度' : 'Standard Length', 
            desc: language === 'zh' ? '完整模擬考試時間' : 'Full exam duration simulation' 
        },
        { 
            icon: <Layers className="w-6 h-6 text-orange-500" />, 
            label: language === 'zh' ? '官方格式' : 'Official Format', 
            desc: language === 'zh' ? '100% 遵循考評局格式' : '100% HKEAA alignment' 
        },
        { 
            icon: <ClipboardCheck className="w-6 h-6 text-emerald-500" />, 
            label: language === 'zh' ? '評分準則' : 'Marking Scheme', 
            desc: language === 'zh' ? '精準 AI 閱卷分析' : 'Precise AI-led grading' 
        },
        { 
            icon: <BarChart className="w-6 h-6 text-purple-500" />, 
            label: language === 'zh' ? '預計等級' : 'Predicted Grade', 
            desc: language === 'zh' ? '動態預測 DSE 成績' : 'Dynamic DSE grade prediction' 
        }
    ];

    return (
        <section id={id} className="relative py-32 bg-[#f8f9fb] dark:bg-[#0d0d0d] overflow-hidden transition-colors">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/4 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Content Side */}
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest mb-8">
                            <Target className="w-4 h-4" />
                            {language === 'zh' ? '王牌功能' : 'Signature Feature'}
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] dark:text-white">
                            {language === 'zh' ? '100% 真實模擬試場' : '100% Realistic Mock Environment'}
                        </h2>
                        
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-xl">
                            {language === 'zh' 
                                ? '我們提供市面上最精準的 DSE 模擬考試。從卷一到卷四，無論是考試時間、題目深度，還是評分準則，我們都做到極致還原，助你提前適應考場壓力。' 
                                : 'Experience the most precise HKDSE simulations. From Paper 1 to 4, we reproduce every detail—length, depth, and criteria—to ensure you are battle-ready for the actual exam.'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            {stats.map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm"
                                >
                                    <div className="mb-4">{stat.icon}</div>
                                    <h4 className="text-lg font-bold mb-1 dark:text-white">{stat.label}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        <Link
                            to="/hkdse-english"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                            {language === 'zh' ? '進入模擬試場' : 'Enter Mock Studio'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Visual Side */}
                    <div className="flex-1 relative">
                        <div className="relative z-10 p-8 rounded-[3rem] bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-white/10">
                            {/* Grade Prediction Card Mockup */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                                    <h3 className="text-xl font-bold dark:text-white">{language === 'zh' ? '最新模擬試報告' : 'Latest Mock Report'}</h3>
                                    <span className="text-xs font-bold text-gray-400">MAY 2026</span>
                                </div>

                                <div className="flex items-center gap-8 py-4">
                                    <div className="relative size-32 flex items-center justify-center">
                                        <svg className="size-full" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-primary">5**</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{language === 'zh' ? '預計等級' : 'Predicted'}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-gray-500">{language === 'zh' ? '精準度' : 'Precision'}</span>
                                                <span className="text-primary">98%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                                <div className="h-full bg-primary w-[98%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-gray-500">{language === 'zh' ? '優勢點' : 'Strength'}</span>
                                                <span className="text-emerald-500">Writing P2</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[92%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'zh' ? '總得分' : 'Total Score'}</p>
                                        <p className="text-xl font-black dark:text-white">84/100</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'zh' ? '全港排名' : 'Percentile'}</p>
                                        <p className="text-xl font-black dark:text-white">Top 2%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative floating elements */}
                        <div className="absolute -top-6 -right-6 size-24 rounded-3xl bg-blue-500 shadow-xl shadow-blue-500/20 flex items-center justify-center animate-bounce duration-[3s]">
                            <Target className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 size-40 bg-orange-500/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MockExamSection;
