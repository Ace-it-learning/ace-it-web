import React, { useState, useMemo } from 'react';
import { Volume2, Loader2, BookOpen, X, CheckCircle } from 'lucide-react';
import { tokenizePassage } from '../../utils/speakingPassageTokenizer';
import { addToNotebook } from '../../services/notebookService';

/**
 * DeliveryScaffoldPassage - v12.0
 * Color-coded vocab highlighting (Level 5 = orange, Level 5** = purple)
 * Click-to-open dictionary popup with "Add to Notebook" support.
 */
const DeliveryScaffoldPassage = ({
    text,
    vocabulary = [],
    settings = { vocab: false },
    activeWordIndex = -1,
    resultsMode = false,
    wordAnalysis = [],
    user = null,
    sourceTitle = 'Speaking Delivery Quest'
}) => {
    const [isPlayingWord, setIsPlayingWord] = useState(null);
    const [selectedVocab, setSelectedVocab] = useState(null);
    const [notebookStatus, setNotebookStatus] = useState('idle'); // idle | adding | added | error

    const tokens = useMemo(() => {
        if (!text) return [];
        const normalizedText = (typeof text === 'string') ? text : (text.master_script || text.stimulus || "");

        return tokenizePassage(normalizedText).map((tk) => {
            const cleanToken = tk.text.replace(/[.,!?;:'"()]/g, '').toLowerCase();
            const vocab = vocabulary?.find(v => v.word.toLowerCase() === cleanToken);
            const result = resultsMode ? (wordAnalysis || []).find(w => (w.word || w.token || "").toLowerCase() === cleanToken) : null;
            return { ...tk, vocab, result };
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

    const handleOpenPopup = (vocab, wordText) => {
        if (!vocab) return;
        setSelectedVocab({ ...vocab, originalText: wordText });
        setNotebookStatus('idle');
    };

    const handleClosePopup = () => {
        setSelectedVocab(null);
        setNotebookStatus('idle');
    };

    const handleAddToNotebook = async () => {
        if (!user?.uid || !selectedVocab) return;
        setNotebookStatus('adding');
        try {
            await addToNotebook(user.uid, {
                type: 'vocabulary',
                term: selectedVocab.word,
                note: `${selectedVocab.definition} (IPA: ${selectedVocab.ipa})`,
                context: selectedVocab.translation,
                source: sourceTitle
            });
            setNotebookStatus('added');
        } catch (err) {
            console.error('Notebook add error:', err);
            setNotebookStatus('error');
        }
    };

    const getVocabColorClasses = (difficulty) => {
        if (difficulty === '5**') {
            return {
                text: 'text-purple-700',
                border: 'border-purple-400',
                bg: 'bg-purple-50',
                underline: 'decoration-purple-400',
                dot: 'bg-purple-500'
            };
        }
        if (difficulty === '5') {
            return {
                text: 'text-orange-700',
                border: 'border-orange-400',
                bg: 'bg-orange-50',
                underline: 'decoration-orange-400',
                dot: 'bg-orange-500'
            };
        }
        // Default / level 3
        return {
            text: 'text-emerald-700',
            border: 'border-emerald-400',
            bg: 'bg-emerald-50',
            underline: 'decoration-emerald-400',
            dot: 'bg-emerald-500'
        };
    };

    return (
        <div id="scaffold-passage-root" className="leading-[3.3] text-xl md:text-2xl font-bold tracking-tight px-2 selection:bg-orange-100 antialiased overflow-visible whitespace-pre-wrap relative">
            {tokens.map((tk) => {
                const isActive = tk.index !== -1 && tk.index === activeWordIndex;
                const isPast = tk.index !== -1 && tk.index < activeWordIndex;
                const isCorrect = tk.result && tk.result.status === 'correct';
                const isIncorrect = tk.result && tk.result.status === 'incorrect';

                let classes = "inline ";

                if (resultsMode) {
                    if (isCorrect) classes += "text-emerald-700 font-extrabold ";
                    else if (isIncorrect) classes += "text-rose-600 font-extrabold underline decoration-rose-300 decoration-4 ";
                    else classes += "text-slate-200 opacity-40 ";
                } else if (isActive) {
                    classes += "text-orange-600 font-black ";
                } else if (isPast) {
                    classes += "text-orange-500 font-bold opacity-65 ";
                } else {
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
                        onClick={() => {
                            if (settings.vocab && tk.vocab) {
                                handleOpenPopup(tk.vocab, tk.text);
                            } else if (settings.vocab) {
                                playWord(tk.text, tk.id);
                            }
                        }}
                    >
                        {tk.text}
                    </span>
                );

                if (settings.vocab && tk.vocab) {
                    const colors = getVocabColorClasses(tk.vocab.difficulty);
                    return (
                        <span key={`wrap-${tk.id}`} className="relative inline cursor-pointer">
                            <span className={`border-b-2 border-dotted ${colors.border} ${colors.bg} rounded px-0.5`}>
                                {content}
                            </span>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} ml-0.5 align-middle`}></span>
                        </span>
                    );
                }

                return content;
            })}

            {/* Dictionary Popup */}
            {selectedVocab && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClosePopup}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{selectedVocab.word}</h3>
                                <p className="text-sm font-mono text-gray-400">[{selectedVocab.ipa}]</p>
                            </div>
                            <button
                                onClick={handleClosePopup}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Definition */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 leading-relaxed">{selectedVocab.definition}</p>
                        </div>

                        {/* Chinese Translation */}
                        <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Chinese</p>
                            <p className="text-lg font-bold text-amber-900">{selectedVocab.translation}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => playWord(selectedVocab.word, 'popup-word')}
                                className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Volume2 className="w-4 h-4" />
                                Listen
                            </button>
                            <button
                                onClick={handleAddToNotebook}
                                disabled={notebookStatus === 'adding' || notebookStatus === 'added'}
                                className={`flex-[2] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                    notebookStatus === 'added'
                                        ? 'bg-emerald-500 text-white'
                                        : notebookStatus === 'error'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-900 text-white hover:bg-black'
                                }`}
                            >
                                {notebookStatus === 'adding' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : notebookStatus === 'added' ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <BookOpen className="w-4 h-4" />
                                )}
                                {notebookStatus === 'adding'
                                    ? 'Adding...'
                                    : notebookStatus === 'added'
                                    ? 'Added!'
                                    : notebookStatus === 'error'
                                    ? 'Failed'
                                    : 'Add to Notebook'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryScaffoldPassage;
