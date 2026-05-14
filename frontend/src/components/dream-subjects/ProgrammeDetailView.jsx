import React from 'react';
import {
    Target, GraduationCap, TrendingUp, Info, Sparkles,
    BookOpen, Users, Award, Lightbulb, Building2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sectionConfig = {
    admission: { icon: Target, color: 'rose', titleEn: 'Admission Criteria', titleZh: '收生要求' },
    curriculum: { icon: BookOpen, color: 'indigo', titleEn: 'Programme Structure', titleZh: '課程結構' },
    structure: { icon: BookOpen, color: 'indigo', titleEn: 'Programme Structure', titleZh: '課程結構' },
    career: { icon: TrendingUp, color: 'emerald', titleEn: 'Career Prospects', titleZh: '職業前景' },
    campus: { icon: Building2, color: 'sky', titleEn: 'Campus Life', titleZh: '校園生活' },
    competitiveness: { icon: Target, color: 'amber', titleEn: 'Competitiveness', titleZh: '競爭分析' },
    alumni: { icon: Users, color: 'violet', titleEn: 'Notable Alumni', titleZh: '知名校友' },
    scholarships: { icon: Award, color: 'amber', titleEn: 'Scholarships', titleZh: '獎學金' },
    tips: { icon: Lightbulb, color: 'orange', titleEn: "Ace Sir's Strategy", titleZh: 'Ace Sir 攻略' }
};

const ProgrammeDetailView = ({ details, language, isLoading }) => {
    const currentLang = language === 'en' ? 'en' : 'zh';

    if (isLoading) {
        return (
            <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                </div>
                <h4 className="text-xl font-black text-slate-400">
                    {currentLang === 'en' ? 'Loading details...' : '載入詳情中...'}
                </h4>
            </div>
        );
    }

    const data = details?.[currentLang];

    if (!data || !data.sections) {
        return (
            <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-slate-500">
                        {currentLang === 'en' ? 'Details coming soon...' : '詳情更新中...'}
                    </h4>
                    <p className="text-base text-slate-400 max-w-xs mx-auto mt-2">
                        {currentLang === 'en'
                            ? "Ace Sir is compiling detailed insights for this program. Stay tuned!"
                            : "Ace Sir 正在整理此學科的詳細資訊，請留意稍後更新！"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pt-4 border-t border-slate-100 mt-4"
        >
            {Object.entries(data.sections).map(([key, section]) => {
                const config = sectionConfig[key] || { icon: Info, color: 'slate', titleEn: section.title || key, titleZh: section.title || key };
                const Icon = config.icon;
                const isTips = key === 'tips';

                return (
                    <div
                        key={key}
                        className={`p-5 rounded-2xl border transition-all ${
                            isTips
                                ? 'bg-orange-50 border-orange-100'
                                : 'bg-slate-50 border-slate-100'
                        }`}
                    >
                        <h4 className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${
                            isTips ? 'text-orange-600' : `text-${config.color}-600`
                        }`}>
                            <Icon className="w-4 h-4" />
                            {currentLang === 'en' ? config.titleEn : config.titleZh}
                        </h4>
                        <div className="space-y-2">
                            {(section.content || section.bullets || []).map((line, i) => {
                                // Convert **bold** markers to <strong> tags
                                const renderBoldText = (text) => {
                                    const parts = text.split(/(\*\*[^*]+\*\*)/g);
                                    return parts.map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={idx} className="font-black text-slate-800">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    });
                                };

                                return (
                                    <p key={i} className={`text-base leading-relaxed ${
                                        isTips ? 'text-slate-700' : 'text-slate-600'
                                    }`}>
                                        {line.startsWith('- ') ? (
                                            <span className="flex gap-2">
                                                <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                                                    isTips ? 'bg-orange-400' : `bg-${config.color}-400`
                                                }`} />
                                                <span>{renderBoldText(line.substring(2))}</span>
                                            </span>
                                        ) : renderBoldText(line)}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
};

export default ProgrammeDetailView;
