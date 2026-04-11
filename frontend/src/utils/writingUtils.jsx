/**
 * Writing Utilities
 * Shared logic for localization and text highlighting across the Writing Studio and Writing Lab.
 */

/**
 * getLocalizedValue
 * Safely extracts text based on the user's current language.
 * Supports legacy _zh fields and standard {en, zh} bilingual objects.
 */
export const getLocalizedValue = (data, field, isChinese) => {
    if (!data) return '';
    const val = data[field];
    const valZh = data[`${field}_zh`];
    
    // Priority 1: Legacy explicit _zh field
    if (isChinese && valZh) return valZh;
    
    // Priority 2: Standard bilingual object {en, zh}
    if (val && typeof val === 'object') {
        if (isChinese) {
            if (val.zh) return val.zh;
            // Fallback with indicator
            return val.en ? `${val.en} (待翻譯)` : '';
        }
        return val.en || val.zh || '';
    }
    
    // Priority 3: Flat string fallback
    return val || '';
};

/**
 * sanitizePhrase
 * Aggressive sanitizer to normalize text for fuzzy matching.
 */
export const sanitizePhrase = (str) => {
    return str?.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '').toLowerCase().trim() || '';
};

/**
 * generateFuzzyPattern
 * Creates a regex pattern for CJK-aware fuzzy matching.
 */
export const generateFuzzyPattern = (phrase) => {
    const hasSpaces = /\s/.test(phrase);
    const isCJK = /[\u4e00-\u9fa5]/.test(phrase);
    
    if (!hasSpaces && isCJK) {
        // CJK: Treat every character as a word, allow any punctuation between them
        return phrase.split('')
            .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^a-z0-9\u4e00-\u9fa5]*');
    } else {
        // English/Mixed: Slit by whitespace
        const words = phrase.split(/\s+/).filter(w => w.length > 0);
        return words
            .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('[^a-z0-9\u4e00-\u9fa5]*');
    }
};

/**
 * sortHotspotsByLength
 * Prioritizes matching longer phrases first to avoid greedy collision with shorter fragments.
 */
export const sortHotspotsByLength = (hotspots) => {
    if (!hotspots) return [];
    return [...hotspots]
        .map((h, i) => ({ ...h, originalIndex: i }))
        .sort((a, b) => {
            const pA = a.original_phrase || a.phrase || '';
            const pB = b.original_phrase || b.phrase || '';
            return pB.length - pA.length;
        });
};
