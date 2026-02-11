import React, { useState, useRef } from 'react';

/**
 * VocabSpotlight - Highlights difficult words with hover tooltips
 * Props:
 *   - text: The passage text to render
 *   - vocabData: Array of { word, definition, translation, pos }
 *   - onWordClick: Callback when word is clicked (for full dictionary popup)
 */
const VocabSpotlight = ({ text, vocabData = [], onWordClick }) => {
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipRef = useRef(null);

    if (!vocabData || vocabData.length === 0) {
        return <span>{text}</span>;
    }

    // Build a map of words to their data for quick lookup
    const vocabMap = {};
    vocabData.forEach(v => {
        vocabMap[v.word.toLowerCase()] = v;
    });

    // Split text into words while preserving punctuation and spaces
    const parts = text.split(/(\s+)/);

    const renderPart = (part, index) => {
        // Clean word for lookup (remove punctuation)
        const cleanWord = part.replace(/[.,!?;:'"()]/g, '').toLowerCase();
        const vocabEntry = vocabMap[cleanWord];

        if (vocabEntry) {
            return (
                <span
                    key={index}
                    className="relative inline-block"
                    onMouseEnter={() => setActiveTooltip(index)}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <span
                        className="border-b-2 border-dotted border-emerald-400 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        onClick={() => onWordClick?.(vocabEntry)}
                    >
                        {part}
                    </span>

                    {/* Tooltip */}
                    {activeTooltip === index && (
                        <div
                            ref={tooltipRef}
                            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150"
                        >
                            <div className="font-bold text-emerald-300 capitalize mb-1">
                                {vocabEntry.word} <span className="text-slate-400 font-normal">({vocabEntry.pos})</span>
                            </div>
                            <div className="text-slate-200 mb-1">{vocabEntry.definition}</div>
                            <div className="text-amber-300 font-medium">繁：{vocabEntry.translation}</div>

                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </div>
                    )}
                </span>
            );
        }

        return <span key={index}>{part}</span>;
    };

    return (
        <span className="vocab-spotlight">
            {parts.map(renderPart)}
        </span>
    );
};

export default VocabSpotlight;
