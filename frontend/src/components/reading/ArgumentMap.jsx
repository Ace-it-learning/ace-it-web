import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowDown } from 'lucide-react';

/**
 * ArgumentMap - Rich connector card between paragraphs
 * Replaces the old LogicConnector with bridge sentences, signal words, and exam insights
 */
const CONNECTOR_CONFIG = {
    LEADS_TO: {
        label: 'Cause & Effect',
        symbol: '→',
        color: '#10B981',
    },
    HOWEVER: {
        label: 'Contrast',
        symbol: '⟲',
        color: '#F97316',
    },
    FOR_EXAMPLE: {
        label: 'Illustration',
        symbol: '•',
        color: '#3B82F6',
    },
    IN_ADDITION: {
        label: 'Expansion',
        symbol: '+',
        color: '#8B5CF6',
    },
    THEREFORE: {
        label: 'Conclusion',
        symbol: '∴',
        color: '#EC4899',
    },
    ELABORATES: {
        label: 'Elaboration',
        symbol: '↳',
        color: '#6B7280',
    }
};

const ArgumentMap = ({ type, from, to, bridgeSentence, signalWords, examInsight, language = 'en' }) => {
    const [expanded, setExpanded] = useState(false);
    const config = CONNECTOR_CONFIG[type] || CONNECTOR_CONFIG.LEADS_TO;

    // Handle bilingual content
    const getBridgeSentenceText = () => {
        if (!bridgeSentence) return null;
        if (typeof bridgeSentence === 'object') return language === 'zh' ? bridgeSentence.zh : bridgeSentence.en;
        return bridgeSentence; // fallback for old data format
    };

    const getExamInsightText = () => {
        if (!examInsight) return null;
        if (typeof examInsight === 'object') return language === 'zh' ? examInsight.zh : examInsight.en;
        return examInsight; // fallback for old data format
    };

    const bridgeSentenceText = getBridgeSentenceText();
    const examInsightText = getExamInsightText();

    return (
        <div
            className="relative my-2 cursor-pointer select-none"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
            {/* Connector line top */}
            <div className="flex justify-center">
                <div className="w-0.5 h-3" style={{ backgroundColor: `${config.color}40` }} />
            </div>

            {/* Main card */}
            <div
                className="rounded-xl border px-3 py-2 transition-all duration-200"
                style={{
                    backgroundColor: `${config.color}08`,
                    borderColor: `${config.color}30`
                }}
            >
                {/* Compact header */}
                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: config.color }}
                    >
                        {config.symbol}
                    </div>

                    <div className="flex items-center gap-1.5 flex-grow min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.color }}>
                            P{from + 1} → P{to + 1}: {config.label}
                        </span>
                        <ChevronDown
                            className={`w-3 h-3 opacity-40 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                            style={{ color: config.color }}
                        />
                    </div>
                </div>

                {/* Bridge sentence - always visible */}
                {bridgeSentenceText && (
                    <p className="text-xs mt-1.5 leading-relaxed text-gray-600 dark:text-gray-400 font-medium pl-7">
                        {bridgeSentenceText}
                    </p>
                )}

                {/* Expanded details */}
                {expanded && (
                    <div className="mt-2 pl-7 space-y-2 border-t border-dashed pt-2" style={{ borderColor: `${config.color}25` }}>
                        {/* Signal Words */}
                        {signalWords && signalWords.length > 0 && (
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-50">Signal Words</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {signalWords.map((word, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                            style={{
                                                backgroundColor: `${config.color}15`,
                                                color: config.color
                                            }}
                                        >
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Exam Insight */}
                        {examInsightText && (
                            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">DSE Question Preview</span>
                                    <p className="text-[10px] text-indigo-700 dark:text-indigo-200 leading-relaxed font-medium mt-0.5">
                                        {examInsightText}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Connector line bottom */}
            <div className="flex justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-0.5 h-2" style={{ backgroundColor: `${config.color}40` }} />
                    <ArrowDown className="w-3 h-3" style={{ color: `${config.color}60` }} />
                </div>
            </div>
        </div>
    );
};

export default ArgumentMap;
export { CONNECTOR_CONFIG };
