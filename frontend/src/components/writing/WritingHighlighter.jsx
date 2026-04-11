import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { 
    sanitizePhrase, 
    generateFuzzyPattern, 
    sortHotspotsByLength, 
    getLocalizedValue 
} from '../../utils/writingUtils';

/**
 * WritingHighlighter
 * A premium, interactive text renderer that identifies and highlights "hotspots" (AI-suggested improvements).
 * Supports CJK-aware fuzzy matching and bilingual tooltips.
 */
const WritingHighlighter = ({ 
    text, 
    hotspots, 
    isChinese, 
    t, 
    className = "",
    matchField = "original_phrase", // "original_phrase" | "improved_phrase"
    activeHotspot: externalActiveHotspot = null, // External control
    onHighlightClick = null // External callback
}) => {
    const [localActiveHotspot, setLocalActiveHotspot] = useState(null);
    const [hoveredHotspot, setHoveredHotspot] = useState(null);

    // Use external state if provided, otherwise fallback to local
    const activeHotspot = onHighlightClick ? externalActiveHotspot : localActiveHotspot;
    const setActiveHotspot = onHighlightClick || setLocalActiveHotspot;

    if (!text) return null;
    if (!hotspots || hotspots.length === 0) {
        return <div className={`whitespace-pre-wrap ${className}`}>{text}</div>;
    }

    const sortedHotspots = sortHotspotsByLength(hotspots)
        .map((h, i) => ({ ...h, originalIndex: h.originalIndex ?? i }));

    let parts = [text];

    sortedHotspots.forEach((hotspot) => {
        const phrase = hotspot[matchField] || hotspot.original_phrase || hotspot.phrase;
        if (!phrase) return;
        
        const cleanPhrase = sanitizePhrase(phrase);
        if (!cleanPhrase) return;

        const newParts = [];
        parts.forEach(part => {
            if (typeof part !== 'string') {
                newParts.push(part);
                return;
            }
            
            const fuzzyPattern = generateFuzzyPattern(phrase);
            
            try {
                const regex = new RegExp(`(${fuzzyPattern})`, 'gi');
                const split = part.split(regex);
                
                split.forEach((s, i) => {
                    const cleanS = sanitizePhrase(s);
                    // Match if sanitized versions are equal, or if cleanPhrase is a substantial part of s
                    if (cleanS && (cleanS === cleanPhrase || cleanS.includes(cleanPhrase) || cleanPhrase.includes(cleanS))) {
                        const originalIdx = hotspot.originalIndex;
                        const isActive = activeHotspot === originalIdx;
                        
                        newParts.push(
                            <button
                                key={`${originalIdx}-${i}-${cleanS}`}
                                onMouseEnter={() => setHoveredHotspot(originalIdx)}
                                onMouseLeave={() => setHoveredHotspot(null)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveHotspot(activeHotspot === originalIdx ? null : originalIdx);
                                }}
                                className={`inline-block px-1.5 py-0.5 rounded transition-all duration-300 font-bold cursor-help relative
                                    ${isActive 
                                        ? 'bg-amber-400 text-slate-900 shadow-[0_4px_12px_rgba(251,191,36,0.3)] scale-105 ring-2 ring-offset-2 ring-amber-500 z-10' 
                                        : 'bg-amber-100/80 text-amber-900 border-b-2 border-amber-200 hover:bg-amber-200 hover:shadow-sm'
                                    }`}
                            >
                                {s}
                                
                                <AnimatePresence>
                                    {(hoveredHotspot === originalIdx || isActive) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                                            animate={{ opacity: 1, y: -10, x: '-50%' }}
                                            exit={{ opacity: 0, y: 10, x: '-50%' }}
                                            style={{ left: '50%' }}
                                            className="absolute bottom-full mb-4 w-72 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl z-[100] pointer-events-none"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap size={12} className="text-amber-400 fill-current" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">
                                                    {t ? t('writing_result.expert_recommendation') : (isChinese ? '專家建議' : 'EXPERT RECOMMENDATION')}
                                                </span>
                                            </div>
                                            <div className="space-y-3 font-sans">
                                                {hotspot.improved_phrase && (
                                                    <div className="flex flex-col gap-1 border-b border-white/10 pb-2">
                                                        <span className="text-[10px] text-gray-400 font-black uppercase">{isChinese ? '優化後' : 'IMPROVED'}</span>
                                                        <span className="text-sm font-black text-amber-400 truncate">{hotspot.improved_phrase}</span>
                                                    </div>
                                                )}
                                                <p className="text-[11px] font-bold leading-relaxed text-left">
                                                    {getLocalizedValue(hotspot, 'explanation', isChinese)}
                                                </p>
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 -mt-1.5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    } else if (s) {
                        newParts.push(s);
                    }
                });
            } catch (e) {
                newParts.push(part);
            }
        });
        parts = newParts;
    });

    return (
        <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
            {parts}
        </div>
    );
};

export default WritingHighlighter;
