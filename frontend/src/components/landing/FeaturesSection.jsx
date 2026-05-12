import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    BookOpen,
    Mic,
    PenTool,
    Headphones,
    Calendar,
    BarChart3,
    Library,
    ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FeaturesSection = ({ id }) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('grammar');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const tabs = [
        { id: 'grammar', icon: <Library className="w-5 h-5" />, label: language === 'zh' ? '語法實驗室' : 'Grammar Lab', color: "indigo" },
        { id: 'reading', icon: <BookOpen className="w-5 h-5" />, label: t('features.quest.tabs.reading'), color: "blue" },
        { id: 'writing', icon: <PenTool className="w-5 h-5" />, label: t('features.quest.tabs.writing'), color: "orange" },
        { id: 'listening', icon: <Headphones className="w-5 h-5" />, label: t('features.quest.tabs.listening'), color: "emerald" },
        { id: 'speaking', icon: <Mic className="w-5 h-5" />, label: t('features.quest.tabs.speaking'), color: "purple" }
    ];

    const tabImages = {
        grammar: '/Quest_Hub/Grammer_lab.jpg',
        reading: '/Quest_Hub/Reading_lab.jpg',
        writing: '/Quest_Hub/Writing_lab.jpg',
        listening: '/Quest_Hub/Listening_Lab.jpg',
        speaking: '/Quest_Hub/Speaking_Lab.jpg'
    };

    const tabContent = {
        grammar: {
            title: language === 'zh' ? '語法精準實驗室' : 'Grammar Precision Lab',
            desc: language === 'zh' ? '透過互動式 AI 練習與即時糾錯，掌握複雜的 HKDSE 語法結構。' : 'Master complex HKDSE grammar structures through interactive AI-led drills and instant error correction.',
            features: [
                language === 'zh' ? '動態糾錯機制' : 'Dynamic Error Correction',
                language === 'zh' ? '句型精通訓練' : 'Sentence Pattern Mastery',
                language === 'zh' ? '5** 級結構分析' : 'Level 5** Structural Analysis',
                language === 'zh' ? '每週語法實驗室' : 'Weekly Grammar Labs'
            ]
        },
        reading: {
            title: language === 'zh' ? '深度閱讀分析' : 'Deep Reading Analysis',
            desc: language === 'zh' ? '即時詞彙解釋、文章邏輯圖解與 5** 級解析。' : 'Instant vocabulary definitions, logic mapping, and Level 5** explanations.',
            features: [
                language === 'zh' ? '點擊即查詞典' : 'Click-to-define Dictionary',
                language === 'zh' ? '段落邏輯分析' : 'Paragraph Logic Insights',
                language === 'zh' ? '動態應試腳手架' : 'Dynamic Scaffolding',
                language === 'zh' ? '每週更新 DSE 篇章' : 'Weekly Updated DSE Passages'
            ]
        },
        writing: {
            title: language === 'zh' ? '寫作精英模式' : 'Writing Elite Mode',
            desc: language === 'zh' ? '由 AI 驅動的 C-L-O 三維評分，助你精煉每一句。' : 'AI-driven C-L-O triad grading to refine every sentence of your essay.',
            features: [
                language === 'zh' ? '實時內容反饋' : 'Real-time Content Feedback',
                language === 'zh' ? '5** 級範文對比' : 'Elite Exemplar Comparison',
                language === 'zh' ? '每週熱門試題' : 'Weekly Trending Topics'
            ]
        },
        listening: {
            title: language === 'zh' ? '沉浸式聆聽訓練' : 'Immersive Listening Training',
            desc: language === 'zh' ? '模擬 DSE 錄音環境，配合智能筆記與重點提取。' : 'Simulated DSE recording environments with smart note-taking and key-point extraction.',
            features: [
                language === 'zh' ? '多口音聽力源' : 'Multi-accent Audio Sources',
                language === 'zh' ? '綜合能力分析' : 'Integrated Skills Analysis',
                language === 'zh' ? '每週新錄音實戰' : 'Weekly New Audio Quests'
            ]
        },
        speaking: {
            title: language === 'zh' ? 'AI 口語實驗室' : 'AI Speaking Lab',
            desc: language === 'zh' ? '24/7 AI 陪練員，即時分析發音、流暢度與內容邏輯。' : '24/7 AI sparring partners analyzing pronunciation, fluency, and logic.',
            features: [
                language === 'zh' ? '即時發音糾正' : 'Instant Pronunciation Correction',
                language === 'zh' ? '觀點思維導圖' : 'Ideas Mind Mapping',
                language === 'zh' ? '每週模擬討論組' : 'Weekly Group Discussions'
            ]
        }
    };

    return (
        <section id={id} className="bg-white dark:bg-[#1a110a] py-24 transition-colors">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 italic dark:text-white">{t('features.quest.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        {t('features.quest.desc')}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${
                                activeTab === tab.id
                                    ? `bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl scale-105`
                                    : `bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 dark:text-gray-400`
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="space-y-8 text-left lg:pl-12">
                            <div>
                                <h3 className="text-4xl font-black mb-4 tracking-tight dark:text-white">
                                    {tabContent[activeTab].title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                    {tabContent[activeTab].desc}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {tabContent[activeTab].features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                                        <div className="size-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                                            <CheckCircle className="w-3 h-3 text-orange-500" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95">
                                {language === 'zh' 
                                    ? `開始 ${tabs.find(t => t.id === activeTab).label} 任務` 
                                    : `Start ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Quest`}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="relative rounded-[2.5rem] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 shadow-inner">
                            <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800 rounded-[2rem] overflow-hidden relative shadow-2xl">
                                <img
                                    src={tabImages[activeTab]}
                                    alt={tabContent[activeTab].title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

            </div>
        </section>
    );
};

export default FeaturesSection;
