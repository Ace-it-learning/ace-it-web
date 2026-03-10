import React, { useState } from 'react';
import { Quote, Volume2, Loader2 } from 'lucide-react';

/**
 * DeliveryScaffoldPassage - High-fidelity passage rendering for Speaking Delivery.
 * Features:
 * - Vocabulary Highlights with Tooltips (IPA + Translation)
 * - Prosody Guide (Pauses, Stress, Intonation)
 */
const DeliveryScaffoldPassage = ({
    text,
    vocabulary = [],
    prosody = { pauses: [], emphasis: [], intonation: [] },
    settings = { vocab: false, prosody: false }
}) => {
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [isPlayingWord, setIsPlayingWord] = useState(null);

    if (!text) return null;

    // Build vocab map for fast lookup
    const vocabMap = {};
    vocabulary.forEach(v => {
        vocabMap[v.word.toLowerCase()] = v;
    });

    const playWord = async (word, index) => {
        if (isPlayingWord) return;
        setIsPlayingWord(index);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: word,
                    languageCode: 'en-GB',
                    gender: 'FEMALE'
                })
            });

            if (!res.ok) throw new Error('TTS failed');
            const { audioContent } = await res.json();
            const audioUrl = `data:audio/mp3;base64,${audioContent}`;
            const audio = new Audio(audioUrl);
            audio.onended = () => setIsPlayingWord(null);
            audio.onerror = () => setIsPlayingWord(null);
            audio.play();
        } catch (err) {
            console.error('Word TTS failed:', err);
            // Fallback
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-GB';
            utterance.onend = () => setIsPlayingWord(null);
            window.speechSynthesis.speak(utterance);
        }
    };

    // 1. Split text into tokens (preserving whitespace)
    const tokens = text.split(/(\s+)/);

    const renderToken = (token, index) => {
        const cleanWord = token.replace(/[.,!?;:'"()]/g, '').toLowerCase();
        const vocabEntry = vocabMap[cleanWord];
        const isEmphasized = prosody.emphasis?.some(e => e.toLowerCase() === cleanWord);

        // Intonation phrase matching
        const intonation = prosody.intonation?.find(i =>
            token.toLowerCase().includes(i.text.toLowerCase()) ||
            i.text.toLowerCase().includes(token.toLowerCase())
        );

        let innerContent = token;

        // Apply Emphasis (Stress) - Inline weight change to avoid layout shift
        if (settings.prosody && isEmphasized) {
            innerContent = (
                <span className="font-extrabold text-indigo-900 bg-indigo-50/50 px-0.5 rounded shadow-sm">
                    {token}
                </span>
            );
        }

        let element = <span key={index}>{innerContent}</span>;

        // Apply Intonation (Dashed Underlines to avoid line-height shift)
        if (settings.prosody && intonation) {
            const underlineClass = intonation.type === 'rising'
                ? 'border-b-2 border-dashed border-blue-400'
                : 'border-b-2 border-dashed border-orange-400 font-medium';

            element = (
                <span key={index} className={`${underlineClass} pb-0.5 transition-all duration-300`}>
                    {innerContent}
                </span>
            );
        }

        // Apply Vocab Highlighting
        if (settings.vocab && vocabEntry) {
            element = (
                <div
                    key={index}
                    className="relative inline-block group"
                    onMouseEnter={() => setActiveTooltip(index)}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <span
                        className={`cursor-help transition-all duration-300 ${!intonation ? 'border-b-2 border-emerald-400/40 group-hover:border-emerald-500' : ''} group-hover:bg-emerald-50`}
                    >
                        {settings.prosody && (intonation || isEmphasized) ? element : token}
                    </span>

                    {/* Tooltip */}
                    {activeTooltip === index && (
                        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200 border border-slate-700/50 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-emerald-400 text-sm tracking-tight">{vocabEntry.word}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playWord(vocabEntry.word, index);
                                        }}
                                        disabled={isPlayingWord === index}
                                        className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-emerald-400 disabled:opacity-50"
                                    >
                                        {isPlayingWord === index ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">[{vocabEntry.ipa}]</span>
                            </div>
                            <div className="text-slate-300 mb-3 leading-relaxed italic line-clamp-2">{vocabEntry.definition}</div>
                            <div className="flex items-center gap-2 text-amber-400 font-black bg-amber-400/10 px-3 py-1.5 rounded-xl w-fit border border-amber-400/20">
                                <span className="text-[10px] uppercase opacity-60 font-black">ZH</span>
                                <span className="text-sm">{vocabEntry.translation}</span>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                        </div>
                    )}
                </div>
            );
        }

        return element;
    };

    // Interleave Pauses (Subtle Markers)
    const renderedParts = [];
    tokens.forEach((token, i) => {
        renderedParts.push(renderToken(token, i));

        // Calculate non-whitespace index for matching with prosody.pauses array
        const wordTokensOnly = tokens.map((t, idx) => ({ t, idx })).filter(x => x.t.trim().length > 0);
        const currentWordIndex = wordTokensOnly.findIndex(x => x.idx === i);

        if (settings.prosody && currentWordIndex !== -1 && prosody.pauses?.includes(currentWordIndex)) {
            renderedParts.push(
                <span key={`pause-${i}`} className="inline-flex items-center justify-center mx-1.5 align-middle">
                    <span className="w-[3px] h-4 bg-red-400/30 rounded-full" />
                </span>
            );
        }
    });

    return (
        <div className="leading-[2.5] text-lg md:text-xl font-normal text-gray-700 tracking-wide whitespace-pre-wrap px-2">
            {renderedParts}
        </div>
    );
};

export default DeliveryScaffoldPassage;
