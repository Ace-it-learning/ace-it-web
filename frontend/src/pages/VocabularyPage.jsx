import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, Loader2, BookOpen, Search, PlusCircle } from 'lucide-react';

// Expanded DSE High-Frequency Vocabulary (90+ Words)
import { DSE_LEXICON } from '../data/dse_vocabulary_data';
// Remove local DSE_VOCABULARY const

import { useTranslation } from 'react-i18next';
// ... imports

// ... DSE_VOCABULARY definition

const VocabularyPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState("Core: Verbs (Argumentation)");
    const [searchQuery, setSearchQuery] = useState("");
    const [generatingFor, setGeneratingFor] = useState(null);
    const [sentences, setSentences] = useState({});
    const [requestingAI, setRequestingAI] = useState(false);

    // Alpha-sort words in each category
    const categories = Object.keys(DSE_LEXICON);

    const filteredWords = useMemo(() => {
        let words = DSE_LEXICON[activeCategory] || [];

        if (searchQuery) {
            // If searching, we search across ALL categories
            words = Object.values(DSE_LEXICON).flat();
            words = words.filter(w =>
                w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                w.chinese.includes(searchQuery)
            );
        }

        // Always sort alphabetically by word
        return [...words].sort((a, b) => a.word.localeCompare(b.word));
    }, [activeCategory, searchQuery]);

    const handleGenerateSentence = async (word) => {
        if (!user) {
            alert("Please sign in to generate sentences.");
            return;
        }
        setGeneratingFor(word);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/api/tutor/vocabulary/sentence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    word: word,
                    level: '5**'
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with ${res.status}`);
            }

            const data = await res.json();
            setSentences(prev => ({ ...prev, [word]: data.sentence }));
        } catch (err) {
            console.error("Sentence generation failed:", err);
            alert(t('vocabulary.generation_failed').replace('{{error}}', err.message));
        } finally {
            setGeneratingFor(null);
        }
    };

    const handleAIRequest = async () => {
        if (!searchQuery) return;
        setRequestingAI(true);
        // We reuse the sentence generator as a "Quick Analysis"
        await handleGenerateSentence(searchQuery);
        setRequestingAI(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                                {t('vocabulary.title')}
                            </h1>
                            <p className="hidden sm:block text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('vocabulary.subtitle')}</p>
                        </div>
                    </div>

                    {/* Search Bar & Button */}
                    <div className="flex-1 max-w-lg flex items-center gap-2">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('vocabulary.find_word')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                            />
                        </div>
                        {searchQuery && (
                            <button
                                onClick={handleAIRequest}
                                disabled={requestingAI}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-md"
                            >
                                {requestingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlusCircle className="w-3 h-3" />}
                                <span className="hidden sm:inline">{t('vocabulary.request_ai')}</span>
                                <span className="sm:hidden">{t('nav.agents')}</span>
                            </button>
                        )}
                    </div>

                    <div className="hidden lg:block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        {t('vocabulary.total_words').replace('{{count}}', Object.values(DSE_LEXICON).flat().length)}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* DSE Strategy Banner */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-900 mb-1">💡 DSE Strategist's Pro Tip: The "300 + 100" Rule</h3>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Master the <strong>Core 300</strong> (Verbs, Adjectives, Nouns) to ensure you never misinterpret a question, and use the <strong>Elite 100</strong> upgrades (e.g., swapping "bad" for "detrimental") to impress markers in Paper 2 Writing.
                        </p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                            className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-all border ${activeCategory === cat && !searchQuery
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Vocabulary Grid - Enlarged & Polished */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredWords.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-lg transition-all flex flex-col h-full group relative overflow-hidden"
                        >
                            {/* Word Header */}
                            {(() => {
                                const strategyMatch = item.chinese.match(/(.*)(\(Use instead of .*\))/);
                                const chineseMain = strategyMatch ? strategyMatch[1].trim() : item.chinese;
                                const strategyTip = strategyMatch ? strategyMatch[2].replace(/[()]/g, '') : null;

                                return (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors" title={item.word}>{item.word}</h3>
                                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{item.type}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-400 shrink-0">{chineseMain}</span>
                                        </div>

                                        {/* Strategy Tip (Elite Only) */}
                                        {strategyTip && (
                                            <div className="mb-3">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                                    {strategyTip}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {/* Definition */}
                            <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2" title={item.definition}>
                                {item.definition}
                            </p>

                            <div className="mt-auto space-y-2">
                                {/* Generate Button - Premium Gold */}
                                <button
                                    onClick={() => handleGenerateSentence(item.word)}
                                    disabled={generatingFor === item.word}
                                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white border-none rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                                >
                                    {generatingFor === item.word ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                    {sentences[item.word] ? t('vocabulary.generate_another') : t('vocabulary.golden_sentence')}
                                </button>

                                {/* Generated Sentence - Premium Display */}
                                {sentences[item.word] && (
                                    <div className="p-4 bg-white text-slate-700 rounded-xl border-2 border-amber-400 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-[11px] leading-relaxed font-medium">
                                            <span className="text-amber-500 font-black mr-1">“</span>
                                            {sentences[item.word].split(new RegExp(`(${item.word})`, 'gi')).map((part, i) =>
                                                part.toLowerCase() === item.word.toLowerCase()
                                                    ? <strong key={i} className="text-slate-900 font-extrabold text-xs">{part}</strong>
                                                    : part
                                            )}
                                            <span className="text-amber-500 font-black ml-1">”</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {searchQuery && filteredWords.length === 0 && (
                    <div className="mt-12 text-center space-y-6">
                        {/* New AI Analysis result display for non-listed words */}
                        {sentences[searchQuery.trim()] ? (
                            <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border-2 border-amber-400 shadow-xl animate-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Analysis: <span className="text-emerald-600">"{searchQuery}"</span></h2>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg leading-relaxed text-slate-700 font-medium italic">
                                        <span className="text-amber-500 font-black text-3xl mr-2">“</span>
                                        {sentences[searchQuery.trim()].split(new RegExp(`(${searchQuery.trim()})`, 'gi')).map((part, i) =>
                                            part.toLowerCase() === searchQuery.trim().toLowerCase()
                                                ? <strong key={i} className="text-slate-900 font-extrabold">{part}</strong>
                                                : part
                                        )}
                                        <span className="text-amber-500 font-black text-3xl ml-2">”</span>
                                    </p>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">DSE 5** Standard</span>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                    <PlusCircle className="w-10 h-10 text-emerald-200" />
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium">Word "{searchQuery}" not found in our list.</p>
                                    <button
                                        onClick={handleAIRequest}
                                        disabled={requestingAI}
                                        className="mt-2 text-emerald-600 font-bold text-sm hover:underline flex items-center gap-2 mx-auto disabled:opacity-50"
                                    >
                                        {requestingAI ? "Analyzing..." : `Request AI Analysis for "${searchQuery}" →`}
                                        {requestingAI && <Loader2 className="w-3 h-3 animate-spin" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VocabularyPage;
