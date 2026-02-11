import React, { useState } from 'react';
import { Target, BarChart3, Zap, RotateCcw, MapPin, CheckCircle2, ChevronDown, Lightbulb, Quote } from 'lucide-react';

/**
 * ParagraphInsight - Rich insight card for each paragraph
 * Replaces the old ParagraphTag with summary, key phrases, and DSE tips
 */
const TAG_CONFIG = {
    MAIN_CLAIM: {
        label: 'Main Claim',
        icon: Target,
        color: '#10B981',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
    },
    EVIDENCE: {
        label: 'Evidence',
        icon: BarChart3,
        color: '#3B82F6',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
    },
    COUNTERPOINT: {
        label: 'Counterpoint',
        icon: Zap,
        color: '#F97316',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-700 dark:text-orange-300',
        badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
    },
    REBUTTAL: {
        label: 'Rebuttal',
        icon: RotateCcw,
        color: '#F43F5E',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-200 dark:border-rose-800',
        text: 'text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
    },
    CONTEXT: {
        label: 'Context',
        icon: MapPin,
        color: '#64748B',
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        border: 'border-slate-200 dark:border-slate-700',
        text: 'text-slate-700 dark:text-slate-300',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    CONCLUSION: {
        label: 'Conclusion',
        icon: CheckCircle2,
        color: '#8B5CF6',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-300',
        badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
    }
};

const ParagraphInsight = ({ tag, summary, keyPhrases, dseTip, index, language = 'en' }) => {
    const [expanded, setExpanded] = useState(false);
    const config = TAG_CONFIG[tag] || TAG_CONFIG.CONTEXT;
    const Icon = config.icon;

    // Handle bilingual content - summary and dseTip can be objects with {en, zh} or plain strings
    const getSummaryText = () => {
        if (!summary) return null;
        if (typeof summary === 'object') return language === 'zh' ? summary.zh : summary.en;
        return summary; // fallback for old data format
    };

    const getDseTipText = () => {
        if (!dseTip) return null;
        if (typeof dseTip === 'object') return language === 'zh' ? dseTip.zh : dseTip.en;
        return dseTip; // fallback for old data format
    };

    const summaryText = getSummaryText();
    const dseTipText = getDseTipText();

    return (
        <div
            className={`rounded-xl border ${config.border} ${config.bg} transition-all duration-200 cursor-pointer select-none`}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
            {/* Compact header - always visible */}
            <div className="flex items-start gap-2 px-3 py-2">
                <div
                    className="flex items-center justify-center w-5 h-5 rounded-md mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                    <Icon className="w-3 h-3" />
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${config.text}`}>
                            P{index + 1} · {config.label}
                        </span>
                        <ChevronDown
                            className={`w-3 h-3 ${config.text} opacity-50 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        />
                    </div>
                    {summaryText && (
                        <p className={`text-xs mt-1 leading-relaxed ${config.text} opacity-80 font-medium`}>
                            {summaryText}
                        </p>
                    )}
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-dashed" style={{ borderColor: `${config.color}30` }}>
                    {/* Key Phrases */}
                    {keyPhrases && keyPhrases.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center gap-1 mb-1.5">
                                <Quote className="w-3 h-3" style={{ color: config.color }} />
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Key Phrases</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {keyPhrases.map((phrase, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${config.badge}`}
                                    >
                                        "{phrase}"
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DSE Tip */}
                    {dseTipText && (
                        <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                                {dseTipText}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ParagraphInsight;
export { TAG_CONFIG };
