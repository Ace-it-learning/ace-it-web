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
    settings = { vocab: false, prosody: false },
    activeWordIndex = -1,
    resultsMode = false,
    wordAnalysis = []
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

    // Interleave Pauses (Subtle Markers)
    const renderedParts = [];
    let currentWordCounter = 0;

    tokens.forEach((token, i) => {
        const isWhitespace = /^\s+$/.test(token);
        const wordIndex = !isWhitespace ? currentWordCounter : -1;
        
        // Render the token
        const cleanWord = token.replace(/[.,!?;:'"()]/g, '').toLowerCase();
        const vocabEntry = vocabMap[cleanWord];
        const isEmphasized = prosody.emphasis?.some(e => e.toLowerCase() === cleanWord);
        
        // Results Feedback Logic
        const matchResult = resultsMode ? (wordAnalysis || []).find(w => w.word.toLowerCase() === cleanWord) : null;
        const isCorrect = matchResult && matchResult.status === 'correct';
        const isIncorrect = matchResult && matchResult.status === 'incorrect';

        // Highlighting Logic (Option B: Progressive Fill)
        const isWordActive = wordIndex !== -1 && wordIndex === activeWordIndex;
        const hasWordPassed = wordIndex !== -1 && wordIndex < activeWordIndex;
        
        // Intonation phrase matching
        const intonation = prosody.intonation?.find(i =>
            token.toLowerCase().includes(i.text.toLowerCase()) ||
            i.text.toLowerCase().includes(token.toLowerCase())
        );

        let innerContent = token;

        // Apply Emphasis (Stress)
        if (settings.prosody && isEmphasized) {
            innerContent = (
                <span className="font-extrabold text-indigo-900 bg-indigo-50/50 px-0.5 rounded shadow-sm">
                    {token}
                </span>
            );
        }

        let element = (
            <span 
                key={i} 
                className={`transition-all duration-300 rounded px-1 py-0.5 ${
                    resultsMode ? (
                        isCorrect ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        isIncorrect ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm' :
                        'text-gray-400 opacity-60'
                    ) : (
                        isWordActive ? 'bg-indigo-600 text-white shadow-lg scale-110 font-black' : 
                        hasWordPassed ? 'text-indigo-600 bg-indigo-50 font-bold' : 
                        ''
                    )
                }`}
            >
                {innerContent}
            </span>
        );

        // Apply Intonation
        if (settings.prosody && intonation) {
            const underlineClass = intonation.type === 'rising'
                ? 'border-b-2 border-dashed border-blue-400'
                : 'border-b-2 border-dashed border-orange-400 font-medium';

            element = (
                <span key={i} className={`${underlineClass} pb-0.5 transition-all duration-300`}>
                    {innerContent}
                </span>
            );
        }

        // Apply Vocab Highlighting
        if (settings.vocab && vocabEntry) {
            element = (
                <div
                    key={i}
                    className="relative inline-block group"
                    onMouseEnter={() => setActiveTooltip(i)}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <span
                        className={`cursor-help transition-all duration-300 ${!intonation ? 'border-b-2 border-emerald-400/40 group-hover:border-emerald-500' : ''} group-hover:bg-emerald-50`}
                    >
                        {settings.prosody && (intonation || isEmphasized) ? element : (
                             <span className={isWordActive ? 'bg-indigo-600 text-white font-black' : hasWordPassed ? 'text-indigo-600 font-bold' : ''}>
                                {token}
                             </span>
                        )}
                    </span>

                    {/* Tooltip Content */}
                    {activeTooltip === i && (
                        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200 border border-slate-700/50 backdrop-blur-md">
                             <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-emerald-400 text-sm tracking-tight">{vocabEntry.word}</span>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            playWord(vocabEntry.word, i); 
                                        }} 
                                        disabled={isPlayingWord === i}
                                        className="p-1 hover:bg-slate-800 rounded-lg text-emerald-400 disabled:opacity-50"
                                    >
                                        {isPlayingWord === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">[{vocabEntry.ipa}]</span>
                            </div>
                            <div className="text-slate-300 mb-3 leading-relaxed italic line-clamp-2">{vocabEntry.definition}</div>
                            <div className="flex items-center gap-2 text-amber-400 font-black bg-amber-400/10 px-3 py-1.5 rounded-xl w-fit border border-amber-400/20">
                                <span className="text-[10px] uppercase opacity-60 font-black">ZH</span>
                                <span className="text-sm">{vocabEntry.translation}</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                        </div>
                    )}
                </div>
            );
        }

        renderedParts.push(element);

        // Calculate non-whitespace index for matching with prosody.pauses array
        if (!isWhitespace) {
            if (settings.prosody && prosody.pauses?.includes(currentWordCounter)) {
                renderedParts.push(
                    <span key={`pause-${i}`} className="inline-flex items-center justify-center mx-1.5 align-middle">
                        <span className="w-[3px] h-4 bg-red-400/30 rounded-full" />
                    </span>
                );
            }
            currentWordCounter++;
        }
    });

    return (
        <div className="leading-[2.5] text-lg md:text-xl font-normal text-gray-700 tracking-wide whitespace-pre-wrap px-2">
            {renderedParts}
        </div>
    );
};

export default DeliveryScaffoldPassage;
