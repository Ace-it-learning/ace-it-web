import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Info, ChevronDown, ChevronUp, Scale, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { PROGRAM_CATEGORIES, UNIVERSITY_SHORT_NAMES, getUniversityLabel } from '../../constants/jupasPrograms';
import { getJupasProgrammeDetails } from '../../services/jupasService';
import ProgrammeDetailView from './ProgrammeDetailView';
import WeightingsModal from './WeightingsModal';

// ── Build a flat searchable text blob from programme details ──
function extractDetailText(details, lang) {
    if (!details) return '';
    const data = details[lang === 'zh' ? 'zh' : 'en'];
    if (!data) return '';
    const parts = [];
    // Programme name / faculty
    if (data.name) parts.push(data.name);
    if (data.faculty) parts.push(data.faculty);
    // All sections
    if (data.sections) {
        Object.values(data.sections).forEach(sec => {
            if (sec.title) parts.push(sec.title);
            if (sec.content) parts.push(...sec.content);
            if (sec.bullets) parts.push(...sec.bullets);
        });
    }
    return parts.join(' ').toLowerCase();
}

// ── Tokenise query: split on spaces, remove empty ──
function tokenise(query) {
    return query.toLowerCase().split(/\s+/).filter(Boolean);
}

// ── Score a programme against search tokens ──
// Returns { matches: boolean, score: number, matchedFields: string[] }
function scoreProgramme(p, details, tokens, lang) {
    if (!tokens.length) return { matches: true, score: 0, matchedFields: [] };

    const detailText = details ? extractDetailText(details, lang) : '';
    const fields = {
        code: (p.code || '').toLowerCase(),
        name: (p.name || p.nameEn || '').toLowerCase(),
        nameZh: (p.nameZh || '').toLowerCase(),
        university: (p.university || '').toLowerCase(),
        uniShort: (UNIVERSITY_SHORT_NAMES[p.university] || '').toLowerCase(),
        faculty: (p.faculty || '').toLowerCase(),
        category: (p.category || '').toLowerCase(),
        details: detailText,
    };

    let score = 0;
    const matchedFields = new Set();
    let allTokensMatch = true;

    for (const token of tokens) {
        let tokenMatched = false;
        let bestTokenScore = 0;

        for (const [field, text] of Object.entries(fields)) {
            if (!text) continue;

            // Exact match (highest score)
            if (text === token) {
                bestTokenScore = Math.max(bestTokenScore, 100);
                tokenMatched = true;
                matchedFields.add(field);
                continue;
            }
            // Starts with (e.g. "JS10" matches "JS1001")
            if (text.startsWith(token)) {
                bestTokenScore = Math.max(bestTokenScore, 80);
                tokenMatched = true;
                matchedFields.add(field);
                continue;
            }
            // Word boundary match (e.g. "BBA" matches "BBA Accountancy" as whole word)
            const wordBoundary = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
            if (wordBoundary.test(text)) {
                bestTokenScore = Math.max(bestTokenScore, 60);
                tokenMatched = true;
                matchedFields.add(field);
                continue;
            }
            // Substring match (lowest score)
            if (text.includes(token)) {
                bestTokenScore = Math.max(bestTokenScore, 30);
                tokenMatched = true;
                matchedFields.add(field);
            }
        }

        if (!tokenMatched) {
            allTokensMatch = false;
        } else {
            score += bestTokenScore;
        }
    }

    // Bonus: more tokens matched = higher score
    score += tokens.length * 5;

    // Bonus: code exact match gets huge boost
    if (fields.code && tokens.some(t => fields.code === t || fields.code.startsWith(t))) {
        score += 200;
    }

    return {
        matches: allTokensMatch,
        score,
        matchedFields: Array.from(matchedFields),
    };
}

const ProgrammeSearchPanel = ({
    programmes,
    dreamPrograms,
    onAddProgram,
    onViewDetail,
    detailState,
    language,
    t,
    programsLoading
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedUniversity, setSelectedUniversity] = useState('all');
    const [medianRange, setMedianRange] = useState({ min: '', max: '' });
    const [showMedianModal, setShowMedianModal] = useState(false);
    const [expandedProgram, setExpandedProgram] = useState(null);
    const [weightingsModalOpen, setWeightingsModalOpen] = useState(false);
    const [selectedProgrammeForWeightings, setSelectedProgrammeForWeightings] = useState(null);

    // ── Background detail fetching for deep search ──
    const [detailCache, setDetailCache] = useState({}); // { [code]: detailsObj }
    const [detailFetchProgress, setDetailFetchProgress] = useState({ loaded: 0, total: 0 });
    const [isIndexing, setIsIndexing] = useState(false);

    const uniDropdownRef = useRef(null);
    const catDropdownRef = useRef(null);
    const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
    const [catDropdownOpen, setCatDropdownOpen] = useState(false);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (uniDropdownRef.current && !uniDropdownRef.current.contains(e.target)) {
                setUniDropdownOpen(false);
            }
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
                setCatDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Background index: fetch all programme details once ──
    useEffect(() => {
        if (!programmes.length) return;
        // Only start indexing if we haven't already and user starts typing
        // Actually, let's pre-fetch in background after programmes load
        const uncached = programmes.filter(p => p.code && !detailCache[p.code] && !detailState[p.code]);
        if (uncached.length === 0) return;

        // Batch fetch details in background (non-blocking)
        const batchSize = 5;
        let cancelled = false;

        const fetchBatch = async (batch) => {
            await Promise.all(
                batch.map(async (p) => {
                    if (cancelled) return;
                    try {
                        const result = await getJupasProgrammeDetails(p.code);
                        if (!cancelled && result.details) {
                            setDetailCache(prev => ({ ...prev, [p.code]: result.details }));
                        }
                    } catch (e) {
                        // silently fail for background fetch
                    }
                })
            );
        };

        const run = async () => {
            setIsIndexing(true);
            setDetailFetchProgress({ loaded: 0, total: uncached.length });
            for (let i = 0; i < uncached.length; i += batchSize) {
                if (cancelled) break;
                const batch = uncached.slice(i, i + batchSize);
                await fetchBatch(batch);
                setDetailFetchProgress({ loaded: Math.min(i + batchSize, uncached.length), total: uncached.length });
            }
            setIsIndexing(false);
        };

        // Delay start so it doesn't compete with initial render
        const timer = setTimeout(run, 2000);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [programmes.length]);

    // Also merge in any details that were fetched via onViewDetail
    useEffect(() => {
        const newCache = {};
        for (const [code, val] of Object.entries(detailState)) {
            if (val && val !== 'loading' && !detailCache[code]) {
                newCache[code] = val;
            }
        }
        if (Object.keys(newCache).length > 0) {
            setDetailCache(prev => ({ ...prev, ...newCache }));
        }
    }, [detailState]);

    // Check if a programme is from PolyU
    const isPolyU = (program) => {
        return program.university === '香港理工大學' || program.university?.includes('Polytechnic');
    };

    const handleOpenWeightings = (program, e) => {
        e.stopPropagation();
        setSelectedProgrammeForWeightings(program);
        setWeightingsModalOpen(true);
    };

    // Derive unique universities from programmes, sorted alphabetically by short name
    const universities = [...new Set(programmes.map(p => p.university).filter(Boolean))].sort((a, b) => {
        const nameA = (UNIVERSITY_SHORT_NAMES[a] || a).toLowerCase();
        const nameB = (UNIVERSITY_SHORT_NAMES[b] || b).toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Categories sorted alphabetically by English key
    const sortedCategories = Object.entries(PROGRAM_CATEGORIES).sort((a, b) =>
        a[0].localeCompare(b[0])
    );

    // ── Search tokens (memoised) ──
    const searchTokens = useMemo(() => tokenise(searchQuery), [searchQuery]);

    // ── Filtered & scored programmes ──
    const filteredPrograms = useMemo(() => {
        // First apply non-search filters
        let candidates = programmes.filter(p => {
            if (dreamPrograms.some(dp => dp.id === p.id)) return false;
            if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
            if (selectedUniversity !== 'all' && p.university !== selectedUniversity) return false;
            const minVal = medianRange.min !== '' ? parseFloat(medianRange.min) : null;
            const maxVal = medianRange.max !== '' ? parseFloat(medianRange.max) : null;
            const median = p.median != null ? parseFloat(p.median) : null;
            if (minVal !== null && (median === null || median < minVal)) return false;
            if (maxVal !== null && (median === null || median > maxVal)) return false;
            return true;
        });

        // If no search query, return as-is
        if (!searchTokens.length) return candidates;

        // Score each candidate
        const scored = candidates.map(p => {
            const details = detailCache[p.code] || detailState[p.code];
            const result = scoreProgramme(p, details, searchTokens, language);
            return { programme: p, ...result };
        });

        // Only keep programmes where ALL tokens matched somewhere
        const matched = scored.filter(s => s.matches);

        // Sort by relevance score descending
        matched.sort((a, b) => b.score - a.score);

        return matched.map(s => s.programme);
    }, [programmes, dreamPrograms, selectedCategory, selectedUniversity, medianRange, searchTokens, detailCache, detailState, language]);

    const handleToggleDetail = (program) => {
        if (expandedProgram === program.id) {
            setExpandedProgram(null);
        } else {
            setExpandedProgram(program.id);
            onViewDetail(program);
        }
    };

    const hasActiveMedianFilter = medianRange.min !== '' || medianRange.max !== '';

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedUniversity('all');
        setMedianRange({ min: '', max: '' });
    };

    const hasAnyFilter = searchQuery || selectedCategory !== 'all' || selectedUniversity !== 'all' || hasActiveMedianFilter;

    // Dropdown selected label helpers
    const getUniLabel = () => {
        if (selectedUniversity === 'all') return language === 'zh' ? '全部大學' : 'All Universities';
        return getUniversityLabel(selectedUniversity, language);
    };

    const getCatLabel = () => {
        if (selectedCategory === 'all') return language === 'zh' ? '全部範疇' : 'All Areas';
        const cat = PROGRAM_CATEGORIES[selectedCategory];
        return language === 'zh' ? cat : selectedCategory;
    };

    return (
        <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'zh'
                        ? '搜尋課程編號、名稱或關鍵字'
                        : 'Search by code, name or keyword'
                    }
                    className="w-full pl-11 pr-24 py-4 bg-white border border-slate-200 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                />
                {/* Indexing indicator */}
                {isIndexing && searchTokens.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {language === 'zh' ? '索引中' : 'Indexing'}
                    </div>
                )}
                {!isIndexing && searchTokens.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {filteredPrograms.length} {language === 'zh' ? '結果' : 'results'}
                    </div>
                )}
            </div>

            {/* Filters Row — University + Category dropdowns + Median Score */}
            <div className="flex flex-wrap items-center gap-2">
                {/* University Dropdown */}
                <div className="relative" ref={uniDropdownRef}>
                    <button
                        onClick={() => { setUniDropdownOpen(!uniDropdownOpen); setCatDropdownOpen(false); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all min-w-[140px] justify-between ${
                            selectedUniversity !== 'all'
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                        }`}
                    >
                        <span className="truncate">{getUniLabel()}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${uniDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {uniDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 z-50 py-1.5 max-h-64 overflow-y-auto">
                            <button
                                onClick={() => { setSelectedUniversity('all'); setUniDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                                    selectedUniversity === 'all' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {language === 'zh' ? '全部大學' : 'All Universities'}
                            </button>
                            {universities.map(uni => (
                                <button
                                    key={uni}
                                    onClick={() => { setSelectedUniversity(uni); setUniDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                                        selectedUniversity === uni ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {getUniversityLabel(uni, language)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Dropdown */}
                <div className="relative" ref={catDropdownRef}>
                    <button
                        onClick={() => { setCatDropdownOpen(!catDropdownOpen); setUniDropdownOpen(false); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all min-w-[160px] justify-between ${
                            selectedCategory !== 'all'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                        }`}
                    >
                        <span className="truncate">{getCatLabel()}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {catDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 z-50 py-1.5 max-h-72 overflow-y-auto">
                            <button
                                onClick={() => { setSelectedCategory('all'); setCatDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                                    selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {language === 'zh' ? '全部範疇' : 'All Areas'}
                            </button>
                            {sortedCategories.map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => { setSelectedCategory(key); setCatDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                                        selectedCategory === key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {language === 'zh' ? label : key}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Median Score Filter Button */}
                <button
                    onClick={() => setShowMedianModal(true)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all ${
                        hasActiveMedianFilter
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {language === 'zh' ? '中位數分數' : 'Median Score'}
                    {hasActiveMedianFilter && (
                        <span className="ml-0.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">
                            {medianRange.min || '0'}-{medianRange.max || '∞'}
                        </span>
                    )}
                </button>

                {/* Clear all filters */}
                {hasAnyFilter && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-black tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <X className="w-3 h-3" />
                        {language === 'zh' ? '清除' : 'Clear'}
                    </button>
                )}
            </div>

            {/* Median Score Modal */}
            {showMedianModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-extrabold text-slate-900">
                                {language === 'zh' ? '中位數分數範圍' : 'Median Score Range'}
                            </h3>
                            <button
                                onClick={() => setShowMedianModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-5">
                            {language === 'zh'
                                ? '輸入課程中位數分數的範圍，篩選符合條件的課程。'
                                : 'Enter a median score range to filter programmes.'}
                        </p>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    {language === 'zh' ? '最低' : 'Min'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={medianRange.min}
                                    onChange={(e) => setMedianRange(prev => ({ ...prev, min: e.target.value }))}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                />
                            </div>
                            <span className="text-slate-300 font-bold pt-5">—</span>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    {language === 'zh' ? '最高' : 'Max'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={medianRange.max}
                                    onChange={(e) => setMedianRange(prev => ({ ...prev, max: e.target.value }))}
                                    placeholder="50"
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setMedianRange({ min: '', max: '' }); }}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                {language === 'zh' ? '重置' : 'Reset'}
                            </button>
                            <button
                                onClick={() => setShowMedianModal(false)}
                                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-200"
                            >
                                {language === 'zh' ? '套用' : 'Apply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Programme List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {programsLoading && (
                    <div className="p-10 text-center">
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                )}

                {!programsLoading && filteredPrograms.length === 0 && (
                    <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                        <p className="text-base text-slate-400 font-medium">{t.emptySearch}</p>
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider mt-2"
                        >
                            {t.clearFilters}
                        </button>
                    </div>
                )}

                {filteredPrograms.map(program => {
                    const isExpanded = expandedProgram === program.id;
                    const detailData = detailState[program.code];
                    const isDetailLoading = detailData === 'loading';
                    const showWeightings = isPolyU(program);

                    return (
                        <div
                            key={program.id}
                            className={`bg-white border rounded-2xl p-5 transition-all shadow-sm ${
                                isExpanded
                                    ? 'border-indigo-300 shadow-md shadow-indigo-100'
                                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                                        {(language === 'zh' ? program.nameZh : program.nameEn) || program.name || program.nameEn || program.code}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="text-sm font-bold text-slate-500">
                                            {getUniversityLabel(program.university, language)}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-black uppercase tracking-wider">
                                            {program.code}
                                        </span>
                                        {program.category && (
                                            <span className="text-xs px-2 py-0.5 bg-indigo-50 rounded-md text-indigo-600 font-black uppercase tracking-wider">
                                                {language === 'zh' ? PROGRAM_CATEGORIES[program.category] : program.category}
                                            </span>
                                        )}
                                        {program.median && (
                                            <span className="text-xs px-2 py-0.5 bg-emerald-50 rounded-md text-emerald-600 font-black uppercase tracking-wider">
                                                {language === 'zh' ? '中位數' : 'Median'}: {program.median}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                                    {/* Weightings Button - Only for PolyU */}
                                    {showWeightings && (
                                        <button
                                            onClick={(e) => handleOpenWeightings(program, e)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                                            title={language === 'zh' ? '科目比重' : 'Weightings'}
                                        >
                                            <Scale className="w-3.5 h-3.5" />
                                            {language === 'zh' ? '比重' : 'Weightings'}
                                        </button>
                                    )}
                                    {/* Prominent Detail Button */}
                                    <button
                                        onClick={() => handleToggleDetail(program)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            isExpanded
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                                        }`}
                                        title={t.programDetail}
                                    >
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                                        {isExpanded ? (language === 'zh' ? '收起' : 'Hide') : (language === 'zh' ? '詳情' : 'Details')}
                                    </button>
                                    <button
                                        onClick={() => onAddProgram(program)}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                        title={t.add}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Detail View */}
                            {isExpanded && (
                                <ProgrammeDetailView
                                    details={isDetailLoading ? null : detailData}
                                    language={language}
                                    isLoading={isDetailLoading}
                                />
                            )}
                        </div>
                    );
                })}

                {filteredPrograms.length > 0 && (
                    <p className="text-xs text-center text-slate-400 py-2 font-medium">
                        {language === 'zh' ? `共 ${filteredPrograms.length} 個結果` : `${filteredPrograms.length} results found`}
                    </p>
                )}
            </div>

            {/* Weightings Modal */}
            <WeightingsModal
                isOpen={weightingsModalOpen}
                onClose={() => setWeightingsModalOpen(false)}
                programme={selectedProgrammeForWeightings}
                language={language}
            />
        </div>
    );
};

export default ProgrammeSearchPanel;
