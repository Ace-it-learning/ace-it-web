import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Pi, Copy, Check, ChevronLeft, Sparkles, MessageSquare, Trophy, Target, LineChart, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PromptTipsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [copiedId, setCopiedId] = useState(null);

    const categories = [
        {
            id: 'english',
            title: t('prompts.categories.english.title'),
            icon: <Book className="w-6 h-6 text-blue-400" />,
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            prompts: [
                { id: 'e1', text: t('prompts.categories.english.p1') },
                { id: 'e2', text: t('prompts.categories.english.p2') },
                { id: 'e3', text: t('prompts.categories.english.p3') },
                { id: 'e4', text: t('prompts.categories.english.p4') },
                { id: 'e5', text: t('prompts.categories.english.p5') },
                { id: 'e6', text: t('prompts.categories.english.p6') },
                { id: 'e7', text: t('prompts.categories.english.p7') },
                { id: 'e8', text: t('prompts.categories.english.p8') },
                { id: 'e9', text: t('prompts.categories.english.p9') }
            ]
        },
        {
            id: 'ace',
            title: t('prompts.categories.ace.title'),
            icon: <Trophy className="w-6 h-6 text-amber-500" />,
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            prompts: [
                { id: 'c1', text: t('prompts.categories.ace.p1') },
                { id: 'c2', text: t('prompts.categories.ace.p2') },
                { id: 'c3', text: t('prompts.categories.ace.p3') },
                { id: 'c4', text: t('prompts.categories.ace.p4') },
                { id: 'c5', text: t('prompts.categories.ace.p5') },
                { id: 'c6', text: t('prompts.categories.ace.p6') },
                { id: 'c7', text: t('prompts.categories.ace.p7') },
                { id: 'c8', text: t('prompts.categories.ace.p8') },
                { id: 'c9', text: t('prompts.categories.ace.p9') }
            ]
        }
    ];

    const handleCopy = (text, id, categoryId) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);

        // Determine target agent: 'ace' category → Ace Sir, otherwise → english
        const targetAgentId = categoryId === 'ace' ? 'ace' : 'english';

        // Brief delay for visual feedback, then redirect to chat with prompt pre-filled
        setTimeout(() => {
            navigate('/dashboard', { state: { prefillPrompt: text, targetAgentId } });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#23170f] pt-10 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs"
                    >
                        <ChevronLeft className="w-4 h-4" /> {t('prompts.back')}
                    </button>
                    <div className="text-center flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3 h-3" /> {t('prompts.master_ai')}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-display italic">{t('prompts.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                            {t('prompts.subtitle')}
                        </p>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center gap-4 px-2">
                                <div className={`p-3 rounded-2xl ${cat.bg} border ${cat.border} shadow-sm`}>
                                    {cat.icon}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{cat.title}</h2>
                            </div>

                            {/* Prompt Cards */}
                            <div className="space-y-4">
                                {cat.prompts.map((prompt) => (
                                    <div
                                        key={prompt.id}
                                        onClick={() => handleCopy(prompt.text, prompt.id, cat.id)}
                                        className="group relative bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-5 rounded-3xl cursor-pointer hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                                    >
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pr-8">
                                            "{prompt.text}"
                                        </p>

                                        <div className="absolute top-5 right-5">
                                            {copiedId === prompt.id ? (
                                                <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                            )}
                                        </div>

                                        {/* Hover Indicator */}
                                        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('prompts.click_to_copy')}</span>
                                            <MessageSquare className="w-3 h-3 text-primary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Insight */}
                <div className="mt-20 text-center">
                    <div className="inline-block p-8 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[3rem] border border-white dark:border-white/10 max-w-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('prompts.pro_tip_title')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            {t('prompts.pro_tip_content')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptTipsPage;
