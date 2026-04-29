import React, { useState, useMemo } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

/**
 * DeliveryScaffoldPassage - FIXED v11.0
 * Uses 'inline' instead of 'inline-block' to prevent squashed words.
 * Ensures natural spacing and stable word indexing.
 */
const DeliveryScaffoldPassage = ({
    text,
    vocabulary = [],
    settings = { vocab: false },
    activeWordIndex = -1,
    resultsMode = false,
    wordAnalysis = []
}) => {
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [isPlayingWord, setIsPlayingWord] = useState(null);

    // 1. DETERMINISTIC TOKENIZER (Clean & Flat)
    const tokens = useMemo(() => {
        if (!text) return [];
        const normalizedText = (typeof text === 'string') ? text : (text.master_script || text.stimulus || "");
        
        const rawTokens = normalizedText.split(/(\s+)/).filter(t => t !== "");
        let wordCounter = 0;

        return rawTokens.map((token, idx) => {
            const isWhitespace = /^\s+$/.test(token);
            const myIndex = isWhitespace ? -1 : wordCounter;
            if (!isWhitespace) wordCounter++;

            const cleanToken = token.replace(/[.,!?;:'"()]/g, '').toLowerCase();
            const vocab = vocabulary?.find(v => v.word.toLowerCase() === cleanToken);
            const result = resultsMode ? (wordAnalysis || []).find(w => (w.word || w.token || "").toLowerCase() === cleanToken) : null;

            return {
                text: token,
                index: myIndex,
                isWhitespace,
                vocab,
                result,
                id: `tk-${idx}`
            };
        });
    }, [text, vocabulary, resultsMode, wordAnalysis]);

    if (!text) return null;

    const playWord = async (word, id) => {
        if (isPlayingWord === id) return;
        setIsPlayingWord(id);
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-GB';
        utterance.onend = () => setIsPlayingWord(null);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div id="scaffold-passage-root" className="leading-[3.3] text-xl md:text-2xl font-bold tracking-tight px-2 selection:bg-orange-100 antialiased overflow-visible whitespace-pre-wrap">
            {tokens.map((tk) => {
                const isActive = tk.index !== -1 && tk.index === activeWordIndex;
                const isPast = tk.index !== -1 && tk.index < activeWordIndex;
                const isCorrect = tk.result && tk.result.status === 'correct';
                const isIncorrect = tk.result && tk.result.status === 'incorrect';

                // Base Styles — no transitions; live karaoke is DOM-driven for zero latency
                let classes = "inline "; 
                
                if (resultsMode) {
                    if (isCorrect) classes += "text-emerald-700 font-extrabold ";
                    else if (isIncorrect) classes += "text-rose-600 font-extrabold underline decoration-rose-300 decoration-4 ";
                    else classes += "text-slate-200 opacity-40 ";
                } else {
                    // Default state: black text. Active/past styling applied via direct DOM manipulation.
                    classes += "text-black font-bold ";
                }

                if (tk.isWhitespace) {
                    return <span key={tk.id} className="inline">{tk.text}</span>;
                }

                const content = (
                    <span 
                        key={tk.id} 
                        id={`word-${tk.index}`}
                        className={classes}
                        onClick={() => settings.vocab && tk.vocab && playWord(tk.text, tk.id)}
                    >
                        {tk.text}
                    </span>
                );

                if (settings.vocab && tk.vocab) {
                    return (
                        <span key={`wrap-${tk.id}`} className="relative inline group cursor-help">
                            <span className="border-b-2 border-dotted border-emerald-400/50">
                                {content}
                            </span>
                            <div className="hidden group-hover:block absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl border border-slate-700/50">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50 font-black text-emerald-400">
                                    {tk.vocab.word} <span className="text-[10px] text-slate-400">[{tk.vocab.ipa}]</span>
                                </div>
                                <div className="text-slate-300 mb-2 italic line-clamp-2">{tk.vocab.definition}</div>
                                <div className="text-orange-400 font-bold underline decoration-orange-400/30">CN: {tk.vocab.translation}</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                            </div>
                        </span>
                    );
                }

                return content;
            })}
        </div>
    );
};

export default DeliveryScaffoldPassage;
