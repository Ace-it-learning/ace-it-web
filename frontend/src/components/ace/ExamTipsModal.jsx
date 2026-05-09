import React, { useState, useMemo } from 'react';
import { X, Trophy, Clock, Target, Rocket, Award, AlertTriangle, HelpCircle, GraduationCap, Brain, Users, Puzzle, BatteryCharging, ListChecks } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EXAM_TIPS, TIP_CATEGORIES } from '../../data/exam_tips';
import { cn } from '../../utils/cn';
import ReactMarkdown from 'react-markdown';

const CATEGORY_ICONS = {
    study_stage: Brain,
    pre_exam: BatteryCharging,
    exam_period: Target,
    jupas_strategy: GraduationCap,
    all: Award
};

const ExamTipsModal = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('all');

    // Get user's dream subject (default to 'general')
    // In a real app, this would come from user profile
    // For now, checks user.dreamSubject or defaults
    const userDream = useMemo(() => {
        return user?.dreamSubject?.toLowerCase() || 'general';
    }, [user]);

    const filteredTips = useMemo(() => {
        return EXAM_TIPS.filter(tip => {
            if (activeCategory === 'all') return true;
            // Use strategic_tag and handle potential missing field
            return tip.strategic_tag === activeCategory;
        }).sort((a, b) => {
            // Priority sort: high > medium > low (handle missing priority)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const pA = priorityOrder[a.priority] || 0;
            const pB = priorityOrder[b.priority] || 0;
            return pB - pA;
        });
    }, [activeCategory]);

    const recommendedTips = useMemo(() => {
        return EXAM_TIPS.filter(tip =>
            tip.relevantDreams && (
                tip.relevantDreams.includes('all') ||
                tip.relevantDreams.some(d => userDream.includes(d))
            )
        ).slice(0, 2); // Top 2 recommendations
    }, [userDream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-64 h-64 rotate-12" />
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold border border-yellow-400/30">
                                    Ace Sir's Strategy Library
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold mb-2">
                                {language === 'zh' ? 'DSE 應試策略' : 'DSE Strategy'}
                            </h2>
                            <button className="text-white/60 text-sm hover:text-white flex items-center gap-2 transition-colors">
                                <Award className="w-4 h-4 text-yellow-400" />
                                {language === 'zh'
                                    ? `為你推薦：${userDream === 'general' ? '通用策略' : userDream}`
                                    : `Recommended for: ${userDream === 'general' ? 'General Strategy' : userDream}`}
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800/50 p-4 border-r border-gray-100 dark:border-gray-700 overflow-y-auto no-scrollbar shrink-0">
                        <div className="space-y-1">
                            {TIP_CATEGORIES.map(cat => {
                                const Icon = CATEGORY_ICONS[cat.id] || HelpCircle;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                                            activeCategory === cat.id
                                                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", activeCategory === cat.id ? "text-white" : "text-gray-400")} />
                                        <span>{language === 'zh' ? cat.label.zh : cat.label.en}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tips Grid */}
                    <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 dark:bg-black/20">
                        <div className="grid grid-cols-1 gap-4">
                            {filteredTips.map((tip) => (
                                <div
                                    key={tip.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                                tip.subject === 'maths' ? "bg-green-100 text-green-700" :
                                                    tip.subject === 'english' ? "bg-blue-100 text-blue-700" :
                                                        "bg-gray-100 text-gray-700"
                                            )}>
                                                {tip.subject}
                                            </span>
                                            {tip.priority === 'high' && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                    🔥 HOT
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                                        {language === 'zh' ? tip.title.zh : tip.title.en}
                                    </h3>

                                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>
                                            {language === 'zh' ? tip.content.zh : tip.content.en}
                                        </ReactMarkdown>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => {
                                                onClose();
                                                const event = new CustomEvent('start-ai-chat', {
                                                    detail: { message: `Can you elaborate more on this strategy: "${language === 'zh' ? tip.title.zh : tip.title.en}"?` }
                                                });
                                                window.dispatchEvent(event);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold rounded-xl transition-colors"
                                        >
                                            <Brain className="w-4 h-4" />
                                            {language === 'zh' ? '要求 Ace Sir 深入解說' : 'Ask Ace Sir to Elaborate'}
                                        </button>
                                    </div>
                                    {tip.relevantDreams.some(d => userDream.includes(d)) && (
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-purple-600 font-medium">
                                            <Target className="w-3.5 h-3.5" />
                                            {language === 'zh' ? '推薦原因：適合你的目標學科' : 'Recommended based on your target'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredTips.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <HelpCircle className="w-12 h-12 mb-3 opacity-20" />
                                <p>No tips found in this category yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamTipsModal;
