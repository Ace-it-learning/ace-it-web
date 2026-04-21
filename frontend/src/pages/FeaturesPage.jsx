import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, 
    Zap, 
    BookOpen, 
    Trophy, 
    Calendar, 
    CheckCircle, 
    Users, 
    Sparkles,
    ChevronRight,
    Search,
    Mic,
    PenTool,
    Headphones,
    BarChart3
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FeaturesPage = () => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('reading');

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
        { id: 'reading', icon: <Search className="w-5 h-5" />, label: t('features.quest.tabs.reading'), color: "blue" },
        { id: 'writing', icon: <PenTool className="w-5 h-5" />, label: t('features.quest.tabs.writing'), color: "orange" },
        { id: 'listening', icon: <Headphones className="w-5 h-5" />, label: t('features.quest.tabs.listening'), color: "emerald" },
        { id: 'speaking', icon: <Mic className="w-5 h-5" />, label: t('features.quest.tabs.speaking'), color: "purple" }
    ];

    const tabContent = {
        reading: {
            title: language === 'zh' ? '深度閱讀分析' : 'Deep Reading Analysis',
            desc: language === 'zh' ? '即時詞彙解釋、文章邏輯圖解與 5** 級解析。' : 'Instant vocabulary definitions, logic mapping, and Level 5** explanations.',
            features: [
                language === 'zh' ? '點擊即查詞典' : 'Click-to-define Dictionary',
                language === 'zh' ? '段落邏輯分析' : 'Paragraph Logic Insights',
                language === 'zh' ? '動態應試腳手架' : 'Dynamic Scaffolding'
            ]
        },
        writing: {
            title: language === 'zh' ? '寫作精英模式' : 'Writing Elite Mode',
            desc: language === 'zh' ? '由 AI 驅動的 C-L-O 三維評分，助你精煉每一句。' : 'AI-driven C-L-O triad grading to refine every sentence of your essay.',
            features: [
                language === 'zh' ? '實時內容反饋' : 'Real-time Content Feedback',
                language === 'zh' ? '5** 級範文對比' : 'Elite Exemplar Comparison',
                language === 'zh' ? '語法與流暢度優化' : 'Grammar & Fluency Optimization'
            ]
        },
        listening: {
            title: language === 'zh' ? '沉浸式聆聽訓練' : 'Immersive Listening Training',
            desc: language === 'zh' ? '模擬 DSE 錄音環境，配合智能筆記與重點提取。' : 'Simulated DSE recording environments with smart note-taking and key-point extraction.',
            features: [
                language === 'zh' ? '多口音聽力源' : 'Multi-accent Audio Sources',
                language === 'zh' ? '綜合能力分析' : 'Integrated Skills Analysis',
                language === 'zh' ? '對話重點捕捉' : 'Conversation Key-point Capture'
            ]
        },
        speaking: {
            title: language === 'zh' ? 'AI 口語實驗室' : 'AI Speaking Lab',
            desc: language === 'zh' ? '24/7 AI 陪練員，即時分析發音、流暢度與內容邏輯。' : '24/7 AI sparring partners analyzing pronunciation, fluency, and logic.',
            features: [
                language === 'zh' ? '即時發音糾正' : 'Instant Pronunciation Correction',
                language === 'zh' ? '觀點思維導圖' : 'Ideas Mind Mapping',
                language === 'zh' ? '模擬小組討論' : 'Group Discussion Simulation'
            ]
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0f1115] text-gray-900 dark:text-white transition-colors duration-500">
            <Header />

            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Premium Features</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
                            {t('features.title')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                            {t('features.subtitle')}
                        </p>
                    </motion.div>
                </section>

                {/* AI Tutor Showcase */}
                <section className="container mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                            className="space-y-8"
                        >
                            <motion.div variants={itemVariants}>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 italic">{t('features.tutors.title')}</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    {t('features.tutors.desc')}
                                </p>
                            </motion.div>

                            <div className="space-y-4">
                                {[
                                    { name: t('features.tutors.ace'), icon: <Zap />, color: "bg-orange-500" },
                                    { name: t('features.tutors.math'), icon: <BarChart3 />, color: "bg-blue-500" },
                                    { name: t('features.tutors.english'), icon: <BookOpen />, color: "bg-emerald-500" }
                                ].map((tutor, i) => (
                                    <motion.div
                                        key={tutor.name}
                                        variants={itemVariants}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-orange-500/50 transition-all cursor-default group"
                                    >
                                        <div className={`p-3 rounded-xl ${tutor.color} text-white group-hover:scale-110 transition-transform`}>
                                            {tutor.icon}
                                        </div>
                                        <span className="font-bold text-lg">{tutor.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
                                <img 
                                    src="/src/assets/features/chat_mockup.png" 
                                    alt="Chat Interface Mockup" 
                                    className="w-full h-auto"
                                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&q=80&w=1000"; }}
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Live AI Simulation</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* The Quest Hub (Tabs) */}
                <section className="bg-white dark:bg-[#1a110a] py-32 transition-colors">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 italic">{t('features.quest.title')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                {t('features.quest.desc')}
                            </p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex flex-wrap justify-center gap-4 mb-16">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                                        activeTab === tab.id
                                            ? `bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl scale-105`
                                            : `bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10`
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
                                        <h3 className="text-4xl font-black mb-4 tracking-tight">
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

                                    <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                                        <span>Learn more about {activeTab} quest</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative rounded-[2.5rem] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 shadow-inner">
                                    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800 rounded-[2rem] overflow-hidden flex items-center justify-center relative shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5" />
                                        <div className="z-10 text-center p-8">
                                            <div className="inline-block p-4 rounded-3xl bg-white dark:bg-gray-900 shadow-xl mb-6">
                                                {tabs.find(t => t.id === activeTab).icon}
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                                                Visual Interface Preview
                                            </p>
                                            <h4 className="text-xl font-bold mt-2">
                                                {tabContent[activeTab].title}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Weekly & Mock Grid */}
                <section className="container mx-auto px-6 py-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-12 rounded-[3rem] bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden group"
                        >
                            <Calendar className="w-12 h-12 text-blue-400 mb-8" />
                            <h3 className="text-3xl font-bold mb-4">{t('features.weekly.title')}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                {t('features.weekly.desc')}
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
                                    Dynamic Content
                                </span>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -right-10 size-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-12 rounded-[3rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 relative overflow-hidden group shadow-xl shadow-orange-500/5"
                        >
                            <BarChart3 className="w-12 h-12 text-orange-500 mb-8" />
                            <h3 className="text-3xl font-bold mb-4">{t('features.mock.title')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                                {t('features.mock.desc')}
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-widest">
                                    DSE Aligned
                                </span>
                            </div>

                             {/* Decorative element */}
                             <div className="absolute -bottom-10 -right-10 size-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all" />
                        </motion.div>
                    </div>
                </section>

                {/* Call Action */}
                <section className="container mx-auto px-6 pb-20 pt-10">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="p-16 rounded-[4rem] bg-primary text-white text-center shadow-2xl shadow-primary/30 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-50" />
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 italic">Ready to Ace your DSE?</h2>
                            <button className="px-10 py-5 bg-white text-primary rounded-full font-black text-xl hover:bg-orange-50 transition-all transform hover:scale-110 active:scale-95 shadow-xl">
                                Start Your Journey Now
                            </button>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default FeaturesPage;
