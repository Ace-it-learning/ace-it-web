import React, { useState } from 'react';
import { Target, BarChart3, Zap, RotateCcw, MapPin, CheckCircle2 } from 'lucide-react';

/**
 * ParagraphTag - Purpose badge for paragraphs
 * Tags: MAIN_CLAIM, EVIDENCE, COUNTERPOINT, REBUTTAL, CONTEXT, CONCLUSION
 */
const TAG_CONFIG = {
    MAIN_CLAIM: {
        label: 'Main Claim',
        icon: Target,
        color: 'emerald',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-300 dark:border-emerald-700'
    },
    EVIDENCE: {
        label: 'Evidence',
        icon: BarChart3,
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-300 dark:border-blue-700'
    },
    COUNTERPOINT: {
        label: 'Counterpoint',
        icon: Zap,
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300',
        borderClass: 'border-orange-300 dark:border-orange-700'
    },
    REBUTTAL: {
        label: 'Rebuttal',
        icon: RotateCcw,
        color: 'rose',
        bgClass: 'bg-rose-100 dark:bg-rose-900/30',
        textClass: 'text-rose-700 dark:text-rose-300',
        borderClass: 'border-rose-300 dark:border-rose-700'
    },
    CONTEXT: {
        label: 'Context',
        icon: MapPin,
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-300 dark:border-slate-600'
    },
    CONCLUSION: {
        label: 'Conclusion',
        icon: CheckCircle2,
        color: 'purple',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300',
        borderClass: 'border-purple-300 dark:border-purple-700'
    }
};

const ParagraphTag = ({ tag, explanation }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const config = TAG_CONFIG[tag] || TAG_CONFIG.CONTEXT;
    const Icon = config.icon;

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border cursor-pointer transition-all hover:scale-105 ${config.bgClass} ${config.textClass} ${config.borderClass}`}
            >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.label}</span>
            </div>

            {/* Explanation Tooltip */}
            {showTooltip && explanation && (
                <div className="absolute z-50 left-full ml-2 top-0 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="font-medium text-slate-200">{explanation}</div>

                    {/* Arrow */}
                    <div className="absolute top-2 right-full border-4 border-transparent border-r-slate-900" />
                </div>
            )}
        </div>
    );
};

export default ParagraphTag;
export { TAG_CONFIG };
